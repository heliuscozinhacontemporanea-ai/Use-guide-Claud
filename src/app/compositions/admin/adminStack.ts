import type { EditorBlock } from '../../../domain/partners';
import { createPageStack } from '../../../ui/hooks/pageStack';

/** Páginas abertas por cima do painel admin (D33): anúncios e dicas no editor do parceiro (F4). */
export type AdminPage =
  | { view: 'listing-new' }
  | { view: 'listing-editor'; itemId: string }
  | { view: 'listing-block'; itemId: string; block: EditorBlock; title: string }
  | { view: 'listing-publish'; itemId: string }
  | { view: 'tip'; itemId?: string };

export const adminPages = createPageStack<AdminPage>('admin');
