import type { Response } from 'express';
import { getListingStatsApplicationUseCase } from '../../../application/usecases/insights/getListingStatsApplicationUseCase';
import { InsightsAccessError } from '../../../domain/insights';
import { ListingPlanError } from '../../../domain/partners';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ListingStatsParamsSchema } from './schemas/listingStatsSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

export class ListingStatsController {
  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user)
      return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login para ver as métricas.');
    const params = ListingStatsParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Item inválido.');
    try {
      const data = await getListingStatsApplicationUseCase(
        { uid: req.user.uid, admin: req.user.admin },
        params.data.itemId,
        params.data.itemCollection
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      if (error instanceof InsightsAccessError) {
        return sendError(res, 403, error.code, error.message);
      }
      if (error instanceof ListingPlanError) {
        return sendError(res, error.statusCode, error.code, error.message);
      }
      console.error('[ListingStatsController.get]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível carregar as métricas.');
    }
  }
}
