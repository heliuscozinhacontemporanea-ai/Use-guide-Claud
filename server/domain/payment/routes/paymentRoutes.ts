import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { PaymentController } from '../controllers/paymentController';

const router = Router();

router.post(
  '/plans/intents',
  verifyAuthToken,
  PaymentController.createPlanPaymentIntent
);
router.post(
  '/process',
  verifyAuthToken,
  PaymentController.createPlanPaymentIntent
);
router.post(
  '/connect/account',
  verifyAuthToken,
  PaymentController.createConnectedAccount
);
router.post(
  '/connect/account-session',
  verifyAuthToken,
  PaymentController.createConnectAccountSession
);
router.get(
  '/connect/status',
  verifyAuthToken,
  PaymentController.getConnectStatus
);

export default router;
