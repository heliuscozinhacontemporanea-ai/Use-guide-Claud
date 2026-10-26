import { RESCHEDULE_REFUND_DAYS } from './cancellationPolicy';

const DAY_MS = 24 * 3_600_000;

/**
 * Até quando a compra remarcada pode ser cancelada com reembolso integral (D16, 4A): 7 dias depois
 * do aviso, sem passar do início. `null` quando o prazo já acabou ou não houve remarcação.
 */
export function rescheduleRefundDeadline(
  rescheduledAt: string | null | undefined,
  startsAt: string,
  now: Date
): string | null {
  if (!rescheduledAt) return null;
  const end = Math.min(
    new Date(rescheduledAt).getTime() + RESCHEDULE_REFUND_DAYS * DAY_MS,
    new Date(startsAt).getTime()
  );
  return now.getTime() < end ? new Date(end).toISOString() : null;
}
