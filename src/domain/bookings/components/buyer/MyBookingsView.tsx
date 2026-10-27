import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { useMyBookings } from '../../hooks/useMyBookings';
import type { BookingSummary } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { formatMinor } from '../../utils/money';
import { previewRefund } from '../../utils/refundPreview';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { BuyerBookingCard } from './BuyerBookingCard';

/** Venda que o comprador pode reclamar; o formato é o de `ClaimableSale` do payment. */
export interface BookingClaimSale {
  referenceType: 'booking';
  referenceId: string;
  serviceStartsAt: string;
  serviceEndsAt: string;
}

// Mesmos estados que o backend aceita para reclamar; `no_show` permite contestar a falta.
const CLAIMABLE = new Set(['confirmed', 'completed', 'no_show']);

function claimSaleOf(booking: BookingSummary): BookingClaimSale | null {
  if (!CLAIMABLE.has(booking.status)) return null;
  const startsAt = booking.offer.startsAt;
  const endsAt = new Date(
    new Date(startsAt).getTime() + (booking.offer.durationMinutes ?? 0) * 60_000
  ).toISOString();
  return {
    referenceType: 'booking',
    referenceId: booking.id,
    serviceStartsAt: startsAt,
    serviceEndsAt: endsAt,
  };
}

/** Lista de reservas do comprador, aberta como sub-tela do menu lateral. */
export function MyBookingsView({
  onBack,
  renderClaimAction,
}: {
  onBack: () => void;
  /** Slot da composição para "Relatar problema" (D16, 2A). */
  renderClaimAction?: (sale: BookingClaimSale) => ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore, cancel } = useMyBookings();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const now = new Date();
  const upcoming = data.filter((booking) => new Date(booking.offer.startsAt) > now);
  const past = data.filter((booking) => new Date(booking.offer.startsAt) <= now);

  const claimActionOf = (booking: BookingSummary) => {
    const sale = renderClaimAction ? claimSaleOf(booking) : null;
    return sale ? renderClaimAction?.(sale) : null;
  };

  const requestCancel = (booking: BookingSummary) => {
    // Só para mostrar antes de confirmar; o valor devolvido é decidido pelo backend.
    const preview = previewRefund(booking, new Date());
    const amount = formatMinor(preview.refundAmountMinor, i18n.language);
    setConfirm({
      message:
        preview.refundAmountMinor > 0
          ? t('bookings.buyer.confirmCancelRefund', { amount })
          : t('bookings.buyer.confirmCancelNoRefund'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        try {
          const result = await cancel(booking.id);
          setNotice(
            result.refundAmountMinor > 0
              ? t('bookings.buyer.canceledWithRefund', {
                  amount: formatMinor(result.refundAmountMinor, i18n.language),
                })
              : t('bookings.buyer.canceledNoRefund')
          );
        } catch (err: unknown) {
          setNotice(getBookingErrorMessage(err));
        }
      },
    });
  };

  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center gap-2">
        <BackButton label={t('bookings.buyer.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">
          {t('bookings.buyer.myBookingsTitle')}
        </h2>
      </div>
      <SegmentedControl
        label={t('bookings.buyer.tabsLabel')}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'upcoming', label: t('bookings.buyer.upcomingTab', { count: upcoming.length }) },
          { value: 'past', label: t('bookings.buyer.pastTab', { count: past.length }) },
        ]}
      />
      {notice && (
        <p role="status" className="text-sm text-accent">
          {notice}
        </p>
      )}
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && shown.length === 0 && (
        <ListEmpty
          message={t(
            tab === 'upcoming' ? 'bookings.buyer.emptyUpcoming' : 'bookings.buyer.emptyPast'
          )}
        />
      )}
      {shown.length > 0 && (
        <ul className="space-y-3">
          {shown.map((booking) => (
            <BuyerBookingCard
              key={booking.id}
              booking={booking}
              upcoming={tab === 'upcoming'}
              claimAction={claimActionOf(booking)}
              onCancel={
                tab === 'upcoming' && booking.status === 'confirmed'
                  ? () => requestCancel(booking)
                  : undefined
              }
            />
          ))}
        </ul>
      )}
      {loading && <ListLoading label={t('bookings.buyer.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.loadMore')}
        </button>
      )}
      <ConfirmDialog data={confirm} />
    </section>
  );
}
