import { createFileRoute, redirect } from '@tanstack/react-router';
import type { Session } from '@supabase/supabase-js';
import LoginPage from '../features/auth/pages/LoginPage';
import { authQueryOptions } from '../features/auth/hooks/useAuth';
import { supabase } from '../supabaseClient';

export const Route = createFileRoute('/login')({
    beforeLoad: async ({ context }) => {
        let session = context.queryClient.getQueryData<Session | null>(
            authQueryOptions.queryKey
        );

        if (!session) {
            const { data } = await supabase.auth.getSession();
            session = data.session;
            if (session) {
                context.queryClient.setQueryData(
                    authQueryOptions.queryKey,
                    session
                );
            }
        }

        if (session) {
            throw redirect({
                to: '/'
            });
        }
    },
    component: LoginPage
});
