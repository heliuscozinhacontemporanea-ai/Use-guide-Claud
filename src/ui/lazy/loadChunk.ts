const RELOAD_FLAG = 'useguide.chunkReload';

function hasReloaded(): boolean {
  try {
    return sessionStorage.getItem(RELOAD_FLAG) === '1';
  } catch {
    return false;
  }
}

function setReloaded(value: boolean): boolean {
  try {
    if (value) sessionStorage.setItem(RELOAD_FLAG, '1');
    else sessionStorage.removeItem(RELOAD_FLAG);
    return true;
  } catch {
    return false;
  }
}

/**
 * Carrega um arquivo de código sob demanda (DESIGN.md P11). Depois de uma publicação, o app aberto
 * pode pedir um arquivo que não existe mais: recarrega a página uma vez para pegar a versão nova. Sem
 * `sessionStorage` não recarrega, para nunca entrar em ciclo.
 */
export async function loadChunk<T>(load: () => Promise<T>): Promise<T> {
  try {
    const loaded = await load();
    if (hasReloaded()) setReloaded(false);
    return loaded;
  } catch (error) {
    if (hasReloaded() || !setReloaded(true)) throw error;
    window.location.reload();
    return new Promise<T>(() => undefined);
  }
}

/** Baixa o código antes de a pessoa tocar (DESIGN.md P12); falha aqui é silenciosa, a tela tenta de novo. */
export function prefetchChunk(load: () => Promise<unknown>): void {
  load().catch(() => undefined);
}
