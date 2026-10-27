import { CheckCircle2, Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { getBookingUseCase } from '../../application/usecases/getBookingUseCase';
import type { BookingStatus } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';

/** Retorno do Stripe para reservas: só mostra o status; quem confirma é o webhook. */
export function BookingResultView({
  bookingId,
  onViewMyBookings,
}: {
  bookingId: string;
  onViewMyBookings: () => void;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<BookingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    getBookingUseCase(bookingId)
      .then((booking) => setStatus(booking.status))
      .catch((err: unknown) => setError(getBookingErrorMessage(err)));
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
        <h1 className="text-xl font-display font-black text-white">
          {t('bookings.buyer.resultTitle')}
        </h1>
        {!status && !error && <ListLoading label={t('bookings.buyer.resultLoading')} />}
        {error && <ListError message={error} onRetry={load} />}
        {status === 'confirmed' && (
          <>
            <CheckCircle2 size={36} className="text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-white/80">{t('bookings.buyer.confirmedDescription')}</p>
          </>
        )}
        {status && status !== 'confirmed' && (
          <>
            <Clock size={36} className="text-amber-300" aria-hidden="true" />
            <p className="text-sm text-white/80">{t(`bookings.bookingStatus.${status}`)}</p>
          </>
        )}
        <button type="button" onClick={onViewMyBookings} className={BUTTON_PRIMARY}>
          {t('bookings.buyer.viewMyBookings')}
        </button>
      </GlassCard>
    </div>
  );
}
