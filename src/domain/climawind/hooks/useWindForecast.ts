import { useCallback, useEffect, useState } from 'react';
import { windForecastAdapter } from '../factory';
import type { WindPoint } from '../types/climaWind';
import type { ForecastDay } from '../types/windForecast';

const RETRIES = 2;
const RETRY_MS = 2000;

/** Tenta de novo algumas vezes: o proxy do tempo às vezes demora na primeira chamada. */
async function withRetry<T>(load: () => Promise<T>, isActive: () => boolean): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await load();
    } catch (error) {
      if (attempt >= RETRIES || !isActive()) throw error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
    }
  }
}

/** Previsão de 10 dias do lugar, carregada quando a folha abre. */
export function useWindForecast(location: { lat: number; lon: number }, enabled: boolean) {
  const [days, setDays] = useState<ForecastDay[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { lat, lon } = location;

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` pede uma nova tentativa.
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setError(false);
    withRetry(
      () => windForecastAdapter.fetchForecast(lat, lon),
      () => active
    )
      .then((result) => active && setDays(result))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [enabled, lat, lon, attempt]);

  const reload = useCallback(() => {
    setDays(null);
    setAttempt((n) => n + 1);
  }, []);
  return { days, loading: enabled && days === null && !error, error, reload };
}

/** Vento atual em cada ponto do mapa; até chegar, os pontos aparecem sem velocidade. */
export function useWindMapPoints(points: WindPoint[], enabled: boolean) {
  const [current, setCurrent] = useState<WindPoint[]>(points);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setError(false);
    withRetry(
      () => windForecastAdapter.fetchCurrentWind(points),
      () => active
    )
      .then((result) => active && setCurrent(result))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [enabled, points]);

  return { points: current, error };
}
