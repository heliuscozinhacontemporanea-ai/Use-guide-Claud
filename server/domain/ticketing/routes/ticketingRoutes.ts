import { Router } from 'express';
import { verifyAdminToken, verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { TicketingController } from '../controllers/ticketingController';

const router = Router();

export const adminTicketingEventsRouter = Router();
adminTicketingEventsRouter.get('/:id/orders', verifyAdminToken, TicketingController.listEventOrders);
adminTicketingEventsRouter.get('/:id/refunds', verifyAdminToken, TicketingController.listEventRefunds);
adminTicketingEventsRouter.get(
  '/:id/check-ins',
  verifyAdminToken,
  TicketingController.listEventCheckIns
);
adminTicketingEventsRouter.get(
  '/:id/analytics',
  verifyAdminToken,
  TicketingController.getEventSalesAnalytics
);

router.get(
  '/occurrences/:occurrenceId/ticket-types',
  TicketingController.listPublicTicketTypes
);
router.get(
  '/occurrences/:occurrenceId/ticket-types/manage',
  verifyAuthToken,
  TicketingController.listManagementTicketTypes
);
router.post('/ticket-types', verifyAuthToken, TicketingController.createTicketType);
router.patch('/ticket-types/:id', verifyAuthToken, TicketingController.updateTicketType);
router.delete(
  '/ticket-types/:id',
  verifyAuthToken,
  TicketingController.archiveOrDeleteTicketType
);

router.post('/orders', verifyAuthToken, TicketingController.createOrder);
router.get('/orders', verifyAuthToken, TicketingController.listUserOrders);
router.get('/orders/:id', verifyAuthToken, TicketingController.getOrder);
router.post('/orders/:id/pay', verifyAuthToken, TicketingController.createOrderPaymentIntent);
router.post(
  '/orders/:id/payment-intent',
  verifyAuthToken,
  TicketingController.createOrderPaymentIntent
);
router.post(
  '/orders/:id/confirm-return',
  verifyAuthToken,
  TicketingController.confirmOrderPaymentReturn
);
router.post('/orders/:id/expire', verifyAuthToken, TicketingController.expireOrder);
router.post('/orders/:id/refund', verifyAuthToken, TicketingController.requestRefund);


router.get('/tickets', verifyAuthToken, TicketingController.listUserTickets);
router.get('/tickets/:id/qr', verifyAuthToken, TicketingController.getTicketQrToken);
router.post('/tickets/:id/qr/reissue', verifyAuthToken, TicketingController.reissueTicketQrToken);
router.post('/tickets/:id/transfer', verifyAuthToken, TicketingController.transferTicket);

router.post('/check-in', verifyAuthToken, TicketingController.checkInTicket);
router.post(
  '/check-in/offline-sessions',
  verifyAuthToken,
  TicketingController.createOfflineCheckInSession
);
router.post(
  '/check-in/offline-sync',
  verifyAuthToken,
  TicketingController.syncOfflineCheckIns
);

router.get(
  '/events/:id/orders',
  verifyAuthToken,
  TicketingController.listEventOrders
);
router.get(
  '/events/:id/refunds',
  verifyAuthToken,
  TicketingController.listEventRefunds
);
router.get(
  '/events/:id/check-ins',
  verifyAuthToken,
  TicketingController.listEventCheckIns
);
router.get(
  '/events/:id/analytics',
  verifyAuthToken,
  TicketingController.getEventSalesAnalytics
);

router.post('/promo-codes', verifyAuthToken, TicketingController.createPromoCode);
router.post('/waitlist', verifyAuthToken, TicketingController.joinWaitlist);

export default router;
