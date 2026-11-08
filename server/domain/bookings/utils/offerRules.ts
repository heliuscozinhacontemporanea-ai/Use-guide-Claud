import { isCancellationPolicyAllowed } from '../../../shared/kernel/cancellationPolicy';
import { BookingDomainError } from '../errors/bookingDomainError';
import {
  type BookableOffer,
  type BookableOfferKind,
  cancellationFamilyOf,
} from '../types/bookingTypes';

export function assertPolicyForKind(kind: BookableOfferKind, policy: string): void {
  if (!isCancellationPolicyAllowed(cancellationFamilyOf(kind), policy)) {
    throw new BookingDomainError(
      'VALIDATION_ERROR',
      'Política de cancelamento não disponível para este tipo de oferta.'
    );
  }
}

/** Entrada de atração é sempre por pessoa; venda por grupo precisa do tamanho do grupo (D20). */
export function assertSellingUnit(
  kind: BookableOfferKind,
  unit: BookableOffer['sellingUnit'],
  groupMaxPeople: number | undefined
): void {
  if (unit !== 'group') return;
  if (kind === 'private_entry') {
    throw new BookingDomainError('VALIDATION_ERROR', 'Entrada de atração é vendida por pessoa.');
  }
  if (!groupMaxPeople) {
    throw new BookingDomainError(
      'VALIDATION_ERROR',
      'Informe quantas pessoas cabem em cada grupo.'
    );
  }
}

export function assertValidPricing(pricing: BookableOffer['pricing']): void {
  if (pricing.priceOptions.length === 0) {
    throw new BookingDomainError('VALIDATION_ERROR', 'Informe ao menos uma opção de preço.');
  }
  for (const option of pricing.priceOptions) {
    if (!Number.isInteger(option.unitAmountMinor) || option.unitAmountMinor <= 0) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        'Preço deve ser um valor inteiro em centavos.'
      );
    }
  }
}
