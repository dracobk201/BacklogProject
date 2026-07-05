import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import React from 'react';
import { ConfigProvider, Layout, theme as antdTheme } from 'antd';
import { useSettingsStore } from '../stores/settingsStore';

export interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { theme } = useSettingsStore();

        return (
            <React.Fragment>
                <ConfigProvider
                    theme={{
                        algorithm:
                            theme === 'dark'
                                ? antdTheme.darkAlgorithm
                                : antdTheme.defaultAlgorithm
                    }}
                >
                    <Layout
                        style={{
                            minHeight: '100vh',
                            backgroundColor:
                                theme === 'dark' ? '#0f172a' : '#f0f2f5',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Outlet />
                    </Layout>
                </ConfigProvider>
                {/* Devtools only in development */}
                <ReactQueryDevtools buttonPosition="bottom-left" />
                <TanStackRouterDevtools position="bottom-right" />
            </React.Fragment>
        );
    }
});
