import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinorCompact } from '../../../../shared/utils/money';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { Dialog } from '../../../../ui/components/Dialog';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import type { StatusTone } from '../../../../ui/components/StatusText';
import { afterSheetsClose } from '../../../../ui/components/sheet/useSheetHistory';
import { usePartnerOffers } from '../../hooks/usePartnerOffers';
import type { BookableGuideItem, OfferStatus, PartnerOffer } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { HOURLY_PRICE_OPTION_ID } from '../../utils/fleetSelection';
import { formatDuration } from '../../utils/formatDuration';
import { isBookableCategory, isFleetOffer } from '../../utils/offerKindByCategory';
import type { PartnerOfferPageSpec } from './PartnerOfferPage';
import { PartnerOfferSheet } from './PartnerOfferSheet';

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
  /** Editor, horários e reservas abrem como páginas empilhadas do painel (F3, D33). */
  onOpenPage: (page: PartnerOfferPageSpec & { title: string }) => void;
  /** Muda quando uma página de oferta fecha: a lista relê as ofertas. */
  version?: number;
  /** Na página do estabelecimento: a lista termina com "+ Nova oferta" (protótipo da F3, tela 5). */
  inPage?: boolean;
}

/** Passeios e aluguéis do Catálogo (p09) e da página do estabelecimento (p19). */
export function PartnerOffersManager({
  items,
  accountNotice,
  canPublish,
  creating = false,
  onCreatingChange,
  onOpenCoupons,
  onOpenPage,
  version = 0,
  inPage = false,
}: PartnerOffersManagerProps) {
  const { t, i18n } = useTranslation();
  const offers = usePartnerOffers();
  const { reload } = offers;
  const [selected, setSelected] = useState<PartnerOffer | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const eligible = items.filter((item) => isBookableCategory(item.category));
  const itemOf = (offer: PartnerOffer) => eligible.find((item) => item.id === offer.guideItemId);

  // O carregamento inicial já lê as ofertas; a versão só muda depois que uma página de oferta fecha.
  useEffect(() => {
    if (version > 0) void reload();
  }, [version, reload]);

  // Com vários estabelecimentos, a escolha é uma folha: o editor abre depois que ela fecha.
  const startCreate = (item: BookableGuideItem) => {
    onCreatingChange?.(false);
    afterSheetsClose(() =>
      onOpenPage({
        kind: 'editor',
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        listing: { vehicles: item.vehicles, routes: item.routes },
        title: t('bookings.editor.titleNew'),
      })
    );
  };
  const onlyItem = eligible.length === 1 ? eligible[0] : undefined;
  // Um estabelecimento só: o "Criar" vai direto ao editor.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reage só ao pedido de criar.
  useEffect(() => {
    if (creating && onlyItem) startCreate(onlyItem);
  }, [creating, onlyItem?.id]);

  const summary = (offer: PartnerOffer) => {
    if (isFleetOffer(offer)) return fleetSummary(offer);
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

  // Aluguel e translado privativo: o preço é por veículo, ou por hora no horário personalizado (F3b).
  const fleetSummary = (offer: PartnerOffer) => {
    const options = offer.pricing.priceOptions;
    const perVehicle = options.filter((option) => option.id !== HOURLY_PRICE_OPTION_ID);
    const hourly = options.find((option) => option.id === HOURLY_PRICE_OPTION_ID);
    const money = (minor: number) => formatMoneyMinorCompact(minor, i18n.language);
    if (perVehicle.length === 0) {
      return hourly ? t('fleet.summary.perHour', { amount: money(hourly.unitAmountMinor) }) : '';
    }
    const amount = money(Math.min(...perVehicle.map((option) => option.unitAmountMinor)));
    return t(perVehicle.length > 1 ? 'fleet.summary.fromPerVehicle' : 'fleet.summary.perVehicle', {
      amount,
    });
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

  // A folha da oferta fecha primeiro; a página abre depois que ela sai do histórico.
  const fromSheet = (open: () => void) => {
    setSelected(null);
    afterSheetsClose(open);
  };
  const openPage = (page: PartnerOfferPageSpec & { title: string }) =>
    fromSheet(() => onOpenPage(page));

  const visible = offers.data.filter((offer) => offer.status !== 'archived' && itemOf(offer));
  const grouped = eligible.length > 1;
  // Na linha, a duração vem antes do preço ("4 h · a partir de R$ 90 por pessoa"); a folha só o preço.
  const rowSub = (offer: PartnerOffer) =>
    [offer.durationMinutes ? formatDuration(offer.durationMinutes) : null, summary(offer)]
      .filter(Boolean)
      .join(' · ');
  const newOfferRow = (item: (typeof eligible)[number]) => (
    <ListRowButton title={t('bookings.partner.newOfferRow')} onClick={() => startCreate(item)} />
  );

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
      ) : visible.length === 0 && inPage && eligible[0] ? (
        <ListCard>{newOfferRow(eligible[0])}</ListCard>
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
                    sub={rowSub(offer)}
                    status={{
                      tone: STATUS_TONE[offer.status],
                      text: t(`bookings.status.${offer.status}`),
                    }}
                    onClick={() => setSelected(offer)}
                  />
                ))}
                {inPage && newOfferRow(item)}
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
          if (selected && item) {
            openPage({
              kind: 'editor',
              itemId: item.id,
              itemName: item.name,
              category: item.category,
              offerId: selected.id,
              listing: { vehicles: item.vehicles, routes: item.routes },
              title: t('bookings.editor.titleEdit'),
            });
          }
        }}
        onSlots={() =>
          selected &&
          openPage({
            kind: 'slots',
            offerId: selected.id,
            // Aluguel e translado privativo abrem dias com veículos (F3b).
            title: t(isFleetOffer(selected) ? 'fleet.days.title' : 'bookings.partner.manageSlots'),
          })
        }
        onBookings={() =>
          selected &&
          openPage({
            kind: 'bookings',
            offerId: selected.id,
            title: t('bookings.partner.viewBookings'),
          })
        }
        onStatus={(status) => selected && requestStatus(selected, status)}
        onCoupons={
          onOpenCoupons && selected
            ? () => {
                const offerId = selected.id;
                fromSheet(() => onOpenCoupons(offerId));
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
