export const SUPPORTED_LOCALES = ['pt-BR', 'en', 'fr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt-BR';
export const LOCALE_STORAGE_KEY = 'useguide.locale';
export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) {
    return null;
  }
  const normalized = value.trim().replace('_', '-').toLowerCase();
  if (normalized === 'pt' || normalized.startsWith('pt-')) {
    return 'pt-BR';
  }
  if (normalized === 'en' || normalized.startsWith('en-')) {
    return 'en';
  }
  if (normalized === 'fr' || normalized.startsWith('fr-')) {
    return 'fr';
  }
  return null;
}
/** Idioma escolhido pela pessoa (Configurações ou aviso de idioma); `null` se nunca escolheu. */
export function readSavedLocale(): Locale | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return null;
  }
}
function readBrowserLocales(): string[] {
  if (typeof navigator === 'undefined') {
    return [];
  }
  const languages = Array.isArray(navigator.languages) ? navigator.languages : [];
  return [...languages, navigator.language].filter((language): language is string =>
    Boolean(language)
  );
}
/** Preferência sem olhar a URL: escolha salva → idioma do navegador → pt-BR (decisão D10). */
export function resolvePreferredLocale(): Locale {
  const savedLocale = readSavedLocale();
  if (savedLocale) {
    return savedLocale;
  }
  for (const candidate of readBrowserLocales()) {
    const locale = normalizeLocale(candidate);
    if (locale) {
      return locale;
    }
  }
  return DEFAULT_LOCALE;
}
export function persistLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // A indisponibilidade do storage não pode impedir a troca de idioma.
  }
}

export function getLocaleDisplayLabel(targetLocale: Locale, currentLocale: Locale): string {
  if (targetLocale === 'pt-BR') {
    return 'Português';
  }

  if (targetLocale === 'en') {
    switch (currentLocale) {
      case 'en':
        return 'English';
      case 'fr':
        return 'Anglais';
      default:
        return 'Inglês';
    }
  }

  if (targetLocale === 'fr') {
    switch (currentLocale) {
      case 'fr':
        return 'Français';
      case 'en':
        return 'French';
      default:
        return 'Francês';
    }
  }

  return targetLocale;
}
