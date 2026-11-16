import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { formatPhoneForDisplay } from '../../../../shared/utils/phone';
import { ConfirmDialog } from '../../../../ui/components/ConfirmDialog';
import { ListCard, ListRowAction, ListRowButton } from '../../../../ui/components/ListRows';
import { StatusText } from '../../../../ui/components/StatusText';
import { deletePartnerContentItemUseCase } from '../../application/usecases/deletePartnerContentItemUseCase';
import { getPartnerItemContactUseCase } from '../../application/usecases/getPartnerItemContactUseCase';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { ListingStep, ListingStepId } from '../../types/partnerHome';
import { languageDisplayName } from '../../utils/languageNames';
import { listingSellsThroughApp } from '../../utils/listingSells';
import { useListingStepLabels } from './listingStepLabels';

export type EditorBlock = ListingStepId | 'phone';

const asList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : typeof value === 'string' && value.trim()
      ? [value]
      : [];

/**
 * Editar anúncio (F2): a lista de blocos do estabelecimento, com o resumo e o ✓ (ou o que falta)
 * pela mesma regra do guia. Cada bloco abre a página dele, com "Salvar" na barra.
 */
export function ListingEditorPage({
  item,
  steps,
  publication,
  onOpenBlock,
  onDeleted,
}: {
  item: PartnerContentRecord;
  steps: ListingStep[];
  publication?: 'draft' | 'published';
  onOpenBlock: (block: EditorBlock, title: string) => void;
  onDeleted: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { showToast } = useUI();
  const labels = useListingStepLabels(item.category);
  const [phone, setPhone] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const info = item.operationalInfo ?? {};
  const sells = listingSellsThroughApp(item.category, info.access);

  useEffect(() => {
    let active = true;
    void getPartnerItemContactUseCase(item.id)
      .then(({ phone: current }) => active && setPhone(current))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [item.id]);

  // À direita da linha, como no protótipo aprovado: ✓ ou o que falta, pela regra do guia.
  const status = (id: EditorBlock) => {
    const step = steps.find((entry) => entry.id === id);
    if (!step) return undefined;
    return step.done ? (
      <span className="shrink-0 text-success">
        <Check size={18} aria-hidden="true" />
        <span className="sr-only">{t('partnerGuide.editor.done')}</span>
      </span>
    ) : (
      <span className="max-w-[45%] text-right text-[13px] font-semibold text-warn">
        {/* Com muitos campos, a linha mostra quantos; a página do bloco diz quais. */}
        {step.missing.length > 2
          ? t('partnerGuide.editor.missingCount', { count: step.missing.length })
          : t('partnerGuide.page.missing', { fields: labels.fields(step.missing) })}
      </span>
    );
  };

  const photos = (item.images ?? []).filter(Boolean).length;
  const where = [item.address, item.location].filter(Boolean).join(' · ');
  const phoneText = formatPhoneForDisplay(phone ?? undefined) || t('partnerGuide.editor.empty');
  const blocks: Array<{ id: EditorBlock; title: string; sub: string }> = [
    {
      id: 'name',
      title: t('partnerGuide.editor.name'),
      sub: [item.name, item.city].filter(Boolean).join(' · '),
    },
    {
      id: 'photos',
      title: labels.step('photos'),
      sub: photos
        ? t('partnerGuide.editor.photos', { count: photos })
        : t('partnerGuide.editor.noPhotos'),
    },
    {
      id: 'about',
      title: labels.step('about'),
      sub:
        asList(info.languages)
          .map((language) => languageDisplayName(language, i18n.language))
          .join(', ') || t('partnerGuide.editor.empty'),
    },
    ...(item.category === 'producer'
      ? []
      : [
          {
            id: 'where' as const,
            title: labels.step('where'),
            sub: where || t('partnerGuide.editor.empty'),
          },
          { id: 'details' as const, title: labels.step('details'), sub: '' },
        ]),
    ...(steps.some((step) => step.id === 'contacts')
      ? [
          {
            id: 'contacts' as const,
            title: labels.step('contacts'),
            sub: t('partnerGuide.steps.contactsHint'),
          },
        ]
      : []),
    { id: 'phone', title: t('partnerGuide.editor.phone'), sub: phoneText },
  ];
  const headline =
    item.isActive === false
      ? t('partnerGuide.editor.paused')
      : publication === 'draft'
        ? t('partnerGuide.editor.draft')
        : t('partnerGuide.editor.published');

  const remove = async () => {
    setError(null);
    try {
      await deletePartnerContentItemUseCase(item.id);
      setConfirm(false);
      showToast(t('partnerGuide.editor.deleted'), 'success');
      onDeleted();
    } catch (failure) {
      setConfirm(false);
      // Reserva ativa ou evento ligado prende o anúncio (D34, F2): a tela diz o que fazer.
      const code = failure instanceof Error ? failure.message : '';
      setError(
        code === 'LISTING_HAS_BOOKINGS'
          ? t('partnerGuide.editor.hasBookings')
          : code === 'LISTING_HAS_EVENTS'
            ? t('partnerGuide.editor.hasEvents')
            : t('partnerGuide.editor.deleteFailed')
      );
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <p className="px-1">
        <StatusText tone={publication === 'draft' || item.isActive === false ? 'warn' : 'success'}>
          {headline}
        </StatusText>
      </p>
      <ListCard>
        {blocks.map((block) => (
          <ListRowButton
            key={block.id}
            title={block.title}
            sub={block.sub || undefined}
            aside={status(block.id)}
            onClick={() => onOpenBlock(block.id, block.title)}
          />
        ))}
      </ListCard>
      {sells && item.category !== 'producer' ? (
        <p className="px-1 text-[13px] text-ink/70">{t('partnerGuide.editor.sellsNote')}</p>
      ) : null}
      {error ? (
        <p role="alert">
          <StatusText tone="danger">{error}</StatusText>
        </p>
      ) : null}
      <ListCard>
        <ListRowAction
          label={t('partnerGuide.editor.delete')}
          tone="danger"
          onClick={() => setConfirm(true)}
        />
      </ListCard>
      <ConfirmDialog
        data={
          confirm
            ? {
                title: t('partnerGuide.editor.deleteTitle', { name: item.name }),
                message: t('partnerGuide.editor.deleteMessage'),
                confirmLabel: t('partnerGuide.editor.delete'),
                onConfirm: () => void remove(),
                onCancel: () => setConfirm(false),
              }
            : null
        }
      />
    </div>
  );
}
