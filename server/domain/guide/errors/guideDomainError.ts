export type GuideErrorCode =
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INVALID_ID'
  | 'CONTACT_IN_TEXT';

export class GuideDomainError extends Error {
  constructor(
    public readonly code: GuideErrorCode,
    message: string,
    /** CONTACT_IN_TEXT: campo e trechos achados, para o formulário marcar o campo. */
    public readonly details?: { field: string; found: string[] }
  ) {
    super(message);
    this.name = 'GuideDomainError';
  }
}
