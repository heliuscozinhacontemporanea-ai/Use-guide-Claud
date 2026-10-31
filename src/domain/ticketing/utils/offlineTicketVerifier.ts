import {
  getOfflineManifestBundle,
  isTicketMarkedUsedOffline,
  recordOfflineCheckInEvent,
  sha256HexBrowser,
  type StoredOfflineCheckInEvent,
} from './offlineCheckInStorage';

/** Motivo de recusa, traduzido na tela (`ticketGate.offline.<motivo>`). */
export type OfflineRejection =
  | 'notPrepared'
  | 'sessionExpired'
  | 'format'
  | 'signature'
  | 'expired'
  | 'otherSession'
  | 'notInManifest'
  | 'revoked'
  | 'used'
  | 'unsupported';

interface TicketQrContent {
  kid: string;
  tid: string;
  occ: string;
  qv: number;
  exp: number;
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * Confere a assinatura Ed25519 do QR com as chaves do manifesto, no aparelho, e marca o ingresso
 * como usado nesta estação até sincronizar. Navegador sem Ed25519 no WebCrypto devolve `unsupported`.
 * Referência: https://developer.mozilla.org/docs/Web/API/SubtleCrypto/verify#ed25519
 */
export async function verifyAndConsumeOfflineQrToken(params: {
  rawToken: string;
  occurrenceId: string;
}): Promise<
  { valid: true; event: StoredOfflineCheckInEvent } | { valid: false; reason: OfflineRejection }
> {
  const bundle = await getOfflineManifestBundle(params.occurrenceId);
  if (!bundle) return { valid: false, reason: 'notPrepared' };
  if (Date.now() > new Date(bundle.expiresAt).getTime()) {
    return { valid: false, reason: 'sessionExpired' };
  }
  const token = params.rawToken.trim();
  const [prefix, body, signature, extra] = token.split('.');
  if (prefix !== 'UGT1' || !body || !signature || extra !== undefined) {
    return { valid: false, reason: 'format' };
  }
  let content: TicketQrContent;
  try {
    content = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as TicketQrContent;
  } catch {
    return { valid: false, reason: 'format' };
  }
  const key = bundle.keys.find((candidate) => candidate.kid === content.kid);
  if (!key || !globalThis.crypto?.subtle) return { valid: false, reason: 'unsupported' };
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
    if (!valid) return { valid: false, reason: 'signature' };
  } catch {
    return { valid: false, reason: 'unsupported' };
  }
  if (content.exp * 1000 < Date.now()) return { valid: false, reason: 'expired' };
  if (content.occ !== params.occurrenceId) return { valid: false, reason: 'otherSession' };

  const ticketIdHash = await sha256HexBrowser(content.tid);
  const entry = bundle.tickets.find((ticket) => ticket.ticketIdHash === ticketIdHash);
  if (!entry) return { valid: false, reason: 'notInManifest' };
  if (entry.qrVersion !== content.qv) return { valid: false, reason: 'revoked' };
  if (await isTicketMarkedUsedOffline(params.occurrenceId, ticketIdHash)) {
    return { valid: false, reason: 'used' };
  }
  const event: StoredOfflineCheckInEvent = {
    clientEventId: crypto.randomUUID(),
    sessionId: bundle.sessionId,
    occurrenceId: params.occurrenceId,
    ticketId: content.tid,
    ticketIdHash,
    qrVersion: content.qv,
    scannedAt: new Date().toISOString(),
    rawToken: token,
  };
  await recordOfflineCheckInEvent(event);
  return { valid: true, event };
}
