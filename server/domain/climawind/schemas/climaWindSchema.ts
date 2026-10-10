import { z } from 'zod';

/**
 * Schema de validação para query params de GET /api/weather.
 * Aceita tanto coordenada única quanto múltiplas coordenadas separadas por vírgula
 * (suporte a multiponto do mapa de vento).
 */
const coordinatePattern = /^-?\d{1,3}(\.\d+)?(,-?\d{1,3}(\.\d+)?)*$/;

export const ClimaWindQuerySchema = z.object({
  latitude: z
    .string()
    .min(1, 'latitude é obrigatória')
    .regex(
      coordinatePattern,
      'latitude deve ser um número ou lista de números separados por vírgula'
    ),
  longitude: z
    .string()
    .min(1, 'longitude é obrigatória')
    .regex(
      coordinatePattern,
      'longitude deve ser um número ou lista de números separados por vírgula'
    ),
});

export type ClimaWindQueryDTO = z.infer<typeof ClimaWindQuerySchema>;
