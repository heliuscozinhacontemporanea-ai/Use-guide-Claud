import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { createListingDraftUseCase } from '../../application/usecases/createListingDraftUseCase';
import { LISTING_CATEGORIES } from '../../constants/listingCategories';
import { EMPTY_JOIN_DRAFT, type PartnerJoinDraft } from '../../utils/partnerJoinDraft';
import { PartnerBusinessPage } from './PartnerBusinessPage';

// O perfil de produtor tem entrada própria (Mais e "Também trabalha com…?"): o Catálogo não o oferece.
const PLACE_CATEGORIES = LISTING_CATEGORIES.map((category) => category.id).filter(
  (id) => id !== 'producer'
);

/** Novo estabelecimento pelo Catálogo (F2): "Seu negócio" sem os Termos, já aceitos. */
export function NewListingPage({
  categories = PLACE_CATEGORIES,
  requirePhone = true,
  allowUseGuideName = false,
  laterText,
  createdMessage,
  onCreated,
}: {
  categories?: string[];
  /** O admin cadastra o lugar sem telefone, se não tiver (escolhas da F4). */
  requirePhone?: boolean;
  /** O admin pode usar "Use Guide" no nome (D35, item 10). */
  allowUseGuideName?: boolean;
  laterText?: string;
  /** Aviso depois de criar (o do parceiro manda seguir o guia no Início). */
  createdMessage?: string;
  onCreated: (itemId: string) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const [draft, setDraft] = useState<PartnerJoinDraft>(() => ({
    ...EMPTY_JOIN_DRAFT,
    category: categories.length === 1 ? (categories[0] ?? '') : '',
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const itemId = await createListingDraftUseCase(draft);
      showToast(createdMessage ?? t('partnerGuide.editor.draftCreated'), 'success');
      onCreated(itemId);
    } catch (err) {
      setError(
        err instanceof Error && err.message === 'LISTING_NAME_RESERVED'
          ? t('partnerGuide.join.errors.nameReserved')
          : t('partnerGuide.join.errors.failed')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PartnerBusinessPage
      draft={draft}
      onChange={setDraft}
      onSubmit={() => void submit()}
      onOpenTerms={() => undefined}
      submitting={submitting}
      error={error}
      requireTerms={false}
      requirePhone={requirePhone}
      allowUseGuideName={allowUseGuideName}
      categories={categories}
      submitLabel={t('partnerGuide.editor.createDraft')}
      submittingLabel={t('partnerGuide.editor.creatingDraft')}
      laterText={laterText ?? t('partnerGuide.editor.newLater')}
    />
  );
}
