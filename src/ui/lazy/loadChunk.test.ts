import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadChunk } from './loadChunk';

describe('loadChunk', () => {
  const reload = vi.fn();
  const original = window.location;

  afterEach(() => {
    sessionStorage.clear();
    reload.mockReset();
    Object.defineProperty(window, 'location', { configurable: true, value: original });
  });

  function stubReload() {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...original, reload },
    });
  }

  it('devolve o módulo quando o arquivo carrega', async () => {
    await expect(loadChunk(() => Promise.resolve({ ok: true }))).resolves.toEqual({ ok: true });
  });

  it('arquivo que sumiu depois de uma publicação recarrega a página uma vez', async () => {
    stubReload();
    void loadChunk(() => Promise.reject(new Error('Failed to fetch dynamically imported module')));
    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  });

  it('na segunda falha não recarrega de novo: o erro sobe para a tela de erro', async () => {
    stubReload();
    sessionStorage.setItem('useguide.chunkReload', '1');
    await expect(loadChunk(() => Promise.reject(new Error('offline')))).rejects.toThrow('offline');
    expect(reload).not.toHaveBeenCalled();
  });

  it('carregar com sucesso libera a próxima recarga', async () => {
    sessionStorage.setItem('useguide.chunkReload', '1');
    await loadChunk(() => Promise.resolve({}));
    expect(sessionStorage.getItem('useguide.chunkReload')).toBeNull();
  });
});
