import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePartnerEventSessions } from './usePartnerEventSessions';

const m = vi.hoisted(() => ({ occurrences: vi.fn(), listing: vi.fn(), sales: vi.fn() }));
vi.mock('../../events', () => ({
  listEventOccurrencesUseCase: m.occurrences,
  getEventListingByIdUseCase: m.listing,
}));
vi.mock('../application/usecases/getPartnerEventSalesUseCase', () => ({
  getPartnerEventSalesUseCase: m.sales,
}));

const occurrence = (id: string) => ({
  id,
  startsAt: '2026-12-01T22:00:00.000Z',
  endsAt: '2026-12-02T02:00:00.000Z',
  capacity: 100,
});

describe('usePartnerEventSessions', () => {
  afterEach(() => vi.clearAllMocks());

  it('marca as sessões com vendas ou cortesias, que ficam sem lixeira (D27)', async () => {
    m.occurrences.mockResolvedValue([occurrence('a'), occurrence('b'), occurrence('c')]);
    m.listing.mockResolvedValue(null);
    m.sales.mockResolvedValue({
      sessions: [
        { id: 'a', sold: 3, courtesies: 0 },
        { id: 'b', sold: 0, courtesies: 1 },
        { id: 'c', sold: 0, courtesies: 0 },
      ],
    });
    const { result } = renderHook(() => usePartnerEventSessions('ev-1', vi.fn()));
    await waitFor(() => expect(result.current.loadState).toBe('ready'));
    await waitFor(() => expect(result.current.lockedIds).toEqual(['a', 'b']));
    expect(result.current.savedIds).toEqual(['a', 'b', 'c']);
  });

  it('sem a leitura das vendas, nada fica marcado e o servidor continua recusando', async () => {
    m.occurrences.mockResolvedValue([occurrence('a')]);
    m.listing.mockResolvedValue(null);
    m.sales.mockRejectedValue(new Error('INTERNAL_ERROR'));
    const { result } = renderHook(() => usePartnerEventSessions('ev-1', vi.fn()));
    await waitFor(() => expect(result.current.loadState).toBe('ready'));
    expect(result.current.lockedIds).toEqual([]);
  });

  it('evento novo: não lê vendas', () => {
    const { result } = renderHook(() => usePartnerEventSessions(undefined, vi.fn()));
    expect(result.current.loadState).toBe('idle');
    expect(m.sales).not.toHaveBeenCalled();
  });
});
