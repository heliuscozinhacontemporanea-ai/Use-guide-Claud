import { Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { createTicketOrderSchema, joinWaitlistSchema } from '../schemas/ticketingSchema';
import { createTicketOrderUseCase } from '../usecases/createTicketOrderUseCase';
import { expireTicketOrderUseCase } from '../usecases/expireTicketOrderUseCase';
import { getTicketOrderUseCase } from '../usecases/getTicketOrderUseCase';
import { joinEventWaitlistUseCase } from '../usecases/joinEventWaitlistUseCase';
import { listUserTicketOrdersUseCase } from '../usecases/listUserTicketOrdersUseCase';
import { getActor, handleTicketingError, sendError } from './ticketingHttp';

/** Pedidos de quem compra: criar, ver, expirar e entrar na lista de espera. */
export class TicketOrderController {
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = createTicketOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const result = await createTicketOrderUseCase(getActor(req), parsed.data);
      return res.status(result.isIdempotentReplay ? 200 : 201).json({
        status: 'success',
        id: result.order.id,
        serverNow: result.serverNow,
        data: result,
      });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async expireOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const orderId = String(req.params.id || '');
      const { order } = await getTicketOrderUseCase(getActor(req), orderId);
      if (order.buyerId !== req.user.uid && req.user.admin !== true) {
        return sendError(res, 403, 'FORBIDDEN', 'Acesso negado a este pedido.');
      }
      await expireTicketOrderUseCase(orderId);
      return res.status(200).json({ status: 'success', orderId, expired: true });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async listUserOrders(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const orders = await listUserTicketOrdersUseCase(getActor(req));
      return res.status(200).json({ status: 'success', data: orders });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async getOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const id = String(req.params.id || '');
      const result = await getTicketOrderUseCase(getActor(req), id);
      return res.status(200).json({
        status: 'success',
        serverNow: new Date().toISOString(),
        data: result,
      });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async joinWaitlist(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const parsed = joinWaitlistSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
      }
      const entry = await joinEventWaitlistUseCase(getActor(req), parsed.data);
      return res.status(201).json({ status: 'success', data: entry });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }
}
