import type { Request, Response } from 'express';
import { runBookingCompletionJobApplicationUseCase } from '../../../application/usecases/bookings/runBookingCompletionJobApplicationUseCase';
import { expireOverdueBookingsUseCase } from '../../../domain/bookings';
import { handleBookingError } from './bookingHttpErrors';

// Chamados pelos jobs agendados; a chave já foi conferida pelo middleware verifyInternalJobKey.
export class InternalBookingsController {
  static async expire(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ expired: await expireOverdueBookingsUseCase(200) });
    } catch (error) {
      return handleBookingError(res, 'expireJob', error);
    }
  }

  static async complete(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json(await runBookingCompletionJobApplicationUseCase(200));
    } catch (error) {
      return handleBookingError(res, 'completeJob', error);
    }
  }
}
