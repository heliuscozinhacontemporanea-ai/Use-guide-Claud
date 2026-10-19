import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import {
  DEFAULT_LOCALE,
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
  if (!suggestion) return null;

  return (
    <LocaleSuggestionBanner
      target={suggestion}
      onSwitch={() => switchLocale(suggestion)}
      onKeep={() => saveLocaleChoice(DEFAULT_LOCALE)}
    />
  );
}
