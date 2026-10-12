import type { Response } from 'express';
import { cancelBookingByBuyerApplicationUseCase } from '../../../application/usecases/bookings/cancelBookingByBuyerApplicationUseCase';
import { createBookingApplicationUseCase } from '../../../application/usecases/bookings/createBookingApplicationUseCase';
import {
  getBookingForActorUseCase,
  listAvailableSlotsUseCase,
  listMyBookingsUseCase,
  markBookingNoShowUseCase,
} from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { handleBookingError, sendError } from './bookingHttpErrors';
import { toBookingDetails, toBuyerBooking, toSellerBooking } from './bookingResponses';
import {
  CancelBookingSchema,
  CreateBookingSchema,
  DocumentIdSchema,
  IdempotencyKeyHeaderSchema,
  PageQuerySchema,
  SlotWindowQuerySchema,
} from './schemas/bookingSchemas';

function actorOf(req: AuthenticatedRequest) {
  return req.user ? { uid: req.user.uid, admin: req.user.admin === true } : null;
}

export class BookingsController {
  static async listSlots(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const window = SlotWindowQuerySchema.safeParse(req.query);
    if (!offerId.success || !window.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Parâmetros inválidos.');
    }
    try {
      const slots = await listAvailableSlotsUseCase(offerId.data, window.data.from, window.data.to);
      return res.status(200).json({ data: slots });
    } catch (error) {
      return handleBookingError(res, 'listSlots', error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const parsed = CreateBookingSchema.safeParse(req.body);
    // Idempotency-Key no header (AGENTS.md §10.1) vale quando o corpo não traz a chave.
    const headerKey = IdempotencyKeyHeaderSchema.safeParse(req.headers['idempotency-key']);
    const idempotencyKey = parsed.success
      ? (parsed.data.idempotencyKey ?? (headerKey.success ? headerKey.data : undefined))
      : undefined;
    if (!parsed.success || !idempotencyKey) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da reserva inválidos.');
    }
    try {
      const result = await createBookingApplicationUseCase(
        {
          uid: req.user.uid,
          admin: req.user.admin === true,
          emailVerified: req.user.emailVerified,
        },
        { ...parsed.data, idempotencyKey }
      );
      return res.status(201).json(result);
    } catch (error) {
      return handleBookingError(res, 'create', error);
    }
  }

  static async listMine(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const page = PageQuerySchema.safeParse(req.query);
    if (!page.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Parâmetros inválidos.');
    try {
      const result = await listMyBookingsUseCase(actor, page.data);
      return res
        .status(200)
        .json({ data: result.data.map(toBuyerBooking), nextCursor: result.nextCursor });
    } catch (error) {
      return handleBookingError(res, 'listMine', error);
    }
  }

  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
    if (!bookingId.success) return sendError(res, 404, 'NOT_FOUND', 'Reserva não encontrada.');
    try {
      const details = await getBookingForActorUseCase(actor, bookingId.data);
      return res.status(200).json(toBookingDetails(details, actor.uid, actor.admin));
    } catch (error) {
      return handleBookingError(res, 'get', error);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
    const body = CancelBookingSchema.safeParse(req.body ?? {});
    if (!bookingId.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    }
    try {
      const result = await cancelBookingByBuyerApplicationUseCase(
        actor,
        bookingId.data,
        body.data.reason ?? ''
      );
      return res.status(200).json(result);
    } catch (error) {
      return handleBookingError(res, 'cancel', error);
    }
  }

  static async markNoShow(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
    if (!bookingId.success) return sendError(res, 404, 'NOT_FOUND', 'Reserva não encontrada.');
    try {
      const booking = await markBookingNoShowUseCase(actor, bookingId.data);
      return res.status(200).json(toSellerBooking(booking));
    } catch (error) {
      return handleBookingError(res, 'markNoShow', error);
    }
  }
}
