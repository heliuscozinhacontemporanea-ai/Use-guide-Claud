import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { PartnerDomainError } from '../../domain/partners/errors/partnerDomainError';
import { createPartnerEventApplicationUseCase } from './createPartnerEventApplicationUseCase';

const mocks = vi.hoisted(() => ({
  getPartnerProfileUseCase: vi.fn(),
  linkBusinessUseCase: vi.fn(),
  getItemByIdUseCase: vi.fn(),
  createEventListingUseCase: vi.fn(),
  deleteOrArchiveEventListingUseCase: vi.fn(),
}));

vi.mock('../../domain/partners', () => ({
  PartnerDomainError,
  getPartnerProfileUseCase: mocks.getPartnerProfileUseCase,
  linkBusinessUseCase: mocks.linkBusinessUseCase,
}));

vi.mock('../../domain/guide', () => ({
  getItemByIdUseCase: mocks.getItemByIdUseCase,
}));

vi.mock('./listingPlans/syncListingSealApplicationUseCase', () => ({
  syncListingSealApplicationUseCase: vi.fn(),
}));

vi.mock('../../domain/events', () => ({
  createEventListingUseCase: mocks.createEventListingUseCase,
  deleteOrArchiveEventListingUseCase: mocks.deleteOrArchiveEventListingUseCase,
}));

describe('createPartnerEventApplicationUseCase', () => {
  const partnerUser: AuthenticatedUserContext = {
    uid: 'partner-1',
    role: 'partner',
    admin: false,
  };

  const baseEventInput = {
    name: 'Sunset Jeri',
    description: 'Música ao vivo',
    image: 'https://img.com/event.jpg',
    images: ['https://img.com/event.jpg'],
    location: 'Jericoacoara',
    date: '2026-11-10T18:00:00.000Z',
    endDate: '2026-11-10T23:00:00.000Z',
    eventCategory: 'show',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createEventListingUseCase.mockResolvedValue({
      listing: { id: 'event-created-1' },
      occurrences: [],
    });
    mocks.linkBusinessUseCase.mockResolvedValue(undefined);
  });

  it.each(['hotel', 'restaurant', 'sight', 'producer'])(
    'cria evento vinculado a cadastro próprio (%s)',
    async (category) => {
      mocks.getPartnerProfileUseCase.mockResolvedValue({ id: 'partner-1' });
      mocks.getItemByIdUseCase.mockResolvedValue({
        id: 'est-1',
        ownerId: 'partner-1',
        category,
        name: 'Meu cadastro',
      });

      const eventId = await createPartnerEventApplicationUseCase(partnerUser, {
        ...baseEventInput,
        establishmentId: 'est-1',
      });

      expect(eventId).toBe('event-created-1');
      expect(mocks.createEventListingUseCase).toHaveBeenCalledWith(
        partnerUser,
        expect.objectContaining({ establishmentId: 'est-1' })
      );
      expect(mocks.linkBusinessUseCase).toHaveBeenCalledWith('partner-1', {
        businessId: 'event-created-1',
        businessName: 'Sunset Jeri',
        type: 'event',
      });
    }
  );

  it('o evento usa o fuso do estabelecimento (D28)', async () => {
    mocks.getPartnerProfileUseCase.mockResolvedValue({ id: 'partner-1' });
    mocks.getItemByIdUseCase.mockResolvedValue({
      id: 'est-1',
      ownerId: 'partner-1',
      category: 'restaurant',
      name: 'Bar no Amazonas',
      timeZone: 'America/Manaus',
    });
    await createPartnerEventApplicationUseCase(partnerUser, {
      ...baseEventInput,
      establishmentId: 'est-1',
    });
    expect(mocks.createEventListingUseCase).toHaveBeenCalledWith(
      partnerUser,
      expect.objectContaining({ timeZone: 'America/Manaus' })
    );
  });

  it('recusa evento sem estabelecimento nem perfil de produtor', async () => {
    mocks.getPartnerProfileUseCase.mockResolvedValue({ id: 'partner-1' });
    await expect(
      createPartnerEventApplicationUseCase(partnerUser, baseEventInput)
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(mocks.createEventListingUseCase).not.toHaveBeenCalled();
  });

  it('recusa cadastro de outro parceiro', async () => {
    mocks.getPartnerProfileUseCase.mockResolvedValue({ id: 'partner-1' });
    mocks.getItemByIdUseCase.mockResolvedValue({ id: 'est-x', ownerId: 'outro' });
    await expect(
      createPartnerEventApplicationUseCase(partnerUser, {
        ...baseEventInput,
        establishmentId: 'est-x',
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(mocks.createEventListingUseCase).not.toHaveBeenCalled();
  });

  it('desfaz o evento se o vínculo com o parceiro falhar', async () => {
    mocks.getPartnerProfileUseCase.mockResolvedValue({ id: 'partner-1' });
    mocks.getItemByIdUseCase.mockResolvedValue({ id: 'est-1', ownerId: 'partner-1' });
    mocks.linkBusinessUseCase.mockRejectedValue(new Error('falhou'));
    await expect(
      createPartnerEventApplicationUseCase(partnerUser, {
        ...baseEventInput,
        establishmentId: 'est-1',
      })
    ).rejects.toThrow('falhou');
    expect(mocks.deleteOrArchiveEventListingUseCase).toHaveBeenCalledWith(
      partnerUser,
      'event-created-1',
      false
    );
  });

  describe('evento do Use Guide (escolhas da F4)', () => {
    const adminUser: AuthenticatedUserContext = { uid: 'admin-1', role: 'admin', admin: true };

    it('sem estabelecimento: usa o fuso do estado e da cidade, sem perfil de parceiro', async () => {
      await createPartnerEventApplicationUseCase(adminUser, {
        ...baseEventInput,
        state: 'CE',
        city: 'Jijoca de Jericoacoara',
      });
      expect(mocks.getPartnerProfileUseCase).not.toHaveBeenCalled();
      expect(mocks.createEventListingUseCase).toHaveBeenCalledWith(
        adminUser,
        expect.objectContaining({ timeZone: 'America/Fortaleza', city: 'Jijoca de Jericoacoara' })
      );
      expect(mocks.linkBusinessUseCase).not.toHaveBeenCalled();
    });

    it('sem estabelecimento nem cidade, recusa', async () => {
      await expect(
        createPartnerEventApplicationUseCase(adminUser, baseEventInput)
      ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
      expect(mocks.createEventListingUseCase).not.toHaveBeenCalled();
    });

    it('no estabelecimento, só anúncio do Use Guide', async () => {
      mocks.getItemByIdUseCase.mockResolvedValue({ id: 'est-p', ownerId: 'partner-1' });
      await expect(
        createPartnerEventApplicationUseCase(adminUser, {
          ...baseEventInput,
          establishmentId: 'est-p',
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      mocks.getItemByIdUseCase.mockResolvedValue({
        id: 'est-u',
        ownerId: 'useguide',
        timeZone: 'America/Fortaleza',
      });
      await createPartnerEventApplicationUseCase(adminUser, {
        ...baseEventInput,
        establishmentId: 'est-u',
      });
      expect(mocks.createEventListingUseCase).toHaveBeenCalledTimes(1);
      expect(mocks.linkBusinessUseCase).not.toHaveBeenCalled();
    });
  });
});
