export type ListingVerificationErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'DOCUMENT_IN_USE'
  | 'CNPJ_ALREADY_USED'
  | 'ALREADY_VERIFIED'
  | 'NOT_PENDING'
  | 'LISTING_NOT_VERIFIED'
  | 'CPF_CANNOT_SELL';

const STATUS: Record<ListingVerificationErrorCode, number> = {
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  DOCUMENT_IN_USE: 409,
  CNPJ_ALREADY_USED: 409,
  ALREADY_VERIFIED: 409,
  NOT_PENDING: 409,
  LISTING_NOT_VERIFIED: 422,
  CPF_CANNOT_SELL: 422,
};

export class ListingVerificationError extends Error {
  readonly statusCode: number;

  constructor(
    readonly code: ListingVerificationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ListingVerificationError';
    this.statusCode = STATUS[code];
  }
}
