import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resolveInitialLocale } from './initialLocale';
import { DEFAULT_LOCALE, normalizeLocale, resolvePreferredLocale } from './locale';
import { resources } from './resources';

const initialLocale =
  typeof window !== 'undefined'
    ? resolveInitialLocale(window.location.pathname, window.location.search, navigator.userAgent)
    : resolvePreferredLocale();
i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: ['pt-BR', 'en', 'fr'],
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
  load: 'currentOnly',
  // @ts-expect-error initImmediate exists at runtime but not in i18next v26 InitOptions type
  initImmediate: false,
  react: {
    useSuspense: false,
  },
});
// Só atualiza o <html lang>: gravar o idioma é papel de saveLocaleChoice (decisão D10).
function syncLocale(locale: string): void {
  const normalizedLocale = normalizeLocale(locale);
  if (!normalizedLocale) {
    return;
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalizedLocale;
  }
}
syncLocale(initialLocale);
i18n.on('languageChanged', syncLocale);
export { i18n };
