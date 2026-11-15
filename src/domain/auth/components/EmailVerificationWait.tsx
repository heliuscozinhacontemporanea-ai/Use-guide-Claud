import { MailCheck } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusText, type StatusTone } from '../../../ui/components/StatusText';
import { BUTTON_SECONDARY } from '../../../ui/styles/controls';
import { useEmailVerification, useEmailVerificationSync } from '../hooks/useEmailVerification';
import { useEmailVerificationPromptStore } from '../stores/useEmailVerificationPromptStore';

// Enquanto a página está aberta, relê a conta de tempos em tempos: a pessoa confirma em outra aba.
const POLL_MS = 5000;

type Feedback = { tone: StatusTone; key: string };

/**
 * Espera a confirmação do e-mail dentro de um fluxo (Seja parceiro, D34): só "Reenviar o e-mail",
 * porque a conta criada não troca de e-mail, e segue sozinha quando o e-mail é confirmado.
 */
export function EmailVerificationWait({
  onVerified,
  note,
}: {
  onVerified: () => void;
  /** Linha extra abaixo da espera (ex.: os dados do negócio ficam guardados). */
  note?: ReactNode;
}) {
  const { t } = useTranslation();
  const verification = useEmailVerification();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  useEmailVerificationSync(!verification.verified, verification.refresh);
  const sentAt = useEmailVerificationPromptStore((state) => state.sentAt);

  // Conta antiga sem e-mail confirmado: o link sai ao abrir a página (a conta nova já recebeu).
  // biome-ignore lint/correctness/useExhaustiveDependencies: só na abertura da página.
  useEffect(() => {
    if (!verification.verified && sentAt === null) void verification.send().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (verification.verified) {
      onVerified();
      return;
    }
    const timer = window.setInterval(() => {
      void verification.refresh().catch(() => false);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [verification.verified, verification.refresh, onVerified]);

  const resend = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await verification.send();
      setFeedback({ tone: 'success', key: 'emailVerification.sent' });
    } catch (err: unknown) {
      const tooMany = err instanceof Error && err.message === 'TOO_MANY_REQUESTS';
      setFeedback({
        tone: 'danger',
        key: tooMany
          ? 'emailVerification.errors.TOO_MANY_REQUESTS'
          : 'emailVerification.errors.failed',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center gap-4 pt-6">
      <span className="w-16 h-16 rounded-full bg-partner-soft text-partner flex items-center justify-center">
        <MailCheck size={28} aria-hidden="true" />
      </span>
      <h2 className="text-[21px] font-display font-bold text-ink">
        {t('emailVerification.title')}
      </h2>
      <p className="text-[15px] text-ink/75 leading-snug break-words">
        {t('emailVerification.continuesHere', { email: verification.email })}
      </p>
      <p role="status" className="flex items-center gap-2 text-[13px] text-ink/70">
        <span
          aria-hidden="true"
          className="w-2 h-2 rounded-full bg-partner animate-pulse motion-reduce:animate-none"
        />
        {t('emailVerification.waiting')}
      </p>
      {note ? <p className="text-[13px] text-ink/70">{note}</p> : null}
      {feedback ? (
        <p role={feedback.tone === 'danger' ? 'alert' : 'status'}>
          <StatusText tone={feedback.tone}>
            {t(feedback.key, { email: verification.email })}
          </StatusText>
        </p>
      ) : null}
      <p className="text-[13px] text-ink/70">{t('emailVerification.spamHint')}</p>
      <button
        type="button"
        disabled={busy || verification.cooldown > 0}
        onClick={() => void resend()}
        className={`${BUTTON_SECONDARY} w-full`}
      >
        {verification.cooldown > 0
          ? t('emailVerification.resendEmailIn', { seconds: verification.cooldown })
          : t('emailVerification.resendEmail')}
      </button>
    </div>
  );
}
