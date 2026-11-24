import { Response } from 'express';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { getTicketQrTokenUseCase } from '../usecases/getTicketQrTokenUseCase';
import { listUserTicketsUseCase } from '../usecases/listUserTicketsUseCase';
import { swapTicketQrUseCase } from '../usecases/swapTicketQrUseCase';
import { getActor, handleTicketingError, sendError } from './ticketingHttp';

/** Ingressos de quem comprou: a lista e o QR (com a troca do QR). */
export class TicketController {
  static async listUserTickets(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const tickets = await listUserTicketsUseCase(getActor(req));
      return res.status(200).json({ status: 'success', data: tickets });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async getTicketQrToken(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const ticketId = String(req.params.id || '');
      const result = await getTicketQrTokenUseCase(getActor(req), ticketId);
      return res.status(200).json({
        status: 'success',
        ticketId: result.ticketId,
        token: result.token,
        expiresAt: result.expiresAt,
        data: result,
      });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }

  static async swapTicketQr(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
      const result = await swapTicketQrUseCase(getActor(req), String(req.params.id || ''));
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return handleTicketingError(res, error);
    }
  }
}
