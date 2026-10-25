import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { deletePartnerEventApplicationUseCase } from './deletePartnerEventApplicationUseCase';
import { getEventListingByIdUseCase, type EventListing } from '../../domain/events';
import { linkBusinessUseCase, unlinkBusinessUseCase } from '../../domain/partners';
import { deleteEventListingSafelyApplicationUseCase } from './deleteEventListingSafelyApplicationUseCase';

vi.mock('../../domain/events', () => ({
  getEventListingByIdUseCase: vi.fn(),
}));

vi.mock('../../domain/partners', () => ({
  linkBusinessUseCase: vi.fn(),
  unlinkBusinessUseCase: vi.fn(),
}));

vi.mock('./deleteEventListingSafelyApplicationUseCase', () => ({
  deleteEventListingSafelyApplicationUseCase: vi.fn(),
}));

describe('deletePartnerEventApplicationUseCase', () => {
  const regularUser: AuthenticatedUserContext = {
    uid: 'partner-C',
    admin: false,
    role: 'partner',
  };

  const mockEvent: EventListing = {
    id: 'event-200',
    ownerId: 'partner-C',
    partnerId: 'partner-C',
    title: 'Luau Jeri',
    name: 'Luau Jeri',
    description: 'Festa na praia',
    category: 'event',
    eventCategory: 'shows',
    coverImage: 'https://example.com/event.jpg',
    image: 'https://example.com/event.jpg',
    images: ['https://example.com/event.jpg'],
    visibility: 'public',
    status: 'published',
    isActive: true,
    organizerId: 'partner-C',
    location: { name: 'Jeri' },
    salesPolicy: {
      cancellationPolicy: 'flexible',
      serviceFeeMode: 'pass_to_buyer',
      allowTicketTransfer: true,
      ticketTransferCutoffHours: 4,
    },
    date: '2026-12-31T20:00:00Z',
    endDate: '2027-01-01T04:00:00Z',
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unlink sucesso + delete sucesso', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(mockEvent);
    vi.mocked(unlinkBusinessUseCase).mockResolvedValueOnce(undefined);
    vi.mocked(deleteEventListingSafelyApplicationUseCase).mockResolvedValueOnce({
      mode: 'deleted',
    });

    await deletePartnerEventApplicationUseCase(regularUser, 'event-200');

    expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-C', 'event-200');
    expect(deleteEventListingSafelyApplicationUseCase).toHaveBeenCalledWith(
      regularUser,
      'event-200'
    );
    expect(linkBusinessUseCase).not.toHaveBeenCalled();
  });

  it('unlink falha + Events não é apagado', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(mockEvent);
    const unlinkError = new Error('Falha ao desvincular evento');
    vi.mocked(unlinkBusinessUseCase).mockRejectedValueOnce(unlinkError);

    await expect(deletePartnerEventApplicationUseCase(regularUser, 'event-200')).rejects.toThrow(
      unlinkError
    );

    expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-C', 'event-200');
    expect(deleteEventListingSafelyApplicationUseCase).not.toHaveBeenCalled();
    expect(linkBusinessUseCase).not.toHaveBeenCalled();
  });

  it('unlink sucesso + delete falha + relink sucesso', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(mockEvent);
    vi.mocked(unlinkBusinessUseCase).mockResolvedValueOnce(undefined);
    const deleteError = new Error('Erro de infraestrutura ao apagar evento');
    vi.mocked(deleteEventListingSafelyApplicationUseCase).mockRejectedValueOnce(deleteError);
    vi.mocked(linkBusinessUseCase).mockResolvedValueOnce(undefined);

    await expect(deletePartnerEventApplicationUseCase(regularUser, 'event-200')).rejects.toThrow(
      deleteError
    );

    expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-C', 'event-200');
    expect(deleteEventListingSafelyApplicationUseCase).toHaveBeenCalledWith(
      regularUser,
      'event-200'
    );
    expect(linkBusinessUseCase).toHaveBeenCalledWith('partner-C', {
      businessId: 'event-200',
      businessName: 'Luau Jeri',
      type: 'event',
    });
  });

  it('unlink sucesso + delete falha + relink falha (relança erro original)', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(mockEvent);
    vi.mocked(unlinkBusinessUseCase).mockResolvedValueOnce(undefined);
    const deleteError = new Error('Erro ao apagar evento');
    vi.mocked(deleteEventListingSafelyApplicationUseCase).mockRejectedValueOnce(deleteError);
    vi.mocked(linkBusinessUseCase).mockRejectedValueOnce(new Error('Falha no rollback'));

    await expect(deletePartnerEventApplicationUseCase(regularUser, 'event-200')).rejects.toThrow(
      deleteError
    );

    expect(linkBusinessUseCase).toHaveBeenCalledWith('partner-C', {
      businessId: 'event-200',
      businessName: 'Luau Jeri',
      type: 'event',
    });
  });

  it('event inexistente não executa unlink nem delete', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(null);

    await deletePartnerEventApplicationUseCase(regularUser, 'event-inexistente');

    expect(unlinkBusinessUseCase).not.toHaveBeenCalled();
    expect(deleteEventListingSafelyApplicationUseCase).not.toHaveBeenCalled();
    expect(linkBusinessUseCase).not.toHaveBeenCalled();
  });

  it('ownerId ausente lança erro sem apagar Events', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce({
      ...mockEvent,
      ownerId: '',
    });

    await expect(deletePartnerEventApplicationUseCase(regularUser, 'event-200')).rejects.toThrow(
      'Proprietário do evento não encontrado.'
    );

    expect(unlinkBusinessUseCase).not.toHaveBeenCalled();
    expect(deleteEventListingSafelyApplicationUseCase).not.toHaveBeenCalled();
  });

  it('delete falha com NOT_FOUND não deve recriar vínculo (idempotência)', async () => {
    vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(mockEvent);
    vi.mocked(unlinkBusinessUseCase).mockResolvedValueOnce(undefined);
    const notFoundError = Object.assign(new Error('Evento não encontrado'), { code: 'NOT_FOUND' });
    vi.mocked(deleteEventListingSafelyApplicationUseCase).mockRejectedValueOnce(notFoundError);

    await expect(deletePartnerEventApplicationUseCase(regularUser, 'event-200')).rejects.toThrow(
      notFoundError
    );

    expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-C', 'event-200');
    expect(deleteEventListingSafelyApplicationUseCase).toHaveBeenCalledWith(
      regularUser,
      'event-200'
    );
    expect(linkBusinessUseCase).not.toHaveBeenCalled();
  });
});
