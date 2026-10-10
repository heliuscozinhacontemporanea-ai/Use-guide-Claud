import { Request, Response } from 'express';
import { climaWindService } from '../factory';
import { ClimaWindQuerySchema } from '../schemas/climaWindSchema';

export class ClimaWindController {
  static async getWindData(req: Request, res: Response): Promise<Response> {
    const parsed = ClimaWindQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      console.warn(
        '[ClimaWindController] Query rejeitada na validação de schema:',
        parsed.error.issues
      );
      return res.status(400).json({
        error: 'Parâmetros de consulta climática inválidos.',
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { latitude: lat, longitude: lon } = parsed.data;

    const queryParams = new URLSearchParams(req.query as Record<string, string>);
    const cacheKey = queryParams.toString();

    console.info(
      `[ClimaWindController] Consulta iniciada: ${lat.substring(0, 20)}... Multiponto: ${lat.includes(',')}`
    );

    try {
      const { data } = await climaWindService.getWindData(lat, lon, cacheKey);
      return res.json(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno';
      console.error(
        '[ClimaWindController Error] Todos os provedores de vento falharam:',
        errorMessage
      );
      return res.status(errorMessage.includes('429') ? 429 : 503).json({
        error: 'Sistemas meteorológicos temporariamente indisponíveis',
        message: errorMessage,
      });
    }
  }
}
