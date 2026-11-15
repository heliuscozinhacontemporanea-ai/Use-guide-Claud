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

  it('getPublicGuideItemUseCase devolve item ativo e publicado', async () => {
    const item = { id: 'a', isActive: true, publication: 'published' };
    getItemById.mockResolvedValue(item);
    await expect(getPublicGuideItemUseCase('a')).resolves.toEqual(item);
  });

  it('getPublicGuideItemUseCase devolve null para rascunho (D34)', async () => {
    getItemById.mockResolvedValue({ id: 'a', isActive: true, publication: 'draft' });
    await expect(getPublicGuideItemUseCase('a')).resolves.toBeNull();
  });

  it('listPublicGuideItemsUseCase deixa fora inativos e rascunhos', async () => {
    getAllItems.mockResolvedValue([
      { id: 'a', isActive: true, publication: 'published' },
      { id: 'b', isActive: false, publication: 'published' },
      { id: 'c', isActive: true, publication: 'draft' },
    ]);
    await expect(listPublicGuideItemsUseCase()).resolves.toEqual([
      { id: 'a', isActive: true, publication: 'published' },
    ]);
  });
});
