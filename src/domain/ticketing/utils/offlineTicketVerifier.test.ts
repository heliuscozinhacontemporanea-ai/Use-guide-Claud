import { generateKeyPairSync, sign } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => ({
  bundle: null as unknown,
  used: null as { qrVersion: number } | null,
  saved: [] as unknown[],
  recorded: [] as unknown[],
}));

vi.mock('./offlineCheckInStorage', async () => {
  const actual =
    await vi.importActual<typeof import('./offlineCheckInStorage')>('./offlineCheckInStorage');
  return {
    sha256HexBrowser: actual.sha256HexBrowser,
    getOfflineManifestBundle: vi.fn(async () => storage.bundle),
    getOfflineUsedRecord: vi.fn(async () => storage.used),
    saveOfflineManifestBundle: vi.fn(async (bundle: unknown) => {
      storage.saved.push(bundle);
    }),
    recordOfflineCheckInEvent: vi.fn(async (event: unknown) => {
      storage.recorded.push(event);
    }),
  };
});

import { sha256HexBrowser } from './offlineCheckInStorage';
import { verifyAndConsumeOfflineQrToken } from './offlineTicketVerifier';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');

function token(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify({ v: 1, kid: 'tq1', ...payload })).toString('base64url');
  return `UGT1.${body}.${sign(null, Buffer.from(body), privateKey).toString('base64url')}`;
}

const VALID = { tid: 'tkt_1', occ: 'occ_1', qv: 2, exp: Math.floor(Date.now() / 1000) + 3600 };

describe('conferência do QR do ingresso sem internet (D20, B36)', () => {
  beforeEach(async () => {
    storage.used = null;
    storage.saved = [];
    storage.recorded = [];
    storage.bundle = {
      occurrenceId: 'occ_1',
      sessionId: 'sess_1',
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      keys: [{ kid: 'tq1', publicKeyJwk: publicKey.export({ format: 'jwk' }) }],
      tickets: [{ ticketIdHash: await sha256HexBrowser('tkt_1'), qrVersion: 2 }],
    };
  });

  it('aceita o QR assinado e guarda a entrada para enviar depois', async () => {
    const result = await verifyAndConsumeOfflineQrToken({
      rawToken: token(VALID),
      occurrenceId: 'occ_1',
    });
    expect(result.valid).toBe(true);
    expect(storage.recorded).toHaveLength(1);
  });

  it('recusa QR adulterado, de outra sessão, substituído ou já usado', async () => {
    const [prefix, , signature] = token(VALID).split('.');
    const forged = Buffer.from(
      JSON.stringify({ v: 1, kid: 'tq1', ...VALID, tid: 'tkt_9' })
    ).toString('base64url');
    const cases: Array<[string, string]> = [
      [`${prefix}.${forged}.${signature}`, 'signature'],
      [token({ ...VALID, occ: 'occ_2' }), 'otherSession'],
      [token({ ...VALID, qv: 1 }), 'revoked'],
      ['ug_tkt_abc', 'format'],
    ];
    for (const [rawToken, reason] of cases) {
      await expect(
        verifyAndConsumeOfflineQrToken({ rawToken, occurrenceId: 'occ_1' })
      ).resolves.toEqual({ valid: false, reason });
    }
    storage.used = { qrVersion: 2 };
    await expect(
      verifyAndConsumeOfflineQrToken({ rawToken: token(VALID), occurrenceId: 'occ_1' })
    ).resolves.toEqual({ valid: false, reason: 'used' });
    await expect(
      verifyAndConsumeOfflineQrToken({
        rawToken: token({ ...VALID, qv: 3 }),
        occurrenceId: 'occ_1',
      })
    ).resolves.toEqual({ valid: false, reason: 'swappedConflict' });
    expect(storage.recorded).toHaveLength(0);
  });

  it('QR trocado depois da lista: a versão nova vence e passa a ser a da lista (D21)', async () => {
    const result = await verifyAndConsumeOfflineQrToken({
      rawToken: token({ ...VALID, qv: 3 }),
      occurrenceId: 'occ_1',
    });
    expect(result.valid).toBe(true);
    expect(storage.saved).toHaveLength(1);
    expect(JSON.stringify(storage.saved[0])).toContain('"qrVersion":3');
  });
});
