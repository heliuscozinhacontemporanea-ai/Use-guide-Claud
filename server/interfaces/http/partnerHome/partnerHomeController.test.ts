import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({
  get: vi.fn(),
  save: vi.fn(),
  agenda: vi.fn(),
  catalog: vi.fn(),
  sales: vi.fn(),
}));

vi.mock('../../../application/usecases/partnerHome/getPartnerHomeApplicationUseCase', () => ({
  getPartnerHomeApplicationUseCase: m.get,
}));
vi.mock('../../../application/usecases/partnerHome/getPartnerAgendaApplicationUseCase', () => ({
  getPartnerAgendaApplicationUseCase: m.agenda,
}));
vi.mock('../../../application/usecases/partnerHome/getPartnerCatalogApplicationUseCase', () => ({
  getPartnerCatalogApplicationUseCase: m.catalog,
}));
vi.mock('../../../application/usecases/partnerHome/getPartnerEventSalesApplicationUseCase', () => ({
  getPartnerEventSalesApplicationUseCase: m.sales,
}));
vi.mock('../../../domain/partners', async () => {
  const { PartnerDomainError } = await import('../../../domain/partners/errors/partnerDomainError');
  return {
    PartnerDomainError,
    PARTNER_HOME_CARD_IDS: ['today', 'sales_today', 'reviews'],
    savePartnerHomeCardsUseCase: m.save,
  };
});

import { PartnerHomeController } from './partnerHomeController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

function request(user?: { uid: string }, body: unknown = {}): AuthenticatedRequest {
  return { query: { ownerUid: 'outro' }, body, params: {}, user } as never;
}

describe('PartnerHomeController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('responde 401 sem login', async () => {
    const res = response();
    await PartnerHomeController.get(request(), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(m.get).not.toHaveBeenCalled();
  });

  it('lê sempre o início de quem está logado, mesmo com outro dono na consulta', async () => {
    m.get.mockResolvedValue({ attention: [] });
    const res = response();
    await PartnerHomeController.get(request({ uid: 'owner-1' }), res as unknown as Response);
    expect(m.get).toHaveBeenCalledWith('owner-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { attention: [] } });
  });

  it('falha sem detalhe interno', async () => {
    m.get.mockRejectedValue(new Error('firestore down at /x'));
    const res = response();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await PartnerHomeController.get(request({ uid: 'owner-1' }), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain('firestore');
  });

  it('salva os cartões de quem está logado', async () => {
    m.save.mockResolvedValue(['reviews', 'today']);
    const res = response();
    await PartnerHomeController.saveCards(
      request({ uid: 'owner-1' }, { cards: ['reviews', 'today'] }),
      res as unknown as Response
    );
    expect(m.save).toHaveBeenCalledWith('owner-1', ['reviews', 'today']);
    expect(res.json).toHaveBeenCalledWith({ data: { cards: ['reviews', 'today'] } });
  });

  it('recusa cartão desconhecido ou campo a mais', async () => {
    for (const body of [{ cards: ['hack'] }, { cards: ['today'], ownerId: 'x' }]) {
      const res = response();
      await PartnerHomeController.saveCards(
        request({ uid: 'owner-1' }, body),
        res as unknown as Response
      );
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(m.save).not.toHaveBeenCalled();
  });

  it('agenda: lê o período de quem está logado e recusa período inválido ou longo', async () => {
    m.agenda.mockResolvedValue([]);
    const ok = response();
    await PartnerHomeController.getAgenda(
      {
        query: { from: '2026-11-02T03:00:00.000Z', to: '2026-11-09T03:00:00.000Z' },
        user: { uid: 'owner-1' },
      } as never,
      ok as unknown as Response
    );
    expect(m.agenda).toHaveBeenCalledWith(
      'owner-1',
      '2026-11-02T03:00:00.000Z',
      '2026-11-09T03:00:00.000Z'
    );
    for (const query of [
      { from: '2026-11-09T03:00:00.000Z', to: '2026-11-02T03:00:00.000Z' },
      { from: '2026-01-01T03:00:00.000Z', to: '2026-12-01T03:00:00.000Z' },
      { from: 'ontem', to: 'hoje' },
    ]) {
      const res = response();
      await PartnerHomeController.getAgenda(
        { query, user: { uid: 'owner-1' } } as never,
        res as unknown as Response
      );
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  it('catálogo: lê só o do uid logado e responde 503 sem detalhe interno', async () => {
    m.catalog.mockResolvedValueOnce({ events: [] });
    const ok = response();
    await PartnerHomeController.getCatalog(request({ uid: 'owner-1' }), ok as unknown as Response);
    expect(m.catalog).toHaveBeenCalledWith('owner-1');
    expect(ok.status).toHaveBeenCalledWith(200);

    m.catalog.mockRejectedValueOnce(new Error('firestore: segredo interno'));
    const fail = response();
    await PartnerHomeController.getCatalog(
      request({ uid: 'owner-1' }),
      fail as unknown as Response
    );
    expect(fail.status).toHaveBeenCalledWith(503);
    expect(JSON.stringify(fail.json.mock.calls)).not.toContain('segredo');
  });

  it('vendas do evento: lê do uid logado; evento de outro dono responde 404 (IDOR)', async () => {
    const { TicketingDomainError } = await import(
      '../../../domain/ticketing/errors/ticketingDomainError'
    );
    m.sales.mockResolvedValueOnce({ orders: [] });
    const ok = response();
    await PartnerHomeController.getEventSales(
      { params: { eventId: 'ev1' }, user: { uid: 'owner-1' } } as never,
      ok as unknown as Response
    );
    expect(m.sales).toHaveBeenCalledWith('owner-1', 'ev1');
    expect(ok.status).toHaveBeenCalledWith(200);

    m.sales.mockRejectedValueOnce(new TicketingDomainError('FORBIDDEN', 'Sem permissão.'));
    const other = response();
    await PartnerHomeController.getEventSales(
      { params: { eventId: 'ev-de-outro' }, user: { uid: 'owner-1' } } as never,
      other as unknown as Response
    );
    expect(other.status).toHaveBeenCalledWith(404);

    const bad = response();
    await PartnerHomeController.getEventSales(
      { params: { eventId: '../x' }, user: { uid: 'owner-1' } } as never,
      bad as unknown as Response
    );
    expect(bad.status).toHaveBeenCalledWith(400);
  });
});
