export type PromoterErrorCode =
  | 'PROMOTER_ALREADY_INVITED'
  | 'PROMOTER_SELF'
  | 'PROMOTER_INVALID_EARNING'
  | 'PROMOTER_EVENT_CLOSED'
  | 'PROMOTER_NOT_FOUND'
  | 'PROMOTER_WRONG_STATUS';

const STATUS: Record<PromoterErrorCode, number> = {
  PROMOTER_ALREADY_INVITED: 409,
  PROMOTER_SELF: 422,
  PROMOTER_INVALID_EARNING: 400,
  PROMOTER_EVENT_CLOSED: 422,
  PROMOTER_NOT_FOUND: 404,
  PROMOTER_WRONG_STATUS: 409,
};

/** Erros dos divulgadores (D27), com `code` estável para a tela traduzir (§10.2). */
export class PromoterError extends Error {
  readonly status: number;
  constructor(
    public readonly code: PromoterErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'PromoterError';
    this.status = STATUS[code];
  }
}
