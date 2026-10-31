import { Ticket as TicketIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { openEmailVerificationPromptUseCase } from '../../../auth';
import { acceptTransferLinkUseCase } from '../../application/usecases/acceptTransferLinkUseCase';
import { previewTransferLinkUseCase } from '../../application/usecases/previewTransferLinkUseCase';
import type { TicketTransferLinkPreview } from '../../types/ticketing';

const KNOWN_ERRORS = [
  'TRANSFER_LINK_INVALID',
  'TRANSFER_LINK_EXPIRED',
  'TRANSFER_LINK_OWN',
  'RECIPIENT_NOT_VERIFIED',
  'RATE_LIMITED',
];

function errorCode(err: unknown): string {
  return err instanceof Error && KNOWN_ERRORS.includes(err.message) ? err.message : 'failed';
}

/**
 * Quem abriu um link de transferência (D21): sem login, pede para entrar ou criar a conta; com
 * login, mostra o ingresso e de quem vem antes de aceitar.
 */
export function TransferLinkReceiverDialog({
  link,
  loggedIn,
  onLogin,
  onAccepted,
  onClose,
}: {
  link: { linkId: string; token: string };
  loggedIn: boolean;
  onLogin: () => void;
  onAccepted: () => void;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [preview, setPreview] = useState<TicketTransferLinkPreview | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const error = errorKey ? t(`username.transfer.link.errors.${errorKey}`) : null;

  useEffect(() => {
    if (!loggedIn) return;
    setErrorKey(null);
    void previewTransferLinkUseCase(link.linkId, link.token)
      .then(setPreview)
      .catch((err: unknown) => setErrorKey(errorCode(err)));
  }, [link.linkId, link.token, loggedIn]);

  const accept = async () => {
    setBusy(true);
    setErrorKey(null);
    try {
      await acceptTransferLinkUseCase(link.linkId, link.token);
      setAccepted(true);
    } catch (err: unknown) {
      const code = errorCode(err);
      if (code === 'RECIPIENT_NOT_VERIFIED') openEmailVerificationPromptUseCase();
      setErrorKey(code);
    } finally {
      setBusy(false);
    }
  };

  const fromLabel = preview?.from.username
    ? `@${preview.from.username}`
    : (preview?.from.displayName ?? '');

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('username.transfer.link.receiveTitle')}
    >
      <div className="space-y-4">
        {!loggedIn ? (
          <>
            <p className="text-[13px] text-ink/70">{t('username.transfer.link.loginHint')}</p>
            <button type="button" onClick={onLogin} className={`${BUTTON_PRIMARY} w-full`}>
              {t('username.transfer.link.login')}
            </button>
          </>
        ) : accepted ? (
          <>
            <StatusText tone="success">{t('username.transfer.link.accepted')}</StatusText>
            <button type="button" onClick={onAccepted} className={`${BUTTON_PRIMARY} w-full`}>
              {t('username.transfer.link.seeTickets')}
            </button>
          </>
        ) : preview ? (
          <>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-ink/[0.04]">
              <span className="w-11 h-11 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                <TicketIcon size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink break-words">
                  {preview.eventTitle}
                </p>
                <p className="text-[13px] text-ink/70">
                  {[
                    preview.ticketType,
                    preview.startsAt && formatBusinessDateTime(preview.startsAt, i18n.language),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </div>
            <p className="text-[13px] text-ink/70">
              {t('username.transfer.link.from', {
                name: fromLabel,
                time: formatBusinessDateTime(preview.expiresAt, i18n.language),
              })}
            </p>
            {error && (
              <p role="alert">
                <StatusText tone="danger">{error}</StatusText>
              </p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void accept()}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t('username.transfer.link.accept')}
            </button>
            <div className="flex justify-center">
              <TextButton tone="ink" onClick={onClose}>
                {t('username.transfer.link.decline')}
              </TextButton>
            </div>
          </>
        ) : error ? (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        ) : (
          <div className="h-24 rounded-2xl bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
        )}
      </div>
    </Dialog>
  );
}
