import { Copy, Link2, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { cancelTransferLinkUseCase } from '../../application/usecases/cancelTransferLinkUseCase';
import { createTransferLinkUseCase } from '../../application/usecases/createTransferLinkUseCase';
import type { Ticket } from '../../types/ticketing';
import { buildTransferLinkUrl } from '../../utils/transferLinkUrl';

const KNOWN_ERRORS = ['RATE_LIMITED', 'TRANSFER_ONLY_TO_BUYER'];

/**
 * Link de transferência para quem ainda não tem conta (D21): vale 30 min e uma vez só. O código
 * aparece só agora; o ingresso continua com quem comprou até alguém aceitar.
 */
export function TransferLinkPanel({
  ticket,
  onChanged,
}: {
  ticket: Ticket;
  onChanged: () => Promise<void> | void;
}) {
  const { t, i18n } = useTranslation();
  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(
    ticket.transferLinkExpiresAt && new Date(ticket.transferLinkExpiresAt) > new Date()
      ? ticket.transferLinkExpiresAt
      : null
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: 'success' | 'danger'; message: string } | null>(
    null
  );
  const time = (iso: string) => formatBusinessDateTime(iso, i18n.language);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setStatus(null);
    try {
      await action();
    } catch (err: unknown) {
      const code =
        err instanceof Error && KNOWN_ERRORS.includes(err.message) ? err.message : 'failed';
      setStatus({ tone: 'danger', message: t(`username.transfer.errors.${code}`) });
    } finally {
      setBusy(false);
    }
  };

  const create = () =>
    run(async () => {
      const link = await createTransferLinkUseCase(ticket.id);
      setUrl(buildTransferLinkUrl(window.location.origin, link.linkId, link.token));
      setExpiresAt(link.expiresAt);
      await onChanged();
    });

  const cancel = () =>
    run(async () => {
      await cancelTransferLinkUseCase(ticket.id);
      setUrl(null);
      setExpiresAt(null);
      await onChanged();
    });

  const share = async () => {
    if (!url) return;
    const text = t('username.transfer.link.shareText', {
      event: ticket.eventSnapshot?.title ?? '',
    });
    if (navigator.share) {
      await navigator.share({ text, url }).catch(() => undefined);
      return;
    }
    await copy();
  };

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard
      ?.writeText(url)
      .then(() => setStatus({ tone: 'success', message: t('username.transfer.link.copied') }))
      .catch(() => undefined);
  };

  return (
    <div className="space-y-3 p-3 rounded-2xl bg-ink/[0.04]">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
        <Link2 size={16} aria-hidden="true" />
        {t('username.transfer.link.title')}
      </p>
      {url ? (
        <>
          <p className="text-[13px] text-ink/70">
            {t('username.transfer.link.ready', { time: expiresAt ? time(expiresAt) : '' })}
          </p>
          <p className="text-[12px] text-ink/70 break-all select-all p-2 rounded-xl bg-surface border border-line">
            {url}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void share()}
              className={`${BUTTON_PRIMARY} inline-flex items-center justify-center gap-1.5`}
            >
              <Share2 size={16} aria-hidden="true" />
              {t('username.transfer.link.share')}
            </button>
            <button
              type="button"
              onClick={() => void copy()}
              className={`${BUTTON_SECONDARY} inline-flex items-center justify-center gap-1.5`}
            >
              <Copy size={16} aria-hidden="true" />
              {t('username.transfer.link.copy')}
            </button>
          </div>
        </>
      ) : expiresAt ? (
        <p className="text-[13px] text-ink/70">
          {t('username.transfer.link.pending', { time: time(expiresAt) })}
        </p>
      ) : (
        <>
          <p className="text-[13px] text-ink/70">{t('username.transfer.link.hint')}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void create()}
            className={`${BUTTON_SECONDARY} w-full`}
          >
            {t('username.transfer.link.create')}
          </button>
        </>
      )}
      {status && (
        <p role="status">
          <StatusText tone={status.tone}>{status.message}</StatusText>
        </p>
      )}
      {(url || expiresAt) && (
        <div className="flex justify-center">
          <TextButton tone="danger" disabled={busy} onClick={() => void cancel()}>
            {t('username.transfer.link.cancel')}
          </TextButton>
        </div>
      )}
    </div>
  );
}
