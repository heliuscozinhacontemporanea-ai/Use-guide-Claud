import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ history: vi.fn(), cancel: vi.fn(), deleteOrArchive: vi.fn() }));
vi.mock('./hasEventCommercialHistoryApplicationUseCase', () => ({
  hasEventCommercialHistoryApplicationUseCase: m.history,
}));
vi.mock('./cancelEventListingAndRefundApplicationUseCase', () => ({
  cancelEventListingAndRefundApplicationUseCase: m.cancel,
}));
vi.mock('../../domain/events', async () => {
  const errors = await import('../../domain/events/errors/eventDomainError');
  return {
    EventHasSalesError: errors.EventHasSalesError,
    deleteOrArchiveEventListingUseCase: m.deleteOrArchive,
  };
});

import { EventHasSalesError } from '../../domain/events/errors/eventDomainError';
import { deleteEventListingSafelyApplicationUseCase } from './deleteEventListingSafelyApplicationUseCase';

const partner = { uid: 'owner-1', admin: false };

describe('deleteEventListingSafelyApplicationUseCase (D27)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('parceiro não exclui evento com vendas: nada é cancelado, reembolsado ou apagado', async () => {
    m.history.mockResolvedValue(true);
    await expect(deleteEventListingSafelyApplicationUseCase(partner, 'ev1')).rejects.toBeInstanceOf(
      EventHasSalesError
    );
    expect(m.cancel).not.toHaveBeenCalled();
    expect(m.deleteOrArchive).not.toHaveBeenCalled();
  });

  it('se a checagem de vendas falhar, recusa em vez de apagar', async () => {
    m.history.mockRejectedValue(new Error('firestore fora'));
    await expect(deleteEventListingSafelyApplicationUseCase(partner, 'ev1')).rejects.toThrow();
    expect(m.deleteOrArchive).not.toHaveBeenCalled();
  });

  it('sem vendas, exclui', async () => {
    m.history.mockResolvedValue(false);
    m.deleteOrArchive.mockResolvedValue({ mode: 'deleted' });
    await expect(deleteEventListingSafelyApplicationUseCase(partner, 'ev1')).resolves.toEqual({
      mode: 'deleted',
    });
    expect(m.deleteOrArchive).toHaveBeenCalledWith(partner, 'ev1', false);
  });

  it('admin continua podendo encerrar com reembolso', async () => {
    m.history.mockResolvedValue(true);
    m.deleteOrArchive.mockResolvedValue({ mode: 'archived' });
    const admin = { uid: 'admin-1', admin: true };
    await deleteEventListingSafelyApplicationUseCase(admin, 'ev1');
    expect(m.cancel).toHaveBeenCalled();
    expect(m.deleteOrArchive).toHaveBeenCalledWith(admin, 'ev1', true);
  });
});
