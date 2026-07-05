import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationIT from './locales/it/translation.json';

const resources = {
    en: {
        translation: translationEN
    },
    es: {
        translation: translationES
    },
    it: {
        translation: translationIT
    }
};

const savedSettings = localStorage.getItem('app-settings');
let defaultLng = 'en'; // default fallback
if (savedSettings) {
    try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.state && parsed.state.language) {
            defaultLng = parsed.state.language;
        }
    } catch {
        // Ignore JSON parse errors
    }
}

i18n.use(initReactI18next).init({
    resources,
    lng: defaultLng,
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    }
});

export default i18n;
