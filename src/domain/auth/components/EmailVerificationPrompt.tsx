import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { StatusText, type StatusTone } from '../../../ui/components/StatusText';
import { TextButton } from '../../../ui/components/TextButton';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { useEmailVerification, useEmailVerificationSync } from '../hooks/useEmailVerification';
import { useEmailVerificationPromptStore } from '../stores/useEmailVerificationPromptStore';

type Feedback = { tone: StatusTone; key: string };

/**
 * Aviso "Confirme seu e-mail" (D22): abre depois do cadastro por e-mail e quando uma ação exige
 * e-mail confirmado. Enquanto a conta não está confirmada, relê a conta quando o app volta à tela.
 */
export function EmailVerificationPrompt() {
  const { t } = useTranslation();
  const reason = useEmailVerificationPromptStore((state) => state.reason);
  const close = useEmailVerificationPromptStore((state) => state.close);
  const verification = useEmailVerification();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  useEmailVerificationSync(!verification.verified, verification.refresh);

  if (!reason) return null;

  const dismiss = () => {
    setFeedback(null);
    close();
  };

  const check = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const verified = await verification.refresh();
      if (!verified) setFeedback({ tone: 'warn', key: 'emailVerification.notYet' });
    } catch {
      setFeedback({ tone: 'danger', key: 'emailVerification.errors.failed' });
    } finally {
      setBusy(false);
    }
  };

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

  const email = verification.email;

  return (
    <Dialog
      open
      nested={reason === 'required'}
      onOpenChange={(open) => !open && dismiss()}
      title={t('emailVerification.title')}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
            <MailCheck size={20} aria-hidden="true" />
          </span>
          <p className="text-[15px] text-ink/80 leading-snug break-words">
            {t(
              reason === 'signup'
                ? 'emailVerification.sentAfterSignup'
                : 'emailVerification.required',
              { email }
            )}
          </p>
        </div>

        {verification.verified ? (
          <>
            <StatusText tone="success">{t('emailVerification.verified')}</StatusText>
            <button type="button" onClick={dismiss} className={`${BUTTON_PRIMARY} w-full`}>
              {t('emailVerification.close')}
            </button>
          </>
        ) : (
          <>
            <p className="text-[13px] text-ink/70">{t('emailVerification.spamHint')}</p>
            {feedback && (
              <p role={feedback.tone === 'danger' ? 'alert' : 'status'}>
                <StatusText tone={feedback.tone}>{t(feedback.key, { email })}</StatusText>
              </p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void check()}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t('emailVerification.checked')}
            </button>
            <div className="flex flex-wrap justify-center gap-x-6">
              <TextButton
                tone="accent"
                disabled={busy || verification.cooldown > 0}
                onClick={() => void resend()}
              >
                {verification.cooldown > 0
                  ? t('emailVerification.resendIn', { seconds: verification.cooldown })
                  : t('emailVerification.resend')}
              </TextButton>
              <TextButton tone="ink" onClick={dismiss}>
                {t('emailVerification.later')}
              </TextButton>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
