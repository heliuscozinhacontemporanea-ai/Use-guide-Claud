import type { Response } from 'express';
import { listAdminAccountDebtsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listAdminAccountDebtsApplicationUseCase';
import { PaymentDomainError, waiveAccountDebtUseCase } from '../../../domain/payment';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  AccountDebtParamsSchema,
  ListAdminAccountDebtsQuerySchema,
} from './schemas/paymentAccountSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof PaymentDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[AdminAccountDebtController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(
    res,
    503,
    'ACCOUNT_DEBT_UNAVAILABLE',
    'Não foi possível concluir a operação no momento.'
  );
}

/** Dívidas dos CNPJs com a plataforma, vistas pelo admin (D16). */
export class AdminAccountDebtController {
  static async listOpen(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const query = ListAdminAccountDebtsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Consulta inválida.');
    try {
      const page = await listAdminAccountDebtsApplicationUseCase(
        query.data.limit,
        query.data.cursor
      );
      return res.status(200).json(page);
    } catch (error) {
      return handleError(res, error, 'listOpen');
    }
  }

  static async waive(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const params = AccountDebtParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dívida inválida.');
    try {
      const debt = await waiveAccountDebtUseCase(params.data.debtId, req.user.uid);
      console.info('[audit] account_debt_waived', { debtId: debt.id, adminUid: req.user.uid });
      return res.status(200).json({ data: { id: debt.id, status: debt.status } });
    } catch (error) {
      return handleError(res, error, 'waive');
    }
  }
}
