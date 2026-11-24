export type ListingClaimErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'EMAIL_NOT_VERIFIED'
  | 'TERMS_REQUIRED'
  | 'LISTING_NOT_CLAIMABLE'
  | 'ALREADY_APPROVED'
  | 'NOT_PENDING'
  | 'NOT_APPROVED'
  | 'DOCUMENT_IN_USE'
  | 'CNPJ_ALREADY_USED'
  | 'LISTING_IN_USE';

const STATUS: Record<ListingClaimErrorCode, number> = {
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  EMAIL_NOT_VERIFIED: 403,
  TERMS_REQUIRED: 422,
  LISTING_NOT_CLAIMABLE: 422,
  ALREADY_APPROVED: 409,
  NOT_PENDING: 409,
  NOT_APPROVED: 409,
  DOCUMENT_IN_USE: 409,
  CNPJ_ALREADY_USED: 409,
  LISTING_IN_USE: 409,
};

/** Erros do "Sou o dono" (D35) com `code` estável (§10.2). */
export class ListingClaimError extends Error {
  readonly statusCode: number;

  constructor(
    readonly code: ListingClaimErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ListingClaimError';
    this.statusCode = STATUS[code];
  }
}
