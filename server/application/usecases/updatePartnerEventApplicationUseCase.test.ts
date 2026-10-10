import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { updatePartnerEventApplicationUseCase } from './updatePartnerEventApplicationUseCase';
import {
  getEventListingByIdUseCase,
  type EventListing,
} from '../../domain/events';
import { updateBusinessUseCase } from '../../domain/partners';
import { updateEventListingSafelyApplicationUseCase } from './eventLifecycleOrchestrationUseCases';

vi.mock('../../domain/events', () => ({
  getEventListingByIdUseCase: vi.fn(),
  updateEventListingUseCase: vi.fn(),
}));

vi.mock('../../domain/partners', () => ({
  updateBusinessUseCase: vi.fn(),
}));

vi.mock('./eventLifecycleOrchestrationUseCases', () => ({
  updateEventListingSafelyApplicationUseCase: vi.fn(),
}));

describe('updatePartnerEventApplicationUseCase', () => {
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

  const mockEvent: EventListing = {
    id: 'event-100',
    ownerId: 'partner-B',
    partnerId: 'partner-B',
    title: 'Festival de Verão Antigo',
    name: 'Festival de Verão Antigo',
    description: 'Descrição Antiga do Evento',
    category: 'Show',
    eventCategory: 'Show',
    date: '2026-12-01',
    endDate: '2026-12-05',
    coverImage: 'https://example.com/event.jpg',
    image: 'https://example.com/event.jpg',
    images: ['https://example.com/e1.jpg'],
    visibility: 'public',
    status: 'published',
    isActive: true,
    organizerId: 'partner-B',
    location: { name: 'Centro Cultural' },
    refundPolicy: { enabled: true },
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Events update + Partner update succeeds = success', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(mockEvent);
    vi.mocked(updateEventListingSafelyApplicationUseCase).mockResolvedValueOnce(mockEvent);
    vi.mocked(updateBusinessUseCase).mockResolvedValueOnce(undefined);

    await updatePartnerEventApplicationUseCase(regularUser, 'event-100', {
      name: 'Festival de Verão Novo',
      description: 'Nova descrição do evento',
    });

    expect(updateEventListingSafelyApplicationUseCase).toHaveBeenCalledWith(
      regularUser,
      'event-100',
      expect.objectContaining({
        name: 'Festival de Verão Novo',
        title: 'Festival de Verão Novo',
        description: 'Nova descrição do evento',
      })
    );

    expect(updateBusinessUseCase).toHaveBeenCalledWith('partner-B', {
      businessId: 'event-100',
      businessName: 'Festival de Verão Novo',
      type: 'event',
    });
  });

  it('Events update + Partner update fails = Events rollback + original error rethrown', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(mockEvent);
    vi.mocked(updateEventListingSafelyApplicationUseCase).mockResolvedValue(mockEvent);
    const partnerError = new Error('Falha ao atualizar evento no parceiro');
    vi.mocked(updateBusinessUseCase).mockRejectedValueOnce(partnerError);

    await expect(
      updatePartnerEventApplicationUseCase(regularUser, 'event-100', {
        name: 'Festival de Verão Novo',
      })
    ).rejects.toThrow(partnerError);

    expect(updateEventListingSafelyApplicationUseCase).toHaveBeenCalledTimes(1);
  });

  it('admin updates resource owned by Partner B = updateBusiness(B), Nunca updateBusiness(admin.uid)', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(mockEvent);
    vi.mocked(updateEventListingSafelyApplicationUseCase).mockResolvedValueOnce(mockEvent);
    vi.mocked(updateBusinessUseCase).mockResolvedValueOnce(undefined);

    await updatePartnerEventApplicationUseCase(adminUser, 'event-100', {
      name: 'Festival Atualizado pelo Admin',
    });

    expect(updateBusinessUseCase).toHaveBeenCalledWith('partner-B', {
      businessId: 'event-100',
      businessName: 'Festival Atualizado pelo Admin',
      type: 'event',
    });

    expect(updateBusinessUseCase).not.toHaveBeenCalledWith(adminUser.uid, expect.anything());
  });

  it('não deve atualizar business quando o nome do evento não mudar', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(mockEvent);
    vi.mocked(updateEventListingSafelyApplicationUseCase).mockResolvedValueOnce(mockEvent);

    await updatePartnerEventApplicationUseCase(regularUser, 'event-100', {
      description: 'Apenas mudou descrição do evento',
    });

    expect(updateBusinessUseCase).not.toHaveBeenCalled();
  });
});
