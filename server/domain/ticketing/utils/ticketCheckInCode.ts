import { ShortCodeDeriver, normalizeShortCode } from '../../../infrastructure/crypto/shortCode';

/** Código junto do QR do ingresso, para a portaria digitar quando a leitura falha (D20). */
export const TICKET_CODE_LENGTH = 8;

const codes = new ShortCodeDeriver('TICKET_CHECKIN_CODE_SECRET');

// A versão do QR entra no rótulo: na transferência ou reemissão, o código antigo deixa de valer.
function label(ticketId: string, qrVersion: number): string {
  return `ticket:${ticketId}#v${qrVersion}`;
}

/** Derivado do ID e da versão com o segredo do Secret Manager e nunca gravado (§7.7, D20). */
export function deriveTicketCheckInCode(ticketId: string, qrVersion: number): string {
  return codes.current(label(ticketId, qrVersion), TICKET_CODE_LENGTH);
}

export function ticketCheckInCodeMatches(
  ticketId: string,
  qrVersion: number,
  code: string
): boolean {
  return codes.matches(label(ticketId, qrVersion), TICKET_CODE_LENGTH, code);
}

export function normalizeTicketCheckInCode(input: string): string | null {
  return normalizeShortCode(input, TICKET_CODE_LENGTH);
}
