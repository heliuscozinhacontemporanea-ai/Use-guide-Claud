import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { InsightsAccessError, InsightsUnavailableError } from '../errors/insightsErrors';
import { insightsService } from '../factory';
import { getItemStatsParamsSchema, trackInteractionSchema } from '../schemas/insightsSchemas';

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

  static async getItemStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 401, 'UNAUTHENTICATED', 'Faça login para ver as métricas.');
      return;
    }
    const parsed = getItemStatsParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Item inválido.');
      return;
    }
    try {
      const stats = await insightsService.getItemStats(
        parsed.data.itemId,
        parsed.data.itemCollection,
        { uid: req.user.uid, admin: req.user.admin }
      );
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      if (error instanceof InsightsAccessError) {
        sendError(res, 403, error.code, error.message);
        return;
      }
      console.error('[InsightsController.getItemStats]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível carregar as métricas.');
    }
  }
}
