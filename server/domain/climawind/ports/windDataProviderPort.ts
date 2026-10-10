import { WindDataPayload } from '../types/climaWindTypes';

export interface WindDataProviderPort {
  /**
   * Busca dados climáticos (vento, temperatura) para as coordenadas fornecidas.
   * Cada implementação decide seu próprio formato de chamada; o retorno é sempre
   * normalizado no formato uniforme consumido pelo frontend.
   */
  fetchWindData(lat: string, lon: string): Promise<WindDataPayload>;
}
