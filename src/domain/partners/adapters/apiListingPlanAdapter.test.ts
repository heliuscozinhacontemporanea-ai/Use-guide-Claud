import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.hoisted(() => vi.fn());
vi.mock('../../../shared/infrastructure/firebase/firebaseApiFetch', () => ({
  firebaseApiFetch: fetchMock,
}));

import { ApiListingPlanAdapter } from './apiListingPlanAdapter';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe('ApiListingPlanAdapter', () => {
  const adapter = new ApiListingPlanAdapter();
  beforeEach(() => fetchMock.mockReset());

  it('lê o plano do estabelecimento com autenticação e App Check', async () => {
    fetchMock.mockResolvedValue(ok({ data: { itemId: 'item-1', planActive: false } }));
    await expect(adapter.get('item-1')).resolves.toMatchObject({ itemId: 'item-1' });
    const [path, init, options] = fetchMock.mock.calls[0] ?? [];
    expect(path).toBe('/api/listing-plans/item-1');
    expect(init).toMatchObject({ method: 'GET' });
    expect(options).toEqual({ requireAuth: true, requireAppCheck: true });
  });

  it('ativa o teste grátis por POST no estabelecimento', async () => {
    fetchMock.mockResolvedValue(ok({ data: { itemId: 'item-1', planType: 'trial' } }));
    await adapter.activateTrial('item-1');
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/listing-plans/item-1/trial');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });
  });

  it('admin concede o selo por PUT só com { grant }', async () => {
    fetchMock.mockResolvedValue(ok({ data: { itemId: 'item-1', planType: 'admin' } }));
    await adapter.setSeal('item-1', true);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/listing-plans/item-1/seal');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'PUT',
      body: JSON.stringify({ grant: true }),
    });
  });

  it('lança o code estável do erro', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'TRIAL_ALREADY_USED' } }), { status: 409 })
    );
    await expect(adapter.activateTrial('item-1')).rejects.toThrow('TRIAL_ALREADY_USED');
  });
});
