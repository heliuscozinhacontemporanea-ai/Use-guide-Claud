import crypto from 'crypto';

const DEFAULT_FALLBACK_QR_SECRET = 'use-guide-ticket-qr-hmac-secret-v1';

function getQrSecret(): string {
  const secret = process.env.TICKET_QR_SECRET?.trim();
  if (secret && secret.length >= 16) {
    return secret;
  }
  return DEFAULT_FALLBACK_QR_SECRET;
}

export function generateOpaqueTicketQrToken(): { rawQrToken: string; qrTokenHash: string } {
  const randomSecret = crypto.randomBytes(24).toString('base64url');
  const rawQrToken = `ug_tkt_${randomSecret}`;
  const qrTokenHash = hashTicketQrToken(rawQrToken);
  return { rawQrToken, qrTokenHash };
}

export function hashTicketQrToken(rawQrToken: string): string {
  return crypto
    .createHmac('sha256', getQrSecret())
    .update(rawQrToken.trim())
    .digest('hex');
}

export function hashTicketQrTokenLegacySha256(rawQrToken: string): string {
  return crypto.createHash('sha256').update(rawQrToken.trim()).digest('hex');
}
