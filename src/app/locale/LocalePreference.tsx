import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import {
  DEFAULT_LOCALE,
  ensureLocaleLoaded,
  type Locale,
  onLocaleChoice,
  saveLocaleChoice,
  suggestedLocaleFor,
} from '../../shared/i18n';
import { LocaleSuggestionBanner } from './LocaleSuggestionBanner';
import { useAccountLocaleSync } from './useAccountLocaleSync';

/** Aviso de idioma e sincronização com a conta (decisão D10); o redirecionamento da home fica no main.tsx. */
export function LocalePreference() {
  const { pathname } = useLocation();
  const { switchLocale } = useLocalizedRouting();
  const [, setChoiceVersion] = useState(0);
  // Inscrito antes da sincronização com a conta, que pode gravar uma escolha no mesmo ciclo.
  useEffect(() => onLocaleChoice(() => setChoiceVersion((version) => version + 1)), []);
  useAccountLocaleSync();

  const suggestion = suggestedLocaleFor(pathname, navigator.userAgent);
  // O aviso fala no idioma sugerido, que pode ainda não ter sido baixado (AGENTS.md §12.2).
  const [loadedLocale, setLoadedLocale] = useState<Locale | null>(null);
  useEffect(() => {
    if (!suggestion) return;
    let active = true;
    void ensureLocaleLoaded(suggestion).then(() => {
      if (active) setLoadedLocale(suggestion);
    });
    return () => {
      active = false;
    };
  }, [suggestion]);
  if (!suggestion || loadedLocale !== suggestion) return null;

  return (
    <LocaleSuggestionBanner
      target={suggestion}
      onSwitch={() => switchLocale(suggestion)}
      onKeep={() => saveLocaleChoice(DEFAULT_LOCALE)}
    />
  );
}
