/** Espelho de src/shared/i18n/locale.ts; o teste de paridade garante que são iguais (AGENTS.md §12.5). */
export const SUPPORTED_LOCALES = ['pt-BR', 'en', 'fr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt-BR';
