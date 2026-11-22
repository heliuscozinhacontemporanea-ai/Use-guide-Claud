import type { Request, Response } from 'express';
import {
  getPublicFleetDayUseCase,
  listFleetDaysForPartnerUseCase,
  openFleetDaysUseCase,
} from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { handleBookingError, sendError } from './bookingHttpErrors';
import {
  DocumentIdSchema,
  FleetDateParamSchema,
  FleetDaysQuerySchema,
  OpenFleetDaysSchema,
} from './schemas/bookingSchemas';

function actorOf(req: AuthenticatedRequest) {
  return req.user ? { uid: req.user.uid, admin: req.user.admin === true } : null;
}

/** Dias com veículos do aluguel e do translado privativo (F3b). */
export class FleetDaysController {
  static async open(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const parsed = OpenFleetDaysSchema.safeParse(req.body);
    if (!offerId.success || !parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados dos dias inválidos.');
    }
    try {
      const days = await openFleetDaysUseCase(actor, offerId.data, parsed.data);
      return res.status(200).json({ data: days });
    } catch (error) {
      return handleBookingError(res, 'openFleetDays', error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const query = FleetDaysQuerySchema.safeParse(req.query);
    if (!offerId.success || !query.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Período inválido.');
    }
    try {
      const days = await listFleetDaysForPartnerUseCase(
        actor,
        offerId.data,
        query.data.from,
        query.data.to
      );
      return res.status(200).json({ data: days });
    } catch (error) {
      return handleBookingError(res, 'listFleetDays', error);
    }
  }

  static async publicDay(req: Request, res: Response): Promise<Response> {
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const date = FleetDateParamSchema.safeParse(req.params.date);
    if (!offerId.success || !date.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dia inválido.');
    }
    try {
      return res.status(200).json(await getPublicFleetDayUseCase(offerId.data, date.data));
    } catch (error) {
      return handleBookingError(res, 'publicFleetDay', error);
    }
  }
}
