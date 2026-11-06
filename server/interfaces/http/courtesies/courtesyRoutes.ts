import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { rateLimitByIp } from '../../../infrastructure/http/rateLimitByIp';
import { rateLimitByUser } from '../../../infrastructure/http/rateLimitByUser';
import { CourtesyController } from './courtesyController';

// Receber ingresso muda a conta: token revogado é recusado (AGENTS.md §7.3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

export const courtesyRouter = Router();
courtesyRouter.get('/', verifyAuthToken, CourtesyController.list);
courtesyRouter.post(
  '/',
  verifyAuthToken,
  rateLimitByUser('courtesy-invite', 60, 60 * 60_000),
  CourtesyController.invite
);
courtesyRouter.post(
  '/links',
  verifyAuthToken,
  rateLimitByUser('courtesy-invite', 60, 60 * 60_000),
  CourtesyController.createLink
);
courtesyRouter.delete('/:courtesyId', verifyAuthToken, CourtesyController.cancel);
// A página do link abre antes do login (p28): limite por IP contra tentativas de adivinhar (§7.4).
courtesyRouter.post(
  '/links/:courtesyId/preview',
  rateLimitByIp('courtesy-link-open', 30, 10 * 60_000),
  CourtesyController.previewLink
);
courtesyRouter.post(
  '/links/:courtesyId/accept',
  verifyAuthTokenStrict,
  rateLimitByUser('courtesy-link-open', 30, 10 * 60_000),
  rateLimitByIp('courtesy-link-open', 30, 10 * 60_000),
  CourtesyController.acceptLink
);
