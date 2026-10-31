import crypto from 'crypto';
import { listTicketQrTokenLookupHashes } from './qrToken';

// Separa o HMAC do link do HMAC do QR, mesmo usando a mesma chave do Secret Manager.
const PURPOSE = 'transfer-link:';

/** Código do link: 256 bits aleatórios (§7.7); vai depois do `#` da URL, fora dos logs do servidor (§7.9). */
export function generateTransferLinkToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('base64url');
  const [tokenHash] = listTicketQrTokenLookupHashes(`${PURPOSE}${token}`);
  return { token, tokenHash: tokenHash ?? '' };
}

/** Confere o código com o hash gravado, com a chave atual ou, na rotação, a anterior (§7.8). */
export function transferLinkTokenMatches(token: string, tokenHash: string): boolean {
  const expected = Buffer.from(tokenHash);
  return listTicketQrTokenLookupHashes(`${PURPOSE}${token}`).some((candidate) => {
    const received = Buffer.from(candidate);
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
  });
}
