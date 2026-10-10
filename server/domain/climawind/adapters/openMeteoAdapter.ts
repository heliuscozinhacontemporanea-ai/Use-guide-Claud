import { WindDataProviderPort } from '../ports/windDataProviderPort';
import { WindDataPayload } from '../types/climaWindTypes';

/**
 * Implementação concreta do WindDataProviderPort usando Open-Meteo.
 * Suporta consulta multiponto. Tenta o modelo icon_seamless primeiro
 * (maior resolução), com fallback para o modelo padrão selecionado
 * automaticamente pelo Open-Meteo.
 * Referência: https://open-meteo.com/en/docs
 */
export class OpenMeteoAdapter implements WindDataProviderPort {
  private async fetchWithModel(
    lat: string,
    lon: string,
    model?: string,
    retries = 1
  ): Promise<WindDataPayload> {
    let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,uv_index&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=kn&timezone=auto`;
    if (model) url += `&models=${model}`;

    const controller = new AbortController();
    // Timeout de 8s por tentativa
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'CearaCoast/1.2' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 429 && retries > 0) {
        console.warn(
          `[OpenMeteoAdapter] Rate limit (429) para modelo '${model || 'default'}', aguardando retry...`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.fetchWithModel(lat, lon, model, retries - 1);
      }

      if (!response.ok)
        throw new Error(`Open-Meteo (${model || 'default'}) respondeu ${response.status}`);
      return (await response.json()) as WindDataPayload;
    } catch (err) {
      clearTimeout(timeoutId);
      if (retries > 0) return this.fetchWithModel(lat, lon, model, retries - 1);
      throw err;
    }
  }

  async fetchWindData(lat: string, lon: string): Promise<WindDataPayload> {
    try {
      return await this.fetchWithModel(lat, lon, 'icon_seamless');
    } catch (err) {
      console.warn(
        '[OpenMeteoAdapter] Modelo icon_seamless falhou, tentando modelo padrão:',
        (err as Error).message
      );
      return this.fetchWithModel(lat, lon);
    }
  }
}
