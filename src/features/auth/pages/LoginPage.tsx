import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { NotificationType } from '@capacitor/haptics';
import { supabase } from '../../../supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { authQueryOptions } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../stores/settingsStore';
import { hapticNotification } from '@/utils/haptics';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Gamepad2 } from 'lucide-react';

export interface LoginPageProps {
    className?: string;
}

/**
 * Authentication and Login Page.
 * Responsive mobile-first layout with Supabase Auth UI.
 */
const LoginPage: React.FC<LoginPageProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const appTheme = useSettingsStore((state) => state.theme);

    useEffect(() => {
        // 1. Check existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                queryClient.setQueryData(authQueryOptions.queryKey, session);
                navigate({ to: '/' });
            }
        });

        // 2. Listen to auth state transitions
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                queryClient.setQueryData(authQueryOptions.queryKey, session);
                hapticNotification(NotificationType.Success);
                navigate({ to: '/' });
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate, queryClient]);

    return (
        <div
            className={`min-h-[calc(100vh-60px)] flex items-center justify-center px-4 py-8 ${className}`}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                <Card className="border-border shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-3 shadow-md">
                            <Gamepad2 className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Backlog Project
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('login.signIn')}
                        </p>
                    </CardHeader>

                    <CardContent className="pt-2">
                        <Auth
                            supabaseClient={supabase}
                            appearance={{
                                theme: ThemeSupa,
                                variables: {
                                    default: {
                                        colors: {
                                            brand: 'var(--primary)',
                                            brandAccent: 'var(--primary)',
                                            brandButtonText: 'var(--primary-foreground)'
                                        },
                                        radii: {
                                            borderRadiusButton: '0.5rem',
                                            buttonBorderRadius: '0.5rem',
                                            inputBorderRadius: '0.5rem'
                                        }
                                    }
                                }
                            }}
                            theme={appTheme === 'dark' ? 'dark' : 'default'}
                            providers={['google']}
                            redirectTo={
                                Capacitor.isNativePlatform()
                                    ? 'com.pakatagames.backlogpriority://auth/callback'
                                    : window.location.origin
                            }
                            localization={{
                                variables: {
                                    sign_in: {
                                        email_label: t('login.email'),
                                        password_label: t('login.password'),
                                        button_label: t('login.signIn')
                                    },
                                    sign_up: {
                                        email_label: t('login.email'),
                                        password_label: t('login.password'),
                                        button_label: t('login.signUp')
                                    }
                                }
                            }}
                        />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default LoginPage;
