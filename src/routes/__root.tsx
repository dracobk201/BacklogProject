import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useSupabaseDeepLinks } from '../features/auth/hooks/useSupabaseDeepLinks';

export interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useSupabaseDeepLinks();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const theme = useSettingsStore((state) => state.theme);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            const root = document.documentElement;
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }, [theme]);

        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <Outlet />
            </div>
        );
    }
});
