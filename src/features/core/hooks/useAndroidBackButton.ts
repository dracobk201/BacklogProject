import { useEffect } from 'react';
import { useRouter, useLocation } from '@tanstack/react-router';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Hook to handle Android hardware back button and navigation gestures.
 * Navigates back in history when possible, or exits the application on the root screen.
 */
export const useAndroidBackButton = (): void => {
    const router = useRouter();
    const location = useLocation();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const setupListener = async () => {
            const handle = await App.addListener('backButton', ({ canGoBack }) => {
                if (location.pathname === '/' || !canGoBack) {
                    App.exitApp();
                } else {
                    router.history.back();
                }
            });

            return handle;
        };

        const handlePromise = setupListener();

        return () => {
            handlePromise.then((handle) => handle.remove());
        };
    }, [router, location.pathname]);
};

