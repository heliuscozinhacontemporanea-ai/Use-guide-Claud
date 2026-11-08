import crypto from 'crypto';

/** O manifesto do aparelho leva o hash do ID do ingresso, não o ID (quem copia o manifesto não forja QR). */
export function hashTicketIdForOfflineManifest(ticketId: string): string {
  return crypto.createHash('sha256').update(ticketId.trim()).digest('hex');
}
