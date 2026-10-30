import { describe, expect, it } from 'vitest';
import { bookingServiceEndsAt, serviceEndsAtMs } from './serviceTime';

describe('fim do serviço', () => {
  it('soma a duração ao início; sem duração, o fim é o início', () => {
    expect(
      bookingServiceEndsAt({
        offerSnapshot: {
          title: 'Buggy',
          startsAt: '2026-11-10T11:00:00.000Z',
          durationMinutes: 150,
          cancellationPolicy: 'moderate',
        },
      })
    ).toBe('2026-11-10T13:30:00.000Z');
    expect(serviceEndsAtMs('2026-11-10T11:00:00.000Z')).toBe(
      new Date('2026-11-10T11:00:00.000Z').getTime()
    );
  });
});
