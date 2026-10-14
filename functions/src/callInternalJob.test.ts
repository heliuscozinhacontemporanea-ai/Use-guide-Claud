import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const secret = vi.hoisted(() => ({ value: 'k'.repeat(32) }));
vi.mock('firebase-functions/params', () => ({
  defineSecret: () => ({ value: () => secret.value }),
}));

import { callInternalJob } from './callInternalJob';

describe('callInternalJob', () => {
  beforeEach(() => {
    secret.value = 'k'.repeat(32);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('envia a chave do Secret Manager no header', async () => {
    await callInternalJob('https://use-guide.run.app/internal/bookings/expire', 'expireBookings');
    expect(fetch).toHaveBeenCalledWith(
      'https://use-guide.run.app/internal/bookings/expire',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-Internal-Job-Key': 'k'.repeat(32) }),
      })
    );
  });

  it('falha com mensagem clara sem URL ou sem chave', async () => {
    await expect(callInternalJob('', 'expireBookings')).rejects.toThrow('não configurado');
    secret.value = '';
    await expect(callInternalJob('https://x.run.app/internal/x', 'expireBookings')).rejects.toThrow('não configurado');
  });

  it('resposta de erro do Cloud Run vira falha do job (o Scheduler registra e tenta de novo)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(callInternalJob('https://x.run.app/internal/x', 'expireBookings')).rejects.toThrow('503');
  });
});
