/** Chaves públicas do QR da entrada guardadas no aparelho para conferir sem internet (D20). */
const KEY_PREFIX = 'useguide.entryKeys.';

interface EntryPassContent {
  kid: string;
  bid: string;
  sid: string;
  oid: string;
  n: number;
  exp: number;
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function saveEntryKeys(
  offerId: string,
  keys: Array<{ kid: string; publicKeyJwk: JsonWebKey }>
) {
  try {
    localStorage.setItem(`${KEY_PREFIX}${offerId}`, JSON.stringify(keys));
  } catch {
    // Sem armazenamento, a conferência sem internet não fica disponível; online continua valendo.
  }
}

function loadEntryKeys(offerId: string): Array<{ kid: string; publicKeyJwk: JsonWebKey }> {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${offerId}`);
    return raw ? (JSON.parse(raw) as Array<{ kid: string; publicKeyJwk: JsonWebKey }>) : [];
  } catch {
    return [];
  }
}

/**
 * Confere a assinatura Ed25519 do QR no próprio aparelho, para a portaria sem sinal. Navegador sem
 * Ed25519 no WebCrypto devolve `unsupported`, e a entrada fica para o servidor conferir depois.
 * Referência: https://developer.mozilla.org/docs/Web/API/SubtleCrypto/verify#ed25519
 */
export async function verifyEntryPassOffline(
  offerId: string,
  slotId: string,
  token: string
): Promise<'valid' | 'invalid' | 'unsupported'> {
  const [prefix, body, signature, extra] = token.trim().split('.');
  if (prefix !== 'UGE1' || !body || !signature || extra !== undefined) return 'invalid';
  let content: EntryPassContent;
  try {
    content = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as EntryPassContent;
  } catch {
    return 'invalid';
  }
  if (content.sid !== slotId || content.oid !== offerId) return 'invalid';
  if (content.exp * 1000 < Date.now()) return 'invalid';
  const key = loadEntryKeys(offerId).find((candidate) => candidate.kid === content.kid);
  if (!key || !globalThis.crypto?.subtle) return 'unsupported';
  try {
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      key.publicKeyJwk,
      { name: 'Ed25519' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      { name: 'Ed25519' },
      publicKey,
      base64UrlToBytes(signature),
      new TextEncoder().encode(body)
    );
    return valid ? 'valid' : 'invalid';
  } catch {
    return 'unsupported';
  }
}
