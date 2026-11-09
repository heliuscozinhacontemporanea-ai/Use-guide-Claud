import { PLATFORM_TIME_ZONE } from '../../../../shared/utils/timeZones';
import { type ReactNode, useState } from 'react';
import { usePartnerCatalogEvents } from '../../hooks/usePartnerCatalogEvents';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { PartnerEstablishment, PartnerTodayItem } from '../../types/partnerHome';
import { belongs, type EstablishmentFilter } from '../../utils/partnerHomeFilter';
import { type CatalogSegment, PartnerCatalogTab } from './PartnerCatalogTab';
import { PartnerEstablishmentPage } from './PartnerEstablishmentPage';
import { PartnerEventPage } from './PartnerEventPage';

/** O que a composição monta no Catálogo (outros domínios). */
export interface PartnerCatalogRenders {
  /** Passeios e aluguéis (bookings) dos itens dados. */
  renderOffers?: (props: {
    items: Array<{ id: string; name: string; category: string }>;
    creating: boolean;
    onCreatingChange: (creating: boolean) => void;
    /** Na página do estabelecimento: nulo quando ele não vende passeios nem aluguéis. */
    inPage: boolean;
    /** Cupons da oferta, na área Cupons (B1c). */
    onOpenCoupons?: (offerId: string) => void;
  }) => ReactNode;
  /** Visitas do mês (insights). */
  renderVisits?: (itemId: string, onOpenPlan: () => void) => ReactNode;
  /** Avaliações recentes (reviews); o toque leva às respostas. */
  renderReviews?: (itemId: string, onOpen: () => void) => ReactNode;
  /** Aba Convidados da página do evento (ticketing, D27). */
  renderGuests?: (props: EventGuestsRenderProps) => ReactNode;
  /** Aba Divulgadores da página do evento (ticketing, D27). */
  renderPromoters?: (eventId: string) => ReactNode;
}

export interface EventGuestsRenderProps {
  eventId: string;
  eventTitle: string;
  /** Sessões que ainda aceitam convite, e todas, para dar nome a cada linha. */
  openSessions: Array<{ id: string; startsAt: string }>;
  allSessions: Array<{ id: string; startsAt: string }>;
  onChanged: () => void;
}

/** Catálogo (p09) e página do estabelecimento (p19), com o filtro de estabelecimento (11.3). */
export function PartnerCatalogSection({
  segment,
  parts,
  offersLabel,
  title,
  onSegmentChange,
  placeId,
  onPlaceChange: setPlaceId,
  eventId,
  onEventChange,
  eventReloadKey,
  onOpenSession,
  items,
  events,
  loading,
  filter,
  establishments,
  eventsVersion,
  onEditItem,
  onCreateItem,
  onOpenEvent,
  onCreateEvent,
  onOpenPlan,
  onVerify,
  onToggleActive,
  verificationVersion,
  planVersion,
  onOpenReviews,
  renders,
  onOpenCoupons,
}: {
  segment: CatalogSegment;
  /** Partes do catálogo que os segmentos do parceiro usam. */
  parts?: CatalogSegment[];
  /** Nome da parte de reservas: o do segmento ("Passeios") ou "Serviços". */
  offersLabel?: string;
  /** Título da tela, o mesmo da aba ("Passeios", "Ofertas"). */
  title?: string;
  onSegmentChange: (segment: CatalogSegment) => void;
  /** Estabelecimento aberto (p19); o painel esconde os atalhos enquanto ele está aberto. */
  placeId: string | null;
  onPlaceChange: (placeId: string | null) => void;
  /** Evento aberto (p10); o painel esconde os atalhos enquanto ele está aberto. */
  eventId: string | null;
  onEventChange: (eventId: string | null) => void;
  /** Muda depois de adiar ou cancelar uma sessão. */
  eventReloadKey: number;
  onOpenSession: (item: PartnerTodayItem) => void;
  items: PartnerContentRecord[];
  events: PartnerContentRecord[];
  loading: boolean;
  filter: EstablishmentFilter;
  establishments: PartnerEstablishment[];
  /** Muda depois de salvar um evento, para a lista reler vendidos e status. */
  eventsVersion: number;
  onEditItem: (item: PartnerContentRecord) => void;
  onCreateItem: () => void;
  /** Abre Editar evento (p18). */
  onOpenEvent: (item: PartnerContentRecord, hasSales: boolean) => void;
  onCreateEvent: () => void;
  onOpenPlan: (item: PartnerContentRecord) => void;
  onVerify: (item: PartnerContentRecord) => void;
  onToggleActive: (itemId: string, active: boolean) => Promise<void>;
  /** Muda depois de um envio de verificação, para a página reler o status. */
  verificationVersion: number;
  /** Muda depois de ativar ou comprar um plano. */
  planVersion: number;
  onOpenReviews: () => void;
  renders: PartnerCatalogRenders;
  /** Área Cupons já com o evento ou a oferta escolhidos (B1). */
  onOpenCoupons?: (target: { kind: 'event' | 'offer'; id: string }) => void;
}) {
  const catalogEvents = usePartnerCatalogEvents(eventsVersion);
  const [creatingOffer, setCreatingOffer] = useState(false);
  const places = items.filter((item) => item.category !== 'producer' && belongs([item.id], filter));
  const openOfferCoupons = onOpenCoupons
    ? (id: string) => onOpenCoupons({ kind: 'offer', id })
    : undefined;
  const toOfferItem = (item: PartnerContentRecord) => ({
    id: item.id,
    name: item.name,
    category: item.category,
  });

  if (eventId) {
    const record = events.find((entry) => entry.id === eventId);
    return (
      <PartnerEventPage
        eventId={eventId}
        reloadKey={eventReloadKey + eventsVersion}
        onBack={() => onEventChange(null)}
        onEdit={(hasSales) => record && onOpenEvent(record, hasSales)}
        onOpenSession={onOpenSession}
        timeZone={record?.timeZone ?? PLATFORM_TIME_ZONE}
        renderGuests={renders.renderGuests}
        renderPromoters={renders.renderPromoters}
        onOpenCoupons={
          onOpenCoupons ? () => onOpenCoupons({ kind: 'event', id: eventId }) : undefined
        }
      />
    );
  }

  const place = placeId ? items.find((item) => item.id === placeId) : undefined;
  if (place) {
    return (
      <PartnerEstablishmentPage
        key={`${place.id}-${verificationVersion}-${planVersion}`}
        item={place}
        stats={establishments.find((entry) => entry.id === place.id)}
        onBack={() => setPlaceId(null)}
        onEdit={() => onEditItem(place)}
        onOpenPlan={() => onOpenPlan(place)}
        onVerify={() => onVerify(place)}
        onToggleActive={() => void onToggleActive(place.id, place.isActive !== false)}
        visits={renders.renderVisits?.(place.id, () => onOpenPlan(place))}
        offers={
          renders.renderOffers?.({
            items: [toOfferItem(place)],
            creating: false,
            onCreatingChange: () => {},
            inPage: true,
            onOpenCoupons: openOfferCoupons,
          }) ?? null
        }
        reviews={renders.renderReviews?.(place.id, onOpenReviews)}
      />
    );
  }

  return (
    <PartnerCatalogTab
      segment={segment}
      parts={parts}
      offersLabel={offersLabel}
      title={title}
      onSegmentChange={onSegmentChange}
      places={places}
      placesLoading={loading}
      events={{
        ...catalogEvents,
        data: catalogEvents.data.filter((event) => belongs(event.establishmentIds, filter)),
        reload: () => void catalogEvents.reload(),
      }}
      groups={
        filter === null && establishments.length > 1
          ? establishments.map((entry) => ({ id: entry.id, name: entry.name }))
          : null
      }
      onOpenPlace={(item) => setPlaceId(item.id)}
      onOpenEvent={onEventChange}
      onCreate={() =>
        segment === 'places'
          ? onCreateItem()
          : segment === 'events'
            ? onCreateEvent()
            : setCreatingOffer(true)
      }
      offers={renders.renderOffers?.({
        items: places.map(toOfferItem),
        creating: creatingOffer,
        onCreatingChange: setCreatingOffer,
        inPage: false,
        onOpenCoupons: openOfferCoupons,
      })}
    />
  );
}
