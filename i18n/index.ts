import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en';
import es from './locales/es';

const locale = Localization.getLocales()[0]?.languageCode ?? 'en';
const supported = ['en', 'es'];
const lng = supported.includes(locale) ? locale : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng,
  fallbackLng: 'en',
  compatibilityJSON: 'v3',   // requerido en React Native (sin Intl.PluralRules completo)
  interpolation: { escapeValue: false },
});

export default i18n;
