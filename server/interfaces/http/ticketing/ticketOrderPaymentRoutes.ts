import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { TicketOrderPaymentController } from './ticketOrderPaymentController';

const router = Router();

router.post(
  '/orders/:id/payment-intent',
  verifyAuthToken,
  TicketOrderPaymentController.createOrderPaymentIntent
);
router.post(
  '/orders/:id/confirm-return',
  verifyAuthToken,
  TicketOrderPaymentController.confirmOrderPaymentReturn
);
router.post('/orders/:id/refund', verifyAuthToken, TicketOrderPaymentController.requestRefund);

export default router;
