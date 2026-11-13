import type { AddressInfo } from 'node:net';
import express from 'express';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ event: vi.fn() }));
vi.mock('../../../domain/ticketing', () => ({ getPromoterLinkEventUseCase: m.event }));
vi.mock('../../../infrastructure/http/rateLimitByIp', () => ({
  rateLimitByIp: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import { promoterLinkRouter } from './promoterLinkRoute';

const server = express().use('/e', promoterLinkRouter).listen(0);
let base = '';
beforeAll(() => {
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => {
  server.close();
});

/** Destino do redirecionamento, sem segui-lo. */
async function go(path: string, language?: string) {
  const response = await fetch(`${base}${path}`, {
    redirect: 'manual',
    headers: language ? { 'Accept-Language': language } : {},
  });
  return { status: response.status, location: response.headers.get('location') };
}

describe('link curto do divulgador (C6)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('leva ao anúncio do evento, no idioma do aparelho, com o código para a compra', async () => {
    m.event.mockResolvedValue('ev1');
    expect(await go('/e/joao.promo-k7Qm2a')).toEqual({
      status: 302,
      location: '/eventos?d=joao.promo-k7Qm2a&item=ev1&type=event',
    });
    expect((await go('/e/joao.promo-k7Qm2a', 'fr-FR,fr')).location).toBe(
      '/fr/evenements?d=joao.promo-k7Qm2a&item=ev1&type=event'
    );
  });

  it('link que não vale mais ou malformado cai na lista de eventos, sem sair do site', async () => {
    m.event.mockResolvedValue(null);
    expect((await go('/e/joao.promo-k7Qm2a')).location).toBe('/eventos');
    expect((await go('/e/%2F%2Fevil.example')).location).toBe('/eventos');
    expect(m.event).toHaveBeenCalledTimes(1);
    m.event.mockRejectedValue(new Error('falha'));
    expect((await go('/e/joao.promo-k7Qm2a')).location).toBe('/eventos');
  });
});
