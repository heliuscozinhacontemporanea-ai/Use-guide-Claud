import { ArrowLeft, Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { usePartnerOffers } from '../../hooks/usePartnerOffers';
import type { BookableGuideItem, OfferStatus, PartnerOffer } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { emptyOfferFormValues, offerToFormValues } from '../../utils/offerFormMapping';
import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';
import { PartnerBookingsList } from './PartnerBookingsList';
import { PartnerOfferEditor } from './PartnerOfferEditor';
import { PartnerOfferRow } from './PartnerOfferRow';
import { PartnerSlotsManager } from './PartnerSlotsManager';

// Fase 1 (decisão D3): passeio vende horários; atração vende entradas.
const KIND_BY_CATEGORY: Record<string, PartnerOffer['kind']> = {
  tour: 'tour',
  sight: 'private_entry',
};

type View =
  | { type: 'list' }
  | { type: 'editor'; item: BookableGuideItem; offer?: PartnerOffer }
  | { type: 'slots' | 'bookings'; offer: PartnerOffer };

interface PartnerOffersManagerProps {
  items: BookableGuideItem[];
  /** Aviso montado pela composição quando a conta financeira ainda não está habilitada. */
  accountNotice?: ReactNode;
}

export function PartnerOffersManager({ items, accountNotice }: PartnerOffersManagerProps) {
  const { t } = useTranslation();
  const offers = usePartnerOffers();
  const [view, setView] = useState<View>({ type: 'list' });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const eligible = items.filter((item) => KIND_BY_CATEGORY[item.category]);

  const changeStatus = async (offer: PartnerOffer, status: Exclude<OfferStatus, 'draft'>) => {
    setBusyId(offer.id);
    setActionError(null);
    try {
      await offers.setStatus(offer.id, status);
    } catch (error: unknown) {
      setActionError(getBookingErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const requestStatus = (offer: PartnerOffer, status: Exclude<OfferStatus, 'draft'>) => {
    if (status !== 'archived') {
      void changeStatus(offer, status);
      return;
    }
    setConfirm({
      message: t('bookings.partner.confirmArchive'),
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void changeStatus(offer, status);
      },
    });
  };

  const backButton = (
    <button
      type="button"
      onClick={() => setView({ type: 'list' })}
      aria-label={t('bookings.editor.cancel')}
      className={`${BUTTON_SECONDARY} w-11`}
    >
      <ArrowLeft size={16} aria-hidden="true" />
    </button>
  );

  return (
    <GlassCard className="p-5 space-y-4 border border-white/10">
      <div>
        <h2 className="text-base font-bold text-white">{t('bookings.partner.sectionTitle')}</h2>
        <p className="text-xs text-white/60">{t('bookings.partner.sectionDescription')}</p>
      </div>
      {accountNotice}
      {actionError && (
        <p role="alert" className="text-xs text-red-300">
          {actionError}
        </p>
      )}

      {view.type === 'editor' && (
        <PartnerOfferEditor
          mode={view.offer ? 'edit' : 'create'}
          defaultValues={
            view.offer
              ? offerToFormValues(view.offer)
              : emptyOfferFormValues(KIND_BY_CATEGORY[view.item.category] ?? 'tour')
          }
          onCancel={() => setView({ type: 'list' })}
          onSubmit={async (fields, kind) => {
            if (view.offer) await offers.update(view.offer.id, fields);
            else await offers.create({ ...fields, guideItemId: view.item.id, kind });
            setView({ type: 'list' });
          }}
        />
      )}

      {(view.type === 'slots' || view.type === 'bookings') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {backButton}
            <p className="text-sm font-bold text-white">{view.offer.title['pt-BR']}</p>
          </div>
          {view.type === 'slots' ? (
            <PartnerSlotsManager offerId={view.offer.id} />
          ) : (
            <PartnerBookingsList offerId={view.offer.id} />
          )}
        </div>
      )}

      {view.type === 'list' && (
        <>
          {offers.loading && <ListLoading label={t('bookings.partner.loading')} />}
          {!offers.loading && offers.error && (
            <ListError message={offers.error} onRetry={() => void offers.reload()} />
          )}
          {!offers.loading && !offers.error && eligible.length === 0 && (
            <ListEmpty message={t('bookings.partner.noEligibleItems')} />
          )}
          {!offers.loading &&
            !offers.error &&
            eligible.map((item) => {
              const itemOffers = offers.data.filter((offer) => offer.guideItemId === item.id);
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white/90 break-words">{item.name}</h3>
                    <button
                      type="button"
                      onClick={() => setView({ type: 'editor', item })}
                      className={BUTTON_SECONDARY}
                    >
                      <Plus size={13} className="inline mr-1" aria-hidden="true" />
                      {t('bookings.partner.newOffer')}
                    </button>
                  </div>
                  {itemOffers.length === 0 ? (
                    <ListEmpty message={t('bookings.partner.emptyOffers')} />
                  ) : (
                    <ul className="space-y-2">
                      {itemOffers.map((offer) => (
                        <PartnerOfferRow
                          key={offer.id}
                          offer={offer}
                          busy={busyId === offer.id}
                          onEdit={() => setView({ type: 'editor', item, offer })}
                          onSlots={() => setView({ type: 'slots', offer })}
                          onBookings={() => setView({ type: 'bookings', offer })}
                          onStatus={(status) => requestStatus(offer, status)}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
        </>
      )}
      <ConfirmDialog data={confirm} />
    </GlassCard>
  );
}
