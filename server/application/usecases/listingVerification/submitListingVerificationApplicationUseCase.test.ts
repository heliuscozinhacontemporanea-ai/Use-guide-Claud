import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getItem: vi.fn(),
  isOwnFile: vi.fn(),
  submit: vi.fn(),
}));

vi.mock('../../../domain/guide', () => ({ getItemByIdUseCase: mocks.getItem }));
vi.mock('../../../domain/media', () => ({ isOwnVerificationFileUseCase: mocks.isOwnFile }));
vi.mock('../../../domain/partners', async () => {
  const { ListingVerificationError } = await import(
    '../../../domain/partners/errors/listingVerificationError'
  );
  return { ListingVerificationError, submitListingVerificationUseCase: mocks.submit };
});

import { submitListingVerificationApplicationUseCase } from './submitListingVerificationApplicationUseCase';

const actor = { uid: 'owner-1' };

describe('submitListingVerificationApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('recusa arquivo de outra conta antes de gravar', async () => {
    mocks.getItem.mockResolvedValue({ id: 'item-1', ownerId: 'owner-1', category: 'hotel' });
    mocks.isOwnFile.mockReturnValue(false);
    await expect(
      submitListingVerificationApplicationUseCase(actor, 'item-1', {
        mode: 'document',
        files: { identity: 'verification/owner-2/i.webp' },
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('estabelecimento inexistente: NOT_FOUND', async () => {
    mocks.getItem.mockResolvedValue(null);
    await expect(
      submitListingVerificationApplicationUseCase(actor, 'item-x', {
        mode: 'linked',
        sourceItemId: 'item-1',
      })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('perfil de produtor carrega o estabelecimento de origem', async () => {
    mocks.getItem.mockImplementation(async (id: string) =>
      id === 'item-3'
        ? { id: 'item-3', ownerId: 'owner-1', category: 'producer' }
        : { id: 'item-1', ownerId: 'owner-1', category: 'hotel' }
    );
    await submitListingVerificationApplicationUseCase(actor, 'item-3', {
      mode: 'linked',
      sourceItemId: 'item-1',
    });
    expect(mocks.submit).toHaveBeenCalledWith(
      actor,
      { id: 'item-3', ownerId: 'owner-1', category: 'producer' },
      { mode: 'linked', sourceItemId: 'item-1' },
      { id: 'item-1', ownerId: 'owner-1', category: 'hotel' }
    );
  });
});
