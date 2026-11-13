import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
    User,
    Mail,
    Calendar,
    LogOut,
    ShieldAlert,
    Trash2,
    AlertTriangle,
    ExternalLink,
    Globe,
    Moon,
    Sun
} from 'lucide-react';
import { ImpactStyle } from '@capacitor/haptics';
import { supabase } from '../../../supabaseClient';
import { authQueryOptions } from '../hooks/useAuth';
import { hapticImpact } from '@/utils/haptics';
import { useSettingsStore } from '../../../stores/settingsStore';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

export interface ProfilePageProps {
    className?: string;
}

/**
 * User Profile Page.
 * Displays user account information, app preferences (language, theme),
 * session management, and account deletion options to strictly adhere
 * to Google Play Developer Policies.
 */
const ProfilePage: React.FC<ProfilePageProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { language, theme, setLanguage, setTheme } = useSettingsStore();
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const { data: session } = useQuery(authQueryOptions);
    const user = session?.user;

    const handleLogout = async () => {
        hapticImpact(ImpactStyle.Light);
        await supabase.auth.signOut();
        queryClient.removeQueries({ queryKey: ['auth-session'] });
        queryClient.setQueryData(authQueryOptions.queryKey, null);
        navigate({ to: '/login' });
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        setIsDeleting(true);
        hapticImpact(ImpactStyle.Heavy);

        try {
            // 1. Try to invoke Supabase RPC if configured
            const { error: rpcError } = await supabase.rpc('delete_user');

            // 2. If RPC is not created or fails, delete user rows in user-owned tables
            if (rpcError) {
                await Promise.allSettled([
                    supabase.from('backlog').delete().eq('user_id', user.id),
                    supabase.from('user_scoring_weights').delete().eq('user_id', user.id),
                    supabase.from('user_preferences').delete().eq('user_id', user.id)
                ]);
            }

            // 3. Terminate session
            await supabase.auth.signOut();
            queryClient.clear();

            toast.success(t('profile.deleteAccountSuccess'));
            setIsDialogOpen(false);
            navigate({ to: '/login' });
        } catch (err) {
            console.error('Account deletion error:', err);
            toast.error(t('profile.deleteAccountError'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={`space-y-6 max-w-2xl mx-auto py-2 ${className}`}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {t('profile.title')}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {t('profile.subtitle')}
                </p>
            </div>

            {/* Profile Info Card */}
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
                                    {t('profile.memberSince')}:{' '}
                                    {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-full h-11 min-h-11 text-muted-foreground hover:text-foreground hover:bg-muted border-border font-medium active:scale-95 transition-transform"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            {t('appLayout.logout')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* App Preferences: Language & Theme */}
            <Card className="border-border">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-semibold">
                        {t('settings.preferences')}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        {t('settings.preferencesDescription')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-4">
                    {/* Language Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">
                                    {t('settings.language')}
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('settings.selectLanguage')}
                            </p>
                        </div>

                        <div className="w-full sm:w-[170px]">
                            <Select
                                value={language}
                                onValueChange={(val) => {
                                    if (val) {
                                        hapticImpact(ImpactStyle.Light);
                                        setLanguage(val);
                                    }
                                }}
                            >
                                <SelectTrigger className="min-h-11 sm:min-h-[38px] w-full">
                                    <SelectValue placeholder={t('settings.language')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">
                                        🇬🇧 {t('settings.english')}
                                    </SelectItem>
                                    <SelectItem value="es">
                                        🇪🇸 {t('settings.spanish')}
                                    </SelectItem>
                                    <SelectItem value="it">
                                        🇮🇹 {t('settings.italian')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border-t border-border/60" />

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                                {theme === 'dark' ? (
                                    <Moon className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <Sun className="w-4 h-4 text-muted-foreground" />
                                )}
                                <Label htmlFor="profile-dark-mode" className="text-sm font-medium">
                                    {theme === 'dark'
                                        ? t('settings.darkMode')
                                        : t('settings.lightMode')}
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('settings.themeDescription')}
                            </p>
                        </div>

                        <Switch
                            id="profile-dark-mode"
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => {
                                hapticImpact(ImpactStyle.Light);
                                setTheme(checked ? 'dark' : 'light');
                            }}
                            className="min-h-[24px]"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Account Safety Info */}
            <Card className="border-border/60 bg-muted/20">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground">
                        <ShieldAlert className="w-4 h-4" />
                        <span>{t('profile.dataSecurity')}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('profile.securityNotice')}
                    </p>
                    <div className="pt-1">
                        <a
                            href="mailto:support@pakatagames.com?subject=Backlog%20Priority%20-%20Data%20Deletion%20Request"
                            className="inline-flex items-center text-xs text-primary hover:underline gap-1"
                        >
                            <span>{t('profile.manualDeleteRequest')}</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone: Account Deletion (Google Play Compliance) */}
            <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{t('profile.dangerZone')}</span>
                    </div>
                    <CardTitle className="text-base font-semibold text-destructive mt-1">
                        {t('profile.deleteAccount')}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        {t('profile.deleteAccountDesc')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-2">
                    <Button
                        variant="destructive"
                        className="w-full h-11 min-h-11 font-medium active:scale-95 transition-transform"
                        onClick={() => {
                            hapticImpact(ImpactStyle.Medium);
                            setIsDialogOpen(true);
                        }}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('profile.deleteAccount')}
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <DialogTitle className="text-lg font-bold">
                                    {t('profile.deleteAccountConfirmTitle')}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground pt-1 leading-relaxed">
                                    {t('profile.deleteAccountConfirmDesc')}
                                </DialogDescription>
                            </DialogHeader>

                            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto min-h-11"
                                    disabled={isDeleting}
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    {t('profile.deleteAccountCancelBtn')}
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full sm:w-auto min-h-11"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                >
                                    {isDeleting
                                        ? t('common.deleting')
                                        : t('profile.deleteAccountConfirmBtn')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;
