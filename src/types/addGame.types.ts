export interface OpenCriticResults {
    cover_url: string;
    game_title: string;
    game_id: string;
    game_type: string | null;
    release_year: number | null;
    steam_app_id: string | null;
}

export interface SelectedGameOption {
    value: string;
    label: string;
    key: string;
}

export interface FormValues {
    beaten_before: boolean | undefined;
    dropped: boolean | undefined;
    excitement: number | undefined;
    game: string;
    game_type: GameType;
    length_hours: number | null;
    notes?: string | undefined;
    platform: string[];
    rating: number | undefined;
    recommended: boolean | undefined;
    release_year: string;
    start_date?: string;
    completion_date?: string;
    status: string;
    steam_rating: number | undefined;
    cover_url?: string | undefined;
}

export const GameType = {
    Indie: 'Indie',
    AA: 'AA',
    AAA: 'AAA'
} as const;
export type GameType = (typeof GameType)[keyof typeof GameType];

export const GameStatus = {
    Pending: 'pending',
    Playing: 'playing',
    Completed: 'completed',
    Dropped: 'dropped'
} as const;
export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];
