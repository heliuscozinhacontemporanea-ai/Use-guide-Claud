import type { Response } from 'express';
import { declarePartnerForceMajeureApplicationUseCase } from '../../../application/usecases/paymentAccounts/declarePartnerForceMajeureApplicationUseCase';
import { readForceMajeureProofApplicationUseCase } from '../../../application/usecases/paymentAccounts/readForceMajeureProofApplicationUseCase';
import {
  decideForceMajeureUseCase,
  listForceMajeureReviewsUseCase,
  PaymentDomainError,
} from '../../../domain/payment';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  AccountDebtParamsSchema,
  DecideForceMajeureSchema,
  DeclareForceMajeureSchema,
} from './schemas/paymentAccountSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof PaymentDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[ForceMajeureController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(
    res,
    503,
    'FORCE_MAJEURE_UNAVAILABLE',
    'Não foi possível concluir a operação no momento.'
  );
}

/** Força maior na multa de cancelamento (D16, 3A): declaração do parceiro e decisão do admin. */
export class ForceMajeureController {
  static async declare(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = AccountDebtParamsSchema.safeParse(req.params);
    const body = DeclareForceMajeureSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Declaração inválida.');
    }
    try {
      const debt = await declarePartnerForceMajeureApplicationUseCase(
        req.user.uid,
        params.data.debtId,
        body.data
      );
      return res.status(200).json({ data: debt });
    } catch (error) {
      return handleError(res, error, 'declare');
    }
  }

  static async listReviews(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    try {
      return res.status(200).json({ data: await listForceMajeureReviewsUseCase(50) });
    } catch (error) {
      return handleError(res, error, 'listReviews');
    }
  }

  static async readProof(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const params = AccountDebtParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dívida inválida.');
    try {
      const file = await readForceMajeureProofApplicationUseCase(req.user.uid, params.data.debtId);
      if (!file) return sendError(res, 404, 'NOT_FOUND', 'Prova não encontrada.');
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline');
      return res.status(200).send(file.data);
    } catch (error) {
      return handleError(res, error, 'readProof');
    }
  }

  static async decide(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const params = AccountDebtParamsSchema.safeParse(req.params);
    const body = DecideForceMajeureSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Decisão inválida.');
    }
    try {
      const debt = await decideForceMajeureUseCase(
        params.data.debtId,
        req.user.uid,
        body.data.approve
      );
      console.info('[audit] force_majeure_decided', {
        debtId: debt.id,
        adminUid: req.user.uid,
        approve: body.data.approve,
      });
      return res
        .status(200)
        .json({ data: { id: debt.id, status: debt.status, dueAt: debt.dueAt } });
    } catch (error) {
      return handleError(res, error, 'decide');
    }
  }
}
