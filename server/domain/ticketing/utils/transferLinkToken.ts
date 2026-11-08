import { generateLinkToken, linkTokenMatches } from './opaqueLinkToken';

// Separa o HMAC do link do HMAC do QR, mesmo usando a mesma chave do Secret Manager.
const PURPOSE = 'transfer-link:';

/** Código do link: vai depois do `#` da URL, fora dos logs do servidor (§7.9). */
export function generateTransferLinkToken(): { token: string; tokenHash: string } {
  return generateLinkToken(PURPOSE);
}

export function transferLinkTokenMatches(token: string, tokenHash: string): boolean {
  return linkTokenMatches(PURPOSE, token, tokenHash);
}
