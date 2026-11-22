import { useTranslation } from 'react-i18next';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { createSlotsUseCase } from '../../application/usecases/createSlotsUseCase';
import { openFleetDaysUseCase } from '../../application/usecases/openFleetDaysUseCase';
import { usePartnerOffers } from '../../hooks/usePartnerOffers';
import type { BookableGuideItem, OfferKind, PartnerOffer } from '../../types/bookings';
import { placeDateKey } from '../../utils/dates';
import { emptyOfferFormValues, offerToFormValues } from '../../utils/offerFormMapping';
import { isFleetOffer, offerKindForCategory } from '../../utils/offerKindByCategory';
import { FleetDaysForm } from './FleetDaysForm';
import { PartnerBookingsList } from './PartnerBookingsList';
import { PartnerFleetDays } from './PartnerFleetDays';
import { PartnerOfferEditor } from './PartnerOfferEditor';
import { PartnerSlotsManager } from './PartnerSlotsManager';
import { SlotCreationForm } from './SlotCreationForm';

/** Página de oferta pedida ao painel (F3, D34): o editor, os horários, as reservas ou abrir. */
export type PartnerOfferPageSpec =
  | {
      kind: 'editor';
      itemId: string;
      category: string;
      offerId?: string;
      /** Veículos e trechos do anúncio, que o aluguel e o translado escolhem (F3b). */
      listing?: Pick<BookableGuideItem, 'vehicles' | 'routes'>;
      /** Nome do estabelecimento, na linha de contexto do editor. */
      itemName?: string;
    }
  | { kind: 'slots' | 'bookings'; offerId: string }
  | { kind: 'openSlots' | 'openDays'; offerId: string; vehicles?: number };

export interface PartnerOfferSaved {
  offerId: string;
  title: string;
  created: boolean;
}

interface PartnerOfferPageProps {
  page: PartnerOfferPageSpec;
  /** O "Salvar", o "Criar" e o "Abrir" ficam na barra da página (D33). */
  registerSave: (save: (() => void) | null) => void;
  onSaved: (saved: PartnerOfferSaved) => void;
  /** Abre "Abrir horários" ou "Abrir dias" por cima dos horários ou dos dias. */
  onOpenPage: (page: {
    kind: 'openSlots' | 'openDays';
    offerId: string;
    title: string;
    vehicles?: number;
  }) => void;
  /** O formulário de abrir terminou: a página sai e o aviso aparece. */
  onFormDone: (message: string) => void;
  /** Muda quando um formulário de abrir termina: horários e dias releem. */
  version: number;
}

/** "Quadri Jeri · aluguel · Quadriciclo", no topo do editor (protótipo da F3, tela 7). */
function contextLine(
  t: (key: string) => string,
  language: string,
  kind: OfferKind,
  itemName: string | undefined,
  offer: PartnerOffer | undefined
): string {
  const detail =
    offer?.vehicle ?? (offer?.route ? `${offer.route.from} → ${offer.route.to}` : null);
  return [itemName, t(`bookings.kind.${kind}`).toLocaleLowerCase(language), detail]
    .filter(Boolean)
    .join(' · ');
}

/** Conteúdo de uma página de oferta empilhada no painel; a oferta vem da lista do parceiro. */
export function PartnerOfferPage({
  page,
  registerSave,
  onSaved,
  onOpenPage,
  onFormDone,
  version,
}: PartnerOfferPageProps) {
  const { t, i18n } = useTranslation();
  const offers = usePartnerOffers();
  const offerId = page.offerId;
  const offer = offerId ? offers.data.find((entry) => entry.id === offerId) : undefined;

  if (offerId && offers.loading) return <ListLoading label={t('bookings.partner.loading')} />;
  if (offerId && offers.error) {
    return <ListError message={offers.error} onRetry={() => void offers.reload()} />;
  }
  if (offerId && !offer) return <ListEmpty message={t('bookings.partner.offerMissing')} />;

  if (page.kind === 'editor') {
    const kind = offer?.kind ?? offerKindForCategory(page.category) ?? 'tour';
    return (
      <div className="space-y-4">
        <p className="px-1 text-[13px] text-ink/70 break-words">
          {contextLine(t, i18n.language, kind, page.itemName, offer)}
        </p>
        <PartnerOfferEditor
          defaultValues={
            offer ? offerToFormValues(offer) : emptyOfferFormValues(kind, page.listing)
          }
          listing={page.listing}
          publishedPolicy={offer && offer.status !== 'draft' ? offer.cancellationPolicy : undefined}
          registerSave={registerSave}
          onSubmit={async (fields, formKind) => {
            const saved = offer
              ? await offers.update(offer.id, fields)
              : await offers.create({ ...fields, guideItemId: page.itemId, kind: formKind });
            onSaved({ offerId: saved.id, title: saved.title['pt-BR'], created: !offer });
          }}
        />
      </div>
    );
  }

  if (!offer) return null;
  const today = placeDateKey(new Date().toISOString(), offer.timeZone);
  const title = offer.title['pt-BR'];

  if (page.kind === 'openDays') {
    return (
      <div className="space-y-4">
        <p className="px-1 text-[13px] text-ink/70 break-words">{title}</p>
        <FleetDaysForm
          today={today}
          rental={offer.kind === 'rental'}
          defaultVehicles={page.vehicles}
          registerSave={registerSave}
          onOpen={async (payload) => {
            const opened = await openFleetDaysUseCase(offer.id, payload);
            onFormDone(t('fleet.days.opened', { count: opened.length }));
          }}
        />
      </div>
    );
  }

  if (page.kind === 'openSlots') {
    return (
      <div className="space-y-4">
        <p className="px-1 text-[13px] text-ink/70 break-words">{title}</p>
        <SlotCreationForm
          today={today}
          timeZone={offer.timeZone}
          registerSave={registerSave}
          onCreate={async (payload) => {
            const created = await createSlotsUseCase(offer.id, payload);
            onFormDone(t('bookings.slots.created', { count: created.length }));
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="px-1 text-[13px] text-ink/70 break-words">{title}</p>
      {page.kind === 'slots' && isFleetOffer(offer) ? (
        <PartnerFleetDays
          offer={offer}
          reloadKey={version}
          onOpenForm={(vehicles) =>
            onOpenPage({
              kind: 'openDays',
              offerId: offer.id,
              title: t('fleet.days.open'),
              vehicles,
            })
          }
        />
      ) : page.kind === 'slots' ? (
        <PartnerSlotsManager
          offerId={offer.id}
          kind={offer.kind}
          place={{ timeZone: offer.timeZone, city: offer.city }}
          reloadKey={version}
          onOpenForm={() =>
            onOpenPage({ kind: 'openSlots', offerId: offer.id, title: t('bookings.slots.open') })
          }
        />
      ) : (
        <PartnerBookingsList offerId={offer.id} />
      )}
    </div>
  );
}
