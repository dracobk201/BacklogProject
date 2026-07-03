import { createFileRoute, redirect } from '@tanstack/react-router';
import LoginPage from '../features/auth/pages/LoginPage';
import { authQueryOptions } from '../features/auth/hooks/useAuth';

export const Route = createFileRoute('/login')({
    beforeLoad: async ({ context }) => {
        const session =
            await context.queryClient.ensureQueryData(authQueryOptions);
        if (session) {
            throw redirect({
                to: '/'
            });
        }
    },
    component: LoginPage
});
