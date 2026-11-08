export type CourtesyErrorCode =
  | 'COURTESY_ALREADY_GIVEN'
  | 'COURTESY_GUEST_HAS_PURCHASE'
  | 'COURTESY_SELF'
  | 'COURTESY_SESSION_CLOSED'
  | 'COURTESY_SOLD_OUT'
  | 'COURTESY_LINK_INVALID'
  | 'COURTESY_LINK_EXPIRED'
  | 'COURTESY_ALREADY_USED'
  | 'COURTESY_NOT_FOUND';

const STATUS: Record<CourtesyErrorCode, number> = {
  COURTESY_ALREADY_GIVEN: 409,
  COURTESY_GUEST_HAS_PURCHASE: 422,
  COURTESY_SELF: 422,
  COURTESY_SESSION_CLOSED: 422,
  COURTESY_SOLD_OUT: 409,
  // Link inexistente e código errado dão a mesma resposta: não revela quais links existem.
  COURTESY_LINK_INVALID: 404,
  COURTESY_LINK_EXPIRED: 410,
  COURTESY_ALREADY_USED: 409,
  COURTESY_NOT_FOUND: 404,
};

/** Erros das cortesias (D27), com `code` estável para a tela traduzir (§10.2). */
export class CourtesyError extends Error {
  readonly status: number;
  constructor(
    public readonly code: CourtesyErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'CourtesyError';
    this.status = STATUS[code];
  }
}
