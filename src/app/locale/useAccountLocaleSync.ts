import { useEffect } from 'react';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { updatePreferredLocaleUseCase } from '../../domain/user';
import {
  type Locale,
  normalizeLocale,
  onLocaleChoice,
  readSavedLocale,
  saveLocaleChoice,
} from '../../shared/i18n';

function saveOnAccount(locale: Locale): void {
  updatePreferredLocaleUseCase(locale).catch((error: unknown) => {
    console.error('[useAccountLocaleSync] idioma não salvo na conta:', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
  });
}

/**
 * Mantém a escolha de idioma igual entre o navegador e a conta (decisão D10): a escolha da conta
 * vale em qualquer aparelho; uma escolha feita antes do login sobe para a conta que ainda não tem.
 */
export function useAccountLocaleSync(): void {
  const { user, profile } = useAuthContext();
  const uid = user?.uid ?? null;
  const accountLocale = profile ? normalizeLocale(profile.preferredLocale) : undefined;

  useEffect(() => {
    if (!uid) return undefined;
    return onLocaleChoice((locale, source) => {
      if (source === 'user') saveOnAccount(locale);
    });
  }, [uid]);

  useEffect(() => {
    if (!uid || accountLocale === undefined) return;
    const savedLocale = readSavedLocale();
    if (accountLocale && accountLocale !== savedLocale) {
      saveLocaleChoice(accountLocale, 'account');
    } else if (!accountLocale && savedLocale) {
      saveOnAccount(savedLocale);
    }
  }, [uid, accountLocale]);
}
