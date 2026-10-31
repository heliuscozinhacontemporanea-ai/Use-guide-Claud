export type PartnerErrorCode =
  | 'INVALID_ARGUMENT'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'PARTNER_TERMS_NOT_ACCEPTED'
  | 'EMAIL_NOT_VERIFIED';

export class PartnerDomainError extends Error {
  constructor(
    public readonly code: PartnerErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'PartnerDomainError';
  }
}
