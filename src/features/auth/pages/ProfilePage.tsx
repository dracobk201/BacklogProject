import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { User, Mail, Calendar, LogOut, ShieldAlert } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { authQueryOptions } from '../hooks/useAuth';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface ProfilePageProps {
    className?: string;
}

/**
 * User Profile Page.
 * Displays user account information and session management actions.
 */
const ProfilePage: React.FC<ProfilePageProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: session } = useQuery(authQueryOptions);
    const user = session?.user;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        queryClient.removeQueries({ queryKey: ['auth-session'] });
        navigate({ to: '/login' });
    };

    return (
        <div className={`space-y-6 max-w-2xl mx-auto py-2 ${className}`}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {t('appLayout.user')}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {t('profile.subtitle', 'Información de tu cuenta y perfil de jugador')}
                </p>
            </div>

            <Card className="border-border">
                <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20 shadow-sm shrink-0">
                        {user?.email?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-lg">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('appLayout.user')}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {user?.email}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                    <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{user?.email}</span>
                        </div>
                        {user?.created_at && (
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>
                                    {t('profile.memberSince', 'Miembro desde')}:{' '}
                                    {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-full h-11 min-h-[44px] text-destructive hover:text-destructive hover:bg-destructive/10 border-border font-medium active:scale-95 transition-transform"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            {t('appLayout.logout')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Account Safety Info */}
            <Card className="border-border/60 bg-muted/20">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground">
                        <ShieldAlert className="w-4 h-4" />
                        <span>{t('profile.dataSecurity', 'Seguridad y Privacidad')}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t(
                            'profile.securityNotice',
                            'Tus datos y biblioteca de videojuegos están cifrados y respaldados en la nube con Supabase.'
                        )}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;
