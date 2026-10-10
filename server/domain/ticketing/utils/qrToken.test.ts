import crypto from 'crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  generateOpaqueTicketQrToken,
  hashTicketQrToken,
  listTicketQrTokenLookupHashes,
} from './qrToken';

const CURRENT_SECRET = 'a'.repeat(32);
const PREVIOUS_SECRET = 'b'.repeat(32);
const RAW_TOKEN = 'ug_tkt_exemplo';

function hmac(secret: string, value: string): string {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

describe('qrToken', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falha sem TICKET_QR_SECRET em vez de usar um segredo fixo', () => {
    vi.stubEnv('TICKET_QR_SECRET', '');
    expect(() => hashTicketQrToken(RAW_TOKEN)).toThrow(/TICKET_QR_SECRET/);
  });

  it('falha com segredo de 31 caracteres', () => {
    vi.stubEnv('TICKET_QR_SECRET', 'a'.repeat(31));
    expect(() => hashTicketQrToken(RAW_TOKEN)).toThrow(/TICKET_QR_SECRET/);
  });

  it('busca só pelo segredo atual quando não há rotação em andamento', () => {
    vi.stubEnv('TICKET_QR_SECRET', CURRENT_SECRET);
    vi.stubEnv('TICKET_QR_SECRET_PREVIOUS', '');
    expect(listTicketQrTokenLookupHashes(RAW_TOKEN)).toEqual([hmac(CURRENT_SECRET, RAW_TOKEN)]);
  });

  it('inclui o segredo anterior durante a rotação', () => {
    vi.stubEnv('TICKET_QR_SECRET', CURRENT_SECRET);
    vi.stubEnv('TICKET_QR_SECRET_PREVIOUS', PREVIOUS_SECRET);
    expect(listTicketQrTokenLookupHashes(RAW_TOKEN)).toEqual([
      hmac(CURRENT_SECRET, RAW_TOKEN),
      hmac(PREVIOUS_SECRET, RAW_TOKEN),
    ]);
  });

  it('gera token opaco com hash determinístico', () => {
    vi.stubEnv('TICKET_QR_SECRET', CURRENT_SECRET);
    const { rawQrToken, qrTokenHash } = generateOpaqueTicketQrToken();
    expect(rawQrToken.startsWith('ug_tkt_')).toBe(true);
    expect(hashTicketQrToken(rawQrToken)).toBe(qrTokenHash);
  });
});
