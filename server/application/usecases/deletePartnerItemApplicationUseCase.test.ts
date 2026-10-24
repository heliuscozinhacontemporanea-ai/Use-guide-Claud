import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { deletePartnerItemApplicationUseCase } from './deletePartnerItemApplicationUseCase';
import {
  deleteGuideItemUseCase,
  getItemByIdUseCase,
  type PublicResourceDTO,
} from '../../domain/guide';
import {
  deleteListingVerificationUseCase,
  linkBusinessUseCase,
  unlinkBusinessUseCase,
} from '../../domain/partners';
import { deleteVerificationFileUseCase } from '../../domain/media';
import { cancelListingPlanSubscriptionUseCase } from '../../domain/payment';

vi.mock('../../domain/guide', () => ({
  getItemByIdUseCase: vi.fn(),
  deleteGuideItemUseCase: vi.fn(),
}));

vi.mock('../../domain/partners', () => ({
  linkBusinessUseCase: vi.fn(),
  unlinkBusinessUseCase: vi.fn(),
  deleteListingVerificationUseCase: vi.fn().mockResolvedValue(['verification/partner-B/c.pdf']),
  deleteListingPlanUseCase: vi.fn(),
}));

vi.mock('../../domain/media', () => ({
  deleteVerificationFileUseCase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../domain/payment', () => ({
  cancelListingPlanSubscriptionUseCase: vi.fn().mockResolvedValue(undefined),
}));

describe('deletePartnerItemApplicationUseCase', () => {
  const regularUser: AuthenticatedUserContext = {
    uid: 'partner-B',
    admin: false,
    role: 'partner',
  };

  const mockItem: PublicResourceDTO = {
    id: 'item-100',
    ownerId: 'partner-B',
    name: 'Restaurante Sabor',
    description: 'Comida boa',
    category: 'restaurant',
    image: 'https://example.com/item.jpg',
    images: ['https://example.com/item.jpg'],
    location: 'Jeri',
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unlink sucesso + delete sucesso', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(unlinkBusinessUseCase).mockResolvedValueOnce(undefined);
    vi.mocked(deleteGuideItemUseCase).mockResolvedValueOnce(undefined);

    await deletePartnerItemApplicationUseCase(regularUser, 'item-100');

    expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-B', 'item-100');
    expect(deleteGuideItemUseCase).toHaveBeenCalledWith(regularUser, 'item-100');
    expect(linkBusinessUseCase).not.toHaveBeenCalled();
    expect(deleteListingVerificationUseCase).toHaveBeenCalledWith('item-100');
    expect(deleteVerificationFileUseCase).toHaveBeenCalledWith('verification/partner-B/c.pdf');
    expect(cancelListingPlanSubscriptionUseCase).toHaveBeenCalledWith('item-100');
  });

  it('unlink falha + Guide não é apagado', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    const unlinkError = new Error('Falha ao desvincular negócio');
    vi.mocked(unlinkBusinessUseCase).mockRejectedValueOnce(unlinkError);

    await expect(deletePartnerItemApplicationUseCase(regularUser, 'item-100')).rejects.toThrow(
      unlinkError
    );

    expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-B', 'item-100');
    expect(deleteGuideItemUseCase).not.toHaveBeenCalled();
    expect(linkBusinessUseCase).not.toHaveBeenCalled();
  });

  it('unlink sucesso + delete falha + relink sucesso', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(unlinkBusinessUseCase).mockResolvedValueOnce(undefined);
    const deleteError = new Error('Erro de infraestrutura ao apagar item');
    vi.mocked(deleteGuideItemUseCase).mockRejectedValueOnce(deleteError);
    vi.mocked(linkBusinessUseCase).mockResolvedValueOnce(undefined);

    await expect(deletePartnerItemApplicationUseCase(regularUser, 'item-100')).rejects.toThrow(
      deleteError
    );

    expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-B', 'item-100');
    expect(deleteGuideItemUseCase).toHaveBeenCalledWith(regularUser, 'item-100');
    expect(linkBusinessUseCase).toHaveBeenCalledWith('partner-B', {
      businessId: 'item-100',
      businessName: 'Restaurante Sabor',
      type: 'item',
    });
  });

  it('unlink sucesso + delete falha + relink falha (relança erro original)', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(unlinkBusinessUseCase).mockResolvedValueOnce(undefined);
    const deleteError = new Error('Erro ao apagar item');
    vi.mocked(deleteGuideItemUseCase).mockRejectedValueOnce(deleteError);
    vi.mocked(linkBusinessUseCase).mockRejectedValueOnce(new Error('Falha no rollback'));

    await expect(deletePartnerItemApplicationUseCase(regularUser, 'item-100')).rejects.toThrow(
      deleteError
    );

    expect(linkBusinessUseCase).toHaveBeenCalledWith('partner-B', {
      businessId: 'item-100',
      businessName: 'Restaurante Sabor',
      type: 'item',
    });
  });

  it('item inexistente não executa unlink nem delete', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(null);

    await deletePartnerItemApplicationUseCase(regularUser, 'item-inexistente');

    expect(unlinkBusinessUseCase).not.toHaveBeenCalled();
    expect(deleteGuideItemUseCase).not.toHaveBeenCalled();
    expect(linkBusinessUseCase).not.toHaveBeenCalled();
  });

  it('ownerId ausente lança erro sem apagar Guide', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce({
      ...mockItem,
      ownerId: '',
    });

    await expect(deletePartnerItemApplicationUseCase(regularUser, 'item-100')).rejects.toThrow(
      'Proprietário do item não encontrado.'
    );

    expect(unlinkBusinessUseCase).not.toHaveBeenCalled();
    expect(deleteGuideItemUseCase).not.toHaveBeenCalled();
  });

  it('delete falha com NOT_FOUND não deve recriar vínculo (idempotência)', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(unlinkBusinessUseCase).mockResolvedValueOnce(undefined);
    const notFoundError = Object.assign(new Error('Item não encontrado'), { code: 'NOT_FOUND' });
    vi.mocked(deleteGuideItemUseCase).mockRejectedValueOnce(notFoundError);

    await expect(deletePartnerItemApplicationUseCase(regularUser, 'item-100')).rejects.toThrow(
      notFoundError
    );

    expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-B', 'item-100');
    expect(deleteGuideItemUseCase).toHaveBeenCalledWith(regularUser, 'item-100');
    expect(linkBusinessUseCase).not.toHaveBeenCalled();
  });
});
