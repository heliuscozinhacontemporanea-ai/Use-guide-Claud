/**
 * Cortesia do organizador (D27): ingresso de graça, nominal, uma por pessoa por evento. Ocupa lugar
 * na sessão por um lote oculto do sistema, sem pedido, repasse nem taxa. Classe Interna (§7.6): só o
 * dono do evento e o admin leem, pela API.
 */
export type CourtesyChannel = 'username' | 'link';

export type CourtesyStatus = 'issued' | 'pending_link' | 'canceled';

export interface CourtesyGuest {
  uid: string;
  /** @ e nome públicos da pessoa (os mesmos do perfil público), para a lista do organizador. */
  username: string | null;
  displayName: string | null;
}

export interface EventCourtesy {
  id: string;
  eventListingId: string;
  occurrenceId: string;
  invitedBy: string;
  channel: CourtesyChannel;
  status: CourtesyStatus;
  guest: CourtesyGuest | null;
  ticketId: string | null;
  /** HMAC do código do link; o código nunca é gravado (§7.7). */
  linkTokenHash: string | null;
  /** O link vale até o início da sessão (D27). */
  linkExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  claimedAt: string | null;
  canceledAt: string | null;
}

/** Dados do ingresso emitido junto da cortesia; o hash do QR vem do serviço. */
export interface CourtesyTicketDraft {
  holderName: string;
  holderEmail: string;
  qrTokenHash: string;
  eventSnapshot: { title: string; startsAt: string; endsAt: string; locationName?: string };
}

// Lote oculto com ID fixo por sessão: a soma de vendidos + reservados da compra já conta a cortesia.
const COURTESY_TYPE_PREFIX = 'courtesy_';

export function courtesyTicketTypeId(occurrenceId: string): string {
  return `${COURTESY_TYPE_PREFIX}${occurrenceId}`;
}

export function isCourtesyTicketTypeId(ticketTypeId: string): boolean {
  return ticketTypeId.startsWith(COURTESY_TYPE_PREFIX);
}
