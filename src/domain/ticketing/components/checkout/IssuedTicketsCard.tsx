import { CheckCircle2, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import type { IssuedTicketView } from '../../hooks/useTicketCheckout';
import type { TicketOrder } from '../../types/ticketing';

interface IssuedTicketsCardProps {
  order: TicketOrder;
  eventTitle: string;
  tickets: IssuedTicketView[];
  onBuyMore: () => void;
}

export function IssuedTicketsCard({
  order,
  eventTitle,
  tickets,
  onBuyMore,
}: IssuedTicketsCardProps) {
  const { t } = useTranslation();
  return (
    <GlassCard className="p-5 space-y-4 border-teal-500/30">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
          <CheckCircle2 size={22} aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-ink">
            {order.totalMinor === 0
              ? t('ticketCheckout.issued.freeTitle')
              : t('ticketCheckout.issued.paidTitle')}
          </h4>
          <p className="text-xs text-ink/70">
            {t('ticketCheckout.issued.order', { id: order.id.slice(0, 8), event: eventTitle })}
          </p>
        </div>
      </div>

      {tickets.length > 0 && (
        <ul className="space-y-3 pt-2">
          {tickets.map(({ ticket, qrDataUrl }) => (
            <li
              key={ticket.id}
              className="p-3.5 rounded-2xl bg-black/40 border border-line flex flex-col sm:flex-row items-center gap-4"
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  width={112}
                  height={112}
                  alt={t('ticketCheckout.issued.qrAlt', { id: ticket.id.slice(0, 8) })}
                  className="w-28 h-28 rounded-xl bg-white p-1.5 shrink-0"
                />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                  <QrCode size={36} aria-hidden="true" />
                </div>
              )}
              <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
                <p className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  {ticket.ticketTypeSnapshot?.name || t('ticketCheckout.issued.defaultType')}
                </p>
                <p className="text-sm font-bold text-ink break-words">{ticket.holderName}</p>
                <p className="text-xs text-ink/70 break-all">{ticket.holderEmail}</p>
                <p className="text-xs text-ink/70 font-mono">
                  {t('ticketCheckout.issued.ticketId', {
                    id: ticket.id.slice(0, 12),
                    version: ticket.qrVersion,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onBuyMore}
        className="w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-ink transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {t('ticketCheckout.issued.buyMore')}
      </button>
    </GlassCard>
  );
}
