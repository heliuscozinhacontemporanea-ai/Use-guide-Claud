import { QrCode, Send, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { TextButton } from '../../../../ui/components/TextButton';
import { cn } from '../../../../shared/utils/cn';
import type { TicketQrPreview } from '../../hooks/useTicketWalletActions';
import type { Ticket } from '../../types/ticketing';
import { TICKET_CODE_PREFIX } from '../../utils/ticketCode';

interface WalletTicketCardProps {
  ticket: Ticket;
  qr?: TicketQrPreview;
  canTransfer: boolean;
  busy: boolean;
  onShowQr: () => void;
  onSwapQr: () => void;
  onTransfer: () => void;
}

const ACTION =
  'min-h-11 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function WalletTicketCard({
  ticket,
  qr,
  canTransfer,
  busy,
  onShowQr,
  onSwapQr,
  onTransfer,
}: WalletTicketCardProps) {
  const { t, i18n } = useTranslation();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const startsAt = ticket.eventSnapshot?.startsAt;
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      timeZone: 'America/Fortaleza',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  return (
    <GlassCard className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">
            {ticket.ticketTypeSnapshot?.name || t('ticketCheckout.issued.defaultType')}
          </p>
          <h4 className="text-sm font-bold text-ink break-words">
            {ticket.eventSnapshot?.title || ticket.holderName}
          </h4>
          <p className="text-xs text-ink/70 break-all">
            {ticket.holderName} • {ticket.holderEmail}
          </p>
          {startsAt && (
            <p className="text-xs text-ink/70 mt-0.5">
              {t('ticketWallet.session', { date: formatDate(startsAt) })}
            </p>
          )}
        </div>
        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-bold shrink-0',
            ticket.status === 'issued'
              ? 'bg-accent-soft text-accent'
              : ticket.status === 'checked_in'
                ? 'bg-success-soft text-success'
                : 'bg-ink/[0.06] text-ink/70'
          )}
        >
          {t(`ticketWallet.ticketStatus.${ticket.status}`, { defaultValue: ticket.status })}
        </span>
      </div>

      {ticket.transferLinkExpiresAt && new Date(ticket.transferLinkExpiresAt) > new Date() && (
        <p className="text-[13px] text-warn">
          {t('username.transfer.link.pending', { time: formatDate(ticket.transferLinkExpiresAt) })}
        </p>
      )}
      {qr && (
        <div className="space-y-3">
          <div className="mx-auto w-full max-w-[240px] aspect-square rounded-2xl bg-white p-3">
            <img
              src={qr.dataUrl}
              width={240}
              height={240}
              alt={t('ticketCheckout.issued.qrAlt', { id: ticket.id.slice(0, 8) })}
              className="w-full h-full"
            />
          </div>
          {qr.code ? (
            <>
              <p
                className="text-center font-display text-[26px] font-bold tracking-[0.12em] tabular-nums text-ink select-all break-all"
                aria-label={t('ticketWallet.code.label', { code: qr.code.split('').join(' ') })}
              >
                {TICKET_CODE_PREFIX}:{qr.code}
              </p>
              <p className="text-[13px] text-ink/70 text-center">{t('ticketWallet.code.hint')}</p>
              <p className="flex items-start gap-2 text-[13px] text-warn">
                <ShieldAlert size={16} className="shrink-0 mt-px" aria-hidden="true" />
                {t('ticketWallet.code.warning')}
              </p>
            </>
          ) : (
            qr.codeVisibleFrom && (
              <p className="text-[13px] text-ink/70 text-center">
                {t('ticketWallet.code.notYet', { date: formatDate(qr.codeVisibleFrom) })}
              </p>
            )
          )}
        </div>
      )}

      {(ticket.status === 'issued' || canTransfer) && (
        <div className="flex items-center gap-2 pt-2 border-t border-line flex-wrap">
          {ticket.status === 'issued' && (
            <button
              type="button"
              disabled={busy}
              onClick={onShowQr}
              className={cn(
                ACTION,
                'flex-1 bg-surface border border-line hover:bg-accent-soft text-ink'
              )}
            >
              <QrCode size={14} className="text-teal-400" aria-hidden="true" />
              {t('ticketWallet.actions.showQr')}
            </button>
          )}
          {canTransfer && (
            <button
              type="button"
              onClick={onTransfer}
              className={cn(ACTION, 'flex-1 bg-accent-soft border border-accent-line text-accent')}
            >
              <Send size={14} aria-hidden="true" />
              {t(
                ticket.receivedFrom
                  ? 'ticketWallet.actions.return'
                  : 'ticketWallet.actions.transfer'
              )}
            </button>
          )}
        </div>
      )}
      {ticket.status === 'issued' && !ticket.qrSwappedAt && (
        <div className="flex justify-center">
          <TextButton
            tone="ink"
            disabled={busy}
            onClick={() =>
              setConfirm({
                title: t('ticketWallet.swap.title'),
                message: t('ticketWallet.swap.message'),
                confirmLabel: t('ticketWallet.swap.confirm'),
                cancelLabel: t('common.cancel'),
                tone: 'danger',
                onCancel: () => setConfirm(null),
                onConfirm: () => {
                  setConfirm(null);
                  onSwapQr();
                },
              })
            }
          >
            {t('ticketWallet.swap.action')}
          </TextButton>
        </div>
      )}
      <ConfirmDialog data={confirm} />
    </GlassCard>
  );
}
