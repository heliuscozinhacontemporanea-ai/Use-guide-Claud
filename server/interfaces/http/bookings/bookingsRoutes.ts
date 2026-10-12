import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { BookingsController } from './bookingsController';
import { PartnerOffersController } from './partnerOffersController';

// Operações com dinheiro recusam token revogado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

export const bookingsRouter = Router();
bookingsRouter.get('/offers/:offerId/slots', BookingsController.listSlots);
bookingsRouter.post('/', verifyAuthTokenStrict, BookingsController.create);
bookingsRouter.get('/me', verifyAuthToken, BookingsController.listMine);
bookingsRouter.get('/:bookingId', verifyAuthToken, BookingsController.get);
bookingsRouter.post('/:bookingId/cancel', verifyAuthTokenStrict, BookingsController.cancel);
bookingsRouter.post('/:bookingId/no-show', verifyAuthToken, BookingsController.markNoShow);

export const partnerOffersRouter = Router();
partnerOffersRouter.use(verifyAuthToken);
partnerOffersRouter.get('/', PartnerOffersController.list);
partnerOffersRouter.post('/', PartnerOffersController.create);
partnerOffersRouter.patch('/:offerId', PartnerOffersController.update);
partnerOffersRouter.post('/:offerId/status', PartnerOffersController.setStatus);
partnerOffersRouter.get('/:offerId/slots', PartnerOffersController.listSlots);
partnerOffersRouter.post('/:offerId/slots', PartnerOffersController.createSlots);
partnerOffersRouter.post(
  '/:offerId/slots/:slotId/cancel',
  verifyAuthTokenStrict,
  PartnerOffersController.cancelSlot
);
partnerOffersRouter.get('/:offerId/bookings', PartnerOffersController.listBookings);
