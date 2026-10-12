export type BookingErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'EMAIL_NOT_VERIFIED'
  | 'NOT_FOUND'
  | 'SLOT_UNAVAILABLE'
  | 'INSUFFICIENT_CAPACITY'
  | 'INVALID_TRANSITION'
  | 'LATE_PAYMENT_REJECTED'
  | 'KIND_NOT_AVAILABLE'
  | 'CANCELLATION_NOT_ALLOWED';

const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  EMAIL_NOT_VERIFIED: 403,
  NOT_FOUND: 404,
  SLOT_UNAVAILABLE: 409,
  INSUFFICIENT_CAPACITY: 409,
  INVALID_TRANSITION: 409,
  LATE_PAYMENT_REJECTED: 409,
  KIND_NOT_AVAILABLE: 422,
  CANCELLATION_NOT_ALLOWED: 422,
};

export class BookingDomainError extends Error {
  readonly statusCode: number;

  constructor(
    public readonly code: BookingErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'BookingDomainError';
    this.statusCode = STATUS_BY_CODE[code];
  }
}
