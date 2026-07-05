export interface Profile {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
}

export interface UserScoringWeights {
    user_id: string;
    weight_excitement: number;
    weight_dropped: number;
    weight_type_indie: number;
    weight_type_aaa: number;
    weight_year_old: number;
    weight_rating: number;
}

export interface UserPreferences {
    user_id: string;
    language: string; // 'en' or 'es'
    theme: string; // 'light' or 'dark'
}

export interface BacklogItem {
    id: string;
    user_id: string;
    game_id: string;
    steam_app_id: string | null;
    game_title: string;
    cover_url: string | null;
    excitement: number;
    dropped: boolean;
    beaten_before: boolean;
    recommended: boolean;
    length_hours: number | null;
    release_year: number | null;
    rating: number | null;
    steam_rating: number | null;
    platform: string | null;
    game_type: 'Indie' | 'AA' | 'AAA' | null;
    status: 'pending' | 'playing' | 'completed' | 'dropped';
    start_date: string | null;
    completion_date: string | null;
    notes: string | null;
}
