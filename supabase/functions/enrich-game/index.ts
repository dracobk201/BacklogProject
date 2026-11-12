import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// CORS Headers allow your React frontend to call this function securely
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type'
};

// ==========================================
// ENVIRONMENT VARIABLES
// Access these using Deno.env.get() instead of import.meta.env
// ==========================================
const IGDB_CLIENT_ID = Deno.env.get('IGDB_CLIENT_ID') || '';
const IGDB_CLIENT_SECRET = Deno.env.get('IGDB_CLIENT_SECRET') || '';
const IGDB_ACCESS_TOKEN = Deno.env.get('IGDB_ACCESS_TOKEN') || '';
const OPENCRITIC_API_KEY = Deno.env.get('OPENCRITIC_API_KEY') || '';

interface IGDBExternalGame {
    category: number;
    uid: string;
}

interface IGDBRawGame {
    id: number;
    name: string;
    cover?: { image_id: string };
    external_games?: IGDBExternalGame[];
    first_release_date?: number;
    category?: number;
    parent_game?: number;
    version_parent?: number;
}

interface FormattedGameSearchResult {
    game_id: string;
    game_title: string;
    release_year: number | null;
    cover_url: string | null;
    steam_app_id: string | null;
    game_type: null;
}

let cachedIgdbToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Retrieves a valid IGDB access token.
 * If IGDB_CLIENT_ID and IGDB_CLIENT_SECRET are configured, it automatically
 * fetches and caches a new Twitch OAuth token, renewing it before expiration.
 * Otherwise, falls back to the static IGDB_ACCESS_TOKEN.
 */
const getIGDBAccessToken = async (forceRefresh = false): Promise<string> => {
    if (IGDB_CLIENT_ID && IGDB_CLIENT_SECRET) {
        const now = Date.now();
        // Return cached token if still valid (buffer of 5 minutes)
        if (!forceRefresh && cachedIgdbToken && now < tokenExpiresAt - 300_000) {
            return cachedIgdbToken;
        }

        const tokenUrl = `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(
            IGDB_CLIENT_ID
        )}&client_secret=${encodeURIComponent(
            IGDB_CLIENT_SECRET
        )}&grant_type=client_credentials`;

        const res = await fetch(tokenUrl, { method: 'POST' });
        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Failed to obtain Twitch OAuth token (${res.status}): ${errBody}`);
        }

        const tokenData = await res.json();
        cachedIgdbToken = tokenData.access_token;
        tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
        return cachedIgdbToken as string;
    }

    if (IGDB_ACCESS_TOKEN) {
        return IGDB_ACCESS_TOKEN;
    }

    throw new Error(
        'Missing IGDB credentials: configure IGDB_CLIENT_ID and IGDB_CLIENT_SECRET (or IGDB_ACCESS_TOKEN) in Supabase Secrets.'
    );
};

const searchGamesFromIGDB = async (
    query: string,
    isRetry = false
): Promise<FormattedGameSearchResult[]> => {
    const url = 'https://api.igdb.com/v4/games';
    const body = `
        search "${query}";
        fields name, first_release_date, category, cover.image_id, external_games.category, external_games.uid, parent_game, version_parent;
        limit 50;
    `;

    try {
        const token = await getIGDBAccessToken(isRetry);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Client-ID': IGDB_CLIENT_ID,
                Authorization: `Bearer ${token}`
            },
            body
        });

        // If unauthorized and we haven't retried yet and have client secret, refresh and retry once
        if (response.status === 401 && !isRetry && IGDB_CLIENT_SECRET) {
            console.warn('IGDB returned 401. Refreshing token and retrying...');
            return await searchGamesFromIGDB(query, true);
        }

        if (!response.ok) throw new Error(`IGDB API error: ${response.status}`);
        let data: IGDBRawGame[] = await response.json();

        // Filter out DLCs, editions, and bundles manually.
        // IGDB search ignores "where" clauses, so we fetch 50 and filter in-memory.
        const allowedCategories = [0, 8, 9, 10, 11];
        data = data.filter((game: IGDBRawGame) => {
            const cat = game.category ?? 0;
            const isAllowedCat = allowedCategories.includes(cat);
            const hasParent = game.parent_game != null;
            const hasVersion = game.version_parent != null;
            return isAllowedCat && !hasParent && !hasVersion;
        });

        // Limit to 10 results after filtering
        data = data.slice(0, 10);

        return data.map((game: IGDBRawGame) => {
            const coverUrl = game.cover?.image_id
                ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
                : null;
            const steamExternal = game.external_games?.find(
                (eg: IGDBExternalGame) => eg.category === 1
            );
            const steamAppId = steamExternal ? steamExternal.uid : null;

            return {
                game_id: game.id.toString(),
                game_title: game.name,
                release_year: game.first_release_date
                    ? new Date(game.first_release_date * 1000).getFullYear()
                    : null,
                cover_url: coverUrl,
                steam_app_id: steamAppId,
                game_type: null
            };
        });
    } catch (error: unknown) {
        console.error('Error searching IGDB:', error);
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`IGDB Search failed: ${msg}`);
    }
};

const searchSteamAppId = async (gameTitle: string): Promise<string | null> => {
    try {
        const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameTitle)}&l=english&cc=US`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const app = data.items.find(
                (item: { type: string; id: number }) => item.type === 'app'
            );
            if (app) {
                return app.id.toString();
            }
        }
        return null;
    } catch (error) {
        console.error('Error searching Steam App ID:', error);
        return null;
    }
};

const getSteamRating = async (appId: string): Promise<number | null> => {
    try {
        const reviewsUrl = `https://store.steampowered.com/appreviews/${appId}?json=1&language=all`;
        const response = await fetch(reviewsUrl);

        if (!response.ok)
            throw new Error(`Steam API error: ${response.status}`);
        const data = await response.json();

        if (data.query_summary && data.query_summary.total_reviews > 0) {
            const total = data.query_summary.total_reviews;
            const positive = data.query_summary.total_positive;
            return Math.round((positive / total) * 100);
        }
        return null;
    } catch (error) {
        console.error('Error fetching Steam rating:', error);
        return null;
    }
};

const getOpenCriticRating = async (
    gameTitle: string
): Promise<number | null> => {
    try {
        const searchUrl = `https://opencritic-api.p.rapidapi.com/game/search?criteria=${encodeURIComponent(gameTitle)}`;
        const searchRes = await fetch(searchUrl, {
            headers: {
                'X-RapidAPI-Key': OPENCRITIC_API_KEY,
                'X-RapidAPI-Host': 'opencritic-api.p.rapidapi.com'
            }
        });

        if (!searchRes.ok)
            throw new Error(`OpenCritic Search error: ${searchRes.status}`);
        const searchData = await searchRes.json();

        if (searchData.length > 0) {
            const ocGameId = searchData[0].id;
            const gameUrl = `https://opencritic-api.p.rapidapi.com/game/${ocGameId}`;
            const gameRes = await fetch(gameUrl, {
                headers: {
                    'X-RapidAPI-Key': OPENCRITIC_API_KEY,
                    'X-RapidAPI-Host': 'opencritic-api.p.rapidapi.com'
                }
            });
            const gameData = await gameRes.json();
            return gameData.topCriticScore
                ? Math.round(gameData.topCriticScore)
                : null;
        }
        return null;
    } catch (error) {
        console.error('Error fetching OpenCritic rating:', error);
        return null;
    }
};

const getGameLengthFromHLTB = async (
    gameTitle: string
): Promise<number | null> => {
    try {
        const payload = {
            searchType: 'games',
            searchTerms: gameTitle.split(' '),
            searchPage: 1,
            size: 20
        };

        const response = await fetch('https://howlongtobeat.com/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HLTB API error: ${response.status}`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const game = data.data[0];
            const hours = game.comp_main / 3600;
            return hours > 0 ? Math.round(hours) : null;
        }
        return null;
    } catch (error) {
        console.error('Error fetching HLTB length:', error);
        return null;
    }
};

// MAIN HANDLER
serve(async (req) => {
    // 1. Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 2. Parse request body
        const { action, query, title, igdbGameId } = await req.json();

        if (action === 'search') {
            if (!query) {
                return new Response(
                    JSON.stringify({ error: 'Missing query for search' }),
                    {
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json'
                        },
                        status: 400
                    }
                );
            }
            const results = await searchGamesFromIGDB(query);
            return new Response(JSON.stringify({ data: results }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        if (action === 'enrich') {
            if (!title) {
                return new Response(
                    JSON.stringify({ error: 'Missing title for enrich' }),
                    {
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json'
                        },
                        status: 400
                    }
                );
            }

            const igdbData = await searchGamesFromIGDB(title);
            const exactMatch = igdbGameId
                ? igdbData.find(
                      (g: { game_id: string }) => g.game_id === igdbGameId
                  ) || igdbData[0]
                : igdbData[0];

            if (!exactMatch) {
                return new Response(
                    JSON.stringify({
                        data: null,
                        message: 'Game not found in IGDB'
                    }),
                    {
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json'
                        },
                        status: 404
                    }
                );
            }

            const [steamRating, ocRating, lengthHours] =
                await Promise.allSettled([
                    (async () => {
                        let appId = exactMatch.steam_app_id;
                        if (!appId) {
                            appId = await searchSteamAppId(title);
                            exactMatch.steam_app_id = appId; // guardarlo para retornarlo en el JSON final
                        }
                        if (appId) {
                            return await getSteamRating(appId);
                        }
                        return null;
                    })(),
                    getOpenCriticRating(title),
                    getGameLengthFromHLTB(title)
                ]);

            const ocVal =
                ocRating.status === 'fulfilled' ? ocRating.value : null;
            const steamVal =
                steamRating.status === 'fulfilled' ? steamRating.value : null;

            const enrichedData = {
                game_id: exactMatch.game_id,
                game_title: exactMatch.game_title,
                steam_app_id: exactMatch.steam_app_id,
                release_year: exactMatch.release_year,
                rating: ocVal,
                steam_rating: steamVal,
                length_hours:
                    lengthHours.status === 'fulfilled'
                        ? lengthHours.value
                        : null,
                game_type: null,
                status: 'pending',
                dropped: false,
                beaten_before: false,
                recommended: false,
                notes: null
            };

            return new Response(JSON.stringify({ data: enrichedData }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({ error: msg }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
});
