import type { Response } from 'express';
import {
  TicketTransferError,
  transferTicketToUsernameApplicationUseCase,
} from '../../../application/usecases/ticketing/transferTicketToUsernameApplicationUseCase';
import { TicketingDomainError } from '../../../domain/ticketing';
import { UsernameError } from '../../../domain/users';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ticketTransferSchema } from './ticketTransferSchema';

const TICKETING_STATUS: Record<TicketingDomainError['code'], number> = {
  INVALID_ARGUMENT: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
};

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

export class TicketTransferController {
  static async transfer(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = ticketTransferSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      const result = await transferTicketToUsernameApplicationUseCase(
        { uid, admin: req.user?.admin === true },
        parsed.data.ticketId,
        parsed.data.username
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof UsernameError) {
        return sendError(res, error.code === 'USERNAME_NOT_FOUND' ? 404 : 400, error.code, error.message);
      }
      if (error instanceof TicketTransferError) {
        return sendError(res, 422, error.code, error.message);
      }
      if (error instanceof TicketingDomainError) {
        return sendError(res, TICKETING_STATUS[error.code], error.code, error.message);
      }
      console.error('[ticketTransfer.transfer]', error instanceof Error ? error.name : 'unknown');
      return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível transferir o ingresso.');
    }
  }
}
