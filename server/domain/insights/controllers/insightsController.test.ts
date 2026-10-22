import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { InsightsUnavailableError } from '../errors/insightsErrors';
import { insightsService } from '../factory';
import { InsightsController } from './insightsController';

vi.mock('../factory', () => ({
  insightsService: { trackInteraction: vi.fn() },
}));

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

function request(partial: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return partial as AuthenticatedRequest;
}

describe('InsightsController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('track sem login conta como visitante e responde 202', async () => {
    vi.mocked(insightsService.trackInteraction).mockResolvedValue(true);
    const res = mockResponse();
    await InsightsController.trackInteraction(
      request({
        body: { itemId: 'item-1', itemCollection: 'items', type: 'view' },
        ip: '203.0.113.9',
      }),
      res as unknown as Response
    );
    expect(insightsService.trackInteraction).toHaveBeenCalledWith(
      expect.objectContaining({ uid: null, ip: '203.0.113.9' })
    );
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({ counted: true });
  });

  it('track com campo extra responde 400 VALIDATION_ERROR', async () => {
    const res = mockResponse();
    await InsightsController.trackInteraction(
      request({
        body: { itemId: 'item-1', itemCollection: 'items', type: 'view', uid: 'forjado' },
      }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('VALIDATION_ERROR');
    expect(insightsService.trackInteraction).not.toHaveBeenCalled();
  });

  it('track sem chave HMAC responde 503 INSIGHTS_UNAVAILABLE', async () => {
    vi.mocked(insightsService.trackInteraction).mockRejectedValue(new InsightsUnavailableError());
    const res = mockResponse();
    await InsightsController.trackInteraction(
      request({ body: { itemId: 'item-1', itemCollection: 'items', type: 'view' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('INSIGHTS_UNAVAILABLE');
  });
});
