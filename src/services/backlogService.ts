import { supabase } from '../lib/supabase';
import type {
    BacklogItem,
    UserScoringWeights,
    UserPreferences
} from '../types/database.types';

/**
 * Fetches all backlog games for the currently authenticated user.
 */
export const getBacklog = async (): Promise<BacklogItem[]> => {
    const { data, error } = await supabase.from('backlog').select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data as BacklogItem[];
};

/**
 * Retrieves the scoring weights for the currently authenticated user.
 */
export const getUserScoringWeights =
    async (): Promise<UserScoringWeights | null> => {
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('user_scoring_weights')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // PGRST116 is the error code when no rows are returned, which is fine if preferences aren't set yet.
        if (error && error.code !== 'PGRST116') {
            throw new Error(error.message);
        }

        return data as UserScoringWeights | null;
    };

/**
 * Updates or creates the scoring weights for the currently authenticated user.
 */
export const updateUserScoringWeights = async (
    prefs: Partial<UserScoringWeights>
): Promise<UserScoringWeights> => {
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('user_scoring_weights')
        .upsert({ user_id: user.id, ...prefs })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as UserScoringWeights;
};

/**
 * Retrieves the general user preferences (language, theme) for the currently authenticated user.
 */
export const getGeneralUserPreferences =
    async (): Promise<UserPreferences | null> => {
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(error.message);
        }

        return data as UserPreferences | null;
    };

/**
 * Updates or creates the general user preferences for the currently authenticated user.
 */
export const updateGeneralUserPreferences = async (
    prefs: Partial<UserPreferences>
): Promise<UserPreferences> => {
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('user_preferences')
        .upsert({ user_id: user.id, ...prefs })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as UserPreferences;
};

/**
 * Adds a new game to the authenticated user's backlog.
 */
export const addGameToBacklog = async (
    game: Omit<BacklogItem, 'id' | 'user_id'>
): Promise<BacklogItem> => {
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('backlog')
        .insert([{ ...game, user_id: user.id }])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as BacklogItem;
};

/**
 * Updates the status and/or notes of a specific game in the backlog.
 */
export const updateGameStatus = async (
    id: string,
    status?: BacklogItem['status'],
    notes?: string
): Promise<BacklogItem> => {
    const updates: Partial<Pick<BacklogItem, 'status' | 'notes'>> = {};
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
        .from('backlog')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as BacklogItem;
};
