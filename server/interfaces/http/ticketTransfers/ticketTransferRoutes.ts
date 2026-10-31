import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { rateLimitByUser } from '../../../infrastructure/http/rateLimitByUser';
import { TicketTransferController } from './ticketTransferController';

// Transferir tira o ingresso da conta: token revogado é recusado (AGENTS.md §7.3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

export const ticketTransferRouter = Router();
ticketTransferRouter.post(
  '/',
  verifyAuthTokenStrict,
  rateLimitByUser('ticket-transfer', 20, 60 * 60_000),
  TicketTransferController.transfer
);
ticketTransferRouter.post(
  '/return',
  verifyAuthTokenStrict,
  rateLimitByUser('ticket-transfer', 20, 60 * 60_000),
  TicketTransferController.returnToBuyer
);
