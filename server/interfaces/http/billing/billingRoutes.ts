import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { BillingController } from './billingController';

// Operação de pagamento: token revogado é recusado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

const router = Router();

router.post('/subscriptions', verifyAuthTokenStrict, BillingController.startSubscription);
router.get('/subscription', verifyAuthToken, BillingController.getSubscription);
router.post('/subscription/change', verifyAuthTokenStrict, BillingController.changePlan);
router.post('/subscription/cancel', verifyAuthTokenStrict, BillingController.cancelAtPeriodEnd);
router.post('/subscription/resume', verifyAuthTokenStrict, BillingController.resume);
router.post('/subscription/portal', verifyAuthTokenStrict, BillingController.createPortalSession);

export default router;
