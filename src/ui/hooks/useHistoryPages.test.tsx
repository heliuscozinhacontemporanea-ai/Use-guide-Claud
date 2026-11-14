import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useHistoryPages } from './useHistoryPages';

describe('useHistoryPages', () => {
  afterEach(() => window.history.replaceState(null, ''));

  it('cada página aberta entra no histórico; o voltar do sistema fecha só a de cima', async () => {
    const { result } = renderHook(() => useHistoryPages<'a' | 'b'>('painel'));
    act(() => result.current.push('a'));
    act(() => result.current.push('b'));
    expect(result.current.pages).toEqual(['a', 'b']);

    act(() => window.history.back());
    await waitFor(() => expect(result.current.pages).toEqual(['a']));
    expect(result.current.top).toBe('a');
  });

  it('o `<` da página fecha pelo histórico, sem deixar entrada para trás', async () => {
    const { result } = renderHook(() => useHistoryPages<'a'>('painel'));
    act(() => result.current.push('a'));
    act(() => result.current.back());
    await waitFor(() => expect(result.current.pages).toEqual([]));
    expect((window.history.state as { ugPages?: string[] } | null)?.ugPages ?? []).toEqual([]);
  });
});
