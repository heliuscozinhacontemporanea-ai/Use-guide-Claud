import { CalendarClock, Ticket } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { rescheduleRefundDeadline } from '../../../../shared/utils/rescheduleRefundDeadline';
import { StatusText, type StatusTone } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import type { TicketOrder } from '../../types/ticketing';

interface WalletOrderCardProps {
  order: TicketOrder;
  ticketCount: number;
  canResume: boolean;
  canRefund: boolean;
  busy: boolean;
  onResume: () => void;
  onRefund: () => void;
  /** "Relatar", montado pela composição (D16, 2A). */
  claimAction?: ReactNode;
}

// Código curto do pedido para o atendimento; o ID completo continua no backend.
const ORDER_CODE_LENGTH = 10;

const STATUS_TONE: Partial<Record<TicketOrder['status'], StatusTone>> = {
  payment_processing: 'info',
  payment_failed: 'danger',
  expired: 'muted',
  refund_pending: 'info',
  refunded: 'muted',
  canceled: 'muted',
  disputed: 'warn',
};

/**
 * Pedido de ingresso (D17): o evento e quando, e uma linha só com o que a pessoa precisa saber ou
 * fazer agora.
 */
export function WalletOrderCard({
  order,
  ticketCount,
  canResume,
  canRefund,
  busy,
  onResume,
  onRefund,
  claimAction,
}: WalletOrderCardProps) {
  const { t, i18n } = useTranslation();
  const format = (iso: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(i18n.language, { timeZone: 'America/Fortaleza', ...options }).format(
      new Date(iso)
    );
  const event = order.eventSnapshot;
  const upcoming = event ? new Date(event.startsAt).getTime() > Date.now() : false;
  const refundUntil =
    event && (order.status === 'paid' || order.status === 'partially_refunded')
      ? rescheduleRefundDeadline(order.rescheduledAt, event.startsAt, new Date())
      : null;
  const statusTone = STATUS_TONE[order.status];
  const status = t(`ticketWallet.orderStatus.${order.status}`, { defaultValue: order.status });

  let footer: ReactNode = null;
  if (canResume) {
    footer = (
      <div className="flex items-center justify-between gap-3">
        <StatusText tone="warn">
          {order.expiresAt
            ? t('ticketWallet.reservedUntil', {
                time: format(order.expiresAt, { timeStyle: 'short' }),
              })
            : status}
        </StatusText>
        <TextButton tone="accent" disabled={busy} onClick={onResume}>
          {t('ticketWallet.payShort')}
        </TextButton>
      </div>
    );
  } else if (statusTone) {
    footer = <StatusText tone={statusTone}>{status}</StatusText>;
  } else if (upcoming) {
    footer = (refundUntil || canRefund) && (
      <div className="flex items-start justify-between gap-3">
        {refundUntil ? (
          <span className="flex items-start gap-2 text-[13px] text-info">
            <CalendarClock size={16} className="shrink-0 mt-px" aria-hidden="true" />
            {t('ticketWallet.rescheduledNotice', {
              date: format(refundUntil, { day: 'numeric', month: 'short' }),
            })}
          </span>
        ) : (
          <span />
        )}
        {canRefund && (
          <TextButton tone="danger" disabled={busy} onClick={onRefund} className="-my-2.5">
            {t('ticketWallet.cancelShort')}
          </TextButton>
        )}
      </div>
    );
  } else {
    footer = claimAction || <StatusText tone="muted">{status}</StatusText>;
  }

  const details = [
    ticketCount > 0 ? t('ticketWallet.ticketCount', { count: ticketCount }) : null,
    formatMoneyMinor(order.totalMinor, i18n.language),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="p-4 rounded-[20px] bg-surface border border-line">
      <div className="flex gap-3">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
          <Ticket size={22} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-ink leading-snug break-words">
            {event?.title ?? t('ticketWallet.order', { id: order.id.slice(0, ORDER_CODE_LENGTH) })}
          </p>
          {event && (
            <p className="text-[13px] text-ink/60 font-mono tracking-wide">
              #{order.id.slice(0, ORDER_CODE_LENGTH)}
            </p>
          )}
          {event && (
            <p className="text-sm text-ink/70 mt-0.5">
              {format(event.startsAt, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
          <p className="text-sm text-ink/70">{details}</p>
        </div>
      </div>
      {footer && <div className="mt-3 pt-3 border-t border-line">{footer}</div>}
    </li>
  );
}
