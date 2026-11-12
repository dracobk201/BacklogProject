import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import React, { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => {
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
            <React.Fragment>
                <div className="min-h-screen bg-background text-foreground flex flex-col">
                    <Outlet />
                </div>
                {/* Devtools only in development */}
                <ReactQueryDevtools buttonPosition="bottom-left" />
                <TanStackRouterDevtools position="bottom-right" />
            </React.Fragment>
        );
    }
});
