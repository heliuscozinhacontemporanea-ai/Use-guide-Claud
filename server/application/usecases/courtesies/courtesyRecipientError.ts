export type CourtesyRecipientErrorCode = 'RECIPIENT_NOT_VERIFIED';

/** A conta que recebe precisa de e-mail confirmado, como na transferência (D21, D27). */
export class CourtesyRecipientError extends Error {
  constructor(
    public readonly code: CourtesyRecipientErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'CourtesyRecipientError';
  }
}
