/** O código vai depois do `#`: o navegador não envia ao servidor nem a logs de proxy (§7.9). */
const HASH_KEY = 'receber-ingresso';

export function buildTransferLinkUrl(origin: string, linkId: string, token: string): string {
  return `${origin}/#${HASH_KEY}=${linkId}.${token}`;
}

export function parseTransferLinkHash(hash: string): { linkId: string; token: string } | null {
  const match = new RegExp(`^#${HASH_KEY}=([A-Za-z0-9]{8,40})\\.([A-Za-z0-9_-]{20,100})$`).exec(
    hash
  );
  return match?.[1] && match[2] ? { linkId: match[1], token: match[2] } : null;
}
