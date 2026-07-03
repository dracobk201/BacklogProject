import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

export const authQueryOptions = {
    queryKey: ['auth-session'],
    queryFn: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            throw error;
        }
        return data.session;
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
};

export const useAuth = () => {
    return useQuery(authQueryOptions);
};
