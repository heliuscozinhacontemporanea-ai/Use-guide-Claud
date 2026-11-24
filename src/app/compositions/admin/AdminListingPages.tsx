import { useTranslation } from 'react-i18next';
import { useAdminListingView } from '../../../domain/admin';
import {
  type EditorBlock,
  ListingPublishPage,
  ListingStepPage,
  NewListingPage,
} from '../../../domain/partners';
import { ListError, ListLoading } from '../../../ui/components/ListState';
import {
  bumpAdminListingVersion,
  useAdminGuideItems,
  useAdminListingVersion,
} from './adminGuideStore';
import { toListingRecord } from './adminListingRecord';
import { adminPages } from './adminStack';

// O admin cadastra lugares de todas as categorias (escolhas da F4); o perfil de produtor é do parceiro.
const PLACE_CATEGORIES = ['hotel', 'restaurant', 'sight', 'tour', 'transfer', 'rental'];

/** Volta para o editor e relê os passos (bloco salvo ou anúncio publicado). */
function done() {
  bumpAdminListingVersion();
  adminPages.back();
}

function useListing(itemId: string) {
  const item = useAdminGuideItems().find((entry) => entry.id === itemId);
  const { view, failed } = useAdminListingView(itemId, useAdminListingVersion());
  return { item, view, failed };
}

/** "Seu negócio" do parceiro sem os Termos e com o telefone opcional (escolhas da F4). */
export function AdminNewListingPage() {
  const { t } = useTranslation();
  return (
    <NewListingPage
      categories={PLACE_CATEGORIES}
      requirePhone={false}
      allowUseGuideName
      laterText={t('adminPanel.guide.newLater')}
      createdMessage={t('adminPanel.guide.created')}
      onCreated={(itemId) => adminPages.replace({ view: 'listing-editor', itemId })}
    />
  );
}

/** Um bloco do anúncio, a mesma página do editor do parceiro. */
export function AdminListingBlockPage({
  itemId,
  block,
  registerSave,
}: {
  itemId: string;
  block: EditorBlock;
  registerSave: (save: (() => void) | null) => void;
}) {
  const { t } = useTranslation();
  const { item, view, failed } = useListing(itemId);
  if (failed) {
    return (
      <ListError message={t('adminPanel.guide.listingError')} onRetry={bumpAdminListingVersion} />
    );
  }
  if (!item || !view) return <ListLoading label={t('adminPanel.guide.loading')} />;
  return (
    <ListingStepPage
      key={`${itemId}-${block}`}
      item={toListingRecord(item)}
      step={block}
      steps={view.setupSteps}
      mode="editor"
      registerSave={registerSave}
      onSaved={done}
    />
  );
}

/** Publicar: o cartão, os passos que liberam (o mínimo no anúncio do Use Guide) e o botão. */
export function AdminListingPublishPage({ itemId }: { itemId: string }) {
  const { t } = useTranslation();
  const { item, view, failed } = useListing(itemId);
  if (failed) {
    return (
      <ListError message={t('adminPanel.guide.listingError')} onRetry={bumpAdminListingVersion} />
    );
  }
  if (!item || !view) return <ListLoading label={t('adminPanel.guide.loading')} />;
  return (
    <ListingPublishPage
      item={toListingRecord(item)}
      steps={view.publishSteps}
      onPublished={done}
      editLaterText={t('adminPanel.guide.editLater')}
    />
  );
}
