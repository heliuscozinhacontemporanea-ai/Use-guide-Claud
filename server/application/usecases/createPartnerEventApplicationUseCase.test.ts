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
});
