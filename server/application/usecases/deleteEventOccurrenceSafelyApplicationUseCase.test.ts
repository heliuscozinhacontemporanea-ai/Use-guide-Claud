import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ committed: vi.fn(), cancel: vi.fn(), remove: vi.fn() }));
vi.mock('./getCommittedTicketsCountForOccurrenceApplicationUseCase', () => ({
  getCommittedTicketsCountForOccurrenceApplicationUseCase: m.committed,
}));
vi.mock('./cancelEventOccurrenceAndRefundApplicationUseCase', () => ({
  cancelEventOccurrenceAndRefundApplicationUseCase: m.cancel,
}));
vi.mock('../../domain/events', async () => {
  const errors = await import('../../domain/events/errors/eventDomainError');
  return {
    OccurrenceHasSalesError: errors.OccurrenceHasSalesError,
    deleteEventOccurrenceUseCase: m.remove,
  };
});

import { OccurrenceHasSalesError } from '../../domain/events/errors/eventDomainError';
import { deleteEventOccurrenceSafelyApplicationUseCase } from './deleteEventOccurrenceSafelyApplicationUseCase';

const partner = { uid: 'owner-1', admin: false };
const admin = { uid: 'admin-1', admin: true };

describe('deleteEventOccurrenceSafelyApplicationUseCase (D27)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('parceiro não exclui sessão com vendas ou cortesias: nada é cancelado, reembolsado ou cobrado', async () => {
    m.committed.mockResolvedValue(3);
    await expect(
      deleteEventOccurrenceSafelyApplicationUseCase(partner, 'occ-1')
    ).rejects.toBeInstanceOf(OccurrenceHasSalesError);
    expect(m.cancel).not.toHaveBeenCalled();
    expect(m.remove).not.toHaveBeenCalled();
  });

  it('o erro leva o código que a tela traduz', async () => {
    m.committed.mockResolvedValue(1);
    await expect(
      deleteEventOccurrenceSafelyApplicationUseCase(partner, 'occ-1')
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      reason: 'SESSION_HAS_SALES',
    });
  });

  it('se a contagem falhar, recusa em vez de apagar', async () => {
    m.committed.mockRejectedValue(new Error('firestore fora'));
    await expect(deleteEventOccurrenceSafelyApplicationUseCase(partner, 'occ-1')).rejects.toThrow();
    expect(m.remove).not.toHaveBeenCalled();
    expect(m.cancel).not.toHaveBeenCalled();
  });

  it('sem vendas, o parceiro exclui a sessão', async () => {
    m.committed.mockResolvedValue(0);
    m.remove.mockResolvedValue({ mode: 'deleted' });
    await expect(deleteEventOccurrenceSafelyApplicationUseCase(partner, 'occ-1')).resolves.toEqual({
      mode: 'deleted',
    });
    expect(m.remove).toHaveBeenCalledWith(partner, 'occ-1', false);
  });

  it('admin continua podendo encerrar com reembolso', async () => {
    m.committed.mockResolvedValue(2);
    await expect(deleteEventOccurrenceSafelyApplicationUseCase(admin, 'occ-1')).resolves.toEqual({
      mode: 'canceled',
    });
    expect(m.cancel).toHaveBeenCalledWith(admin, 'occ-1', expect.any(String));
    expect(m.remove).not.toHaveBeenCalled();
  });
});
