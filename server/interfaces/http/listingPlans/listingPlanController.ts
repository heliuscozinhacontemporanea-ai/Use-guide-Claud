import type { Response } from 'express';
import { activateListingTrialApplicationUseCase } from '../../../application/usecases/listingPlans/activateListingTrialApplicationUseCase';
import { getListingPlanApplicationUseCase } from '../../../application/usecases/listingPlans/getListingPlanApplicationUseCase';
import { setListingSealByAdminApplicationUseCase } from '../../../application/usecases/listingPlans/setListingSealByAdminApplicationUseCase';
import { ListingPlanError, ListingVerificationError } from '../../../domain/partners';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ListingPlanParamsSchema, SetListingSealSchema } from './schemas/listingPlanSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof ListingPlanError || error instanceof ListingVerificationError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[ListingPlanController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir a operação do plano.');
}

function actorOf(req: AuthenticatedRequest) {
  return req.user ? { uid: req.user.uid, admin: req.user.admin } : null;
}

export class ListingPlanController {
  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingPlanParamsSchema.safeParse(req.params);
    if (!params.success)
      return sendError(res, 400, 'VALIDATION_ERROR', 'Estabelecimento inválido.');
    try {
      return res
        .status(200)
        .json({ data: await getListingPlanApplicationUseCase(actor, params.data.itemId) });
    } catch (error) {
      return handleError(res, error, 'get');
    }
  }

  static async activateTrial(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingPlanParamsSchema.safeParse(req.params);
    if (!params.success)
      return sendError(res, 400, 'VALIDATION_ERROR', 'Estabelecimento inválido.');
    try {
      return res
        .status(200)
        .json({ data: await activateListingTrialApplicationUseCase(actor, params.data.itemId) });
    } catch (error) {
      return handleError(res, error, 'activateTrial');
    }
  }

  static async setSeal(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingPlanParamsSchema.safeParse(req.params);
    const body = SetListingSealSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados do selo inválidos.');
    }
    try {
      const view = await setListingSealByAdminApplicationUseCase(
        actor,
        params.data.itemId,
        body.data.grant
      );
      return res.status(200).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'setSeal');
    }
  }
}
