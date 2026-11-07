import type { Response } from 'express';
import { listPartnerPromoCodesApplicationUseCase } from '../../../application/usecases/promotions/listPartnerPromoCodesApplicationUseCase';
import { toPartnerPromoCodeView } from '../../../application/usecases/promotions/partnerPromoCodeView';
import { savePartnerPromoCodeApplicationUseCase } from '../../../application/usecases/promotions/savePartnerPromoCodeApplicationUseCase';
import {
  deletePromoCodeUseCase,
  PromotionsDomainError,
  updatePromoCodeLimitsUseCase,
} from '../../../domain/promotions';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  PromoCodeInputSchema,
  PromoCodeLimitsSchema,
  PromoCodeParamsSchema,
} from './schemas/promoCodeSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

const STATUS: Partial<Record<PromotionsDomainError['code'], number>> = {
  INVALID_ARGUMENT: 422,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  PROMO_TARGET_INVALID: 404,
  PROMO_CODE_TAKEN: 409,
  PROMO_LOCKED: 409,
  PROMO_IN_USE: 409,
};

function handle(res: Response, error: unknown, operation: string): Response {
  if (error instanceof PromotionsDomainError && STATUS[error.code]) {
    return sendError(res, STATUS[error.code] ?? 422, error.code, error.message);
  }
  console.error(`[PromoCodesController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 503, 'PROMO_CODES_UNAVAILABLE', 'Não foi possível carregar os cupons.');
}

/** Área Cupons do parceiro (B1). Tudo pelo uid logado: não há parâmetro de dono (A01). */
export class PromoCodesController {
  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      return res
        .status(200)
        .json({ data: await listPartnerPromoCodesApplicationUseCase(req.user.uid) });
    } catch (error) {
      return handle(res, error, 'list');
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = PromoCodeInputSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Cupom inválido.');
    try {
      const data = await savePartnerPromoCodeApplicationUseCase(req.user.uid, body.data);
      return res.status(201).json({ data });
    } catch (error) {
      return handle(res, error, 'create');
    }
  }

  static async replace(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = PromoCodeParamsSchema.safeParse(req.params);
    const body = PromoCodeInputSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Cupom inválido.');
    }
    try {
      const data = await savePartnerPromoCodeApplicationUseCase(
        req.user.uid,
        body.data,
        params.data.id
      );
      return res.status(200).json({ data });
    } catch (error) {
      return handle(res, error, 'replace');
    }
  }

  static async updateLimits(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = PromoCodeParamsSchema.safeParse(req.params);
    const body = PromoCodeLimitsSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Cupom inválido.');
    }
    try {
      const promo = await updatePromoCodeLimitsUseCase(req.user.uid, params.data.id, body.data);
      // Nomes dos anúncios não mudam aqui; a lista recarrega com eles.
      return res
        .status(200)
        .json({ data: toPartnerPromoCodeView(promo, [], new Date().toISOString()) });
    } catch (error) {
      return handle(res, error, 'updateLimits');
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = PromoCodeParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Cupom inválido.');
    try {
      await deletePromoCodeUseCase(req.user.uid, params.data.id);
      return res.status(204).send();
    } catch (error) {
      return handle(res, error, 'remove');
    }
  }
}
