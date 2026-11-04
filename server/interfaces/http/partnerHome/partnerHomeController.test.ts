import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('../../../application/usecases/partnerHome/getPartnerHomeApplicationUseCase', () => ({
  getPartnerHomeApplicationUseCase: m.get,
}));

import { PartnerHomeController } from './partnerHomeController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

function request(user?: { uid: string }): AuthenticatedRequest {
  return { query: { ownerUid: 'outro' }, body: {}, params: {}, user } as never;
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
});
