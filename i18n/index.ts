import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en';
import es from './locales/es';

const LANG_KEY = 'oztrack_language';

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

// Si el usuario eligió manualmente un idioma antes, tiene prioridad sobre
// el idioma del dispositivo detectado arriba.
AsyncStorage.getItem(LANG_KEY).then(saved => {
  if (saved && supported.includes(saved) && saved !== i18n.language) {
    i18n.changeLanguage(saved);
  }
});

export async function setAppLanguage(lang: 'en' | 'es') {
  await AsyncStorage.setItem(LANG_KEY, lang);
  await i18n.changeLanguage(lang);
}

export default i18n;
