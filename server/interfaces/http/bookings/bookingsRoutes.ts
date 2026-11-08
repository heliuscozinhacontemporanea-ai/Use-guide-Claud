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
bookingsRouter.get('/:bookingId/check-in-code', verifyAuthToken, BookingsController.getCheckInCode);
bookingsRouter.get('/:bookingId/entry-pass', verifyAuthToken, BookingsController.getEntryPass);
bookingsRouter.put(
  '/:bookingId/participants/:unit',
  verifyAuthToken,
  BookingsController.setParticipantName
);
bookingsRouter.post('/:bookingId/cancel', verifyAuthTokenStrict, BookingsController.cancel);
bookingsRouter.post('/:bookingId/no-show', verifyAuthToken, BookingsController.markNoShow);
// Relato e resposta mexem no reembolso (D20): token revogado não serve.
bookingsRouter.post(
  '/:bookingId/provider-absent',
  verifyAuthTokenStrict,
  BookingsController.reportProviderAbsent
);
bookingsRouter.post(
  '/:bookingId/service-confirmation',
  verifyAuthTokenStrict,
  BookingsController.answerServiceConfirmation
);

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
partnerOffersRouter.post(
  '/:offerId/slots/:slotId/reschedule',
  verifyAuthTokenStrict,
  PartnerOffersController.rescheduleSlot
);
partnerOffersRouter.get('/:offerId/bookings', PartnerOffersController.listBookings);
// Check-in libera o repasse (D20): token revogado não serve.
partnerOffersRouter.post(
  '/:offerId/slots/:slotId/check-ins',
  verifyAuthTokenStrict,
  PartnerOffersController.checkIn
);
partnerOffersRouter.post(
  '/:offerId/bookings/:bookingId/arrival',
  verifyAuthToken,
  PartnerOffersController.recordArrival
);
partnerOffersRouter.post(
  '/:offerId/bookings/:bookingId/check-in-without-code',
  verifyAuthTokenStrict,
  PartnerOffersController.checkInWithoutCode
);
partnerOffersRouter.post(
  '/:offerId/bookings/:bookingId/absence-response',
  verifyAuthTokenStrict,
  PartnerOffersController.answerProviderAbsence
);
partnerOffersRouter.get(
  '/:offerId/entry-verification-keys',
  PartnerOffersController.entryVerificationKeys
);
partnerOffersRouter.post(
  '/:offerId/slots/:slotId/entry-check-ins',
  verifyAuthTokenStrict,
  PartnerOffersController.checkInEntry
);
