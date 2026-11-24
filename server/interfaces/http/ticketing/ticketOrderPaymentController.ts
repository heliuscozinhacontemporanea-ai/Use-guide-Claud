import type { Response } from 'express';
import { confirmTicketOrderPaymentClientReturnApplicationUseCase } from '../../../application/usecases/confirmTicketOrderPaymentClientReturnApplicationUseCase';
import { createTicketOrderPaymentIntentApplicationUseCase } from '../../../application/usecases/createTicketOrderPaymentIntentApplicationUseCase';
import { processTicketRefundApplicationUseCase } from '../../../application/usecases/processTicketRefundApplicationUseCase';
import { ticketingHttpError } from '../../../domain/ticketing';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { newIdempotencyKey } from '../../../infrastructure/crypto/idempotencyKey';
import {
  payTicketOrderSchema,
  requestTicketRefundSchema,
} from './schemas/ticketOrderPaymentSchemas';

function getActor(req: AuthenticatedRequest) {
  return {
    uid: req.user?.uid || '',
    admin: req.user?.admin === true,
    role: req.user?.admin === true ? 'admin' : 'user',
    emailVerified: req.user?.emailVerified === true,
  };
}

/** Formato único de erro (§10.2): `code` estável e mensagem segura para a pessoa. */
function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleTicketingError(res: Response, error: unknown): Response {
  const known = ticketingHttpError(error);
  if (known) return sendError(res, known.status, known.code, known.message);
  console.error('[TicketOrderPaymentController]', error instanceof Error ? error.name : 'unknown');
  return sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno no serviço de ingressos.');
}

/** Pagar o pedido de ingresso, confirmar o retorno do pagamento e reembolsar: juntam ticketing e payment. */
export class TicketOrderPaymentController {
  static async createOrderPaymentIntent(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const orderId = String(req.params.id || '');
      const parsed = payTicketOrderSchema.safeParse(req.body || {});
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados de pagamento inválidos.');
      }
      const result = await createTicketOrderPaymentIntentApplicationUseCase(getActor(req), {
        orderId,
        idempotencyKey: parsed.data.idempotencyKey || newIdempotencyKey(),
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async confirmOrderPaymentReturn(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const orderId = String(req.params.id || '');
      const paymentIntentId = String(req.body?.paymentIntentId || req.query.paymentIntentId || '');
      if (!paymentIntentId) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'paymentIntentId é obrigatório.');
      }
      const result = await confirmTicketOrderPaymentClientReturnApplicationUseCase(getActor(req), {
        orderId,
        paymentIntentId,
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async requestRefund(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = requestTicketRefundSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const orderId = String(req.params.id || '');
      const result = await processTicketRefundApplicationUseCase(getActor(req), {
        orderId,
        ...parsed.data,
      });
      return res.status(result.isReplay ? 200 : 201).json({
        status: 'success',
        data: result.refund,
      });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }
}
