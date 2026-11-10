import { motion } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useMyBookings } from '../../hooks/useMyBookings';
import { showsArrivalNotice } from '../../utils/arrivalNotice';
import { ArrivalNoticeCard } from './ArrivalNoticeCard';
import { BuyerBookingCard } from './BuyerBookingCard';
import { MyBookingDetail } from './MyBookingDetail';

/**
 * Reservas do comprador por tempo (Próximas e Anteriores), com os detalhes do serviço. Cancelar e
 * relatar ficam em Configurações › Compras.
 */
export function MyBookingsView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore } = useMyBookings();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [openId, setOpenId] = useState<string | null>(null);
  const opened = data.find((booking) => booking.id === openId) ?? null;
  const now = new Date();
  const upcoming = data.filter((booking) => new Date(booking.offer.startsAt) > now);
  const past = data.filter((booking) => new Date(booking.offer.startsAt) <= now);
  const shown = tab === 'upcoming' ? upcoming : past;
  // O aviso "chegou" fica acima das abas: o serviço pode já ter começado (D27).
  const arrived = data.filter((booking) => showsArrivalNotice(booking, now));

  // Página que entra da direita em 280 ms (regra de movimento, 2026-11-09).
  if (opened) {
    return (
      <motion.div
        key={opened.id}
        initial={{ opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      >
        <MyBookingDetail booking={opened} onBack={() => setOpenId(null)} />
      </motion.div>
    );
  }

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center gap-2">
        <BackButton label={t('bookings.buyer.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">
          {t('bookings.buyer.myBookingsTitle')}
        </h2>
      </div>
      {arrived.map((booking) => (
        <ArrivalNoticeCard key={booking.id} booking={booking} onChanged={reload} />
      ))}
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
            <BuyerBookingCard
              key={booking.id}
              booking={booking}
              upcoming={tab === 'upcoming'}
              onOpen={() => setOpenId(booking.id)}
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
    </section>
  );
}
