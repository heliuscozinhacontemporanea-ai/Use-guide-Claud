import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { InsightsUnavailableError } from '../errors/insightsErrors';
import { insightsService } from '../factory';
import { trackInteractionSchema } from '../schemas/insightsSchemas';

function sendError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ error: { code, message } });
}

export class InsightsController {
  static async trackInteraction(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = trackInteractionSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Interação inválida.');
      return;
    }
    try {
      const counted = await insightsService.trackInteraction({
        ...parsed.data,
        uid: req.user?.uid ?? null,
        ip: req.ip ?? null,
      });
      // 202: a interação foi aceita; repetida na janela de 30 min não soma de novo.
      res.status(202).json({ counted });
    } catch (error) {
      if (error instanceof InsightsUnavailableError) {
        sendError(res, 503, error.code, error.message);
        return;
      }
      console.error('[InsightsController.trackInteraction]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível registrar a interação.');
    }
  }
}
