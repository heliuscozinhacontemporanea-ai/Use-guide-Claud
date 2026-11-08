import crypto from 'crypto';
import { listTicketQrTokenLookupHashes } from './qrToken';

/**
 * Código de link de uso único: 256 bits aleatórios (§7.7), guardado só como HMAC com a chave do
 * QR. O `purpose` separa os hashes de cada tipo de link, mesmo com a mesma chave.
 */
export function generateLinkToken(purpose: string): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('base64url');
  const [tokenHash] = listTicketQrTokenLookupHashes(`${purpose}${token}`);
  return { token, tokenHash: tokenHash ?? '' };
}

/** Confere o código com o hash gravado, com a chave atual ou, na rotação, a anterior (§7.8). */
export function linkTokenMatches(purpose: string, token: string, tokenHash: string): boolean {
  const expected = Buffer.from(tokenHash);
  return listTicketQrTokenLookupHashes(`${purpose}${token}`).some((candidate) => {
    const received = Buffer.from(candidate);
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
  });
}
