import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { refreshEmailVerifiedUseCase, sendEmailVerificationUseCase } from '../factory';
import { useAuthStore } from '../stores/useAuthStore';
import { useEmailVerificationPromptStore } from '../stores/useEmailVerificationPromptStore';

// Espera entre envios do link: o Firebase também limita e responde too-many-requests.
const RESEND_COOLDOWN_MS = 60_000;

function secondsLeft(sentAt: number | null): number {
  if (sentAt === null) return 0;
  return Math.max(0, Math.ceil((sentAt + RESEND_COOLDOWN_MS - Date.now()) / 1000));
}

/** Envio do link e leitura da confirmação do e-mail da conta atual (D22). */
export function useEmailVerification() {
  const { i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setEmailVerified = useAuthStore((state) => state.setEmailVerified);
  const sentAt = useEmailVerificationPromptStore((state) => state.sentAt);
  const markSent = useEmailVerificationPromptStore((state) => state.markSent);
  const [cooldown, setCooldown] = useState(() => secondsLeft(sentAt));

  useEffect(() => {
    setCooldown(secondsLeft(sentAt));
    if (secondsLeft(sentAt) === 0) return;
    const timer = window.setInterval(() => {
      const left = secondsLeft(sentAt);
      setCooldown(left);
      if (left === 0) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sentAt]);

  const send = useCallback(async () => {
    await sendEmailVerificationUseCase(i18n.language);
    markSent(Date.now());
  }, [i18n.language, markSent]);

  const refresh = useCallback(async () => {
    const verified = await refreshEmailVerifiedUseCase();
    if (verified) setEmailVerified(true);
    return verified;
  }, [setEmailVerified]);

  return {
    email: user?.email ?? '',
    verified: user?.emailVerified === true,
    cooldown,
    send,
    refresh,
  };
}

/** Ao voltar para o app (depois de abrir o link em outra aba ou no celular), relê a conta. */
export function useEmailVerificationSync(enabled: boolean, refresh: () => Promise<boolean>) {
  useEffect(() => {
    if (!enabled) return;
    const check = () => {
      if (document.visibilityState === 'visible') void refresh().catch(() => false);
    };
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [enabled, refresh]);
}
