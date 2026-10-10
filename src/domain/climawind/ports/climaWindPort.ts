import { ClimaWindData } from '../types/climaWind';

export interface ClimaWindPort {
  fetchWindData(lat: number, lon: number): Promise<ClimaWindData>;
}
