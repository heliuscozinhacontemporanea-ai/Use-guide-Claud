import { describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('../../../shared/infrastructure/firebase/firebaseApiFetch', () => ({
  firebaseApiFetch: m.fetch,
}));

import { ApiUserAdapter } from './apiUserAdapter';

const reply = (status: number, body: unknown) =>
  ({ ok: status < 400, status, json: async () => body }) as Response;

describe('ApiUserAdapter.deleteCurrentUser', () => {
  it('conta com vendas em andamento: o código e os motivos chegam à tela', async () => {
    m.fetch.mockResolvedValue(
      reply(409, {
        error: { code: 'ACCOUNT_HAS_ACTIVE_SALES', message: 'x', blockers: ['debts'] },
      })
    );
    await expect(new ApiUserAdapter().deleteCurrentUser()).rejects.toMatchObject({
      code: 'ACCOUNT_HAS_ACTIVE_SALES',
      blockers: ['debts'],
    });
  });

  it('login antigo continua pedindo para entrar de novo', async () => {
    m.fetch.mockResolvedValue(reply(401, { error: 'REAUTHENTICATION_REQUIRED' }));
    await expect(new ApiUserAdapter().deleteCurrentUser()).rejects.toMatchObject({
      code: 'REAUTHENTICATION_REQUIRED',
    });
  });

  it('sucesso não lança', async () => {
    m.fetch.mockResolvedValue(reply(200, { status: 'success' }));
    await expect(new ApiUserAdapter().deleteCurrentUser()).resolves.toBeUndefined();
  });
});
