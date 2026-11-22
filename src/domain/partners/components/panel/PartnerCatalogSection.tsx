import { type ReactNode, useState } from 'react';
import { usePartnerCatalogEvents } from '../../hooks/usePartnerCatalogEvents';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { PartnerEstablishment } from '../../types/partnerHome';
import { belongs, type EstablishmentFilter } from '../../utils/partnerHomeFilter';
import { type CatalogSegment, PartnerCatalogTab } from './PartnerCatalogTab';

/** Página de oferta (bookings) empilhada no painel: editor, horários ou reservas (F3, D34). */
/** Veículos e trechos do anúncio, que o aluguel e o translado escolhem na oferta (F3b). */
export interface OfferListing {
  vehicles?: string[];
  routes?: Array<{ from: string; to: string }>;
}

export type OfferPageRequest =
  | {
      kind: 'editor';
      itemId: string;
      category: string;
      offerId?: string;
      listing?: OfferListing;
      /** Nome do estabelecimento, na linha de contexto do editor (protótipo da F3). */
      itemName?: string;
      title: string;
    }
  | { kind: 'slots' | 'bookings'; offerId: string; title: string }
  /** "Abrir horários" e "Abrir dias" em página própria, com a ação na barra (protótipo da F3). */
  | { kind: 'openSlots' | 'openDays'; offerId: string; title: string; vehicles?: number };

export interface OfferPageRenderProps {
  page: OfferPageRequest;
  /** O "Salvar", o "Criar" e o "Abrir" ficam na barra da página (D33). */
  registerSave: (save: (() => void) | null) => void;
  onSaved: (saved: { offerId: string; title: string; created: boolean }) => void;
  /** Abre outra página de oferta por cima (ex.: "Abrir horários"). */
  onOpenPage: (page: OfferPageRequest) => void;
  /** O formulário de "Abrir horários" ou "Abrir dias" terminou: fecha a página e avisa. */
  onFormDone: (message: string) => void;
  /** Muda quando um formulário de abrir termina: horários e dias releem. */
  version: number;
}

/** O que a composição monta no Catálogo (outros domínios). */
export interface PartnerCatalogRenders {
  /** Passeios e aluguéis (bookings) dos itens dados. */
  renderOffers?: (props: {
    items: Array<{ id: string; name: string; category: string } & OfferListing>;
    creating: boolean;
    onCreatingChange: (creating: boolean) => void;
    /** Na página do estabelecimento: nulo quando ele não vende passeios nem aluguéis. */
    inPage: boolean;
    /** Cupons da oferta, na área Cupons (B1c). */
    onOpenCoupons?: (offerId: string) => void;
    /** Abre o editor, os horários ou as reservas como página do painel (F3). */
    onOpenPage?: (page: OfferPageRequest) => void;
    /** Muda quando uma página de oferta fecha: a lista relê as ofertas. */
    version?: number;
  }) => ReactNode;
  /** Conteúdo da página de oferta empilhada (bookings). */
  renderOfferPage?: (props: OfferPageRenderProps) => ReactNode;
  /** "Ver as ofertas deste passeio · 1 oferta à venda" (bookings), no bloco Detalhes. */
  renderOffersLink?: (props: { itemId: string; category: string; onOpen: () => void }) => ReactNode;
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

/**
 * Catálogo (p09), com o filtro de estabelecimento (11.3). O estabelecimento (p19) e o evento (p10)
 * abrem por cima, na pilha do painel (`PartnerCatalogPage`, D33).
 */
export function PartnerCatalogSection({
  segment,
  parts,
  offersLabel,
  title,
  onSegmentChange,
  onOpenPlace,
  onOpenEvent,
  items,
  loading,
  filter,
  establishments,
  eventsVersion,
  onCreateItem,
  onCreateEvent,
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
  onOpenPlace: (place: { id: string; name: string }) => void;
  onOpenEvent: (event: { id: string; title: string }) => void;
  items: PartnerContentRecord[];
  loading: boolean;
  filter: EstablishmentFilter;
  establishments: PartnerEstablishment[];
  /** Muda depois de salvar um evento, para a lista reler vendidos e status. */
  eventsVersion: number;
  onCreateItem: () => void;
  onCreateEvent: () => void;
  renders: PartnerCatalogRenders;
  /** Área Cupons já com a oferta escolhida (B1). */
  onOpenCoupons?: (target: { kind: 'event' | 'offer'; id: string }) => void;
}) {
  const catalogEvents = usePartnerCatalogEvents(eventsVersion);
  const [creatingOffer, setCreatingOffer] = useState(false);
  const places = items.filter((item) => item.category !== 'producer' && belongs([item.id], filter));

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
      onOpenPlace={(item) => onOpenPlace({ id: item.id, name: item.name })}
      onOpenEvent={(eventId) =>
        onOpenEvent({
          id: eventId,
          title: catalogEvents.data.find((event) => event.id === eventId)?.title ?? '',
        })
      }
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
        onOpenCoupons: onOpenCoupons ? (id) => onOpenCoupons({ kind: 'offer', id }) : undefined,
      })}
    />
  );
}

/** Item do catálogo no formato que o painel de ofertas (bookings) recebe. */
export const toOfferItem = (item: PartnerContentRecord) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  ...offerListingOf(item),
});

/** Veículos e trechos que o anúncio cadastrou (aluguel e translado, F3b). */
export function offerListingOf(item: Pick<PartnerContentRecord, 'operationalInfo'>): OfferListing {
  const info = item.operationalInfo;
  return {
    ...(info?.vehicleTypes?.length ? { vehicles: info.vehicleTypes } : {}),
    ...(info?.transferRoutes?.length ? { routes: info.transferRoutes } : {}),
  };
}
