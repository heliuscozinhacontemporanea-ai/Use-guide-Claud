import { useTranslation } from 'react-i18next';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { usePartnerOffers } from '../../hooks/usePartnerOffers';
import { emptyOfferFormValues, offerToFormValues } from '../../utils/offerFormMapping';
import { offerKindForCategory } from '../../utils/offerKindByCategory';
import { PartnerBookingsList } from './PartnerBookingsList';
import { PartnerOfferEditor } from './PartnerOfferEditor';
import { PartnerSlotsManager } from './PartnerSlotsManager';

/** Página de oferta pedida ao painel (F3, D34): o editor, os horários ou as reservas. */
export type PartnerOfferPageSpec =
  | { kind: 'editor'; itemId: string; category: string; offerId?: string }
  | { kind: 'slots' | 'bookings'; offerId: string };

export interface PartnerOfferSaved {
  offerId: string;
  title: string;
  created: boolean;
}

interface PartnerOfferPageProps {
  page: PartnerOfferPageSpec;
  /** O "Salvar" fica na barra da página (D33). */
  registerSave: (save: (() => void) | null) => void;
  onSaved: (saved: PartnerOfferSaved) => void;
}

/** Conteúdo de uma página de oferta empilhada no painel; a oferta vem da lista do parceiro. */
export function PartnerOfferPage({ page, registerSave, onSaved }: PartnerOfferPageProps) {
  const { t } = useTranslation();
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
      <PartnerOfferEditor
        defaultValues={offer ? offerToFormValues(offer) : emptyOfferFormValues(kind)}
        publishedPolicy={offer && offer.status !== 'draft' ? offer.cancellationPolicy : undefined}
        registerSave={registerSave}
        onSubmit={async (fields, formKind) => {
          const saved = offer
            ? await offers.update(offer.id, fields)
            : await offers.create({ ...fields, guideItemId: page.itemId, kind: formKind });
          onSaved({ offerId: saved.id, title: saved.title['pt-BR'], created: !offer });
        }}
      />
    );
  }

  if (!offer) return null;
  return (
    <div className="space-y-4">
      <p className="px-1 text-[13px] text-ink/70 break-words">{offer.title['pt-BR']}</p>
      {page.kind === 'slots' ? (
        <PartnerSlotsManager
          offerId={offer.id}
          kind={offer.kind}
          place={{ timeZone: offer.timeZone, city: offer.city }}
        />
      ) : (
        <PartnerBookingsList offerId={offer.id} />
      )}
    </div>
  );
}
