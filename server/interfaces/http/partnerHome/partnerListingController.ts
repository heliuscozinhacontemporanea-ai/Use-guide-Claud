import type { Response } from 'express';
import { resolveGuideUserContextApplicationUseCase } from '../../../application/usecases/resolveGuideUserContextApplicationUseCase';
import { GuideDomainError, publishGuideItemUseCase } from '../../../domain/guide';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { PartnerListingParamsSchema } from './schemas/partnerListingSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

/** O guia de passos do Início (D34): publicar o rascunho no guia. */
export class PartnerListingController {
  static async publish(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = PartnerListingParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Anúncio inválido.');
    try {
      const user = await resolveGuideUserContextApplicationUseCase(req.user);
      await publishGuideItemUseCase(user, params.data.itemId);
      return res.status(204).end();
    } catch (error) {
      if (error instanceof GuideDomainError) {
        if (error.code === 'LISTING_INCOMPLETE') {
          return res
            .status(422)
            .json({ error: { code: error.code, message: error.message, ...error.details } });
        }
        // Anúncio de outra pessoa responde como inexistente: não revela que o ID existe.
        if (error.code === 'NOT_FOUND' || error.code === 'FORBIDDEN') {
          return sendError(res, 404, 'LISTING_NOT_FOUND', 'Anúncio não encontrado.');
        }
      }
      console.error('[PartnerListingController.publish]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível publicar agora.');
    }
  }
}
