import type { Response } from 'express';
import { getAdminListingApplicationUseCase } from '../../../application/usecases/admin/getAdminListingApplicationUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { AdminListingParamsSchema } from './schemas/adminListingSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

/** O anúncio aberto no editor do parceiro pelo admin (escolhas da F4). A rota já exige a claim. */
export class AdminListingController {
  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const params = AdminListingParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Anúncio inválido.');
    try {
      const data = await getAdminListingApplicationUseCase(params.data.itemId);
      if (!data) return sendError(res, 404, 'LISTING_NOT_FOUND', 'Anúncio não encontrado.');
      return res.status(200).json({ data });
    } catch (error) {
      console.error('[AdminListingController.get]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(res, 503, 'ADMIN_LISTING_UNAVAILABLE', 'Não foi possível abrir o anúncio.');
    }
  }
}
