import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../stores/settingsStore';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Moon, Sun } from 'lucide-react';

export interface SettingsPageProps {
    className?: string;
}

/**
 * Settings and Preferences Page.
 * Allows user to configure language, dark mode, and interface preferences.
 */
const SettingsPage: React.FC<SettingsPageProps> = ({ className = '' }) => {
    const { t } = useTranslation();
    const { language, theme, setLanguage, setTheme } = useSettingsStore();

    return (
        <div className={`space-y-6 max-w-2xl mx-auto py-2 ${className}`}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {t('appLayout.settings')}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {t('settings.subtitle', 'Personaliza tu experiencia en la aplicación')}
                </p>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        {t('settings.general', 'Preferencias Generales')}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        {t('settings.generalDescription', 'Ajusta el idioma y la apariencia visual.')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Language Preference */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <Label className="text-sm font-medium">
                                    {t('settings.language')}
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('settings.selectLanguage', 'Selecciona el idioma de la interfaz')}
                            </p>
                        </div>

                        <div className="w-full sm:w-[180px]">
                            <Select
                                value={language}
                                onValueChange={(val) => {
                                    if (val) setLanguage(val);
                                }}
                            >
                                <SelectTrigger className="min-h-[44px] sm:min-h-[38px]">
                                    <SelectValue placeholder="Idioma" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">
                                        {t('settings.english')}
                                    </SelectItem>
                                    <SelectItem value="es">
                                        {t('settings.spanish')}
                                    </SelectItem>
                                    <SelectItem value="it">
                                        {t('settings.italian')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Dark Mode Preference */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                                {theme === 'dark' ? (
                                    <Moon className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <Sun className="w-4 h-4 text-muted-foreground" />
                                )}
                                <Label htmlFor="theme-switch" className="text-sm font-medium">
                                    {t('settings.darkMode')}
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {theme === 'dark'
                                    ? t('settings.darkThemeActive', 'Tema oscuro activo')
                                    : t('settings.lightThemeActive', 'Tema claro activo')}
                            </p>
                        </div>

                        <Switch
                            id="theme-switch"
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) =>
                                setTheme(checked ? 'dark' : 'light')
                            }
                            className="scale-110 touch-manipulation"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
