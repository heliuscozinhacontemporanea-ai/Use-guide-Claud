import { describe, expect, it } from 'vitest';
import { freeCancellationHoursOf } from './cancellationPolicy';
import { cheapestCardSummary, isValidCardSummary } from './listingCardSummary';

describe('listingCardSummary (D37 item 10)', () => {
  it('escolhe a opção mais barata e, no empate, a primeira', () => {
    const a = { fromPriceMinor: 18000, priceUnit: 'person', serviceFeeIncluded: false } as const;
    const b = { fromPriceMinor: 15000, priceUnit: 'group', serviceFeeIncluded: false } as const;
    const c = { fromPriceMinor: 15000, priceUnit: 'person', serviceFeeIncluded: false } as const;
    expect(cheapestCardSummary([a, b, c])).toBe(b);
    expect(cheapestCardSummary([])).toBeNull();
  });

  it('recusa dinheiro fracionado ou negativo', () => {
    expect(
      isValidCardSummary({ fromPriceMinor: 4300, priceUnit: 'ticket', serviceFeeIncluded: true })
    ).toBe(true);
    expect(
      isValidCardSummary({ fromPriceMinor: 43.5, priceUnit: 'ticket', serviceFeeIncluded: true })
    ).toBe(false);
    expect(
      isValidCardSummary({ fromPriceMinor: -1, priceUnit: 'ticket', serviceFeeIncluded: true })
    ).toBe(false);
  });

  it('cancelamento grátis vem do primeiro prazo com 100% da política', () => {
    expect(freeCancellationHoursOf('booking', 'flexible')).toBe(24);
    expect(freeCancellationHoursOf('booking', 'moderate')).toBe(120);
    expect(freeCancellationHoursOf('booking', 'strict')).toBeNull();
    expect(freeCancellationHoursOf('event', 'moderate')).toBe(168);
    expect(freeCancellationHoursOf('transfer', 'transfer_standard')).toBeNull();
    expect(freeCancellationHoursOf('booking', 'desconhecida')).toBeNull();
  });
});
