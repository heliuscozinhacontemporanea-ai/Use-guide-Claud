import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { WindForecastPort } from '../ports/windForecastPort';
import type { WindPoint } from '../types/climaWind';
import type { ForecastDay } from '../types/windForecast';

/** Erro sem detalhe do provedor: a tela mostra a mensagem traduzida (AGENTS.md §10.2). */
export const WEATHER_UNAVAILABLE = 'WEATHER_UNAVAILABLE';

const TIMEOUT_MS = 12_000;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

interface DailyResponse {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    wind_speed_10m_max?: number[];
    wind_gusts_10m_max?: number[];
    wind_direction_10m_dominant?: number[];
    weather_code?: number[];
  };
}
interface CurrentResponse {
  current?: { wind_speed_10m?: number; wind_direction_10m?: number };
}

async function getWeather<T>(params: URLSearchParams, appCheck: boolean): Promise<T> {
  const res = await firebaseApiFetch(
    `/api/weather?${params.toString()}`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
    { requireAuth: false, requireAppCheck: appCheck }
  );
  if (!res.ok) throw new Error(WEATHER_UNAVAILABLE);
  return (await res.json()) as T;
}

/** Chama o proxy `/api/weather` do backend (MET Norway e Open-Meteo ficam no servidor). */
export class ApiWindForecastAdapter implements WindForecastPort {
  async fetchForecast(lat: number, lon: number): Promise<ForecastDay[]> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      daily:
        'temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,weather_code',
      wind_speed_unit: 'kn',
      timezone: 'auto',
      forecast_days: '10',
    });
    const { daily } = await getWeather<DailyResponse>(params, false);
    if (!daily?.time) throw new Error(WEATHER_UNAVAILABLE);
    // Open-Meteo manda o dia ("2026-11-15"); o MET Norway, data e hora em UTC do dia agrupado.
    return daily.time
      .map((time, i) => ({
        day: time.slice(0, 10),
        maxTemp: Math.round(daily.temperature_2m_max?.[i] ?? 0),
        minTemp: Math.round(daily.temperature_2m_min?.[i] ?? 0),
        maxWind: Math.round(daily.wind_speed_10m_max?.[i] ?? 0),
        maxGusts: Math.round(daily.wind_gusts_10m_max?.[i] ?? 0),
        windDir: daily.wind_direction_10m_dominant?.[i] ?? 0,
        weatherCode: daily.weather_code?.[i] ?? 0,
      }))
      .filter((entry) => DAY.test(entry.day));
  }

  async fetchCurrentWind(points: WindPoint[]): Promise<WindPoint[]> {
    const params = new URLSearchParams({
      latitude: points.map((point) => point.lat).join(','),
      longitude: points.map((point) => point.lng).join(','),
      current: 'wind_speed_10m,wind_direction_10m',
      wind_speed_unit: 'kn',
    });
    const data = await getWeather<CurrentResponse | CurrentResponse[]>(params, true);
    // Um ponto só vem como objeto; vários, como lista na mesma ordem.
    const list = Array.isArray(data) ? data : [data];
    return points.map((point, i) => ({
      ...point,
      speed: Math.round(list[i]?.current?.wind_speed_10m ?? 0),
      dir: list[i]?.current?.wind_direction_10m ?? 0,
    }));
  }
}
