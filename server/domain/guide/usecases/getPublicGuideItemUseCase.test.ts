import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getItemById, getAllItems } = vi.hoisted(() => ({
  getItemById: vi.fn(),
  getAllItems: vi.fn(),
}));

vi.mock('../factory', () => ({ guideService: { getItemById, getAllItems } }));

import { getPublicGuideItemUseCase } from './getPublicGuideItemUseCase';
import { listPublicGuideItemsUseCase } from './listPublicGuideItemsUseCase';

describe('UseCases públicos do guia', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getPublicGuideItemUseCase devolve null para item inativo', async () => {
    getItemById.mockResolvedValue({ id: 'a', isActive: false });
    await expect(getPublicGuideItemUseCase('a')).resolves.toBeNull();
  });

  it('getPublicGuideItemUseCase devolve item ativo', async () => {
    getItemById.mockResolvedValue({ id: 'a', isActive: true });
    await expect(getPublicGuideItemUseCase('a')).resolves.toEqual({ id: 'a', isActive: true });
  });

  it('listPublicGuideItemsUseCase filtra itens inativos', async () => {
    getAllItems.mockResolvedValue([
      { id: 'a', isActive: true },
      { id: 'b', isActive: false },
    ]);
    await expect(listPublicGuideItemsUseCase()).resolves.toEqual([{ id: 'a', isActive: true }]);
  });
});
