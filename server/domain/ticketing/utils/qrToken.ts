import crypto from 'crypto';

const MIN_CURRENT_SECRET_LENGTH = 32;
const MIN_PREVIOUS_SECRET_LENGTH = 16;

function readSecret(name: string, minLength: number): string | null {
  const value = process.env[name]?.trim();
  return value && value.length >= minLength ? value : null;
}

function getCurrentQrSecret(): string {
  const secret = readSecret('TICKET_QR_SECRET', MIN_CURRENT_SECRET_LENGTH);
  if (!secret) {
    throw new Error(
      `TICKET_QR_SECRET ausente ou com menos de ${MIN_CURRENT_SECRET_LENGTH} caracteres.`
    );
  }
  return secret;
}

function hmacQrToken(secret: string, rawQrToken: string): string {
  return crypto.createHmac('sha256', secret).update(rawQrToken.trim()).digest('hex');
}

export function generateOpaqueTicketQrToken(): { rawQrToken: string; qrTokenHash: string } {
  const randomSecret = crypto.randomBytes(24).toString('base64url');
  const rawQrToken = `ug_tkt_${randomSecret}`;
  return { rawQrToken, qrTokenHash: hashTicketQrToken(rawQrToken) };
}

export function hashTicketQrToken(rawQrToken: string): string {
  return hmacQrToken(getCurrentQrSecret(), rawQrToken);
}

/**
 * Hashes aceitos na busca do ingresso: segredo atual e, durante a rotação, o anterior
 * (AGENTS.md §7.8 — a versão anterior fica ativa até expirarem os ingressos emitidos com ela).
 */
export function listTicketQrTokenLookupHashes(rawQrToken: string): string[] {
  const hashes = [hashTicketQrToken(rawQrToken)];
  const previousSecret = readSecret('TICKET_QR_SECRET_PREVIOUS', MIN_PREVIOUS_SECRET_LENGTH);
  if (previousSecret) {
    hashes.push(hmacQrToken(previousSecret, rawQrToken));
  }
  return hashes;
}
