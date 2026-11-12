import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '../../../supabaseClient';
import { authQueryOptions } from './useAuth';

/**
 * Hook to capture incoming deep links for Supabase authentication callbacks.
 * Handles OAuth redirects and email magic links on native Android.
 */
export const useSupabaseDeepLinks = (): void => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const setupDeepLinkListener = async () => {
            const handle = await App.addListener('appUrlOpen', async ({ url }) => {
                // Check if URL matches our authentication callback
                if (url.includes('auth/callback') || url.includes('com.pakatagames.backlogpriority')) {
                    try {
                        // Close any in-app browser instance if opened for OAuth
                        await Browser.close().catch(() => {
                            // Silently ignore if browser wasn't open
                        });

                        const parsedUrl = new URL(url);

                        // 1. Handle PKCE code exchange flow (?code=...)
                        const code = parsedUrl.searchParams.get('code');
                        if (code) {
                            const { error } = await supabase.auth.exchangeCodeForSession(code);
                            if (!error) {
                                await queryClient.invalidateQueries({
                                    queryKey: authQueryOptions.queryKey
                                });
                                navigate({ to: '/' });
                                return;
                            }
                        }

                        // 2. Handle implicit / fragment flow (#access_token=...&refresh_token=...)
                        const hash = parsedUrl.hash.startsWith('#')
                            ? parsedUrl.hash.substring(1)
                            : parsedUrl.hash;
                        const hashParams = new URLSearchParams(hash);

                        const accessToken =
                            hashParams.get('access_token') ||
                            parsedUrl.searchParams.get('access_token');
                        const refreshToken =
                            hashParams.get('refresh_token') ||
                            parsedUrl.searchParams.get('refresh_token');

                        if (accessToken && refreshToken) {
                            const { error } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken
                            });

                            if (!error) {
                                await queryClient.invalidateQueries({
                                    queryKey: authQueryOptions.queryKey
                                });
                                navigate({ to: '/' });
                            }
                        }
                    } catch (error) {
                        console.error('Failed to process authentication deep link:', error);
                    }
                }
            });

            return handle;
        };

        const handlePromise = setupDeepLinkListener();

        return () => {
            handlePromise.then((handle) => handle.remove());
        };
    }, [navigate, queryClient]);
};

