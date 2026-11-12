import { describe, expect, it } from 'vitest';
import { serviceInProgress } from './serviceInProgress';

const at = (iso: string) => new Date(iso).getTime();
const booking = (
  serviceStartedAt: string | null,
  status: 'confirmed' | 'completed' = 'confirmed'
) =>
  ({
    status,
    serviceStartedAt,
    offer: { startsAt: '2026-11-08T12:00:00.000Z', durationMinutes: 120 },
  }) as Parameters<typeof serviceInProgress>[0];

describe('serviceInProgress (C4)', () => {
  it('só depois do "Iniciar serviço" do prestador e até o fim do serviço', () => {
    expect(serviceInProgress(booking(null), at('2026-11-08T12:30:00.000Z'))).toBe(false);
    const started = booking('2026-11-08T12:04:00.000Z');
    expect(serviceInProgress(started, at('2026-11-08T12:30:00.000Z'))).toBe(true);
    expect(serviceInProgress(started, at('2026-11-08T14:00:00.000Z'))).toBe(false);
    expect(
      serviceInProgress(
        booking('2026-11-08T12:04:00.000Z', 'completed'),
        at('2026-11-08T12:30:00.000Z')
      )
    ).toBe(false);
  });
});
