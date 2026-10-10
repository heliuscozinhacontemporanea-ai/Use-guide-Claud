import { useEffect, useMemo, useState } from 'react';

interface CheckoutCountdownInput {
  expiresAt: string;
  serverNow: string;
}

interface CheckoutCountdownResult {
  remainingMs: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isWarning: boolean;
}

export function useCheckoutCountdown({
  expiresAt,
  serverNow,
}: CheckoutCountdownInput): CheckoutCountdownResult {
  const clockOffsetMs = useMemo(
    () => new Date(serverNow).getTime() - Date.now(),
    [serverNow]
  );

  const getRemaining = () =>
    Math.max(
      0,
      new Date(expiresAt).getTime() - (Date.now() + clockOffsetMs)
    );

  const [remainingMs, setRemainingMs] = useState(getRemaining);

  useEffect(() => {
    const update = () => {
      setRemainingMs(getRemaining());
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [expiresAt, clockOffsetMs]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return {
    remainingMs,
    minutes,
    seconds,
    isExpired: remainingMs <= 0,
    isWarning: remainingMs > 0 && remainingMs <= 2 * 60 * 1000,
  };
}
