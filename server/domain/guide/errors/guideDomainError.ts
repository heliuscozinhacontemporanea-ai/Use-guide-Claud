export type GuideErrorCode = 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INVALID_ID';

export class GuideDomainError extends Error {
  constructor(
    public readonly code: GuideErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'GuideDomainError';
  }
}
