import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useMyBookings } from '../../hooks/useMyBookings';
import { BuyerBookingCard } from './BuyerBookingCard';

/**
 * Reservas do comprador por tempo (Próximas e Anteriores), com os detalhes do serviço. Cancelar e
 * relatar ficam em Configurações › Compras.
 */
export function MyBookingsView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore } = useMyBookings();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const now = new Date();
  const upcoming = data.filter((booking) => new Date(booking.offer.startsAt) > now);
  const past = data.filter((booking) => new Date(booking.offer.startsAt) <= now);
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
            <BuyerBookingCard key={booking.id} booking={booking} upcoming={tab === 'upcoming'} />
          ))}
        </ul>
      )}
      {loading && <ListLoading label={t('bookings.buyer.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.loadMore')}
        </button>
      )}
    </section>
  );
}
