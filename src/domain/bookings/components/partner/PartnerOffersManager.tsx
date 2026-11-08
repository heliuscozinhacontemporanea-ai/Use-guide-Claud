import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinorCompact } from '../../../../shared/utils/money';
import { BackButton } from '../../../../ui/components/BackButton';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { Dialog } from '../../../../ui/components/Dialog';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import type { StatusTone } from '../../../../ui/components/StatusText';
import { usePartnerOffers } from '../../hooks/usePartnerOffers';
import type { BookableGuideItem, OfferStatus, PartnerOffer } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { emptyOfferFormValues, offerToFormValues } from '../../utils/offerFormMapping';
import { isBookableCategory, offerKindForCategory } from '../../utils/offerKindByCategory';
import { PartnerBookingsList } from './PartnerBookingsList';
import { PartnerOfferEditor } from './PartnerOfferEditor';
import { PartnerOfferSheet } from './PartnerOfferSheet';
import { PartnerSlotsManager } from './PartnerSlotsManager';

type View =
  | { type: 'list' }
  | { type: 'editor'; item: BookableGuideItem; offer?: PartnerOffer }
  | { type: 'slots' | 'bookings'; offer: PartnerOffer };

const STATUS_TONE: Record<OfferStatus, StatusTone> = {
  draft: 'warn',
  published: 'success',
  paused: 'warn',
  archived: 'muted',
};

interface PartnerOffersManagerProps {
  items: BookableGuideItem[];
  /** Aviso montado pela composição quando a conta financeira ainda não está habilitada. */
  accountNotice?: ReactNode;
  /** Publicar só com a conta do CNPJ do estabelecimento pronta (D14); o servidor confere de novo. */
  canPublish: (guideItemId: string) => boolean;
  /** "Criar" do Catálogo: abre o editor (ou a escolha do estabelecimento). */
  creating?: boolean;
  onCreatingChange?: (creating: boolean) => void;
  /** Cupons da oferta, na área Cupons do painel (B1c). */
  onOpenCoupons?: (offerId: string) => void;
}

/** Passeios e aluguéis do Catálogo (p09) e da página do estabelecimento (p19). */
export function PartnerOffersManager({
  items,
  accountNotice,
  canPublish,
  creating = false,
  onCreatingChange,
  onOpenCoupons,
}: PartnerOffersManagerProps) {
  const { t, i18n } = useTranslation();
  const offers = usePartnerOffers();
  const [view, setView] = useState<View>({ type: 'list' });
  const [selected, setSelected] = useState<PartnerOffer | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const eligible = items.filter((item) => isBookableCategory(item.category));
  const itemOf = (offer: PartnerOffer) => eligible.find((item) => item.id === offer.guideItemId);

  const startCreate = (item: BookableGuideItem) => {
    onCreatingChange?.(false);
    setView({ type: 'editor', item });
  };
  const onlyItem = eligible.length === 1 ? eligible[0] : undefined;
  // Um estabelecimento só: o "Criar" vai direto ao editor.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reage só ao pedido de criar.
  useEffect(() => {
    if (creating && onlyItem) startCreate(onlyItem);
  }, [creating, onlyItem?.id]);

  const summary = (offer: PartnerOffer) => {
    const prices = offer.pricing.priceOptions.map((option) => option.unitAmountMinor);
    const amount = formatMoneyMinorCompact(Math.min(...prices), i18n.language);
    const group = offer.sellingUnit === 'group';
    const key =
      prices.length > 1
        ? group
          ? 'fromPerGroup'
          : 'fromPerPerson'
        : group
          ? 'perGroup'
          : 'perPerson';
    return t(`bookings.partner.${key}`, { amount });
  };

  const changeStatus = async (offer: PartnerOffer, status: Exclude<OfferStatus, 'draft'>) => {
    setBusyId(offer.id);
    setActionError(null);
    try {
      await offers.setStatus(offer.id, status);
      setSelected(null);
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

  const open = (next: View) => {
    setSelected(null);
    setView(next);
  };

  if (view.type === 'editor') {
    return (
      <PartnerOfferEditor
        mode={view.offer ? 'edit' : 'create'}
        publishedPolicy={
          view.offer && view.offer.status !== 'draft' ? view.offer.cancellationPolicy : undefined
        }
        defaultValues={
          view.offer
            ? offerToFormValues(view.offer)
            : emptyOfferFormValues(offerKindForCategory(view.item.category) ?? 'tour')
        }
        onCancel={() => setView({ type: 'list' })}
        onSubmit={async (fields, kind) => {
          if (view.offer) await offers.update(view.offer.id, fields);
          else await offers.create({ ...fields, guideItemId: view.item.id, kind });
          setView({ type: 'list' });
        }}
      />
    );
  }

  if (view.type === 'slots' || view.type === 'bookings') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BackButton
            label={t('bookings.editor.cancel')}
            onClick={() => setView({ type: 'list' })}
          />
          <p className="text-[18px] font-display font-bold text-ink break-words">
            {view.offer.title['pt-BR']}
          </p>
        </div>
        {view.type === 'slots' ? (
          <PartnerSlotsManager
            offerId={view.offer.id}
            kind={view.offer.kind}
            place={{ timeZone: view.offer.timeZone, city: view.offer.city }}
          />
        ) : (
          <PartnerBookingsList offerId={view.offer.id} />
        )}
      </div>
    );
  }

  const visible = offers.data.filter((offer) => offer.status !== 'archived' && itemOf(offer));
  const grouped = eligible.length > 1;

  return (
    <div className="space-y-4">
      {accountNotice}
      {actionError && (
        <p role="alert" className="px-1 text-[13px] text-danger">
          {actionError}
        </p>
      )}
      {offers.loading ? (
        <ListLoading label={t('bookings.partner.loading')} />
      ) : offers.error ? (
        <ListError message={offers.error} onRetry={() => void offers.reload()} />
      ) : eligible.length === 0 ? (
        <ListEmpty message={t('bookings.partner.noEligibleItems')} />
      ) : visible.length === 0 ? (
        <ListEmpty message={t('bookings.partner.emptyCatalog')} />
      ) : (
        eligible.map((item) => {
          const rows = visible.filter((offer) => offer.guideItemId === item.id);
          if (rows.length === 0) return null;
          return (
            <div key={item.id} className="space-y-2">
              {grouped && (
                <h3 className="px-1 text-[13px] font-semibold text-ink/70">{item.name}</h3>
              )}
              <ListCard>
                {rows.map((offer) => (
                  <ListRowButton
                    key={offer.id}
                    title={offer.title['pt-BR']}
                    sub={summary(offer)}
                    status={{
                      tone: STATUS_TONE[offer.status],
                      text: t(`bookings.status.${offer.status}`),
                    }}
                    onClick={() => setSelected(offer)}
                  />
                ))}
              </ListCard>
            </div>
          );
        })
      )}

      <PartnerOfferSheet
        offer={selected}
        summary={selected ? summary(selected) : ''}
        busy={busyId === selected?.id}
        canPublish={selected ? canPublish(selected.guideItemId) : false}
        onClose={() => setSelected(null)}
        onEdit={() => {
          const item = selected && itemOf(selected);
          if (selected && item) open({ type: 'editor', item, offer: selected });
        }}
        onSlots={() => selected && open({ type: 'slots', offer: selected })}
        onBookings={() => selected && open({ type: 'bookings', offer: selected })}
        onStatus={(status) => selected && requestStatus(selected, status)}
        onCoupons={
          onOpenCoupons && selected
            ? () => {
                setSelected(null);
                onOpenCoupons(selected.id);
              }
            : undefined
        }
      />

      <Dialog
        open={creating && eligible.length > 1}
        onOpenChange={(next) => !next && onCreatingChange?.(false)}
        title={t('bookings.partner.newOffer')}
        description={t('bookings.partner.pickItem')}
      >
        <ListCard>
          {eligible.map((item) => (
            <ListRowButton key={item.id} title={item.name} onClick={() => startCreate(item)} />
          ))}
        </ListCard>
      </Dialog>

      <ConfirmDialog data={confirm} />
    </div>
  );
}
