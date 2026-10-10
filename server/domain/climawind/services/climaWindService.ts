import { WindDataProviderPort } from '../ports/windDataProviderPort';
import { ClimaWindCacheEntry, WindDataPayload } from '../types/climaWindTypes';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos — respeita limites de quota das APIs

export class ClimaWindService {
  private cache = new Map<string, ClimaWindCacheEntry>();

  constructor(
    private readonly primaryProvider: WindDataProviderPort, // MET Norway
    private readonly secondaryProvider: WindDataProviderPort // Open-Meteo
  ) {}

  async getWindData(
    lat: string,
    lon: string,
    cacheKey: string
  ): Promise<{ data: WindDataPayload; fromCache: boolean }> {
    const now = Date.now();
    const cached = this.cache.get(cacheKey);

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return { data: cached.data, fromCache: true };
    }

    // Consulta multiponto (várias coordenadas separadas por vírgula) não é suportada
    // pelo MET Norway — pula direto para o provedor secundário (Open-Meteo).
    const isMultiPoint = lat.includes(',');

    try {
      let data: WindDataPayload;

      if (isMultiPoint) {
        data = await this.secondaryProvider.fetchWindData(lat, lon);
      } else {
        try {
          data = await this.primaryProvider.fetchWindData(lat, lon);
        } catch (primaryErr) {
          console.warn(
            '[ClimaWindService] Provedor primário (MET Norway) falhou:',
            (primaryErr as Error).message
          );
          data = await this.secondaryProvider.fetchWindData(lat, lon);
        }
      }

      this.cache.set(cacheKey, { data, timestamp: now });
      return { data, fromCache: false };
    } catch (error) {
      // Todos os provedores falharam — serve cache obsoleto como último recurso
      if (cached) {
        console.warn('[ClimaWindService] Todos os provedores falharam. Servindo cache obsoleto.');
        return { data: cached.data, fromCache: true };
      }
      throw error;
    }
  }
}
