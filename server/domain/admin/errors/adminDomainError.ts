export type AdminDomainErrorCode =
  | 'INVALID_ID'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR';

export class AdminDomainError extends Error {
  constructor(
    public readonly code: AdminDomainErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'AdminDomainError';
  }
}
