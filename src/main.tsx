import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './index.css';
import './i18n';

// Synchronize native network state with TanStack Query
if (Capacitor.isNativePlatform()) {
    Network.addListener('networkStatusChange', (status) => {
        onlineManager.setOnline(status.connected);
    });
}

const queryClient = new QueryClient();

const router = createRouter({
    routeTree,
    context: {
        queryClient
    },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>
);
