import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.hoisted(() => vi.fn());
vi.mock('../../../shared/infrastructure/firebase/firebaseApiFetch', () => ({
  firebaseApiFetch: fetchMock,
}));

import { ApiListingVerificationAdapter } from './apiListingVerificationAdapter';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe('ApiListingVerificationAdapter', () => {
  const adapter = new ApiListingVerificationAdapter();
  beforeEach(() => fetchMock.mockReset());

  it('envia a verificação por PUT com autenticação e App Check', async () => {
    fetchMock.mockResolvedValue(ok({ data: { itemId: 'item-1', status: 'pending' } }));
    await adapter.submit('item-1', { mode: 'linked', sourceItemId: 'item-2' });
    const [path, init, options] = fetchMock.mock.calls[0] ?? [];
    expect(path).toBe('/api/listing-verifications/item-1');
    expect(init).toMatchObject({ method: 'PUT' });
    expect(options).toEqual({ requireAuth: true, requireAppCheck: true });
  });

  it('lista a fila com status, limite e cursor na query', async () => {
    fetchMock.mockResolvedValue(ok({ data: [], nextCursor: null }));
    await adapter.list('rejected', 'item-9');
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      '/api/listing-verifications?status=rejected&limit=20&cursor=item-9'
    );
  });

  it('lança o code estável do erro', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'NOT_PENDING' } }), { status: 409 })
    );
    await expect(adapter.review('item-1', 'approve', null)).rejects.toThrow('NOT_PENDING');
  });
});
