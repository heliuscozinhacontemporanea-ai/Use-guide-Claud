import { ClimaWindPort } from '../ports/climaWindPort';
import { ApiWeatherResponse, ClimaWindData, HourlyWindItem } from '../types/climaWind';
import { getWeatherDesc } from '../../../shared/lib/weatherUtils';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';

/**
 * Implementação concreta do ClimaWindPort — chama o proxy /api/weather do backend.
 * Toda a lógica de fornecedores externos (MET Norway, Open-Meteo) vive no backend.
 */
export class ApiClimaWindAdapter implements ClimaWindPort {
  async fetchWindData(lat: number, lon: number): Promise<ClimaWindData> {
    const controller = new AbortController();
    // 10 segundos — timeout razoável para APIs meteorológicas com fallback no backend
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await firebaseApiFetch(
        `/api/weather?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,uv_index&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=kn&timezone=auto&forecast_days=2&past_days=1`,
        { signal: controller.signal },
        { requireAppCheck: false }
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        let errorJson: { message?: string; error?: string } | null = null;
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          /* parse silencioso */
        }
        throw new Error(
          errorJson?.message || errorJson?.error || `Erro HTTP! Status: ${res.status}`
        );
      }

      const json = (await res.json()) as ApiWeatherResponse;

      if (!json || !json.current || !json.hourly) {
        console.error('Dados climáticos incompletos retornados:', json);
        throw new Error('Dados climáticos incompletos do servidor');
      }

      const hourlyTime = json.hourly.time || [];
      const hourlyWindSpeed = json.hourly.wind_speed_10m || [];
      const hourlyWindDir = json.hourly.wind_direction_10m || [];

      const allHours: HourlyWindItem[] = hourlyTime
        .map((time: string, i: number): HourlyWindItem | null => {
          const d = new Date(time);
          if (isNaN(d.getTime())) return null;
          return {
            time: `${String(d.getHours()).padStart(2, '0')}h`,
            hourNum: d.getHours(),
            speed: Math.round(hourlyWindSpeed[i] ?? 0),
            dir: hourlyWindDir[i] ?? 0,
            timestamp: d.getTime(),
          };
        })
        .filter((item: HourlyWindItem | null): item is HourlyWindItem => item !== null);

      const now = new Date().getTime();
      // Filtro temporal: de 1h atrás até as próximas 24h — janela relevante para condições de vento em Jeri
      const hourlyData = allHours.filter(
        (h: HourlyWindItem) =>
          h.timestamp >= now - 1000 * 60 * 75 && h.timestamp <= now + 1000 * 60 * 60 * 24
      );

      const nowHour = new Date().getHours();
      // Estimativa de maré baseada em horário astronômico para fins estéticos de lazer
      // (não é dado real — ver pendência de fonte de maré real registrada em memória)
      const isHigh = nowHour % 12 < 3 || nowHour % 12 > 9;

      return {
        id: 'regional',
        name: 'Previsões de Ventos',
        lat,
        lon,
        temp: Math.round(json.current.temperature_2m ?? 0),
        windSpeed: Math.round(json.current.wind_speed_10m ?? 0),
        windGusts: Math.round(json.current.wind_gusts_10m ?? 0),
        windDir: json.current.wind_direction_10m ?? 0,
        uvIndex: Math.round(json.current.uv_index ?? 0),
        condition: getWeatherDesc(json.current.weather_code ?? 0),
        tide: isHigh ? 'Alta' : 'Baixa',
        tideHeight: isHigh ? '2.4m' : '0.2m',
        hourlyWind: hourlyData,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
