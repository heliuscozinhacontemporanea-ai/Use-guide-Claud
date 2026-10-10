import { MetNorwayAdapter } from './adapters/metNorwayAdapter';
import { OpenMeteoAdapter } from './adapters/openMeteoAdapter';
import { ClimaWindService } from './services/climaWindService';

/**
 * Ponto de Composição do domínio ClimaWind.
 * Trocar qualquer um dos dois provedores exige alterar apenas as duas linhas abaixo —
 * nenhum outro arquivo do domínio referencia o provedor concreto diretamente.
 */
const primaryProvider = new MetNorwayAdapter(); // Provedor primário — coordenada única
const secondaryProvider = new OpenMeteoAdapter(); // Provedor secundário — fallback e multiponto

export const climaWindService = new ClimaWindService(primaryProvider, secondaryProvider);
