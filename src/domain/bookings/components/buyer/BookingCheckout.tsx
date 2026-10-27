import { CheckCircle2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBookingCheckout } from '../../hooks/useBookingCheckout';
import type { CreateBookingPayload } from '../../types/bookings';
import { formatMinor } from '../../utils/money';
import { ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { RenderPaymentElement } from './types';

interface BookingCheckoutProps {
  request: Omit<CreateBookingPayload, 'idempotencyKey' | 'locale'>;
  renderPaymentElement: RenderPaymentElement;
  onViewMyBookings: () => void;
  onRestart: () => void;
}

function useCountdown(expiresAt: string | null): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  return expiresAt ? Math.max(0, new Date(expiresAt).getTime() - now) : null;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

export function BookingCheckout({
  request,
  renderPaymentElement,
  onViewMyBookings,
  onRestart,
}: BookingCheckoutProps) {
  const { t, i18n } = useTranslation();
  const { status, error, checkout, start, waitForConfirmation, fail, reset } = useBookingCheckout();
  const remaining = useCountdown(status === 'ready' ? (checkout?.expiresAt ?? null) : null);

  useEffect(() => {
    if (status === 'idle') void start(request);
  }, [status, start, request]);

  if (status === 'confirmed') {
    return (
      <div role="status" className="py-4 flex flex-col items-center text-center gap-2">
        <CheckCircle2 size={36} className="text-emerald-400" aria-hidden="true" />
        <p className="text-base font-bold text-white">{t('bookings.buyer.confirmedTitle')}</p>
        <p className="text-xs text-white/70">{t('bookings.buyer.confirmedDescription')}</p>
        <button type="button" onClick={onViewMyBookings} className={BUTTON_PRIMARY}>
          {t('bookings.buyer.viewMyBookings')}
        </button>
      </div>
    );
  }

  if (remaining === 0) {
    return (
      <div className="space-y-3">
        <ListError message={t('bookings.buyer.expired')} onRetry={onRestart} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {status === 'starting' && <ListLoading label={t('bookings.buyer.loading')} />}
      {error && (
        <ListError
          message={error}
          onRetry={() => {
            // Nova tentativa = nova chave de idempotência (outra reserva).
            reset();
          }}
        />
      )}
      {(status === 'confirming' || status === 'delayed') && (
        <div
          role="status"
          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2"
        >
          <Clock
            size={16}
            className="text-amber-300 shrink-0 mt-0.5 animate-pulse"
            aria-hidden="true"
          />
          <div className="text-xs text-amber-100 space-y-1">
            <p className="font-bold">{t('bookings.buyer.pendingTitle')}</p>
            <p>
              {status === 'delayed'
                ? t('bookings.buyer.delayed')
                : t('bookings.buyer.pendingDescription')}
            </p>
          </div>
        </div>
      )}
      {status === 'delayed' && (
        <button type="button" onClick={onViewMyBookings} className={BUTTON_SECONDARY}>
          {t('bookings.buyer.viewMyBookings')}
        </button>
      )}
      {status === 'ready' && checkout && (
        <>
          {remaining !== null && (
            <p className="text-xs text-white/70" aria-live="polite">
              {t('bookings.buyer.expiresIn', { time: formatRemaining(remaining) })}
            </p>
          )}
          {renderPaymentElement({
            clientSecret: checkout.clientSecret,
            bookingId: checkout.bookingId,
            submitLabel: t('bookings.buyer.payButton', {
              amount: formatMinor(checkout.totalMinor, i18n.language),
            }),
            onSucceeded: waitForConfirmation,
            onFailed: fail,
          })}
        </>
      )}
    </div>
  );
}
