import { Router } from 'express';
import { verifyAdminToken, verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { EventTicketingReportController } from '../controllers/eventTicketingReportController';
import { TicketCheckInController } from '../controllers/ticketCheckInController';
import { TicketController } from '../controllers/ticketController';
import { TicketOrderController } from '../controllers/ticketOrderController';
import { TicketTypeController } from '../controllers/ticketTypeController';

const router = Router();

export const adminTicketingEventsRouter = Router();
adminTicketingEventsRouter.get(
  '/:id/orders',
  verifyAdminToken,
  EventTicketingReportController.listEventOrders
);
adminTicketingEventsRouter.get(
  '/:id/refunds',
  verifyAdminToken,
  EventTicketingReportController.listEventRefunds
);
adminTicketingEventsRouter.get(
  '/:id/check-ins',
  verifyAdminToken,
  EventTicketingReportController.listEventCheckIns
);
adminTicketingEventsRouter.get(
  '/:id/analytics',
  verifyAdminToken,
  EventTicketingReportController.getEventSalesAnalytics
);

router.get('/occurrences/:occurrenceId/ticket-types', TicketTypeController.listPublicTicketTypes);
router.get(
  '/occurrences/:occurrenceId/ticket-types/manage',
  verifyAuthToken,
  TicketTypeController.listManagementTicketTypes
);
router.post('/ticket-types', verifyAuthToken, TicketTypeController.createTicketType);
router.patch('/ticket-types/:id', verifyAuthToken, TicketTypeController.updateTicketType);
router.delete('/ticket-types/:id', verifyAuthToken, TicketTypeController.archiveOrDeleteTicketType);

router.post('/orders', verifyAuthToken, TicketOrderController.createOrder);
router.get('/orders', verifyAuthToken, TicketOrderController.listUserOrders);
router.get('/orders/:id', verifyAuthToken, TicketOrderController.getOrder);
router.post('/orders/:id/expire', verifyAuthToken, TicketOrderController.expireOrder);

router.get('/tickets', verifyAuthToken, TicketController.listUserTickets);
router.get('/tickets/:id/qr', verifyAuthToken, TicketController.getTicketQrToken);
router.post('/tickets/:id/qr/swap', verifyAuthToken, TicketController.swapTicketQr);

router.post('/check-in', verifyAuthToken, TicketCheckInController.checkInTicket);
router.post(
  '/check-in/offline-sessions',
  verifyAuthToken,
  TicketCheckInController.createOfflineCheckInSession
);
router.post('/check-in/offline-sync', verifyAuthToken, TicketCheckInController.syncOfflineCheckIns);
router.get(
  '/check-in/offline-sessions/:sessionId/changes',
  verifyAuthToken,
  TicketCheckInController.listOfflineCheckInChanges
);

router.post('/waitlist', verifyAuthToken, TicketOrderController.joinWaitlist);

export default router;
