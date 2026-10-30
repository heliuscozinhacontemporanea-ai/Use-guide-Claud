import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useOfferBookings } from '../../hooks/useOfferBookings';
import { formatSlotDateTime, fortalezaDateKey } from '../../utils/dates';
import { formatMinor } from '../../utils/money';
import { BookingServiceControls } from './BookingServiceControls';

/** Reservas da oferta; no dia do serviço, cada uma mostra as ações do prestador (D20). */
export function PartnerBookingsList({ offerId }: { offerId: string }) {
  const { t, i18n } = useTranslation();
  const bookings = useOfferBookings(offerId);
  const { data, loading, error, hasMore, reload, loadMore } = bookings;
  const [notice, setNotice] = useState<string | null>(null);
  const today = fortalezaDateKey(new Date().toISOString());

  return (
    <section className="space-y-3" aria-label={t('bookings.bookingsList.title')}>
      {notice && (
        <p role="status" className="text-[13px] text-accent">
          {notice}
        </p>
      )}
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && (
        <ListEmpty message={t('bookings.bookingsList.empty')} />
      )}
      <ul className="space-y-2">
        {data.map((booking) => {
          const serviceDay = fortalezaDateKey(booking.offer.startsAt) === today;
          return (
            <li
              key={booking.id}
              className="p-4 rounded-[20px] bg-surface border border-line space-y-3"
            >
              <div>
                <p className="text-[15px] font-semibold text-ink">
                  {formatSlotDateTime(booking.offer.startsAt, i18n.language)}
                </p>
                <p className="text-[13px] text-ink/70">
                  {t('bookings.bookingsList.participants', { count: booking.participantsCount })} ·{' '}
                  {formatMinor(booking.totalMinor, i18n.language)} ·{' '}
                  {t(`bookings.bookingStatus.${booking.status}`)}
                </p>
              </div>
              {booking.pickupAddress && (
                <p className="flex items-start gap-1.5 text-[13px] text-ink/80">
                  <MapPin size={15} className="shrink-0 mt-px" aria-hidden="true" />
                  {t('serviceProof.partner.pickupAt', { address: booking.pickupAddress })}
                </p>
              )}
              {(serviceDay || booking.checkIn) && (
                <BookingServiceControls booking={booking} actions={bookings} onNotice={setNotice} />
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
