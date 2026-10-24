import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAdminToken, verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { ListingPlanController } from './listingPlanController';

// Contratar plano é operação de pagamento: token revogado é recusado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

const router = Router();

router.get('/:itemId', verifyAuthToken, ListingPlanController.get);
router.post('/:itemId/trial', verifyAuthTokenStrict, ListingPlanController.activateTrial);
router.put('/:itemId/seal', verifyAdminToken, ListingPlanController.setSeal);

export default router;
