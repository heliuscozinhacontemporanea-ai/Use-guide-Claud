import { Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { publishPartnerListingUseCase } from '../../application/usecases/publishPartnerListingUseCase';
import { ListingIncompleteError } from '../../errors/listingIncompleteError';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { ListingStep } from '../../types/partnerHome';
import { useListingStepLabels } from './listingStepLabels';

/** Última página do guia (D34): o cartão como vai aparecer, os passos feitos e o publicar. */
export function ListingPublishPage({
  item,
  steps,
  onPublished,
  editLaterText,
}: {
  item: PartnerContentRecord;
  steps: ListingStep[];
  onPublished: () => void;
  /** Onde editar depois (o parceiro edita no Catálogo; o admin, no Guia local). */
  editLaterText?: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const labels = useListingStepLabels(item.category);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const cover = item.images?.[0] || item.image;
  const open = steps.filter((step) => !step.done);

  const publish = async () => {
    setPublishing(true);
    setMessage(null);
    try {
      await publishPartnerListingUseCase(item.id);
      showToast(t('partnerGuide.publish.done'), 'success');
      onPublished();
    } catch (error) {
      setMessage(
        error instanceof ListingIncompleteError
          ? t('partnerGuide.publish.incomplete', {
              steps: error.steps.map((step) => labels.step(step.id)).join(', '),
            })
          : t('partnerGuide.publish.failed')
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="relative mx-auto w-full max-w-[240px] aspect-square rounded-[20px] overflow-hidden bg-ink/[0.06]">
        {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : null}
        <div className="absolute inset-x-0 bottom-0 pt-16 pb-3 px-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-1.5">
          <span className="self-start px-2 py-0.5 rounded-full bg-black/70 text-[11px] font-bold uppercase tracking-[0.04em] text-on-fill">
            {t(`partnerSignup.categories.${item.category}`)}
          </span>
          <span className="text-[17px] font-semibold text-on-fill leading-tight">{item.name}</span>
        </div>
      </div>
      <p className="text-center text-[13px] text-ink/70">{t('partnerGuide.publish.preview')}</p>
      <ul className="space-y-2.5">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-3 text-[15px] text-ink">
            <span
              aria-hidden="true"
              className={
                step.done
                  ? 'w-5 h-5 rounded-full bg-success text-app flex items-center justify-center'
                  : 'w-5 h-5 rounded-full border-2 border-ink/35'
              }
            >
              {step.done ? <Check size={12} strokeWidth={3} /> : null}
            </span>
            {labels.step(step.id)}
          </li>
        ))}
      </ul>
      {message ? (
        <p role="alert">
          <StatusText tone="danger">{message}</StatusText>
        </p>
      ) : null}
      <div className="space-y-2">
        <button
          type="button"
          disabled={publishing || open.length > 0}
          onClick={() => void publish()}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {publishing ? t('partnerGuide.publish.publishing') : t('partnerGuide.publish.button')}
        </button>
        <p className="text-center text-[13px] text-ink/70">
          {open.length > 0
            ? t('partnerGuide.publish.incomplete', {
                steps: open.map((step) => labels.step(step.id)).join(', '),
              })
            : (editLaterText ?? t('partnerGuide.publish.editLater'))}
        </p>
      </div>
    </div>
  );
}
