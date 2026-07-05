import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';
import { updateGeneralUserPreferences } from '../services/backlogService';

interface SettingsState {
    language: string;
    theme: string;
    setLanguage: (lang: string, syncWithDb?: boolean) => void;
    setTheme: (theme: string, syncWithDb?: boolean) => void;
    hydrateFromDb: (prefs: { language: string; theme: string }) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: 'en',
            theme: 'dark',
            setLanguage: async (lang: string, syncWithDb = true) => {
                set({ language: lang });
                i18n.changeLanguage(lang);

                if (syncWithDb) {
                    try {
                        await updateGeneralUserPreferences({ language: lang });
                    } catch (error) {
                        console.error('Failed to sync language to DB:', error);
                    }
                }
            },
            setTheme: async (theme: string, syncWithDb = true) => {
                set({ theme });

                if (syncWithDb) {
                    try {
                        await updateGeneralUserPreferences({ theme });
                    } catch (error) {
                        console.error('Failed to sync theme to DB:', error);
                    }
                }
            },
            hydrateFromDb: (prefs) => {
                set({ language: prefs.language, theme: prefs.theme });
                i18n.changeLanguage(prefs.language);
            }
        }),
        {
            name: 'app-settings', // name of the item in the storage (must be unique)
            partialize: (state) => ({
                language: state.language,
                theme: state.theme
            })
        }
    )
);
