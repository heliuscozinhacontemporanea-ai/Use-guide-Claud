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

  it.each(['hotel', 'restaurant', 'sight'] as const)(
    'permite partner %s criar evento vinculado a establishmentId próprio',
    async (category) => {
      mocks.getPartnerProfileUseCase.mockResolvedValue({
        id: 'partner-1',
        category,
      });
      mocks.getItemByIdUseCase.mockResolvedValue({
        id: 'est-1',
        ownerId: 'partner-1',
        name: 'Meu Estabelecimento',
      });

      const eventId = await createPartnerEventApplicationUseCase(partnerUser, {
        ...baseEventInput,
        establishmentId: 'est-1',
      });

      expect(eventId).toBe('event-created-1');
      expect(mocks.getItemByIdUseCase).toHaveBeenCalledWith('est-1');
      expect(mocks.createEventListingUseCase).toHaveBeenCalledWith(
        partnerUser,
        expect.objectContaining({
          establishmentId: 'est-1',
        })
      );
    }
  );

  it.each(['hotel', 'restaurant', 'sight'] as const)(
    'rejeita partner %s sem establishmentId',
    async (category) => {
      mocks.getPartnerProfileUseCase.mockResolvedValue({
        id: 'partner-1',
        category,
      });

      await expect(
        createPartnerEventApplicationUseCase(partnerUser, {
          ...baseEventInput,
        })
      ).rejects.toThrow('Selecione o estabelecimento ao qual o evento pertence.');

      expect(mocks.createEventListingUseCase).not.toHaveBeenCalled();
    }
  );

  it('rejeita partner tentando usar establishment de outro owner', async () => {
    mocks.getPartnerProfileUseCase.mockResolvedValue({
      id: 'partner-1',
      category: 'hotel',
    });
    mocks.getItemByIdUseCase.mockResolvedValue({
      id: 'est-other',
      ownerId: 'partner-2',
      name: 'Hotel de Outro Parceiro',
    });

    await expect(
      createPartnerEventApplicationUseCase(partnerUser, {
        ...baseEventInput,
        establishmentId: 'est-other',
      })
    ).rejects.toThrow('Você não possui permissão sobre este estabelecimento.');

    expect(mocks.createEventListingUseCase).not.toHaveBeenCalled();
  });

  it('permite event producer criar evento sem establishmentId', async () => {
    mocks.getPartnerProfileUseCase.mockResolvedValue({
      id: 'partner-1',
      category: 'event',
    });

    const eventId = await createPartnerEventApplicationUseCase(partnerUser, {
      ...baseEventInput,
    });

    expect(eventId).toBe('event-created-1');
    expect(mocks.getItemByIdUseCase).not.toHaveBeenCalled();
    expect(mocks.createEventListingUseCase).toHaveBeenCalledWith(
      partnerUser,
      expect.objectContaining({
        establishmentId: undefined,
      })
    );
  });

  it('rejeita event producer enviando establishmentId', async () => {
    mocks.getPartnerProfileUseCase.mockResolvedValue({
      id: 'partner-1',
      category: 'event',
    });

    await expect(
      createPartnerEventApplicationUseCase(partnerUser, {
        ...baseEventInput,
        establishmentId: 'est-1',
      })
    ).rejects.toThrow(
      'Produtor de eventos não pode vincular evento a estabelecimento.'
    );

    expect(mocks.createEventListingUseCase).not.toHaveBeenCalled();
  });
});
