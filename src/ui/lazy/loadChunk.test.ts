import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadChunk, markAppStarted } from './loadChunk';

describe('loadChunk', () => {
  const replace = vi.fn();
  const original = window.location;

  afterEach(() => {
    sessionStorage.clear();
    replace.mockReset();
    Object.defineProperty(window, 'location', { configurable: true, value: original });
  });

  function stubReload() {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'https://useguide.com.br/eventos?item=x', replace },
    });
  }

  it('devolve o módulo quando o arquivo carrega', async () => {
    await expect(loadChunk(() => Promise.resolve({ ok: true }))).resolves.toEqual({ ok: true });
  });

  it('arquivo que sumiu depois de uma publicação recarrega uma vez, furando o cache do HTML', async () => {
    stubReload();
    void loadChunk(() => Promise.reject(new Error('Failed to fetch dynamically imported module')));
    await vi.waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
    const target = new URL(String(replace.mock.calls[0]?.[0]));
    expect(target.pathname).toBe('/eventos');
    expect(target.searchParams.get('item')).toBe('x');
    expect(target.searchParams.get('_v')).toMatch(/^\d+$/);
  });

  it('na segunda falha não recarrega de novo: o erro sobe para a tela de erro', async () => {
    stubReload();
    sessionStorage.setItem('useguide.chunkReload', '1');
    await expect(loadChunk(() => Promise.reject(new Error('offline')))).rejects.toThrow('offline');
    expect(replace).not.toHaveBeenCalled();
  });

  it('carregar com sucesso libera a próxima recarga', async () => {
    sessionStorage.setItem('useguide.chunkReload', '1');
    await loadChunk(() => Promise.resolve({}));
    expect(sessionStorage.getItem('useguide.chunkReload')).toBeNull();
  });

  it('app aberto libera a próxima recarga do guarda do index.html', () => {
    sessionStorage.setItem('useguide.htmlReload', '1');
    markAppStarted();
    expect(sessionStorage.getItem('useguide.htmlReload')).toBeNull();
  });
});
