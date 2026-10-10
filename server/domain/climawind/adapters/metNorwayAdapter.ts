import { WindDataProviderPort } from '../ports/windDataProviderPort';
import {
  MetNorwayApiResponse,
  MetNorwayTimeSeriesEntry,
  UnifiedWindData,
} from '../types/climaWindTypes';

interface DailyAggregate {
  temps: number[];
  windSpeeds: number[];
  windDirs: number[];
  time: string;
}

/**
 * Implementação concreta do WindDataProviderPort usando MET Norway (Yr.no).
 * Não suporta consulta multiponto — uso restrito a coordenada única.
 * Referência: https://api.met.no/weatherapi/locationforecast/2.0/documentation
 */
export class MetNorwayAdapter implements WindDataProviderPort {
  private transform(metData: MetNorwayApiResponse): UnifiedWindData {
    const timeseries = metData.properties?.timeseries || [];
    if (timeseries.length === 0 || !timeseries[0]?.data?.instant?.details) {
      throw new Error('Dados de série temporal do MET Norway vazios ou inválidos');
    }

    const firstEntry = timeseries[0];
    const current = firstEntry.data.instant.details;

    const symbolCode = firstEntry.data.next_1_hours?.summary?.symbol_code || '';
    const weatherCodeMap: Record<string, number> = {
      clearsky: 0,
      clear: 0,
      fair: 1,
      partlycloudy: 2,
      cloudy: 3,
      overcast: 3,
      fog: 45,
      mist: 45,
      rain: 61,
      heavyrain: 65,
      lightrain: 61,
      rainshowers: 80,
      thunder: 95,
      sleet: 56,
      snow: 71,
    };
    const baseCode = symbolCode.split('_')[0] || '';
    const weather_code = weatherCodeMap[baseCode] || 0;

    const toKnots = (ms: number) => Math.round(ms * 1.94384);

    const dailyMap = new Map<string, DailyAggregate>();
    timeseries.forEach((entry: MetNorwayTimeSeriesEntry) => {
      const date = entry.time.split('T')[0] || entry.time;
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { temps: [], windSpeeds: [], windDirs: [], time: entry.time });
      }
      const details = entry.data?.instant?.details;
      const dayData = dailyMap.get(date);
      if (dayData && details) {
        dayData.temps.push(details.air_temperature);
        dayData.windSpeeds.push(toKnots(details.wind_speed));
        dayData.windDirs.push(details.wind_from_direction);
      }
    });

    const dailyDays = Array.from(dailyMap.values()).slice(0, 10);

    return {
      current: {
        temperature_2m: current.air_temperature,
        wind_speed_10m: toKnots(current.wind_speed),
        wind_direction_10m: current.wind_from_direction,
        wind_gusts_10m: toKnots(current.wind_speed_of_gust || current.wind_speed * 1.3),
        weather_code,
        uv_index: current.ultraviolet_index_clear_sky || 0,
      },
      hourly: {
        time: timeseries.slice(0, 48).map((t: MetNorwayTimeSeriesEntry) => t.time),
        wind_speed_10m: timeseries
          .slice(0, 48)
          .map((t: MetNorwayTimeSeriesEntry) => toKnots(t.data.instant.details.wind_speed)),
        wind_direction_10m: timeseries
          .slice(0, 48)
          .map((t: MetNorwayTimeSeriesEntry) => t.data.instant.details.wind_from_direction),
      },
      daily: {
        time: dailyDays.map((d) => d.time),
        temperature_2m_max: dailyDays.map((d) => Math.max(...d.temps)),
        temperature_2m_min: dailyDays.map((d) => Math.min(...d.temps)),
        weather_code: dailyDays.map(() => weather_code),
        wind_speed_10m_max: dailyDays.map((d) => Math.max(...d.windSpeeds)),
        wind_gusts_10m_max: dailyDays.map((d) => Math.round(Math.max(...d.windSpeeds) * 1.3)),
        wind_direction_10m_dominant: dailyDays.map(
          (d) => d.windDirs[Math.floor(d.windDirs.length / 2)] || 0
        ),
      },
    };
  }

  async fetchWindData(lat: string, lon: string): Promise<UnifiedWindData> {
    const controller = new AbortController();
    // Timeout de 8s — evita requisição pendurada indefinidamente caso o MET Norway trave
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const url = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lon}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CearaCoast/1.2 github.com/heliaus',
          'Accept-Encoding': 'gzip',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`MET Norway respondeu ${response.status}`);
      const data = (await response.json()) as MetNorwayApiResponse;
      return this.transform(data);
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
