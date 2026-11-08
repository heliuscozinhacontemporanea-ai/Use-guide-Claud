import { beforeEach, describe, expect, it, vi } from 'vitest';
import { syncOffersPlaceFromItemUseCase } from '../../domain/bookings';
import { updateEstablishmentEventsPlaceUseCase } from '../../domain/events';
import {
  getItemByIdUseCase,
  type PublicResourceDTO,
  updateGuideItemUseCase,
} from '../../domain/guide';
import { updateBusinessUseCase } from '../../domain/partners';
import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { updatePartnerItemApplicationUseCase } from './updatePartnerItemApplicationUseCase';

vi.mock('../../domain/guide', () => ({
  getItemByIdUseCase: vi.fn(),
  updateGuideItemUseCase: vi.fn(),
}));

vi.mock('../../domain/partners', () => ({
  updateBusinessUseCase: vi.fn(),
}));

vi.mock('../../domain/events', () => ({
  updateEstablishmentEventsPlaceUseCase: vi.fn(),
}));

vi.mock('../../domain/bookings', () => ({
  syncOffersPlaceFromItemUseCase: vi.fn(),
}));

describe('updatePartnerItemApplicationUseCase', () => {
  const regularUser: AuthenticatedUserContext = {
    uid: 'partner-B',
    admin: false,
    role: 'partner',
  };

  const adminUser: AuthenticatedUserContext = {
    uid: 'admin-123',
    admin: true,
    role: 'admin',
  };

  const mockItem: PublicResourceDTO = {
    id: 'item-100',
    ownerId: 'partner-B',
    name: 'Nome Antigo',
    description: 'Descrição Antiga',
    category: 'restaurant',
    image: 'https://example.com/old.jpg',
    images: ['https://example.com/1.jpg'],
    location: 'Praia',
    tags: ['restaurante', 'frutos-do-mar'],
    operationalInfo: {
      cuisineType: 'Regional',
    },
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mudar de cidade leva o fuso novo para eventos e ofertas (D28)', async () => {
    vi.mocked(getItemByIdUseCase)
      .mockResolvedValueOnce({ ...mockItem, timeZone: 'America/Fortaleza', city: 'Jijoca' })
      .mockResolvedValueOnce({ ...mockItem, timeZone: 'America/Manaus', city: 'Manaus' });
    await updatePartnerItemApplicationUseCase(regularUser, 'item-100', {
      state: 'AM',
      city: 'Manaus',
    });
    expect(updateEstablishmentEventsPlaceUseCase).toHaveBeenCalledWith('item-100', {
      timeZone: 'America/Manaus',
      city: 'Manaus',
    });
    expect(syncOffersPlaceFromItemUseCase).toHaveBeenCalledWith('item-100');
  });

  it('sem mudança de lugar, eventos e ofertas ficam como estão', async () => {
    const placed = { ...mockItem, timeZone: 'America/Fortaleza', city: 'Jijoca' };
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(placed).mockResolvedValueOnce(placed);
    await updatePartnerItemApplicationUseCase(regularUser, 'item-100', { description: 'Nova' });
    expect(updateEstablishmentEventsPlaceUseCase).not.toHaveBeenCalled();
    expect(syncOffersPlaceFromItemUseCase).not.toHaveBeenCalled();
  });

  it('Guide update + Partner update succeeds = success', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(updateGuideItemUseCase).mockResolvedValueOnce(undefined);
    vi.mocked(updateBusinessUseCase).mockResolvedValueOnce(undefined);

    await updatePartnerItemApplicationUseCase(regularUser, 'item-100', {
      name: 'Nome Novo',
      description: 'Nova descrição',
    });

    expect(updateGuideItemUseCase).toHaveBeenCalledWith(regularUser, 'item-100', {
      name: 'Nome Novo',
      description: 'Nova descrição',
    });

    expect(updateBusinessUseCase).toHaveBeenCalledWith('partner-B', {
      businessId: 'item-100',
      businessName: 'Nome Novo',
      type: 'item',
    });
  });

  it('Guide update + Partner update fails = Guide rollback + original error rethrown', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(updateGuideItemUseCase).mockResolvedValue(undefined);
    const partnerError = new Error('Falha ao atualizar parceiro no Firestore');
    vi.mocked(updateBusinessUseCase).mockRejectedValueOnce(partnerError);

    await expect(
      updatePartnerItemApplicationUseCase(regularUser, 'item-100', {
        name: 'Nome Novo',
      })
    ).rejects.toThrow(partnerError);

    expect(updateGuideItemUseCase).toHaveBeenCalledTimes(2);

    expect(updateGuideItemUseCase).toHaveBeenNthCalledWith(
      2,
      regularUser,
      'item-100',
      expect.objectContaining({
        name: 'Nome Antigo',
        description: 'Descrição Antiga',
        category: 'restaurant',
        image: 'https://example.com/old.jpg',
        images: ['https://example.com/1.jpg'],
        location: 'Praia',
        tags: ['restaurante', 'frutos-do-mar'],
        operationalInfo: {
          cuisineType: 'Regional',
        },
        isActive: true,
      })
    );
  });

  it('admin updates resource owned by Partner B = updateBusiness(B), Nunca updateBusiness(admin.uid)', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(updateGuideItemUseCase).mockResolvedValueOnce(undefined);
    vi.mocked(updateBusinessUseCase).mockResolvedValueOnce(undefined);

    await updatePartnerItemApplicationUseCase(adminUser, 'item-100', {
      name: 'Nome Atualizado pelo Admin',
    });

    expect(updateBusinessUseCase).toHaveBeenCalledWith('partner-B', {
      businessId: 'item-100',
      businessName: 'Nome Atualizado pelo Admin',
      type: 'item',
    });

    expect(updateBusinessUseCase).not.toHaveBeenCalledWith(adminUser.uid, expect.anything());
  });

  it('não deve atualizar business quando o nome não mudar', async () => {
    vi.mocked(getItemByIdUseCase).mockResolvedValueOnce(mockItem);
    vi.mocked(updateGuideItemUseCase).mockResolvedValueOnce(undefined);

    await updatePartnerItemApplicationUseCase(regularUser, 'item-100', {
      description: 'Apenas mudou descrição',
    });

    expect(updateBusinessUseCase).not.toHaveBeenCalled();
  });
});
