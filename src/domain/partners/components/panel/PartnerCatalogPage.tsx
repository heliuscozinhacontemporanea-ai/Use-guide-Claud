import { PLATFORM_TIME_ZONE } from '../../../../shared/utils/timeZones';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { PartnerEstablishment, PartnerTodayItem } from '../../types/partnerHome';
import { type PartnerCatalogRenders, toOfferItem } from './PartnerCatalogSection';
import { PartnerEstablishmentPage } from './PartnerEstablishmentPage';
import { PartnerEventPage } from './PartnerEventPage';

/**
 * Página aberta a partir do Catálogo, por cima do painel (D33): o estabelecimento (p19) ou o evento
 * (p10). O título fica na barra fixa; o "Editar" vira a ação da barra.
 */
export function PartnerCatalogPage({
  page,
  items,
  events,
  establishments,
  eventReloadKey,
  eventsVersion,
  verificationVersion,
  planVersion,
  renders,
  onOpenSession,
  onEditItem,
  onEditEvent,
  onOpenPlan,
  onVerify,
  onToggleActive,
  onOpenReviews,
  onOpenCoupons,
  onOpenEarnings,
}: {
  page: { view: 'place' | 'event'; id: string };
  items: PartnerContentRecord[];
  events: PartnerContentRecord[];
  establishments: PartnerEstablishment[];
  /** Muda depois de adiar ou cancelar uma sessão. */
  eventReloadKey: number;
  /** Muda depois de salvar um evento. */
  eventsVersion: number;
  /** Muda depois de um envio de verificação, para a página reler o status. */
  verificationVersion: number;
  /** Muda depois de ativar ou comprar um plano. */
  planVersion: number;
  renders: PartnerCatalogRenders;
  onOpenSession: (item: PartnerTodayItem) => void;
  onEditItem: (item: PartnerContentRecord) => void;
  /** Abre Editar evento (p18); `hasSales`: com pedidos, não oferece excluir (D27). */
  onEditEvent: (item: PartnerContentRecord, hasSales: boolean) => void;
  onOpenPlan: (item: PartnerContentRecord) => void;
  onVerify: (item: PartnerContentRecord) => void;
  onToggleActive: (itemId: string, active: boolean) => Promise<void>;
  /** Visitas e avaliações, a partir das avaliações recentes do estabelecimento. */
  onOpenReviews: () => void;
  /** Área Cupons já com o evento ou a oferta escolhidos (B1). */
  onOpenCoupons?: (target: { kind: 'event' | 'offer'; id: string }) => void;
  /** Aba Ganhos, a partir da conta de "Você recebe" do evento (A4). */
  onOpenEarnings?: () => void;
}) {
  if (page.view === 'event') {
    const record = events.find((entry) => entry.id === page.id);
    return (
      <PartnerEventPage
        eventId={page.id}
        reloadKey={eventReloadKey + eventsVersion}
        onEdit={(hasSales) => record && onEditEvent(record, hasSales)}
        onOpenSession={onOpenSession}
        timeZone={record?.timeZone ?? PLATFORM_TIME_ZONE}
        renderGuests={renders.renderGuests}
        renderPromoters={renders.renderPromoters}
        onOpenCoupons={
          onOpenCoupons ? () => onOpenCoupons({ kind: 'event', id: page.id }) : undefined
        }
        onOpenEarnings={onOpenEarnings}
      />
    );
  }

  const place = items.find((item) => item.id === page.id);
  if (!place) return null;
  return (
    <PartnerEstablishmentPage
      key={`${place.id}-${verificationVersion}-${planVersion}`}
      item={place}
      stats={establishments.find((entry) => entry.id === place.id)}
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
          onOpenCoupons: onOpenCoupons ? (id) => onOpenCoupons({ kind: 'offer', id }) : undefined,
        }) ?? null
      }
      reviews={renders.renderReviews?.(place.id, onOpenReviews)}
    />
  );
}
