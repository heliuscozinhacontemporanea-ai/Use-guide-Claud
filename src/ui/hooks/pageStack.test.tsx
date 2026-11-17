import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createPageStack, usePageStack } from './pageStack';

describe('createPageStack', () => {
  afterEach(() => window.history.replaceState(null, ''));

  it('cada página aberta entra no histórico; o voltar do sistema fecha só a de cima', async () => {
    const stack = createPageStack<string>('painel');
    const { result } = renderHook(() => usePageStack(stack));
    act(() => stack.push('a'));
    act(() => stack.push('b'));
    expect(result.current).toEqual(['a', 'b']);

    act(() => window.history.back());
    await waitFor(() => expect(result.current).toEqual(['a']));
  });

  it('o `<` da página fecha pelo histórico, sem deixar entrada para trás', async () => {
    const stack = createPageStack<string>('painel');
    const { result } = renderHook(() => usePageStack(stack));
    act(() => stack.push('a'));
    act(() => stack.back());
    await waitFor(() => expect(result.current).toEqual([]));
    expect((window.history.state as { ugPages?: string[] } | null)?.ugPages ?? []).toEqual([]);
  });
});

describe('createPageStack · back(n)', () => {
  afterEach(() => window.history.replaceState(null, ''));

  it('fecha as páginas de cima de uma vez, pelo histórico (editor e seção depois de salvar)', async () => {
    const stack = createPageStack<string>('painel');
    const { result } = renderHook(() => usePageStack(stack));
    act(() => stack.push('lugar'));
    act(() => stack.push('editor'));
    act(() => stack.push('seção'));
    act(() => stack.back(2));
    await waitFor(() => expect(result.current).toEqual(['lugar']));
    expect((window.history.state as { ugPages?: string[] } | null)?.ugPages).toEqual(['painel#1']);
  });
});

describe('createPageStack · clear', () => {
  afterEach(() => window.history.replaceState(null, ''));

  it('fecha todas as páginas pelo histórico, de uma vez', async () => {
    const stack = createPageStack<string>('painel');
    const { result } = renderHook(() => usePageStack(stack));
    act(() => stack.push('a'));
    act(() => stack.push('b'));
    act(() => stack.clear());
    expect(result.current).toEqual([]);
    // As entradas saem do histórico depois (o `history.go` é assíncrono).
    await waitFor(() =>
      expect((window.history.state as { ugPages?: string[] } | null)?.ugPages ?? []).toEqual([])
    );
  });
});

describe('createPageStack · replace', () => {
  afterEach(() => window.history.replaceState(null, ''));

  it('troca a página de cima sem nova entrada no histórico; voltar leva à de baixo', async () => {
    const stack = createPageStack<string>('painel');
    const { result } = renderHook(() => usePageStack(stack));
    act(() => stack.push('lugar'));
    act(() => stack.push('editor'));
    act(() => stack.replace('horários'));
    expect(result.current).toEqual(['lugar', 'horários']);
    expect((window.history.state as { ugPages?: string[] } | null)?.ugPages).toEqual([
      'painel#1',
      'painel#2',
    ]);
    act(() => stack.back());
    await waitFor(() => expect(result.current).toEqual(['lugar']));
  });

  it('sem páginas abertas, não faz nada', () => {
    const stack = createPageStack<string>('painel');
    const { result } = renderHook(() => usePageStack(stack));
    act(() => stack.replace('horários'));
    expect(result.current).toEqual([]);
  });
});
