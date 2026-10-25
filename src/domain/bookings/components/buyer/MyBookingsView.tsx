import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { useMyBookings } from '../../hooks/useMyBookings';
import type { BookingSummary } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { formatSlotDateTime } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { previewRefund } from '../../utils/refundPreview';
import { BUTTON_SECONDARY, ListEmpty, ListError, ListLoading } from '../shared/ListState';

function BookingCard({ booking, onCancel }: { booking: BookingSummary; onCancel?: () => void }) {
  const { t, i18n } = useTranslation();
  return (
    <li className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white break-words">{booking.offer.title}</p>
          <p className="text-xs text-white/70">
            {formatSlotDateTime(booking.offer.startsAt, i18n.language)}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white/80">
          {t(`bookings.bookingStatus.${booking.status}`)}
        </span>
      </div>
      <p className="text-xs text-white/70">
        {t('bookings.bookingsList.participants', { count: booking.participantsCount })} ·{' '}
        {formatMinor(booking.totalMinor, i18n.language)}
      </p>
      {booking.offer.meetingPoint && (
        <p className="text-xs text-white/70">
          {t('bookings.buyer.meetingPoint', { address: booking.offer.meetingPoint })}
        </p>
      )}
      {onCancel && (
        <button type="button" onClick={onCancel} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.cancelBooking')}
        </button>
      )}
    </li>
  );
}

/** Lista de reservas do comprador, aberta como sub-tela do menu lateral. */
export function MyBookingsView({ onBack }: { onBack: () => void }) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore, cancel } = useMyBookings();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const now = new Date();
  const upcoming = data.filter((booking) => new Date(booking.offer.startsAt) > now);
  const past = data.filter((booking) => new Date(booking.offer.startsAt) <= now);

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
          className="w-11 h-11 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>
        <h2 className="text-xl font-display font-black text-white">
          {t('bookings.buyer.myBookingsTitle')}
        </h2>
      </div>
      {notice && (
        <p role="status" className="text-sm text-teal-200">
          {notice}
        </p>
      )}
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && (
        <ListEmpty message={t('bookings.buyer.emptyBookings')} />
      )}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white/80">{t('bookings.buyer.upcoming')}</h2>
          <ul className="space-y-2">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={booking.status === 'confirmed' ? () => requestCancel(booking) : undefined}
              />
            ))}
          </ul>
        </div>
      )}
      {past.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white/80">{t('bookings.buyer.past')}</h2>
          <ul className="space-y-2">
            {past.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
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
