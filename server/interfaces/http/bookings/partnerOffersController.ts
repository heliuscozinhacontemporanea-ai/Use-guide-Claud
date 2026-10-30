import type { Response } from 'express';
import { answerProviderAbsenceApplicationUseCase } from '../../../application/usecases/bookings/answerProviderAbsenceApplicationUseCase';
import { checkInBookingApplicationUseCase } from '../../../application/usecases/bookings/checkInBookingApplicationUseCase';
import { checkInWithoutCodeApplicationUseCase } from '../../../application/usecases/bookings/checkInWithoutCodeApplicationUseCase';
import { recordProviderArrivalApplicationUseCase } from '../../../application/usecases/bookings/recordProviderArrivalApplicationUseCase';
import { cancelSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/cancelSlotByPartnerApplicationUseCase';
import { rescheduleSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase';
import { setBookableOfferStatusApplicationUseCase } from '../../../application/usecases/bookings/setBookableOfferStatusApplicationUseCase';
import {
  checkInEntryUseCase,
  createAvailabilitySlotsUseCase,
  getEntryVerificationKeysUseCase,
  createBookableOfferUseCase,
  listOfferBookingsForPartnerUseCase,
  listOfferSlotsForPartnerUseCase,
  listPartnerOffersUseCase,
  updateBookableOfferUseCase,
} from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { handleBookingError, sendError } from './bookingHttpErrors';
import { toPartnerOffer, toPartnerSlot, toSellerBooking, toUnitCheckIn } from './bookingResponses';
import {
  CheckInByCodeSchema,
  CheckInWithoutCodeSchema,
  CreateOfferSchema,
  CreateSlotsSchema,
  DocumentIdSchema,
  EntryCheckInSchema,
  OfferStatusSchema,
  PageQuerySchema,
  ProviderAbsenceAnswerSchema,
  ProviderArrivalSchema,
  RescheduleSlotSchema,
  SlotWindowQuerySchema,
  UpdateOfferSchema,
} from './schemas/bookingSchemas';

function actorOf(req: AuthenticatedRequest) {
  return req.user ? { uid: req.user.uid, admin: req.user.admin === true } : null;
}

export class PartnerOffersController {
  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      const offers = await listPartnerOffersUseCase(actor);
      return res.status(200).json({ data: offers.map(toPartnerOffer) });
    } catch (error) {
      return handleBookingError(res, 'listOffers', error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const parsed = CreateOfferSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da oferta inválidos.');
    try {
      const offer = await createBookableOfferUseCase(actor, parsed.data);
      return res.status(201).json(toPartnerOffer(offer));
    } catch (error) {
      return handleBookingError(res, 'createOffer', error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const parsed = UpdateOfferSchema.safeParse(req.body);
    if (!offerId.success || !parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da oferta inválidos.');
    }
    try {
      const offer = await updateBookableOfferUseCase(actor, offerId.data, parsed.data);
      return res.status(200).json(toPartnerOffer(offer));
    } catch (error) {
      return handleBookingError(res, 'updateOffer', error);
    }
  }

  static async setStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const parsed = OfferStatusSchema.safeParse(req.body);
    if (!offerId.success || !parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Status inválido.');
    }
    try {
      const offer = await setBookableOfferStatusApplicationUseCase(
        actor,
        offerId.data,
        parsed.data.status
      );
      return res.status(200).json(toPartnerOffer(offer));
    } catch (error) {
      return handleBookingError(res, 'setOfferStatus', error);
    }
  }

  static async createSlots(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const parsed = CreateSlotsSchema.safeParse(req.body);
    if (!offerId.success || !parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Horários inválidos.');
    }
    try {
      const created = await createAvailabilitySlotsUseCase(actor, offerId.data, parsed.data);
      return res.status(201).json({ data: created.map(toPartnerSlot) });
    } catch (error) {
      return handleBookingError(res, 'createSlots', error);
    }
  }

  static async listSlots(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const window = SlotWindowQuerySchema.safeParse(req.query);
    if (!offerId.success || !window.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Parâmetros inválidos.');
    }
    try {
      const slots = await listOfferSlotsForPartnerUseCase(
        actor,
        offerId.data,
        window.data.from,
        window.data.to
      );
      return res.status(200).json({ data: slots.map(toPartnerSlot) });
    } catch (error) {
      return handleBookingError(res, 'listPartnerSlots', error);
    }
  }

  static async cancelSlot(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const slotId = DocumentIdSchema.safeParse(req.params.slotId);
    if (!offerId.success || !slotId.success) {
      return sendError(res, 404, 'NOT_FOUND', 'Horário não encontrado.');
    }
    try {
      const result = await cancelSlotByPartnerApplicationUseCase(actor, offerId.data, slotId.data);
      return res.status(200).json(result);
    } catch (error) {
      return handleBookingError(res, 'cancelSlot', error);
    }
  }

  static async rescheduleSlot(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const slotId = DocumentIdSchema.safeParse(req.params.slotId);
    if (!offerId.success || !slotId.success) {
      return sendError(res, 404, 'NOT_FOUND', 'Horário não encontrado.');
    }
    const body = RescheduleSlotSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Nova data inválida.');
    try {
      const result = await rescheduleSlotByPartnerApplicationUseCase(
        actor,
        offerId.data,
        slotId.data,
        body.data
      );
      return res.status(200).json(result);
    } catch (error) {
      return handleBookingError(res, 'rescheduleSlot', error);
    }
  }

  static async listBookings(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const page = PageQuerySchema.safeParse(req.query);
    if (!offerId.success || !page.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Parâmetros inválidos.');
    }
    try {
      const result = await listOfferBookingsForPartnerUseCase(actor, offerId.data, page.data);
      return res
        .status(200)
        .json({ data: result.data.map(toSellerBooking), nextCursor: result.nextCursor });
    } catch (error) {
      return handleBookingError(res, 'listOfferBookings', error);
    }
  }

  static async checkIn(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const slotId = DocumentIdSchema.safeParse(req.params.slotId);
    const body = CheckInByCodeSchema.safeParse(req.body);
    if (!offerId.success || !slotId.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados do check-in inválidos.');
    }
    try {
      const result = await checkInBookingApplicationUseCase(actor, {
        offerId: offerId.data,
        slotId: slotId.data,
        ...body.data,
      });
      return res.status(200).json(toUnitCheckIn(result));
    } catch (error) {
      return handleBookingError(res, 'checkIn', error);
    }
  }

  static async recordArrival(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const parsed = parseBookingAction(req, ProviderArrivalSchema);
    if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
    try {
      const booking = await recordProviderArrivalApplicationUseCase(
        parsed.actor,
        parsed.offerId,
        parsed.bookingId,
        parsed.body.location
      );
      return res.status(200).json(toSellerBooking(booking));
    } catch (error) {
      return handleBookingError(res, 'recordArrival', error);
    }
  }

  static async checkInWithoutCode(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const parsed = parseBookingAction(req, CheckInWithoutCodeSchema);
    if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
    try {
      const booking = await checkInWithoutCodeApplicationUseCase(parsed.actor, {
        offerId: parsed.offerId,
        bookingId: parsed.bookingId,
        ...parsed.body,
      });
      return res.status(200).json(toSellerBooking(booking));
    } catch (error) {
      return handleBookingError(res, 'checkInWithoutCode', error);
    }
  }

  static async answerProviderAbsence(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const parsed = parseBookingAction(req, ProviderAbsenceAnswerSchema);
    if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
    try {
      const booking = await answerProviderAbsenceApplicationUseCase(
        parsed.actor,
        parsed.offerId,
        parsed.bookingId,
        parsed.body.answer
      );
      return res.status(200).json(toSellerBooking(booking));
    } catch (error) {
      return handleBookingError(res, 'answerProviderAbsence', error);
    }
  }

  static async checkInEntry(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const slotId = DocumentIdSchema.safeParse(req.params.slotId);
    const body = EntryCheckInSchema.safeParse(req.body);
    if (!offerId.success || !slotId.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da entrada inválidos.');
    }
    try {
      const result = await checkInEntryUseCase(actor, {
        offerId: offerId.data,
        slotId: slotId.data,
        ...body.data,
      });
      return res.status(200).json(toUnitCheckIn(result));
    } catch (error) {
      return handleBookingError(res, 'checkInEntry', error);
    }
  }

  static async entryVerificationKeys(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    if (!offerId.success) return sendError(res, 404, 'NOT_FOUND', 'Oferta não encontrada.');
    try {
      const keys = await getEntryVerificationKeysUseCase(actor, offerId.data);
      return res.status(200).json({ data: keys });
    } catch (error) {
      return handleBookingError(res, 'entryVerificationKeys', error);
    }
  }
}

type BookingAction<T> =
  | {
      ok: true;
      actor: { uid: string; admin: boolean };
      offerId: string;
      bookingId: string;
      body: T;
    }
  | { ok: false; status: number; code: string; message: string };

/** Autenticação, IDs da rota e corpo das ações do prestador numa reserva. */
function parseBookingAction<T>(
  req: AuthenticatedRequest,
  schema: { safeParse(value: unknown): { success: true; data: T } | { success: false } }
): BookingAction<T> {
  const actor = actorOf(req);
  if (!actor)
    return { ok: false, status: 401, code: 'UNAUTHENTICATED', message: 'Não autenticado.' };
  const offerId = DocumentIdSchema.safeParse(req.params.offerId);
  const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
  const body = schema.safeParse(req.body ?? {});
  if (!offerId.success || !bookingId.success || !body.success) {
    return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Dados inválidos.' };
  }
  return { ok: true, actor, offerId: offerId.data, bookingId: bookingId.data, body: body.data };
}
