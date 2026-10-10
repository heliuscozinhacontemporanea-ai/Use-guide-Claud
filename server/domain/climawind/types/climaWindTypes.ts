export interface WeatherCurrentData {
  temperature_2m: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  weather_code: number;
  uv_index: number;
}

export interface WeatherHourlyData {
  time: string[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
}

export interface WeatherDailyData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  wind_direction_10m_dominant: number[];
}

export interface UnifiedWindData {
  current: WeatherCurrentData;
  hourly: WeatherHourlyData;
  daily: WeatherDailyData;
}

export interface MetNorwayInstantDetails {
  air_temperature: number;
  wind_speed: number;
  wind_from_direction: number;
  wind_speed_of_gust?: number;
  ultraviolet_index_clear_sky?: number;
}

export interface MetNorwayTimeSeriesEntry {
  time: string;
  data: {
    instant: {
      details: MetNorwayInstantDetails;
    };
    next_1_hours?: {
      summary?: {
        symbol_code?: string;
      };
    };
  };
}

export interface MetNorwayApiResponse {
  properties: {
    timeseries: MetNorwayTimeSeriesEntry[];
  };
}

export interface OpenMeteoApiResponse {
  current?: WeatherCurrentData;
  hourly?: WeatherHourlyData;
  daily?: WeatherDailyData;
  [key: string]: unknown;
}

export type WindDataPayload = UnifiedWindData | OpenMeteoApiResponse | Record<string, unknown>;

export interface ClimaWindCacheEntry {
  data: WindDataPayload;
  timestamp: number;
}
