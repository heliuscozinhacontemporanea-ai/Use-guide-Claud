import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('../../../shared/infrastructure/firebase/firebaseApiFetch', () => ({
  firebaseApiFetch: m.fetch,
}));

import { ApiWindForecastAdapter, WEATHER_UNAVAILABLE } from './apiWindForecastAdapter';

const ok = (body: unknown) => ({ ok: true, json: async () => body });

describe('ApiWindForecastAdapter', () => {
  beforeEach(() => vi.clearAllMocks());

  it('converte a previsão diária e pede com tempo-limite', async () => {
    m.fetch.mockResolvedValue(
      ok({
        daily: {
          time: ['2026-11-15'],
          temperature_2m_max: [30.6],
          temperature_2m_min: [24.4],
          wind_speed_10m_max: [21.5],
          wind_gusts_10m_max: [27.8],
          wind_direction_10m_dominant: [95],
          weather_code: [2],
        },
      })
    );
    const days = await new ApiWindForecastAdapter().fetchForecast(-2.8, -40.4);
    expect(days).toEqual([
      {
        day: '2026-11-15',
        maxTemp: 31,
        minTemp: 24,
        maxWind: 22,
        maxGusts: 28,
        windDir: 95,
        weatherCode: 2,
      },
    ]);
    const [url, init] = m.fetch.mock.calls[0] ?? [];
    expect(url).toContain('forecast_days=10');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('erro do servidor vira um código, sem o texto do provedor', async () => {
    m.fetch.mockResolvedValue({ ok: false, status: 502, text: async () => 'upstream detail' });
    await expect(new ApiWindForecastAdapter().fetchForecast(0, 0)).rejects.toThrow(
      WEATHER_UNAVAILABLE
    );
  });

  it('vento atual de vários pontos, na mesma ordem', async () => {
    m.fetch.mockResolvedValue(
      ok([
        { current: { wind_speed_10m: 10.4, wind_direction_10m: 80 } },
        { current: { wind_speed_10m: 18.6, wind_direction_10m: 100 } },
      ])
    );
    const points = await new ApiWindForecastAdapter().fetchCurrentWind([
      { id: 'a', name: 'A', lat: 1, lng: 2 },
      { id: 'b', name: 'B', lat: 3, lng: 4 },
    ]);
    expect(points.map((point) => [point.id, point.speed, point.dir])).toEqual([
      ['a', 10, 80],
      ['b', 19, 100],
    ]);
  });
});
