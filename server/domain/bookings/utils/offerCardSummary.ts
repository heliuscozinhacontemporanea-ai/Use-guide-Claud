import { freeCancellationHoursOf } from '../../../shared/kernel/cancellationPolicy';
import {
  cheapestCardSummary,
  type ListingCardSummary,
} from '../../../shared/kernel/listingCardSummary';
import { HOURLY_PRICE_OPTION_ID } from '../types/fleetTypes';
import { type BookableOffer, cancellationFamilyOf, isFleetOffer } from '../types/bookingTypes';

function cheapest(amounts: number[]): number | null {
  return amounts.length > 0 ? Math.min(...amounts) : null;
}

/**
 * "A partir de" de uma oferta à venda (D37 item 10): a opção de preço mais barata, como o painel do
 * parceiro já mostra. Por veículo, o preço do veículo; só com horário personalizado, o preço da hora.
 */
export function offerCardSummary(offer: BookableOffer): ListingCardSummary | null {
  const options = offer.pricing.priceOptions;
  let price: number | null;
  let unit: ListingCardSummary['priceUnit'];
  if (isFleetOffer(offer)) {
    price = cheapest(
      options.filter((option) => option.id !== HOURLY_PRICE_OPTION_ID).map((o) => o.unitAmountMinor)
    );
    unit = 'vehicle';
    if (price === null) {
      price =
        options.find((option) => option.id === HOURLY_PRICE_OPTION_ID)?.unitAmountMinor ?? null;
      unit = 'hour';
    }
  } else {
    price = cheapest(options.map((option) => option.unitAmountMinor));
    unit = offer.sellingUnit === 'group' ? 'group' : 'person';
  }
  if (price === null) return null;
  const freeHours = freeCancellationHoursOf(
    cancellationFamilyOf(offer.kind),
    offer.cancellationPolicy
  );
  return {
    fromPriceMinor: price,
    priceUnit: unit,
    serviceFeeIncluded: false,
    ...(offer.durationMinutes ? { durationMinutes: offer.durationMinutes } : {}),
    ...(freeHours !== null ? { freeCancellationHours: freeHours } : {}),
  };
}

/** Resumo do anúncio: a oferta à venda mais barata; sem oferta à venda, o cartão fica sem preço. */
export function itemCardSummary(offers: readonly BookableOffer[]): ListingCardSummary | null {
  return cheapestCardSummary(
    offers
      .filter((offer) => offer.status === 'published')
      .flatMap((offer) => {
        const summary = offerCardSummary(offer);
        return summary ? [summary] : [];
      })
  );
}
