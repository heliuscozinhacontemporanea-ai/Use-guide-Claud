import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { PaymentController } from '../controllers/paymentController';

const router = Router();

router.post('/plans/intents', verifyAuthToken, PaymentController.createPlanPaymentIntent);
router.post('/plans/intents/confirm', verifyAuthToken, PaymentController.confirmPlanPayment);

export default router;
