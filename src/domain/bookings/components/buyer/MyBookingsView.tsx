import { ArrowLeft } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { useMyBookings } from '../../hooks/useMyBookings';
import type { BookingSummary } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { formatMinor } from '../../utils/money';
import { previewRefund } from '../../utils/refundPreview';
import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';
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

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('bookings.buyer.back')}
          className="w-11 h-11 shrink-0 rounded-xl bg-surface hover:bg-accent-soft border border-line flex items-center justify-center text-ink/70 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <h2 className="text-xl font-display font-black text-ink">
          {t('bookings.buyer.myBookingsTitle')}
        </h2>
      </div>
      {notice && (
        <p role="status" className="text-sm text-accent">
          {notice}
        </p>
      )}
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && (
        <ListEmpty message={t('bookings.buyer.emptyBookings')} />
      )}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-ink/80">{t('bookings.buyer.upcoming')}</h2>
          <ul className="space-y-2">
            {upcoming.map((booking) => (
              <BuyerBookingCard
                key={booking.id}
                booking={booking}
                claimAction={claimActionOf(booking)}
                onCancel={booking.status === 'confirmed' ? () => requestCancel(booking) : undefined}
              />
            ))}
          </ul>
        </div>
      )}
      {past.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-ink/80">{t('bookings.buyer.past')}</h2>
          <ul className="space-y-2">
            {past.map((booking) => (
              <BuyerBookingCard
                key={booking.id}
                booking={booking}
                claimAction={claimActionOf(booking)}
              />
            ))}
          </ul>
        </div>
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
