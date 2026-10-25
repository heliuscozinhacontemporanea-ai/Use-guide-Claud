import { QrCode, RefreshCw, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { GlassCard } from '../../../../ui/components/GlassCard';
import type { Ticket } from '../../types/ticketing';

interface WalletTicketCardProps {
  ticket: Ticket;
  qrDataUrl?: string;
  canTransfer: boolean;
  busy: boolean;
  onShowQr: () => void;
  onReissueQr: () => void;
  onTransfer: () => void;
}

const ACTION =
  'min-h-11 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function WalletTicketCard({
  ticket,
  qrDataUrl,
  canTransfer,
  busy,
  onShowQr,
  onReissueQr,
  onTransfer,
}: WalletTicketCardProps) {
  const { t, i18n } = useTranslation();
  const startsAt = ticket.eventSnapshot?.startsAt;
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
              {t('ticketWallet.session', {
                date: new Intl.DateTimeFormat(i18n.language, {
                  timeZone: 'America/Fortaleza',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(startsAt)),
              })}
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
                : 'bg-white/10 text-ink/70'
          )}
        >
          {t(`ticketWallet.ticketStatus.${ticket.status}`, { defaultValue: ticket.status })}
        </span>
      </div>

      {qrDataUrl && (
        <div className="p-3 rounded-xl bg-white flex flex-col items-center gap-2">
          <img
            src={qrDataUrl}
            width={160}
            height={160}
            alt={t('ticketCheckout.issued.qrAlt', { id: ticket.id.slice(0, 8) })}
            className="w-40 h-40"
          />
          <span className="text-xs font-mono text-slate-700">
            {t('ticketWallet.qrSigned', { version: ticket.qrVersion })}
          </span>
        </div>
      )}

      {(ticket.status === 'issued' || canTransfer) && (
        <div className="flex items-center gap-2 pt-2 border-t border-line flex-wrap">
          {ticket.status === 'issued' && (
            <button
              type="button"
              disabled={busy}
              onClick={onShowQr}
              className={cn(ACTION, 'flex-1 bg-surface hover:bg-white/10 text-ink')}
            >
              <QrCode size={14} className="text-teal-400" aria-hidden="true" />
              {t('ticketWallet.actions.showQr')}
            </button>
          )}
          {ticket.status === 'issued' && qrDataUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={onReissueQr}
              className={cn(ACTION, 'bg-surface hover:bg-white/10 text-ink/80')}
            >
              <RefreshCw size={13} aria-hidden="true" />
              {t('ticketWallet.actions.reissueQr')}
            </button>
          )}
          {canTransfer && (
            <button
              type="button"
              onClick={onTransfer}
              className={cn(ACTION, 'flex-1 bg-accent-soft border border-accent-line text-accent')}
            >
              <Send size={14} aria-hidden="true" />
              {t('ticketWallet.actions.transfer')}
            </button>
          )}
        </div>
      )}
    </GlassCard>
  );
}
