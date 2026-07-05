import type { GameStatus, GameType } from './addGame.types';

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
    weight_beated_before: number;
    weight_recommended: number;
    weight_release_year: number;
    weight_steam_rating: number;
    weight_length_hours: number;
    weight_game_type: Record<string, number>;
    weight_rating: number;
    weight_platform: Record<string, number>;
}

export interface UserPreferences {
    user_id: string;
    language: string;
    theme: string;
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
    game_type: GameType | null;
    status: GameStatus;
    start_date: string | null;
    completion_date: string | null;
    notes: string | null;
    deleted_at: string | null;
}
