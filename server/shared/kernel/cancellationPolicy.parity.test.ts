import { describe, expect, it } from 'vitest';
import { DEFAULT_EVENT_SALES_POLICY as FRONTEND_DEFAULT } from '../../../src/domain/events/types/event';
import * as frontend from '../../../src/shared/utils/cancellationPolicy';
import { DEFAULT_EVENT_SALES_POLICY as BACKEND_DEFAULT } from '../../domain/events/types/eventTypes';
import * as backend from './cancellationPolicy';

const FAMILIES = ['event', 'booking', 'transfer'] as const;
const STARTS = '2026-12-31T22:00:00.000Z';
const HOURS = [0, 1, 23, 24, 47, 48, 72, 119, 120, 167, 168, 719, 720, 2000];
const PURCHASES = ['2026-10-01T12:00:00.000Z', '2026-12-28T12:00:00.000Z'];

describe('paridade das políticas de cancelamento frontend × backend', () => {
  it('mesmas listas e prazos', () => {
    expect(frontend.EVENT_CANCELLATION_POLICIES).toEqual(backend.EVENT_CANCELLATION_POLICIES);
    expect(frontend.BOOKING_CANCELLATION_POLICIES).toEqual(backend.BOOKING_CANCELLATION_POLICIES);
    expect(frontend.TRANSFER_CANCELLATION_POLICIES).toEqual(backend.TRANSFER_CANCELLATION_POLICIES);
    expect(frontend.WITHDRAWAL_DAYS).toBe(backend.WITHDRAWAL_DAYS);
    expect(frontend.RESCHEDULE_REFUND_DAYS).toBe(backend.RESCHEDULE_REFUND_DAYS);
    expect(frontend.WITHDRAWAL_MIN_HOURS_BEFORE_START).toBe(
      backend.WITHDRAWAL_MIN_HOURS_BEFORE_START
    );
  });

  it('mesmo padrão de regras de venda do evento', () => {
    expect(FRONTEND_DEFAULT).toEqual(BACKEND_DEFAULT);
  });

  it('mesmo reembolso e mesma regra de troca para cada política', () => {
    for (const family of FAMILIES) {
      const policies = backend.policiesOf(family);
      expect(frontend.policiesOf(family)).toEqual(policies);
      for (const policy of policies as backend.CancellationPolicyId[]) {
        for (const to of policies) {
          expect(frontend.canChangeCancellationPolicy(family, policy, to)).toBe(
            backend.canChangeCancellationPolicy(family, policy, to)
          );
        }
        for (const purchasedAt of PURCHASES) {
          for (const hours of HOURS) {
            const params = {
              family,
              policy,
              purchasedAt,
              startsAt: STARTS,
              now: new Date(new Date(STARTS).getTime() - hours * 3600_000),
              paidMinor: 10001,
              serviceFeeMinor: 300,
            };
            expect(frontend.calculateBuyerRefund(params)).toEqual(
              backend.calculateBuyerRefund(params)
            );
            for (const daysAgo of [3, 8]) {
              const rescheduled = {
                ...params,
                rescheduledAt: new Date(params.now.getTime() - daysAgo * 86_400_000).toISOString(),
              };
              expect(frontend.calculateBuyerRefund(rescheduled)).toEqual(
                backend.calculateBuyerRefund(rescheduled)
              );
            }
          }
        }
      }
    }
  });
});
