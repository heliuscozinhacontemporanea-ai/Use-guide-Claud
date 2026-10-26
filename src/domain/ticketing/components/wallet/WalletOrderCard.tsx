import { CalendarClock, Clock, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
import type { TicketOrder } from '../../types/ticketing';

interface WalletOrderCardProps {
  order: TicketOrder;
  canResume: boolean;
  canRefund: boolean;
  busy: boolean;
  onResume: () => void;
  onRefund: () => void;
  /** "Relatar problema", montado pela composição (D16, 2A). */
  claimAction?: ReactNode;
}

export function WalletOrderCard({
  order,
  canResume,
  canRefund,
  busy,
  onResume,
  onRefund,
  claimAction,
}: WalletOrderCardProps) {
  const { t, i18n } = useTranslation();
  const dateFormat = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(i18n.language, { timeZone: 'America/Fortaleza', ...options });
  const refundUntil =
    order.eventSnapshot && order.status !== 'refunded' && order.status !== 'canceled'
      ? rescheduleRefundDeadline(order.rescheduledAt, order.eventSnapshot.startsAt, new Date())
      : null;
  return (
    <GlassCard className="p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-bold text-ink">
            {t('ticketWallet.order', {
              id: order.id.slice(0, 8),
              amount: formatMoneyMinor(order.totalMinor, i18n.language),
            })}
          </p>
          <p className="text-xs text-ink/70">
            {dateFormat({ dateStyle: 'medium' }).format(new Date(order.createdAt))} •{' '}
            <span className="font-semibold text-accent">
              {t(`ticketWallet.orderStatus.${order.status}`, { defaultValue: order.status })}
            </span>
          </p>
          {order.expiresAt && order.status === 'pending_payment' && (
            <p className="text-xs text-warn flex items-center gap-1">
              <Clock size={12} aria-hidden="true" />
              {t('ticketWallet.reservedUntil', {
                time: dateFormat({ timeStyle: 'short' }).format(new Date(order.expiresAt)),
              })}
            </p>
          )}
        </div>

        {(canResume || canRefund) && (
          <div className="flex items-center gap-2 flex-wrap">
            {canResume && (
              <button
                type="button"
                disabled={busy}
                onClick={onResume}
                className="min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <Clock size={14} aria-hidden="true" />
                {t('ticketWallet.actions.resume')}
              </button>
            )}
            {canRefund && (
              <button
                type="button"
                disabled={busy}
                onClick={onRefund}
                className="min-h-11 px-3.5 rounded-xl bg-danger-soft border border-danger-line text-xs font-bold text-danger flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <RotateCcw size={14} aria-hidden="true" />
                {t('ticketWallet.actions.refund')}
              </button>
            )}
          </div>
        )}
      </div>
      {refundUntil && (
        <p className="px-3 py-2 rounded-xl border border-info-line bg-info-soft text-xs text-info flex items-start gap-2">
          <CalendarClock size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          {t('ticketWallet.rescheduledNotice', {
            date: dateFormat({ dateStyle: 'medium', timeStyle: 'short' }).format(
              new Date(refundUntil)
            ),
          })}
        </p>
      )}
      {claimAction}
    </GlassCard>
  );
}
