import { supabase } from '../lib/supabase';
import type { OpenCriticResults } from '../types/addGame.types';
import type { BacklogItem } from '../types/database.types';

/**
 * Calls the Supabase Edge Function to search for games on IGDB.
 * This avoids CORS issues and keeps API secrets hidden on the server.
 */
export const searchGamesFromIGDB = async (
    query: string
): Promise<OpenCriticResults[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('enrich-game', {
            body: { action: 'search', query }
        });

        if (error) throw new Error(error.message);
        return data.data || [];
    } catch (error) {
        console.error('Error calling search Edge Function:', error);
        return [];
    }
};

/**
 * Calls the Supabase Edge Function to enrich game data.
 * It fetches detailed data from IGDB, Steam Ratings, OpenCritic, and HowLongToBeat.
 */
export const getEnrichedGameData = async (
    igdbGameId: string,
    title: string
): Promise<Partial<BacklogItem>> => {
    try {
        const { data, error } = await supabase.functions.invoke('enrich-game', {
            body: { action: 'enrich', title, igdbGameId }
        });

        if (error) throw new Error(error.message);
        return data.data;
    } catch (error) {
        console.error('Error calling enrich Edge Function:', error);
        throw error;
    }
};
