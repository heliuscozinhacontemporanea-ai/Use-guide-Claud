import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  normalizeLocale,
  persistLocale,
  resolveInitialLocale,
} from './locale';
import { resolveLocaleFromPathname } from './localizedRoutes';
import { resources } from './resources';
// A URL tem prioridade sobre o idioma salvo (decisão D6); fora das rotas localizadas vale a preferência.
const initialLocale =
  (typeof window !== 'undefined' ? resolveLocaleFromPathname(window.location.pathname) : null) ??
  resolveInitialLocale();
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
function syncLocale(locale: string): void {
  const normalizedLocale = normalizeLocale(locale);
  if (!normalizedLocale) {
    return;
  }
  persistLocale(normalizedLocale);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalizedLocale;
  }
}
syncLocale(initialLocale);
i18n.on('languageChanged', syncLocale);
export { i18n };
