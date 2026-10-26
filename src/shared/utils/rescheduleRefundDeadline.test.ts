import { describe, expect, it } from 'vitest';
import { rescheduleRefundDeadline } from './rescheduleRefundDeadline';

const AT = '2026-11-01T12:00:00.000Z';

describe('rescheduleRefundDeadline', () => {
  it('7 dias depois do aviso quando o serviço é depois disso', () => {
    expect(rescheduleRefundDeadline(AT, '2026-12-01T12:00:00.000Z', new Date(AT))).toBe(
      '2026-11-08T12:00:00.000Z'
    );
  });

  it('não passa do início do serviço', () => {
    expect(rescheduleRefundDeadline(AT, '2026-11-03T12:00:00.000Z', new Date(AT))).toBe(
      '2026-11-03T12:00:00.000Z'
    );
  });

  it('null sem remarcação ou com o prazo vencido', () => {
    expect(rescheduleRefundDeadline(null, '2026-12-01T12:00:00.000Z', new Date(AT))).toBeNull();
    expect(
      rescheduleRefundDeadline(AT, '2026-12-01T12:00:00.000Z', new Date('2026-11-09T00:00:00Z'))
    ).toBeNull();
  });
});
