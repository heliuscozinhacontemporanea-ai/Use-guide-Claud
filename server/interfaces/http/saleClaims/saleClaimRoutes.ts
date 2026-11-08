import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { SaleClaimController } from './saleClaimController';

// Abrir e decidir reclamações mexe com repasse e reembolso: token revogado é recusado (AGENTS.md §7.3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

export const saleClaimRouter = Router();
saleClaimRouter.post('/', verifyAuthTokenStrict, SaleClaimController.open);
saleClaimRouter.get('/mine', verifyAuthToken, SaleClaimController.listMine);

export const adminSaleClaimRouter = Router();
adminSaleClaimRouter.get('/', verifyAuthToken, SaleClaimController.listPending);
adminSaleClaimRouter.post('/:claimId/decision', verifyAuthTokenStrict, SaleClaimController.decide);
