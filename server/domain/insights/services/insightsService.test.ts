import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getResourceOwnerIdUseCase } from '../../guide';
import { InsightsAccessError } from '../errors/insightsErrors';
import type { InsightsRepositoryPort } from '../ports/insightsRepositoryPort';
import type { ViewerKeyPort } from '../ports/viewerKeyPort';
import { INTERACTION_GUARD_WINDOW_MS, InsightsService } from './insightsService';

vi.mock('../../guide', () => ({
  getResourceOwnerIdUseCase: vi.fn(),
}));
vi.mock('../../events', () => ({
  getEventListingByIdUseCase: vi.fn(),
}));

const stats = {
  views: 10,
  viewsSignedIn: 4,
  viewsAnonymous: 6,
  whatsapp_click: 2,
  share: 1,
  favorite: 3,
  history: [],
};

describe('InsightsService', () => {
  let repoPort: InsightsRepositoryPort;
  let viewerKeys: ViewerKeyPort;
  let service: InsightsService;
  // 23:30 em Fortaleza ainda é o dia 18, embora já seja dia 19 em UTC.
  const now = new Date('2026-10-19T02:30:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    repoPort = {
      recordInteraction: vi.fn().mockResolvedValue(true),
      getItemStats: vi.fn().mockResolvedValue(stats),
    };
    viewerKeys = { keyFor: vi.fn((viewer: string) => `key(${viewer})`) };
    service = new InsightsService(repoPort, viewerKeys);
  });

  describe('trackInteraction', () => {
    it('visitante sem login conta como visualização anônima, pela chave do IP', async () => {
      await service.trackInteraction(
        { itemId: 'item-1', itemCollection: 'items', type: 'view', ip: '203.0.113.7' },
        now
      );
      expect(viewerKeys.keyFor).toHaveBeenCalledWith('ip:203.0.113.7|view|items|item-1');
      expect(repoPort.recordInteraction).toHaveBeenCalledWith({
        itemId: 'item-1',
        itemCollection: 'items',
        counter: 'viewsAnonymous',
        day: '2026-10-18',
        guardId: 'key(ip:203.0.113.7|view|items|item-1)',
        now,
        guardWindowMs: INTERACTION_GUARD_WINDOW_MS,
      });
    });

    it('usuário logado conta pelo uid, mesmo com IP', async () => {
      await service.trackInteraction(
        { itemId: 'item-1', itemCollection: 'items', type: 'view', uid: 'u1', ip: '203.0.113.7' },
        now
      );
      expect(viewerKeys.keyFor).toHaveBeenCalledWith('u:u1|view|items|item-1');
      expect(vi.mocked(repoPort.recordInteraction).mock.calls[0]?.[0].counter).toBe(
        'viewsSignedIn'
      );
    });

    it('outras interações usam o próprio contador', async () => {
      await service.trackInteraction(
        { itemId: 'ev-1', itemCollection: 'events', type: 'share', ip: '203.0.113.7' },
        now
      );
      expect(vi.mocked(repoPort.recordInteraction).mock.calls[0]?.[0].counter).toBe('share');
    });

    it('sem uid nem IP não conta', async () => {
      expect(
        await service.trackInteraction({ itemId: 'item-1', itemCollection: 'items', type: 'view' })
      ).toBe(false);
      expect(repoPort.recordInteraction).not.toHaveBeenCalled();
    });
  });

  describe('getItemStats', () => {
    it('dono do item vê as métricas', async () => {
      vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('user-123');
      const result = await service.getItemStats('item-1', 'items', { uid: 'user-123' }, now);
      expect(result.views).toBe(10);
      expect(repoPort.getItemStats).toHaveBeenCalledWith('item-1', 'items', now);
    });

    it('admin vê sem checar o dono', async () => {
      await service.getItemStats('item-1', 'items', { uid: 'admin-1', admin: true });
      expect(getResourceOwnerIdUseCase).not.toHaveBeenCalled();
    });

    it('quem não é dono nem admin recebe InsightsAccessError', async () => {
      vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('outro-dono');
      await expect(
        service.getItemStats('item-1', 'items', { uid: 'intruso' })
      ).rejects.toBeInstanceOf(InsightsAccessError);
    });

    it('item sem dono também é recusado', async () => {
      vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue(null);
      await expect(
        service.getItemStats('sumido', 'items', { uid: 'user-123' })
      ).rejects.toBeInstanceOf(InsightsAccessError);
    });
  });
});
