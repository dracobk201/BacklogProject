import React, { useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getGeneralUserPreferences } from '../../../services/backlogService';
import { useSettingsStore } from '../../../stores/settingsStore';
import AppHeader from './AppHeader';
import BottomNav from './BottomNav';
import { useAndroidBackButton } from '../hooks/useAndroidBackButton';
import { useStatusBarSync } from '../hooks/useStatusBarSync';

export interface AppLayoutProps {
    className?: string;
}

/**
 * Main Application Layout.
 * Combines mobile-first header, bottom navigation bar, and main content area
 * with safe-area padding for mobile/Android environments.
 */
const AppLayout: React.FC<AppLayoutProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const hydrateFromDb = useSettingsStore((state) => state.hydrateFromDb);
    const appTheme = useSettingsStore((state) => state.theme);

    // Synchronize native Android hardware and status bar
    useAndroidBackButton();
    useStatusBarSync(appTheme);

    const { data: preferences } = useQuery({
        queryKey: ['user-preferences'],
        queryFn: getGeneralUserPreferences
    });

    // Hydrate preferences from database
    useEffect(() => {
        if (preferences) {
            hydrateFromDb({
                language: preferences.language,
                theme: preferences.theme
            });
        }
    }, [preferences, hydrateFromDb]);

    // Apply dark mode class to root document element
    useEffect(() => {
        const root = document.documentElement;
        if (appTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [appTheme]);

    return (
        <div className={`min-h-screen flex flex-col bg-background text-foreground transition-colors ${className}`}>
            {/* Top Header */}
            <AppHeader />

            {/* Main Content Area: leaves room for bottom navigation on mobile */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8">
                <Outlet />
            </main>

            {/* Desktop Footer */}
            <footer className="hidden md:block border-t border-border py-6 text-center text-xs text-muted-foreground">
                {t('appLayout.footer', { year: currentYear })}
            </footer>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default AppLayout;
