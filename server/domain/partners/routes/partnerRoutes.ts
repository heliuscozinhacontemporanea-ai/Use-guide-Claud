import { Router } from 'express';
import { PartnerContentController } from '../controllers/partnerContentController';
import { verifyAdminToken, verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { resolveGuideContext } from '../../../infrastructure/auth/guideContextMiddleware';
import { PartnerController } from '../controllers/partnerController';

const router = Router();

router.post('/register', verifyAuthToken, PartnerController.registerOrUpgrade);
router.get('/profile', verifyAuthToken, PartnerController.getProfile);
router.get('/profile/:partnerId', verifyAuthToken, PartnerController.getProfile);
router.patch('/status', verifyAdminToken, PartnerController.updateStatus);

router.post('/items', verifyAuthToken, resolveGuideContext, PartnerContentController.createItem);
router.put('/items/:id', verifyAuthToken, resolveGuideContext, PartnerContentController.updateItem);
router.delete(
  '/items/:id',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.deleteItem
);
router.post('/events', verifyAuthToken, resolveGuideContext, PartnerContentController.createEvent);
router.put(
  '/events/:id',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.updateEvent
);
router.patch(
  '/events/:id',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.updateEvent
);
router.delete(
  '/events/:id',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.deleteEvent
);
router.post(
  '/events/:id/occurrences',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.createEventOccurrence
);
router.patch(
  '/events/:id/occurrences/:occurrenceId',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.updateEventOccurrence
);
router.post(
  '/events/:id/occurrences/:occurrenceId/cancel',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.cancelEventOccurrence
);
router.post(
  '/events/:id/occurrences/:occurrenceId/postpone',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.postponeEventOccurrence
);
router.delete(
  '/events/:id/occurrences/:occurrenceId',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.deleteEventOccurrence
);
router.get(
  '/events/:id/orders',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.listEventOrders
);
router.get(
  '/events/:id/check-ins',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.listEventCheckIns
);
router.get(
  '/events/:id/refunds',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.listEventRefunds
);
router.get(
  '/events/:id/analytics',
  verifyAuthToken,
  resolveGuideContext,
  PartnerContentController.getEventSalesAnalytics
);

router.delete('/:partnerId', verifyAuthToken, PartnerController.deletePartner);
router.delete('/', verifyAuthToken, PartnerController.deletePartner);

export default router;
