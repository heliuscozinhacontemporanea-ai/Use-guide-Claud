import { type ComponentType, type LazyExoticComponent, lazy, type ReactNode } from 'react';
import { loadChunk } from './loadChunk';

type FunctionComponentLike = (props: never) => ReactNode;
type PropsOf<C> = C extends (props: infer P) => ReactNode ? P : never;

/** Componente exportado por nome que só é baixado quando aparece pela primeira vez (DESIGN.md P11). */
export function lazyNamed<M extends Record<K, FunctionComponentLike>, K extends keyof M & string>(
  load: () => Promise<M>,
  name: K
): LazyExoticComponent<ComponentType<PropsOf<M[K]>>> {
  return lazy(async () => {
    // O TypeScript não liga `M[K]` às suas props em código genérico; a restrição de `M` garante o tipo.
    const component = (await loadChunk(load))[name] as unknown as ComponentType<PropsOf<M[K]>>;
    return { default: component };
  });
}
