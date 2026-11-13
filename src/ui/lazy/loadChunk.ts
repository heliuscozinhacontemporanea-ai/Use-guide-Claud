const RELOAD_FLAG = 'useguide.chunkReload';
/** Mesma chave do script `stale-html-guard` do index.html. */
const HTML_RELOAD_FLAG = 'useguide.htmlReload';

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
    reloadWithFreshHtml();
    return new Promise<T>(() => undefined);
  }
}

/**
 * Recarrega com `_v` no endereço: a CDN guarda o HTML por alguns minutos, e uma recarga comum poderia
 * trazer a mesma cópia antiga. O script `stale-html-guard` do index.html tira o `_v` da barra.
 */
export function reloadWithFreshHtml(): void {
  const fresh = new URL(window.location.href);
  fresh.searchParams.set('_v', String(Date.now()));
  window.location.replace(fresh.toString());
}

/** O app abriu: a próxima publicação pode recarregar de novo pelo `stale-html-guard`. */
export function markAppStarted(): void {
  try {
    sessionStorage.removeItem(HTML_RELOAD_FLAG);
  } catch {
    // Sem armazenamento, o guarda do index.html nem chega a recarregar.
  }
}

/** Baixa o código antes de a pessoa tocar (DESIGN.md P12); falha aqui é silenciosa, a tela tenta de novo. */
export function prefetchChunk(load: () => Promise<unknown>): void {
  load().catch(() => undefined);
}
