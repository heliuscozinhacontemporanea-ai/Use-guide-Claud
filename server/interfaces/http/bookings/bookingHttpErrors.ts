import type { Response } from 'express';
import { BookingDomainError } from '../../../domain/bookings';
import { ListingVerificationError } from '../../../domain/partners';
import { PaymentDomainError } from '../../../domain/payment';

export function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

/** Erros tipados mantêm status e código; o resto vira 500 sem detalhe interno (AGENTS.md §10.2). */
export function handleBookingError(res: Response, operation: string, error: unknown): Response {
  if (
    error instanceof BookingDomainError ||
    error instanceof PaymentDomainError ||
    error instanceof ListingVerificationError
  ) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[bookings.${operation}]`, {
    message: error instanceof Error ? error.message : 'Erro desconhecido',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir a operação.');
}
