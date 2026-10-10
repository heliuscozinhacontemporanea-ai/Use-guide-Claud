export interface WindPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed?: number;
  dir?: number;
}

export interface HourlyWind {
  time: string;
  speed: number;
  dir: number;
  timestamp: number;
}

export interface HourlyWindItem extends HourlyWind {
  hourNum: number;
}

export interface ClimaWindData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  temp: number;
  windSpeed: number;
  windGusts: number;
  windDir: number;
  condition: string;
  tide: 'Alta' | 'Baixa' | 'Enchendo' | 'Secando' | string;
  tideHeight: string;
  uvIndex: number;
  hourlyWind: HourlyWind[];
}

export interface ApiWeatherResponse {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    wind_gusts_10m?: number;
    wind_direction_10m?: number;
    weather_code?: number;
    uv_index?: number;
  };
  hourly?: {
    time?: string[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
  };
}
