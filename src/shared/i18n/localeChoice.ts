import { type Locale, persistLocale } from './locale';

/** `user`: escolha feita agora nesta tela; `account`: preferência trazida da conta. */
export type LocaleChoiceSource = 'user' | 'account';
type LocaleChoiceListener = (locale: Locale, source: LocaleChoiceSource) => void;

const listeners = new Set<LocaleChoiceListener>();

/** Única forma de gravar o idioma: mudança causada pela URL não passa por aqui (decisão D10). */
export function saveLocaleChoice(locale: Locale, source: LocaleChoiceSource = 'user'): void {
  persistLocale(locale);
  for (const listener of listeners) listener(locale, source);
}

export function onLocaleChoice(listener: LocaleChoiceListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
