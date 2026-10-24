import type { Response } from 'express';
import { changePartnerPlanSubscriptionApplicationUseCase } from '../../../application/usecases/changePartnerPlanSubscriptionApplicationUseCase';
import { startPartnerPlanSubscriptionApplicationUseCase } from '../../../application/usecases/startPartnerPlanSubscriptionApplicationUseCase';
import {
  createBillingPortalSessionUseCase,
  getListingPlanSubscriptionUseCase,
  PaymentDomainError,
  type PlanSubscriptionRecord,
  setPlanSubscriptionCancelAtPeriodEndUseCase,
} from '../../../domain/payment';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  BillingPortalSchema,
  ChangePlanSubscriptionSchema,
  ListingSubscriptionSchema,
  StartPlanSubscriptionSchema,
} from './schemas/billingSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, operation: string, error: unknown): Response {
  if (error instanceof PaymentDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[BillingController.${operation}]`, {
    message: error instanceof Error ? error.message : 'Erro desconhecido',
  });
  return sendError(res, 503, 'BILLING_UNAVAILABLE', 'Assinaturas indisponíveis no momento.');
}

// Allowlist de saída: o ID do cliente no Stripe não sai do backend (AGENTS.md §7.9 regra 4).
function toPublicSubscription(record: PlanSubscriptionRecord | null) {
  if (!record) return null;
  return {
    itemId: record.itemId,
    planId: record.planId,
    status: record.status,
    currentPeriodEnd: record.currentPeriodEnd,
    cancelAtPeriodEnd: record.cancelAtPeriodEnd,
    pendingPlanId: record.pendingPlanId,
    pendingChangeAt: record.pendingChangeAt,
  };
}

export class BillingController {
  static async startSubscription(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) {
      return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    }
    const parsed = StartPlanSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da assinatura inválidos.');
    }
    try {
      const result = await startPartnerPlanSubscriptionApplicationUseCase(
        { uid: req.user.uid, email: req.user.email },
        parsed.data
      );
      return res.status(201).json(result);
    } catch (error: unknown) {
      return handleError(res, 'startSubscription', error);
    }
  }

  static async getSubscription(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) {
      return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    }
    const parsed = ListingSubscriptionSchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Estabelecimento inválido.');
    }
    try {
      const record = await getListingPlanSubscriptionUseCase(parsed.data.itemId, req.user.uid);
      return res.status(200).json({ subscription: toPublicSubscription(record) });
    } catch (error: unknown) {
      return handleError(res, 'getSubscription', error);
    }
  }

  static async changePlan(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) {
      return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    }
    const parsed = ChangePlanSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da troca de período inválidos.');
    }
    try {
      const record = await changePartnerPlanSubscriptionApplicationUseCase(
        { uid: req.user.uid },
        parsed.data
      );
      return res.status(200).json({ subscription: toPublicSubscription(record) });
    } catch (error: unknown) {
      return handleError(res, 'changePlan', error);
    }
  }

  static async cancelAtPeriodEnd(req: AuthenticatedRequest, res: Response): Promise<Response> {
    return BillingController.setCancelAtPeriodEnd(req, res, true);
  }

  static async resume(req: AuthenticatedRequest, res: Response): Promise<Response> {
    return BillingController.setCancelAtPeriodEnd(req, res, false);
  }

  static async createPortalSession(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) {
      return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    }
    const parsed = BillingPortalSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    }
    const appUrl = process.env.APP_URL;
    if (!appUrl?.startsWith('https://')) {
      return sendError(res, 503, 'BILLING_UNAVAILABLE', 'Portal de pagamento indisponível.');
    }
    try {
      const session = await createBillingPortalSessionUseCase(
        req.user.uid,
        `${appUrl.replace(/\/$/, '')}/?partner=1`,
        parsed.data.locale
      );
      return res.status(200).json({ url: session.url });
    } catch (error: unknown) {
      return handleError(res, 'createPortalSession', error);
    }
  }

  private static async setCancelAtPeriodEnd(
    req: AuthenticatedRequest,
    res: Response,
    cancel: boolean
  ): Promise<Response> {
    if (!req.user?.uid) {
      return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    }
    const parsed = ListingSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Estabelecimento inválido.');
    }
    try {
      const record = await setPlanSubscriptionCancelAtPeriodEndUseCase(
        parsed.data.itemId,
        req.user.uid,
        cancel
      );
      return res.status(200).json({ subscription: toPublicSubscription(record) });
    } catch (error: unknown) {
      return handleError(res, 'setCancelAtPeriodEnd', error);
    }
  }
}
