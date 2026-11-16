import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  bookings: vi.fn(),
  events: vi.fn(),
  occurrences: vi.fn(),
  documents: vi.fn(),
  debts: vi.fn(),
  payouts: vi.fn(),
  committed: vi.fn(),
}));
vi.mock('../../../domain/bookings', () => ({ hasActiveBookingsForOwnerUseCase: m.bookings }));
vi.mock('../../../domain/events', () => ({
  listOwnerEventListingsUseCase: m.events,
  listEventOccurrencesUseCase: m.occurrences,
}));
vi.mock('../../../domain/partners', () => ({ listOwnerSalesDocumentsUseCase: m.documents }));
vi.mock('../../../domain/payment', () => ({
  listAccountDebtsUseCase: m.debts,
  listOpenPayoutEntriesUseCase: m.payouts,
}));
vi.mock('../getCommittedTicketsCountForOccurrenceApplicationUseCase', () => ({
  getCommittedTicketsCountForOccurrenceApplicationUseCase: m.committed,
}));

import { listAccountClosureBlockersApplicationUseCase } from './listAccountClosureBlockersApplicationUseCase';

const NOW = new Date('2026-11-16T12:00:00.000Z');
const session = (id: string, endsAt: string, status = 'scheduled') => ({ id, endsAt, status });

describe('listAccountClosureBlockersApplicationUseCase (travas de 2026-11-16)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.bookings.mockResolvedValue(false);
    m.events.mockResolvedValue([]);
    m.occurrences.mockResolvedValue([]);
    m.documents.mockResolvedValue([{ accountKey: 'cnpj-1' }]);
    m.debts.mockResolvedValue([]);
    m.payouts.mockResolvedValue([]);
    m.committed.mockResolvedValue(0);
  });

  it('sem vendas em andamento, nada impede', async () => {
    await expect(listAccountClosureBlockersApplicationUseCase('owner-1', NOW)).resolves.toEqual([]);
  });

  it('lista cada motivo, na ordem em que a tela orienta', async () => {
    m.bookings.mockResolvedValue(true);
    m.events.mockResolvedValue([{ id: 'ev-1' }]);
    m.occurrences.mockResolvedValue([session('occ-1', '2026-12-01T03:00:00.000Z')]);
    m.committed.mockResolvedValue(2);
    m.debts.mockResolvedValue([{ status: 'open' }]);
    m.payouts.mockResolvedValue([{ id: 'p1' }]);
    await expect(listAccountClosureBlockersApplicationUseCase('owner-1', NOW)).resolves.toEqual([
      'bookings',
      'sessions',
      'debts',
      'payouts',
    ]);
    expect(m.payouts).toHaveBeenCalledWith(['cnpj-1'], 1);
  });

  it('sessões passadas ou canceladas não prendem a conta', async () => {
    m.events.mockResolvedValue([{ id: 'ev-1' }]);
    m.occurrences.mockResolvedValue([
      session('passada', '2026-11-10T03:00:00.000Z'),
      session('cancelada', '2026-12-01T03:00:00.000Z', 'canceled'),
    ]);
    m.committed.mockResolvedValue(5);
    await expect(listAccountClosureBlockersApplicationUseCase('owner-1', NOW)).resolves.toEqual([]);
    expect(m.committed).not.toHaveBeenCalled();
  });

  it('multa suspensa (força maior em análise) prende; paga ou perdoada não', async () => {
    m.debts.mockResolvedValue([{ status: 'paid' }, { status: 'waived' }]);
    await expect(listAccountClosureBlockersApplicationUseCase('owner-1', NOW)).resolves.toEqual([]);
    m.debts.mockResolvedValue([{ status: 'suspended' }]);
    await expect(listAccountClosureBlockersApplicationUseCase('owner-1', NOW)).resolves.toEqual([
      'debts',
    ]);
  });

  it('sem documento de venda, não consulta repasses nem multas', async () => {
    m.documents.mockResolvedValue([]);
    await listAccountClosureBlockersApplicationUseCase('owner-1', NOW);
    expect(m.debts).not.toHaveBeenCalled();
    expect(m.payouts).not.toHaveBeenCalled();
  });

  it('se uma leitura falhar, a exclusão é recusada (nunca às cegas)', async () => {
    m.bookings.mockRejectedValue(new Error('firestore fora'));
    await expect(listAccountClosureBlockersApplicationUseCase('owner-1', NOW)).rejects.toThrow();
  });
});
