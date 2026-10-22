import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ list: vi.fn(), getItem: vi.fn(), profiles: vi.fn() }));

vi.mock('../../../domain/guide', () => ({ getItemByIdUseCase: mocks.getItem }));
vi.mock('../../../domain/users', () => ({ getUserProfilesBatchUseCase: mocks.profiles }));
vi.mock('../../../domain/partners', () => ({ listListingVerificationsUseCase: mocks.list }));

import { listListingVerificationsApplicationUseCase } from './listListingVerificationsApplicationUseCase';

const admin = { uid: 'admin-1', admin: true };

describe('listListingVerificationsApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('completa cada linha com o nome do estabelecimento e do dono, sem e-mail nem perfis vinculados', async () => {
    mocks.list.mockResolvedValue({
      data: [
        { itemId: 'item-1', ownerId: 'owner-1', mode: 'document', status: 'pending' },
        { itemId: 'item-3', ownerId: 'owner-1', mode: 'linked', status: 'pending' },
      ],
      nextCursor: 'item-1',
    });
    mocks.getItem.mockResolvedValue({ id: 'item-1', name: 'Pousada Sol', category: 'hotel' });
    mocks.profiles.mockResolvedValue({
      'owner-1': { firstName: 'Ana', lastName: 'Silva', email: 'ana@exemplo.com' },
    });

    const page = await listListingVerificationsApplicationUseCase(admin, 'pending', 20, null);

    expect(mocks.profiles).toHaveBeenCalledWith(['owner-1']);
    expect(page.nextCursor).toBe('item-1');
    expect(page.data).toHaveLength(1);
    expect(mocks.getItem).toHaveBeenCalledTimes(1);
    expect(page.data[0]).toMatchObject({
      listingName: 'Pousada Sol',
      listingCategory: 'hotel',
      ownerName: 'Ana Silva',
    });
    expect(JSON.stringify(page)).not.toContain('ana@exemplo.com');
  });

  it('fila vazia não consulta guia nem usuários', async () => {
    mocks.list.mockResolvedValue({ data: [], nextCursor: null });
    await expect(
      listListingVerificationsApplicationUseCase(admin, 'pending', 20, null)
    ).resolves.toEqual({ data: [], nextCursor: null });
    expect(mocks.getItem).not.toHaveBeenCalled();
    expect(mocks.profiles).not.toHaveBeenCalled();
  });
});
