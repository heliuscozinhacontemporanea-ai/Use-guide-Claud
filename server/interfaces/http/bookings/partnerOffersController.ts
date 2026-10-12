import type { Response } from 'express';
import { cancelSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/cancelSlotByPartnerApplicationUseCase';
import {
  createAvailabilitySlotsUseCase,
  createBookableOfferUseCase,
  listOfferBookingsForPartnerUseCase,
  listOfferSlotsForPartnerUseCase,
  listPartnerOffersUseCase,
  setBookableOfferStatusUseCase,
  updateBookableOfferUseCase,
} from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { handleBookingError, sendError } from './bookingHttpErrors';
import { toPartnerOffer, toPartnerSlot, toSellerBooking } from './bookingResponses';
import {
  CreateOfferSchema,
  CreateSlotsSchema,
  DocumentIdSchema,
  OfferStatusSchema,
  PageQuerySchema,
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
      const offer = await setBookableOfferStatusUseCase(actor, offerId.data, parsed.data.status);
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
}
