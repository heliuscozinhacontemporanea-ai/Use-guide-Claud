import { useTranslation } from 'react-i18next';
import { useOfferBookings } from '../../hooks/useOfferBookings';
import { formatSlotDateTime } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';

export function PartnerBookingsList({ offerId }: { offerId: string }) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore, markNoShow } = useOfferBookings(offerId);
  const now = Date.now();

  return (
    <section className="space-y-3" aria-label={t('bookings.bookingsList.title')}>
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && (
        <ListEmpty message={t('bookings.bookingsList.empty')} />
      )}
      <ul className="space-y-2">
        {data.map((booking) => {
          const started = new Date(booking.offer.startsAt).getTime() <= now;
          return (
            <li
              key={booking.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <p className="text-sm font-bold text-white">
                  {formatSlotDateTime(booking.offer.startsAt, i18n.language)}
                </p>
                <p className="text-xs text-white/60">
                  {t('bookings.bookingsList.participants', { count: booking.participantsCount })} ·{' '}
                  {formatMinor(booking.totalMinor, i18n.language)} ·{' '}
                  {t(`bookings.bookingStatus.${booking.status}`)}
                </p>
              </div>
              {booking.status === 'confirmed' && started && (
                <button
                  type="button"
                  onClick={() => void markNoShow(booking.id)}
                  className={BUTTON_SECONDARY}
                >
                  {t('bookings.bookingsList.markNoShow')}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {loading && <ListLoading label={t('bookings.partner.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('bookings.bookingsList.loadMore')}
        </button>
      )}
    </section>
  );
}
