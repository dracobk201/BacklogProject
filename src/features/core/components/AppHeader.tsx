import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
    Gamepad2,
    LogOut,
    Plus,
    LayoutDashboard,
    SlidersHorizontal,
    User,
    Settings
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export interface AppHeaderProps {
    className?: string;
}

interface NavLink {
    key: string;
    labelKey: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: (pathname: string) => boolean;
}

/**
 * Top Application Header.
 * Provides branding, desktop navigation links, and quick actions with mobile safe-area support.
 */
const AppHeader: React.FC<AppHeaderProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const desktopLinks: NavLink[] = [
        {
            key: 'dashboard',
            labelKey: 'appLayout.dashboard',
            to: '/',
            icon: LayoutDashboard,
            isActive: (pathname) => pathname === '/'
        },
        {
            key: 'games',
            labelKey: 'appLayout.myGames',
            to: '/games',
            icon: Gamepad2,
            isActive: (pathname) =>
                pathname.startsWith('/games') &&
                !pathname.startsWith('/games/add-game') &&
                !pathname.startsWith('/games/rating-config')
        },
        {
            key: 'rating-config',
            labelKey: 'appLayout.ratingConfig',
            to: '/games/rating-config',
            icon: SlidersHorizontal,
            isActive: (pathname) => pathname.startsWith('/games/rating-config')
        },
        {
            key: 'profile',
            labelKey: 'appLayout.user',
            to: '/profile',
            icon: User,
            isActive: (pathname) => pathname.startsWith('/profile')
        },
        {
            key: 'settings',
            labelKey: 'appLayout.settings',
            to: '/settings',
            icon: Settings,
            isActive: (pathname) => pathname.startsWith('/settings')
        }
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        queryClient.removeQueries({ queryKey: ['auth-session'] });
        navigate({ to: '/login' });
    };

    return (
        <header
            aria-label="Application Header"
            className={`sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)] ${className}`}
        >
            <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
                {/* Brand / Logo */}
                <div
                    onClick={() => navigate({ to: '/' })}
                    className="flex items-center space-x-2 cursor-pointer touch-manipulation"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate({ to: '/' })}
                    aria-label="Go to Dashboard"
                >
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        <Gamepad2 className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-base tracking-tight text-foreground">
                        Backlog
                    </span>
                </div>

                {/* Desktop Navigation Links */}
                <nav
                    aria-label="Desktop Navigation"
                    className="hidden md:flex items-center space-x-1"
                >
                    {desktopLinks.map((link) => {
                        const active = link.isActive(location.pathname);
                        const Icon = link.icon;

                        return (
                            <button
                                key={link.key}
                                type="button"
                                onClick={() => navigate({ to: link.to })}
                                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-accent text-accent-foreground font-semibold'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{t(link.labelKey)}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Header Actions */}
                <div className="flex items-center space-x-2">
                    {/* Quick Add Game Button */}
                    <button
                        type="button"
                        onClick={() => navigate({ to: '/games/add-game' })}
                        aria-label={t('appLayout.addGame')}
                        className="flex items-center justify-center h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-95 transition-all touch-manipulation min-w-[36px]"
                    >
                        <Plus className="w-4 h-4 md:mr-1.5" />
                        <span className="hidden md:inline">{t('appLayout.addGame')}</span>
                    </button>

                    {/* Logout Button */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        aria-label={t('appLayout.logout')}
                        className="flex items-center justify-center h-9 px-2.5 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors text-sm font-medium active:scale-95 touch-manipulation"
                    >
                        <LogOut className="w-4 h-4 md:mr-1.5" />
                        <span className="hidden md:inline">{t('appLayout.logout')}</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;

