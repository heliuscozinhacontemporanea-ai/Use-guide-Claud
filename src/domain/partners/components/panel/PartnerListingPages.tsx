import type { PanelPage } from '../../hooks/usePanelNavigation';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { ListingStep, PartnerEstablishment } from '../../types/partnerHome';
import { type EditorBlock, ListingEditorPage } from '../guide/ListingEditorPage';
import { ListingPublishPage } from '../guide/ListingPublishPage';
import { ListingStepPage } from '../guide/ListingStepPage';
import { NewListingPage } from '../join/NewListingPage';

/** O que as páginas do anúncio precisam do painel (guia do Início e editor do Catálogo, D34). */
export interface ListingPagesContext {
  items: PartnerContentRecord[];
  establishments: PartnerEstablishment[];
  /** Passos do anúncio que o guia do Início acompanha. */
  listingSteps: ListingStep[];
  /** A página do bloco entrega à barra a ação de salvar. */
  registerListingSave: (save: (() => void) | null) => void;
  /** Bloco salvo ou anúncio publicado: o Início recarrega e a página fecha. */
  onListingDone: () => void;
  onOpenListingBlock: (itemId: string, block: EditorBlock, title: string) => void;
  onListingDeleted: (itemId: string) => void;
  onListingCreated: (itemId: string) => void;
}

/**
 * Um bloco do anúncio: pelo guia do Início (com "Passo X de N") ou pelo editor (F2). O item vem do
 * catálogo do dono, já carregado no painel.
 */
export function ListingBlockPage({
  page,
  context,
}: {
  page: Extract<PanelPage, { view: 'listing-step' }>;
  context: ListingPagesContext;
}) {
  const item = context.items.find((entry) => entry.id === page.itemId);
  if (!item) return null;
  const editor = page.from === 'editor';
  const steps = editor
    ? (context.establishments.find((entry) => entry.id === item.id)?.setupSteps ?? [])
    : context.listingSteps;
  if (page.step === 'publish') {
    return <ListingPublishPage item={item} steps={steps} onPublished={context.onListingDone} />;
  }
  return (
    <ListingStepPage
      key={`${item.id}-${page.step}`}
      item={item}
      step={page.step}
      steps={steps}
      mode={editor ? 'editor' : 'guide'}
      registerSave={context.registerListingSave}
      onSaved={context.onListingDone}
    />
  );
}

/** Editar anúncio (F2): a lista de blocos do estabelecimento. */
export function ListingEditorPanelPage({
  page,
  context,
}: {
  page: Extract<PanelPage, { view: 'listing-editor' }>;
  context: ListingPagesContext;
}) {
  const item = context.items.find((entry) => entry.id === page.itemId);
  if (!item) return null;
  const establishment = context.establishments.find((entry) => entry.id === item.id);
  return (
    <ListingEditorPage
      item={item}
      steps={establishment?.setupSteps ?? []}
      publication={establishment?.publication}
      onOpenBlock={(block, title) => context.onOpenListingBlock(item.id, block, title)}
      onDeleted={() => context.onListingDeleted(item.id)}
    />
  );
}

/** Novo estabelecimento pelo Catálogo (F2): nasce como rascunho, com o guia no Início. */
export function NewListingPanelPage({
  page,
  context,
}: {
  page: Extract<PanelPage, { view: 'listing-new' }>;
  context: ListingPagesContext;
}) {
  return <NewListingPage categories={page.categories} onCreated={context.onListingCreated} />;
}
