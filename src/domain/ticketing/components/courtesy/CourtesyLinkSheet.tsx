import { Copy, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import type { CourtesyLinkCreated } from '../../types/courtesy';
import { buildCourtesyLinkUrl } from '../../utils/courtesyLinkUrl';

/**
 * Link de convite criado (p15). O código só existe nesta tela (o servidor guarda o HMAC): fechar sem
 * enviar deixa o link sem uso, e o organizador pode cancelá-lo na lista.
 */
export function CourtesyLinkSheet({
  link,
  eventTitle,
  onClose,
}: {
  link: CourtesyLinkCreated | null;
  eventTitle: string;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const url = link ? buildCourtesyLinkUrl(window.location.origin, link.courtesyId, link.token) : '';
  const shown = url.replace(/^https?:\/\//, '');
  const text = t('courtesy.linkSheet.whatsappText', { event: eventTitle, url });

  const copy = async () => {
    await navigator.clipboard
      ?.writeText(url)
      .then(() => setCopied(true))
      .catch(() => undefined);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator
        .share({
          text: t('courtesy.linkSheet.whatsappText', { event: eventTitle, url: '' }).trim(),
          url,
        })
        .catch(() => undefined);
      return;
    }
    await copy();
  };

  return (
    <Dialog
      open={link !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('courtesy.linkSheet.title')}
      description={
        link
          ? t('courtesy.linkSheet.validUntil', {
              date: formatBusinessDate(link.expiresAt, i18n.language, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }),
            })
          : undefined
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 min-h-12 pl-4 pr-1 rounded-2xl bg-sheet-card border border-sheet-card-line">
          <p className="flex-1 min-w-0 text-[15px] text-ink truncate select-all">{shown}</p>
          <button
            type="button"
            onClick={() => void copy()}
            aria-label={t('courtesy.linkSheet.copy')}
            className="press w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <Copy size={20} aria-hidden="true" />
          </button>
        </div>
        {copied && (
          <p role="status">
            <StatusText tone="success">{t('courtesy.linkSheet.copied')}</StatusText>
          </p>
        )}
        <p className="text-[15px] text-ink/70">{t('courtesy.linkSheet.hint')}</p>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BUTTON_PRIMARY} w-full inline-flex items-center justify-center gap-2`}
        >
          <MessageCircle size={20} aria-hidden="true" />
          {t('courtesy.linkSheet.whatsapp')}
        </a>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void share()}
            className="press min-h-11 px-3 rounded-xl inline-flex items-center gap-2 text-[15px] font-semibold text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <Share2 size={18} aria-hidden="true" />
            {t('courtesy.linkSheet.share')}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
