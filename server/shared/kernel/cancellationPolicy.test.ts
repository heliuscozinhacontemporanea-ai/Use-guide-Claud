import { describe, expect, it } from 'vitest';
import {
  calculateBuyerRefund,
  canChangeCancellationPolicy,
  isCancellationPolicyAllowed,
} from './cancellationPolicy';

const STARTS = '2026-12-31T22:00:00.000Z';
const hoursBefore = (h: number) => new Date(new Date(STARTS).getTime() - h * 3600_000);
// Compra antiga: fora do arrependimento, para testar só a política.
const OLD_PURCHASE = '2026-10-01T12:00:00.000Z';

function refund(
  family: 'event' | 'booking' | 'transfer',
  policy: Parameters<typeof calculateBuyerRefund>[0]['policy'],
  hours: number,
  purchasedAt = OLD_PURCHASE
) {
  return calculateBuyerRefund({
    family,
    policy,
    purchasedAt,
    startsAt: STARTS,
    now: hoursBefore(hours),
    paidMinor: 10000,
    serviceFeeMinor: 300,
  });
}

describe('políticas de cancelamento (D14)', () => {
  it('arrependimento: 7 dias da compra e 48 h antes do início devolve tudo, com a taxa de serviço', () => {
    const purchased = hoursBefore(100).toISOString();
    expect(refund('event', 'none', 72, purchased)).toEqual({
      reason: 'withdrawal',
      percent: 100,
      refundMinor: 10000,
      serviceFeeRefundMinor: 300,
    });
    // Menos de 48 h antes do início: vale a política, e a taxa de serviço não volta.
    expect(refund('event', 'none', 40, purchased)).toMatchObject({
      reason: 'none',
      refundMinor: 0,
    });
    expect(refund('event', 'flexible', 40, purchased)).toMatchObject({
      reason: 'policy',
      refundMinor: 10000,
      serviceFeeRefundMinor: 0,
    });
  });

  it('reagendamento: até 7 dias depois do aviso e antes da nova data devolve tudo (D16 4A)', () => {
    const base = {
      family: 'event' as const,
      policy: 'none' as const,
      purchasedAt: OLD_PURCHASE,
      startsAt: STARTS,
      paidMinor: 10000,
      serviceFeeMinor: 300,
    };
    const now = hoursBefore(24);
    const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
    expect(calculateBuyerRefund({ ...base, now, rescheduledAt: daysAgo(7) })).toEqual({
      reason: 'reschedule',
      percent: 100,
      refundMinor: 10000,
      serviceFeeRefundMinor: 300,
    });
    expect(calculateBuyerRefund({ ...base, now, rescheduledAt: daysAgo(7.1) })).toMatchObject({
      reason: 'none',
    });
    expect(
      calculateBuyerRefund({ ...base, now: hoursBefore(-1), rescheduledAt: daysAgo(1) })
    ).toMatchObject({ reason: 'none', refundMinor: 0 });
  });

  it('eventos: flexível 24 h, moderada 7 dias, rígida 30 dias', () => {
    expect(refund('event', 'flexible', 25).refundMinor).toBe(10000);
    expect(refund('event', 'flexible', 23).refundMinor).toBe(0);
    expect(refund('event', 'moderate', 7 * 24).refundMinor).toBe(10000);
    expect(refund('event', 'moderate', 6 * 24).refundMinor).toBe(0);
    expect(refund('event', 'strict', 30 * 24).refundMinor).toBe(10000);
    expect(refund('event', 'strict', 29 * 24).refundMinor).toBe(0);
  });

  it('reservas: moderada devolve 100% até 5 dias e 50% até 24 h; rígida 50% até 7 dias', () => {
    expect(refund('booking', 'moderate', 5 * 24).refundMinor).toBe(10000);
    expect(refund('booking', 'moderate', 48).refundMinor).toBe(5000);
    expect(refund('booking', 'moderate', 12).refundMinor).toBe(0);
    expect(refund('booking', 'strict', 7 * 24).refundMinor).toBe(5000);
    expect(refund('booking', 'strict', 6 * 24).refundMinor).toBe(0);
  });

  it('translado retém no máximo 5% com aviso de 24 h (CC art. 740)', () => {
    expect(refund('transfer', 'transfer_standard', 30).refundMinor).toBe(9500);
    expect(refund('transfer', 'transfer_flexible', 30).refundMinor).toBe(10000);
    expect(refund('transfer', 'transfer_standard', 10).refundMinor).toBe(0);
  });

  it('depois do início (no-show) não há reembolso', () => {
    expect(refund('booking', 'flexible', 0).refundMinor).toBe(0);
    expect(refund('booking', 'flexible', -2).reason).toBe('none');
  });

  it('cada família aceita só as próprias opções', () => {
    expect(isCancellationPolicyAllowed('transfer', 'flexible')).toBe(false);
    expect(isCancellationPolicyAllowed('booking', 'transfer_standard')).toBe(false);
    expect(isCancellationPolicyAllowed('event', 'strict')).toBe(true);
  });

  it('depois de publicar, só muda para igual ou mais flexível', () => {
    expect(canChangeCancellationPolicy('event', 'strict', 'flexible')).toBe(true);
    expect(canChangeCancellationPolicy('event', 'moderate', 'moderate')).toBe(true);
    expect(canChangeCancellationPolicy('event', 'flexible', 'none')).toBe(false);
    expect(canChangeCancellationPolicy('transfer', 'transfer_standard', 'transfer_flexible')).toBe(
      true
    );
    expect(canChangeCancellationPolicy('booking', 'none', 'transfer_flexible')).toBe(false);
  });
});
