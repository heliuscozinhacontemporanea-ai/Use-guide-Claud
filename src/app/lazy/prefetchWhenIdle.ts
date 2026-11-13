import { prefetchChunk } from '../../ui/lazy/loadChunk';

/** Baixa as telas prováveis quando o navegador fica livre, depois da primeira pintura (DESIGN.md P12). */
export function prefetchWhenIdle(loaders: ReadonlyArray<() => Promise<unknown>>): () => void {
  const run = () => {
    for (const load of loaders) prefetchChunk(load);
  };
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(run, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const timer = window.setTimeout(run, 2000);
  return () => window.clearTimeout(timer);
}
