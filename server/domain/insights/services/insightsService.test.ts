import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InsightsService } from './insightsService';
import { InsightsRepositoryPort } from '../ports/insightsRepositoryPort';
import { getResourceOwnerIdUseCase } from '../../guide';

vi.mock('../../guide', () => ({
  getResourceOwnerIdUseCase: vi.fn(),
}));

describe('InsightsService', () => {
  let repoPort: InsightsRepositoryPort;
  let service: InsightsService;

  beforeEach(() => {
    vi.clearAllMocks();
    repoPort = {
      recordInteraction: vi.fn(),
      getItemStats: vi.fn().mockResolvedValue({
        views: 10,
        whatsapp_click: 2,
        share: 1,
        favorite: 3,
        history: [],
      }),
    };
    service = new InsightsService(repoPort);
  });

  it('allows owner to access item stats', async () => {
    vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('user-123');

    const stats = await service.getItemStats('item-1', 'items', {
      uid: 'user-123',
      admin: false,
    });

    expect(stats.views).toBe(10);
    expect(getResourceOwnerIdUseCase).toHaveBeenCalledWith('items', 'item-1');
  });

  it('allows admin to access any item stats without checking ownership', async () => {
    const stats = await service.getItemStats('item-1', 'items', {
      uid: 'admin-999',
      admin: true,
    });

    expect(stats.views).toBe(10);
    expect(getResourceOwnerIdUseCase).not.toHaveBeenCalled();
  });

  it('throws FORBIDDEN when user is neither owner nor admin', async () => {
    vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('different-owner');

    await expect(
      service.getItemStats('item-1', 'items', {
        uid: 'attacker-uid',
        admin: false,
      })
    ).rejects.toThrow('FORBIDDEN');
  });

  it('throws FORBIDDEN when item does not exist or has no owner', async () => {
    vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue(null);

    await expect(
      service.getItemStats('missing-item', 'items', {
        uid: 'user-123',
        admin: false,
      })
    ).rejects.toThrow('FORBIDDEN');
  });
});
