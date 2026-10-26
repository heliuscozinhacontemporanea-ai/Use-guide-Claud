import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { ForceMajeureController } from './forceMajeureController';
import { PaymentAccountController } from './paymentAccountController';

// Abrir o cadastro financeiro é operação de pagamento: token revogado é recusado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

const router = Router();

router.get('/', verifyAuthToken, PaymentAccountController.list);
router.post('/session', verifyAuthTokenStrict, PaymentAccountController.createSession);
router.get('/payouts', verifyAuthToken, PaymentAccountController.listPayouts);
router.get('/debts', verifyAuthToken, PaymentAccountController.listDebts);
router.post('/debts/:debtId/payment', verifyAuthTokenStrict, PaymentAccountController.payDebt);
router.post('/debts/:debtId/waive', verifyAuthTokenStrict, PaymentAccountController.waiveDebt);
router.post('/debts/:debtId/force-majeure', verifyAuthTokenStrict, ForceMajeureController.declare);
router.get('/terms', verifyAuthToken, PaymentAccountController.getTerms);
router.post('/terms', verifyAuthTokenStrict, PaymentAccountController.acceptTerms);

export default router;

/** Fila de força maior do admin (D16, 3A), montada em `/api/admin/account-debts`. */
export const adminAccountDebtRouter = Router();
adminAccountDebtRouter.get('/force-majeure', verifyAuthToken, ForceMajeureController.listReviews);
adminAccountDebtRouter.get(
  '/:debtId/force-majeure/proof',
  verifyAuthToken,
  ForceMajeureController.readProof
);
adminAccountDebtRouter.post(
  '/:debtId/force-majeure/decision',
  verifyAuthTokenStrict,
  ForceMajeureController.decide
);
