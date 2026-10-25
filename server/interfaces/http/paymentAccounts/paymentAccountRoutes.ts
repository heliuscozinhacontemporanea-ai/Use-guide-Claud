import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { PaymentAccountController } from './paymentAccountController';

// Abrir o cadastro financeiro é operação de pagamento: token revogado é recusado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

const router = Router();

router.get('/', verifyAuthToken, PaymentAccountController.list);
router.post('/session', verifyAuthTokenStrict, PaymentAccountController.createSession);
router.get('/debts', verifyAuthToken, PaymentAccountController.listDebts);
router.post('/debts/:debtId/payment', verifyAuthTokenStrict, PaymentAccountController.payDebt);
router.post('/debts/:debtId/waive', verifyAuthTokenStrict, PaymentAccountController.waiveDebt);
router.get('/terms', verifyAuthToken, PaymentAccountController.getTerms);
router.post('/terms', verifyAuthTokenStrict, PaymentAccountController.acceptTerms);

export default router;
