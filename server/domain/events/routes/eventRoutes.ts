import { Router } from 'express';
import { EventsController } from '../controllers/eventsController';

export const publicEventsRouter = Router();
publicEventsRouter.get('/:id', EventsController.getPublicListing);
publicEventsRouter.get('/:id/occurrences', EventsController.listPublicOccurrences);
