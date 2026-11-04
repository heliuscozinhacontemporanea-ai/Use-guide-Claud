import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn() }));

vi.mock('../../../application/usecases/partnerHome/getPartnerHomeApplicationUseCase', () => ({
  getPartnerHomeApplicationUseCase: m.get,
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
});
