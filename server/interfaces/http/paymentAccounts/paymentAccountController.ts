import type { Response } from 'express';
import { acceptPartnerTermsApplicationUseCase } from '../../../application/usecases/paymentAccounts/acceptPartnerTermsApplicationUseCase';
import { getPartnerTermsApplicationUseCase } from '../../../application/usecases/paymentAccounts/getPartnerTermsApplicationUseCase';
import { listPartnerPaymentAccountsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import { startPaymentAccountSessionApplicationUseCase } from '../../../application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase';
import { ListingVerificationError, PartnerDomainError } from '../../../domain/partners';
import { PaymentDomainError } from '../../../domain/payment';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  AcceptPartnerTermsSchema,
  ListPaymentAccountsQuerySchema,
  PaymentAccountSessionSchema,
} from './schemas/paymentAccountSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof ListingVerificationError || error instanceof PaymentDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  if (error instanceof PartnerDomainError) {
    const status = { NOT_FOUND: 404, PARTNER_TERMS_NOT_ACCEPTED: 422 }[error.code as string] ?? 400;
    return sendError(res, status, error.code, error.message);
  }
  console.error(`[PaymentAccountController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  // 503: a falha mais comum aqui é o Stripe indisponível ou sem configuração (AGENTS.md §2.2.5).
  return sendError(
    res,
    503,
    'PAYMENT_ACCOUNT_UNAVAILABLE',
    'Não foi possível consultar a configuração financeira no momento.'
  );
}

export class PaymentAccountController {
  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const query = ListPaymentAccountsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Consulta inválida.');
    const ownerUid =
      req.user.admin === true && query.data.ownerUid ? query.data.ownerUid : req.user.uid;
    try {
      return res
        .status(200)
        .json({ data: await listPartnerPaymentAccountsApplicationUseCase(ownerUid) });
    } catch (error) {
      return handleError(res, error, 'list');
    }
  }

  static async getTerms(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      return res.status(200).json({ data: await getPartnerTermsApplicationUseCase(req.user.uid) });
    } catch (error) {
      return handleError(res, error, 'getTerms');
    }
  }

  static async acceptTerms(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = AcceptPartnerTermsSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Versão inválida.');
    try {
      const terms = await acceptPartnerTermsApplicationUseCase(req.user.uid, body.data.version);
      return res.status(200).json({ data: terms });
    } catch (error) {
      return handleError(res, error, 'acceptTerms');
    }
  }

  static async createSession(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = PaymentAccountSessionSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Conta inválida.');
    try {
      const session = await startPaymentAccountSessionApplicationUseCase(
        { uid: req.user.uid, email: req.user.email ?? '' },
        body.data.accountKey
      );
      return res.status(200).json({ data: session });
    } catch (error) {
      return handleError(res, error, 'createSession');
    }
  }
}
