import { createFileRoute, redirect } from '@tanstack/react-router';
import { authQueryOptions } from '../features/auth/hooks/useAuth';
import AppLayout from '../features/core/components/AppLayout';

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({ context }) => {
        const session =
            await context.queryClient.ensureQueryData(authQueryOptions);
        if (!session) {
            throw redirect({
                to: '/login'
            });
        }
    },
    component: AppLayout
});
