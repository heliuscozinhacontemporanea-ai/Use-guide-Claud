import type { EditorBlock, EventEditorSection } from '../../../domain/partners';
import { createPageStack } from '../../../ui/hooks/pageStack';

/** Páginas abertas por cima do painel admin (D33): anúncios, dicas e eventos no editor do parceiro (F4). */
export type AdminPage =
  | { view: 'listing-new' }
  | { view: 'listing-editor'; itemId: string }
  | { view: 'listing-block'; itemId: string; block: EditorBlock; title: string }
  | { view: 'listing-publish'; itemId: string }
  | { view: 'tip'; itemId?: string }
  | { view: 'event' }
  | { view: 'event-section'; section: EventEditorSection; title: string };

export const adminPages = createPageStack<AdminPage>('admin');
