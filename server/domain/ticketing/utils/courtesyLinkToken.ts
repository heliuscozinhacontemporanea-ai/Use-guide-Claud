import { generateLinkToken, linkTokenMatches } from './opaqueLinkToken';

const PURPOSE = 'courtesy-link:';

/** Código do link de convite (D27): vai depois do `#` da URL, fora dos logs do servidor (§7.9). */
export function generateCourtesyLinkToken(): { token: string; tokenHash: string } {
  return generateLinkToken(PURPOSE);
}

export function courtesyLinkTokenMatches(token: string, tokenHash: string): boolean {
  return linkTokenMatches(PURPOSE, token, tokenHash);
}
