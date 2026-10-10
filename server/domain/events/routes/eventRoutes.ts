import { Router } from 'express';
import { verifyAdminToken } from '../../../infrastructure/auth/authMiddleware';
import { EventsController } from '../controllers/eventsController';

export const publicEventsRouter = Router();
publicEventsRouter.get('/:id', EventsController.getPublicListing);
publicEventsRouter.get('/:id/occurrences', EventsController.listPublicOccurrences);

export const adminEventsRouter = Router();
adminEventsRouter.post('/', verifyAdminToken, EventsController.createListing);
adminEventsRouter.patch('/:id', verifyAdminToken, EventsController.updateListing);
adminEventsRouter.put('/:id', verifyAdminToken, EventsController.updateListing);
adminEventsRouter.post('/:id/publish', verifyAdminToken, EventsController.publishListing);
adminEventsRouter.post('/:id/pause', verifyAdminToken, EventsController.pauseListing);
adminEventsRouter.post('/:id/archive', verifyAdminToken, EventsController.archiveListing);
adminEventsRouter.post('/:id/cancel', verifyAdminToken, EventsController.cancelListing);
adminEventsRouter.delete('/:id', verifyAdminToken, EventsController.deleteListing);
adminEventsRouter.post('/:id/occurrences', verifyAdminToken, EventsController.createOccurrence);
adminEventsRouter.patch(
  '/:id/occurrences/:occurrenceId',
  verifyAdminToken,
  EventsController.updateOccurrence
);
adminEventsRouter.post(
  '/:id/occurrences/:occurrenceId/cancel',
  verifyAdminToken,
  EventsController.cancelOccurrence
);
adminEventsRouter.post(
  '/:id/occurrences/:occurrenceId/postpone',
  verifyAdminToken,
  EventsController.postponeOccurrence
);
adminEventsRouter.delete(
  '/:id/occurrences/:occurrenceId',
  verifyAdminToken,
  EventsController.deleteOccurrence
);
