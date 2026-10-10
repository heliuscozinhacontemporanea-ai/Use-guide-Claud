export type PartnerErrorCode = 'INVALID_ARGUMENT' | 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT';

export class PartnerDomainError extends Error {
  constructor(
    public readonly code: PartnerErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'PartnerDomainError';
  }
}
