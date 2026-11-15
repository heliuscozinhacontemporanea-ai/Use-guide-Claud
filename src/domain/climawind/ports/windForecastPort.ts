import type { WindPoint } from '../types/climaWind';
import type { ForecastDay } from '../types/windForecast';

/** Previsão de 10 dias de um lugar e o vento atual em vários pontos (mapa). */
export interface WindForecastPort {
  fetchForecast(lat: number, lon: number): Promise<ForecastDay[]>;
  fetchCurrentWind(points: WindPoint[]): Promise<WindPoint[]>;
}
