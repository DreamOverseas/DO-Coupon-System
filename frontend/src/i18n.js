import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Plugins:
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(HttpApi)
    // Detect user language (navigator, querystring, localStorage…)
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: false,
        supportedLngs: ['en', 'zh'],
        defaultNS: 'translation',
        backend: {
            // path where resources get loaded from
            loadPath: '/locales/{{lng}}.json',
        },
        detection: {
            // order and from where user language should be detected
            order: ['querystring', 'cookie', 'localStorage', 'navigator'],
            caches: ['localStorage', 'cookie'],
        },
        interpolation: {
            escapeValue: false,            // React already escapes output
        },
        react: {
            useSuspense: true,             // wait for translations to load
        },
    });

export default i18n;
