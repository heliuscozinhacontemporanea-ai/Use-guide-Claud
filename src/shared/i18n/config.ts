import i18n, { type BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resolveInitialLocale } from './initialLocale';
import { DEFAULT_LOCALE, normalizeLocale, resolvePreferredLocale } from './locale';
import { ptBR } from './resources';

const LOCALE_LOADERS: Record<string, () => Promise<Record<string, unknown>>> = {
  en: () => import('./resources.en').then((module) => ({ ...module.en })),
  fr: () => import('./resources.fr').then((module) => ({ ...module.fr })),
};
const pendingLocales = new Map<string, Promise<Record<string, unknown>>>();

function fetchLocale(language: string): Promise<Record<string, unknown>> | null {
  const load = LOCALE_LOADERS[language];
  if (!load) return null;
  let pending = pendingLocales.get(language);
  if (!pending) {
    pending = load();
    pendingLocales.set(language, pending);
    pending.catch(() => pendingLocales.delete(language));
  }
  return pending;
}

/** en e fr chegam sob demanda; `changeLanguage` só resolve depois que o idioma carregou. */
const lazyLocaleBackend: BackendModule = {
  type: 'backend',
  init: () => undefined,
  read: (language, _namespace, callback) => {
    const pending = fetchLocale(language);
    if (!pending) {
      callback(null, {});
      return;
    }
    pending.then(
      (translation) => callback(null, translation),
      (error: unknown) => callback(error instanceof Error ? error : new Error(String(error)), null)
    );
  },
};

const initialLocale =
  typeof window !== 'undefined'
    ? resolveInitialLocale(window.location.pathname, window.location.search, navigator.userAgent)
    : resolvePreferredLocale();
/** Resolve quando o idioma inicial está pronto; o app só pinta depois, para não piscar em português. */
export const i18nReady = i18n
  .use(lazyLocaleBackend)
  .use(initReactI18next)
  .init({
    resources: { 'pt-BR': { translation: ptBR } },
    partialBundledLanguages: true,
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

/**
 * Garante os textos de um idioma sem trocar o idioma da tela (ex.: aviso que fala no idioma do
 * navegador). Não usa `loadLanguages`, que responde na hora para um idioma já pedido mas ainda a caminho.
 */
export async function ensureLocaleLoaded(locale: string): Promise<void> {
  if (i18n.hasResourceBundle(locale, 'translation')) return;
  const pending = fetchLocale(locale);
  if (!pending) return;
  const translation = await pending;
  if (!i18n.hasResourceBundle(locale, 'translation')) {
    i18n.addResourceBundle(locale, 'translation', translation, true, true);
  }
}
