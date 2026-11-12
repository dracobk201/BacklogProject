import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Gamepad2,
    PlusCircle,
    SlidersHorizontal,
    User
} from 'lucide-react';
import { hapticSelection } from '../../../utils/haptics';

export interface BottomNavProps {
    className?: string;
}

interface NavItem {
    key: string;
    labelKey: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: (pathname: string) => boolean;
}

/**
 * Mobile Bottom Navigation Bar.
 * Provides touch-friendly primary navigation tabs adhering to mobile-first UX guidelines.
 */
const BottomNav: React.FC<BottomNavProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems: NavItem[] = [
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
            key: 'add-game',
            labelKey: 'appLayout.addGame',
            to: '/games/add-game',
            icon: PlusCircle,
            isActive: (pathname) => pathname.startsWith('/games/add-game')
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
            isActive: (pathname) =>
                pathname.startsWith('/profile') ||
                pathname.startsWith('/settings')
        }
    ];

    return (
        <nav
            aria-label="Mobile Navigation"
            className={`fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.06)] ${className}`}
        >
            <div className="flex items-center justify-around h-16 px-1">
                {navItems.map((item) => {
                    const active = item.isActive(location.pathname);
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                                hapticSelection();
                                navigate({ to: item.to });
                            }}
                            className={`flex flex-col items-center justify-center flex-1 h-full min-h-11 min-w-[44px] py-1 px-1 transition-all duration-150 active:scale-95 touch-manipulation ${
                                active
                                    ? 'text-primary font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Icon
                                className={`w-5 h-5 mb-1 transition-transform ${
                                    active ? 'scale-110' : ''
                                }`}
                            />
                            <span className="text-[10px] leading-tight truncate max-w-[64px]">
                                {t(item.labelKey)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;

