import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { deletePartnerItemApplicationUseCase } from './deletePartnerItemApplicationUseCase';
import {
  archiveOffersOfGuideItemUseCase,
  hasActiveBookingsForGuideItemUseCase,
} from '../../domain/bookings';
import { countOpenEstablishmentEventsUseCase } from '../../domain/events';
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

vi.mock('../../domain/guide', async (original) => ({
  GuideDomainError: (await original<typeof import('../../domain/guide')>()).GuideDomainError,
  getItemByIdUseCase: vi.fn(),
  deleteGuideItemUseCase: vi.fn(),
}));

vi.mock('../../domain/bookings', () => ({
  hasActiveBookingsForGuideItemUseCase: vi.fn().mockResolvedValue(false),
  archiveOffersOfGuideItemUseCase: vi.fn(),
}));

vi.mock('../../domain/events', () => ({
  countOpenEstablishmentEventsUseCase: vi.fn().mockResolvedValue(0),
}));

vi.mock('../../domain/partners', () => ({
  linkBusinessUseCase: vi.fn(),
  unlinkBusinessUseCase: vi.fn(),
  deleteListingVerificationUseCase: vi.fn().mockResolvedValue(['verification/partner-B/c.pdf']),
  deleteListingPlanUseCase: vi.fn(),
}));

vi.mock('../../domain/payment', () => ({
  cancelListingPlanSubscriptionUseCase: vi.fn(),
}));

vi.mock('../../domain/media', () => ({
  deleteVerificationFileUseCase: vi.fn().mockResolvedValue(undefined),
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
    vi.mocked(hasActiveBookingsForGuideItemUseCase).mockResolvedValue(false);
    vi.mocked(countOpenEstablishmentEventsUseCase).mockResolvedValue(0);
  });

  it('outro parceiro é recusado antes de qualquer mudança no vínculo do dono (IDOR)', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    const intruder: AuthenticatedUserContext = { uid: 'partner-A', admin: false, role: 'partner' };

    await expect(deletePartnerItemApplicationUseCase(intruder, 'item-100')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(unlinkBusinessUseCase).not.toHaveBeenCalled();
    expect(deleteGuideItemUseCase).not.toHaveBeenCalled();
    expect(linkBusinessUseCase).not.toHaveBeenCalled();
  });

  it('com reserva ativa, recusa e não apaga nada (D34, F2)', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(hasActiveBookingsForGuideItemUseCase).mockResolvedValueOnce(true);

    await expect(
      deletePartnerItemApplicationUseCase(regularUser, 'item-100')
    ).rejects.toMatchObject({
      code: 'LISTING_HAS_BOOKINGS',
    });
    expect(unlinkBusinessUseCase).not.toHaveBeenCalled();
    expect(deleteGuideItemUseCase).not.toHaveBeenCalled();
    expect(archiveOffersOfGuideItemUseCase).not.toHaveBeenCalled();
    expect(deleteListingVerificationUseCase).not.toHaveBeenCalled();
  });

  it('com evento ligado ao estabelecimento, recusa e não apaga nada', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(countOpenEstablishmentEventsUseCase).mockResolvedValueOnce(2);

    await expect(
      deletePartnerItemApplicationUseCase(regularUser, 'item-100')
    ).rejects.toMatchObject({
      code: 'LISTING_HAS_EVENTS',
    });
    expect(unlinkBusinessUseCase).not.toHaveBeenCalled();
    expect(deleteGuideItemUseCase).not.toHaveBeenCalled();
  });

  it('se a checagem de reservas falhar, recusa em vez de apagar', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(hasActiveBookingsForGuideItemUseCase).mockRejectedValueOnce(new Error('timeout'));

    await expect(deletePartnerItemApplicationUseCase(regularUser, 'item-100')).rejects.toThrow(
      'timeout'
    );
    expect(deleteGuideItemUseCase).not.toHaveBeenCalled();
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
    // As ofertas saem do app junto com o anúncio.
    expect(archiveOffersOfGuideItemUseCase).toHaveBeenCalledWith('item-100');
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
