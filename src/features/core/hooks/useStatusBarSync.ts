import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Synchronizes the Android Status Bar color and icon theme
 * with the active application light/dark theme.
 *
 * @param theme - Active theme ('dark' | 'light')
 */
export const useStatusBarSync = (theme: string): void => {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const updateStatusBar = async () => {
            try {
                if (theme === 'dark') {
                    await StatusBar.setStyle({ style: Style.Dark });
                    await StatusBar.setBackgroundColor({ color: '#09090b' });
                } else {
                    await StatusBar.setStyle({ style: Style.Light });
                    await StatusBar.setBackgroundColor({ color: '#ffffff' });
                }
            } catch {
                // Silently ignore if status bar plugin is unsupported
            }
        };

        updateStatusBar();
    }, [theme]);
};

