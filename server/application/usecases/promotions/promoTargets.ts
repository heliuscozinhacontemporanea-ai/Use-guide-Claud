import { listPartnerOffersUseCase } from '../../../domain/bookings';
import { listEventOccurrencesUseCase, listOwnerEventListingsUseCase } from '../../../domain/events';
import { listTicketTypesForManagementUseCase } from '../../../domain/ticketing';

/** Anúncio que pode receber cupom: evento (lotes por sessão) ou oferta de reserva (opções de preço). */
export interface PromoTargetOption {
  id: string;
  name: string;
  /** Sessão do lote, no evento; `null` nas opções da oferta. */
  sessionStartsAt: string | null;
}

export interface PromoListingTarget {
  kind: 'event' | 'offer';
  id: string;
  title: string;
  status: string;
  /** Passeio, aluguel, translado ou entrada; só na oferta. */
  offerKind: string | null;
  options: PromoTargetOption[];
}

async function ownerEvents(ownerUid: string): Promise<PromoListingTarget[]> {
  const actor = { uid: ownerUid, admin: false, role: 'partner' as const };
  const events = await listOwnerEventListingsUseCase(ownerUid);
  return Promise.all(
    events
      .filter((event) => event.status !== 'archived')
      .map(async (event) => {
        const occurrences = (await listEventOccurrencesUseCase(event.id)).filter(
          (occurrence) => occurrence.status !== 'canceled'
        );
        const options = await Promise.all(
          occurrences.map(async (occurrence) =>
            (await listTicketTypesForManagementUseCase(actor, occurrence.id)).map((type) => ({
              id: type.id,
              name: type.name,
              sessionStartsAt: occurrence.startsAt,
            }))
          )
        );
        return {
          kind: 'event' as const,
          id: event.id,
          title: event.title || event.name,
          status: event.status,
          offerKind: null,
          options: options
            .flat()
            .sort((a, b) => a.sessionStartsAt.localeCompare(b.sessionStartsAt)),
        };
      })
  );
}

async function ownerOffers(ownerUid: string): Promise<PromoListingTarget[]> {
  const offers = await listPartnerOffersUseCase({ uid: ownerUid, admin: false });
  return offers
    .filter((offer) => offer.status !== 'archived')
    .map((offer) => ({
      kind: 'offer' as const,
      id: offer.id,
      // Texto do cadastro, como no resumo da reserva (offerSnapshot).
      title: offer.title['pt-BR'] ?? Object.values(offer.title)[0] ?? '',
      status: offer.status,
      offerKind: offer.kind,
      options: offer.pricing.priceOptions.map((option) => ({
        id: option.id,
        name: option.label['pt-BR'] ?? Object.values(option.label)[0] ?? '',
        sessionStartsAt: null,
      })),
    }));
}

/** Eventos e ofertas do dono (sem os arquivados), onde ele pode criar cupom. */
export async function loadOwnerPromoTargets(ownerUid: string): Promise<PromoListingTarget[]> {
  const [events, offers] = await Promise.all([ownerEvents(ownerUid), ownerOffers(ownerUid)]);
  return [...events, ...offers];
}
