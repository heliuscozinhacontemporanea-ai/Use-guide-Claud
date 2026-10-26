import type { Response } from 'express';
import { decideSaleClaimApplicationUseCase } from '../../../application/usecases/payouts/decideSaleClaimApplicationUseCase';
import { listAdminSaleClaimsApplicationUseCase } from '../../../application/usecases/payouts/listAdminSaleClaimsApplicationUseCase';
import { openSaleClaimApplicationUseCase } from '../../../application/usecases/payouts/openSaleClaimApplicationUseCase';
import { listMySaleClaimsUseCase, PaymentDomainError } from '../../../domain/payment';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  DecideSaleClaimSchema,
  ListSaleClaimsQuerySchema,
  OpenSaleClaimSchema,
  SaleClaimParamsSchema,
} from './schemas/saleClaimSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof PaymentDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[SaleClaimController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  // 503: a falha mais comum aqui é o Stripe indisponível no reembolso (AGENTS.md §2.2.5).
  return sendError(
    res,
    503,
    'SALE_CLAIM_UNAVAILABLE',
    'Não foi possível concluir a operação no momento.'
  );
}

export class SaleClaimController {
  static async open(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = OpenSaleClaimSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Reclamação inválida.');
    try {
      const claim = await openSaleClaimApplicationUseCase(
        { uid: req.user.uid, admin: req.user.admin === true },
        { ...body.data, details: body.data.details || undefined }
      );
      return res.status(201).json({ data: claim });
    } catch (error) {
      return handleError(res, error, 'open');
    }
  }

  static async listMine(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      return res.status(200).json({ data: await listMySaleClaimsUseCase(req.user.uid) });
    } catch (error) {
      return handleError(res, error, 'listMine');
    }
  }

  static async listPending(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const query = ListSaleClaimsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Consulta inválida.');
    try {
      const page = await listAdminSaleClaimsApplicationUseCase(query.data.limit, query.data.cursor);
      return res.status(200).json(page);
    } catch (error) {
      return handleError(res, error, 'listPending');
    }
  }

  static async decide(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const params = SaleClaimParamsSchema.safeParse(req.params);
    const body = DecideSaleClaimSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Decisão inválida.');
    }
    try {
      const claim = await decideSaleClaimApplicationUseCase(
        req.user.uid,
        params.data.claimId,
        body.data
      );
      console.info('[audit] sale_claim_decided', {
        claimId: claim.id,
        adminUid: req.user.uid,
        outcome: body.data.outcome,
        chargePenalty: body.data.chargePenalty === true,
      });
      return res.status(200).json({
        data: {
          id: claim.id,
          status: claim.status,
          ...(claim.refundAmountMinor !== undefined
            ? { refundAmountMinor: claim.refundAmountMinor }
            : {}),
        },
      });
    } catch (error) {
      return handleError(res, error, 'decide');
    }
  }
}
