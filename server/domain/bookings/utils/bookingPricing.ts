import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookableOffer, BookingLine } from '../types/bookingTypes';

export interface PricedBooking {
  lines: BookingLine[];
  participantsCount: number;
  subtotalMinor: number;
  platformFeeMinor: number;
  totalMinor: number;
}

/**
 * Preço sempre recalculado no backend a partir da oferta (AGENTS.md §8.5). O turista paga o subtotal;
 * a taxa da plataforma sai do repasse ao parceiro (application_fee_amount).
 */
export function priceBookingLines(
  offer: Pick<BookableOffer, 'pricing' | 'maxParticipantsPerBooking'>,
  requested: Array<{ priceOptionId: string; quantity: number }>,
  platformFeePercent: number
): PricedBooking {
  if (requested.length === 0) {
    throw new BookingDomainError('VALIDATION_ERROR', 'Selecione ao menos um item.');
  }
  const seen = new Set<string>();
  const lines = requested.map((request) => {
    if (seen.has(request.priceOptionId)) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Opção de preço repetida.');
    }
    seen.add(request.priceOptionId);
    const option = offer.pricing.priceOptions.find((item) => item.id === request.priceOptionId);
    if (!option) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Opção de preço inválida.');
    }
    if (!Number.isInteger(request.quantity) || request.quantity < (option.minQuantity ?? 1)) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Quantidade inválida.');
    }
    if (option.maxQuantity !== undefined && request.quantity > option.maxQuantity) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Quantidade acima do permitido.');
    }
    return {
      priceOptionId: option.id,
      quantity: request.quantity,
      unitAmountMinor: option.unitAmountMinor,
    };
  });

  const participantsCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  if (participantsCount > offer.maxParticipantsPerBooking) {
    throw new BookingDomainError('VALIDATION_ERROR', 'Número de participantes acima do limite.');
  }
  const subtotalMinor = lines.reduce((sum, line) => sum + line.quantity * line.unitAmountMinor, 0);
  const platformFeeMinor = Math.round((subtotalMinor * platformFeePercent) / 100);
  return { lines, participantsCount, subtotalMinor, platformFeeMinor, totalMinor: subtotalMinor };
}
