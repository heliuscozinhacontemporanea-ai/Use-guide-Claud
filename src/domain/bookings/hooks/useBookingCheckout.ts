import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, normalizeLocale } from '../../../shared/i18n';
import { createBookingUseCase } from '../application/usecases/createBookingUseCase';
import { getBookingUseCase } from '../application/usecases/getBookingUseCase';
import type { CreateBookingPayload, CreateBookingResponse } from '../types/bookings';
import { getBookingErrorMessage } from '../utils/bookingErrorMessage';

// Pix pode levar alguns minutos para confirmar; o webhook é a fonte da verdade (AGENTS.md §8.4).
const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 2 * 60_000;

export type BookingCheckoutStatus =
  | 'idle'
  | 'starting'
  | 'ready'
  | 'confirming'
  | 'confirmed'
  | 'delayed'
  | 'failed';

export function useBookingCheckout() {
  const { i18n } = useTranslation();
  const [status, setStatus] = useState<BookingCheckoutStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<CreateBookingResponse | null>(null);
  // Uma chave por tentativa: reenviar o mesmo pedido não cria outra reserva.
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  const start = useCallback(
    async (payload: Omit<CreateBookingPayload, 'idempotencyKey' | 'locale'>) => {
      setStatus('starting');
      setError(null);
      try {
        const response = await createBookingUseCase({
          ...payload,
          idempotencyKey: idempotencyKeyRef.current,
          locale: normalizeLocale(i18n.language) ?? DEFAULT_LOCALE,
        });
        setCheckout(response);
        setStatus(response.status === 'confirmed' ? 'confirmed' : 'ready');
      } catch (err: unknown) {
        setError(getBookingErrorMessage(err));
        setStatus('failed');
      }
    },
    [i18n.language]
  );

  const waitForConfirmation = useCallback(() => {
    if (!checkout) return;
    stop();
    setStatus('confirming');
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    const poll = async () => {
      try {
        const booking = await getBookingUseCase(checkout.bookingId);
        if (booking.status === 'confirmed') {
          setStatus('confirmed');
          return;
        }
      } catch {
        // Falha pontual: tenta de novo até o prazo.
      }
      if (Date.now() >= deadline) {
        setStatus('delayed');
        return;
      }
      timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    };
    void poll();
  }, [checkout, stop]);

  const reset = useCallback(() => {
    stop();
    idempotencyKeyRef.current = crypto.randomUUID();
    setCheckout(null);
    setError(null);
    setStatus('idle');
  }, [stop]);

  return { status, error, checkout, start, waitForConfirmation, fail: setError, reset };
}
