import { PromotionsDomainError } from '../../promotions';
import { TicketingDomainError } from './ticketingDomainError';

const STATUS_BY_CODE: Record<string, number> = {
  INVALID_ARGUMENT: 400,
  FORBIDDEN: 403,
  EMAIL_NOT_VERIFIED: 403,
  NOT_FOUND: 404,
  TRANSFER_LINK_INVALID: 404,
  CONFLICT: 409,
  TRANSFER_LINK_EXPIRED: 410,
  UNPROCESSABLE_ENTITY: 422,
  TRANSFER_ONLY_TO_BUYER: 422,
  TRANSFER_LINK_OWN: 422,
  COURTESY_NOT_TRANSFERABLE: 422,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
};
const GENERIC_CODES = new Set(['FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'UNPROCESSABLE_ENTITY']);

export interface TicketingHttpError {
  status: number;
  code: string;
  message: string;
}

/**
 * Status e código estável de um erro de ingressos (AGENTS.md §10.2), para os controllers do domínio
 * e da camada de interface. `null` é erro inesperado: quem chama responde 500 sem o detalhe.
 */
export function ticketingHttpError(error: unknown): TicketingHttpError | null {
  // Cupom recusado na compra: a tela traduz pelo código (inválido, encerrado, esgotado, já usado).
  if (error instanceof PromotionsDomainError) {
    return { status: 422, code: error.code, message: error.message };
  }
  if (error instanceof TicketingDomainError) {
    const status = STATUS_BY_CODE[error.code];
    if (status) return { status, code: error.code, message: error.message };
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: unknown }).code);
    if (GENERIC_CODES.has(code)) {
      const status = STATUS_BY_CODE[code] as number;
      return {
        status,
        code,
        message: error instanceof Error ? error.message : 'Erro na operação.',
      };
    }
  }
  return null;
}
