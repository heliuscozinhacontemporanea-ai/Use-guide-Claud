import { describe, expect, it } from 'vitest';
import { previewRefund } from '../../../../src/domain/bookings/utils/refundPreview';
import { calculateCancellationRefund } from './cancellationRefund';

describe('paridade da regra de reembolso app × servidor', () => {
  it('a prévia mostrada no app é igual ao que o backend devolve', () => {
    const startsAt = '2026-11-10T11:00:00.000Z';
    const policies = [
      { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 as const },
      { freeCancellationHoursBefore: 0, refundPercentAfterDeadline: 100 as const },
      { freeCancellationHoursBefore: 48, refundPercentAfterDeadline: 0 as const },
    ];
    const moments = [
      '2026-11-07T00:00:00.000Z',
      '2026-11-09T11:00:00.000Z',
      '2026-11-10T10:59:00.000Z',
      '2026-11-10T11:00:00.000Z',
    ];
    for (const policy of policies) {
      for (const moment of moments) {
        const params = { policy, startsAt, totalMinor: 12345, now: new Date(moment) };
        expect(previewRefund(params)).toEqual(calculateCancellationRefund(params));
      }
    }
  });
});
