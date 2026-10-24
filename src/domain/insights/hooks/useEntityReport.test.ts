import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ stats: vi.fn(), reviews: vi.fn() }));
vi.mock('../application/usecases/getItemStatsUseCase', () => ({ getItemStatsUseCase: m.stats }));
vi.mock('../../reviews', () => ({ getReviewsUseCase: m.reviews }));

import { useEntityReport } from './useEntityReport';

const TARGET = { id: 'item-1', type: 'items' as const };
const REVIEW = { id: 'r1', rating: 5 };

describe('useEntityReport (D11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.reviews.mockResolvedValue({ items: [REVIEW] });
  });

  it('sem plano: métricas travadas, avaliações carregadas e sem erro', async () => {
    m.stats.mockRejectedValue(new Error('LISTING_PLAN_REQUIRED'));
    const { result } = renderHook(() => useEntityReport(TARGET));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.statsLocked).toBe(true);
    expect(result.current.error).toBe(false);
    expect(result.current.reviews).toEqual([REVIEW]);
  });

  it('outra falha nas métricas vira erro com nova tentativa', async () => {
    m.stats.mockRejectedValue(new Error('INTERNAL_ERROR'));
    const { result } = renderHook(() => useEntityReport(TARGET));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.statsLocked).toBe(false);
    expect(result.current.error).toBe(true);
  });

  it('com plano: métricas e avaliações', async () => {
    m.stats.mockResolvedValue({ views: 3 });
    const { result } = renderHook(() => useEntityReport(TARGET));
    await waitFor(() => expect(result.current.stats).toEqual({ views: 3 }));
    expect(result.current.reviews).toEqual([REVIEW]);
  });
});
