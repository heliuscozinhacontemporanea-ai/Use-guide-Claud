import { Check, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import type {
  FirstStepSegment,
  ListingStepId,
  PartnerFirstStep,
  PartnerFirstSteps,
} from '../../types/partnerHome';

const CATEGORY_OF: Record<FirstStepSegment, string> = {
  tours: 'tour',
  rentals: 'rental',
  transfers: 'transfer',
  events: 'producer',
  attraction: 'sight',
  lodging: 'hotel',
  restaurant: 'restaurant',
};

interface Row {
  key: string;
  title: string;
  hint?: string;
  done: boolean;
  /** Bloqueado: o motivo aparece no lugar da seta. */
  lockedHint?: string;
  /** Bloqueado sem motivo à direita (ex.: verificação em análise, já dita na linha). */
  waiting?: boolean;
  onOpen?: () => void;
}

/**
 * Guia de passos no "Resolva agora" (D34): o anúncio que o dono monta ("Para aparecer no guia",
 * com o rascunho e o publicar) e o que falta para vender. Some quando está tudo pronto.
 */
export function PartnerListingGuideCard({
  data,
  onOpenListingStep,
  onOpenStep,
}: {
  data: PartnerFirstSteps;
  onOpenListingStep: (step: ListingStepId | 'publish', title: string) => void;
  onOpenStep: (step: PartnerFirstStep) => void;
}) {
  const { t } = useTranslation();
  const { listing, segment } = data;
  const category = CATEGORY_OF[segment];
  const producer = segment === 'events';
  const draft = listing.publication === 'draft';
  const listingOpen = draft || listing.steps.some((step) => !step.done);
  const showcase = data.title === 'complete';

  const stepTitle = (id: ListingStepId) =>
    id === 'name' && producer
      ? t('partnerGuide.steps.nameProducer')
      : id === 'details'
        ? t(`partnerGuide.steps.details_${category}`, {
            defaultValue: t('partnerGuide.steps.details'),
          })
        : t(`partnerGuide.steps.${id}`);

  const listingRows: Row[] = listing.steps.map((step) => ({
    key: step.id,
    title: stepTitle(step.id),
    hint: step.id === 'contacts' ? t('partnerGuide.steps.contactsHint') : undefined,
    done: step.done,
    onOpen: step.id === 'name' ? undefined : () => onOpenListingStep(step.id, stepTitle(step.id)),
  }));
  const allListingDone = listing.steps.every((step) => step.done);
  const publishRow: Row = {
    key: 'publish',
    title: t('partnerGuide.card.publish'),
    done: false,
    lockedHint: allListingDone ? undefined : t('partnerGuide.card.publishLocked'),
    onOpen: () => onOpenListingStep('publish', t('partnerGuide.publish.title')),
  };

  const sellRow = (step: PartnerFirstStep): Row => {
    if (step.id === 'slots') {
      return {
        key: step.id,
        title: t(step.done ? 'partnerGuide.card.slots.done' : 'partnerGuide.card.slots.title'),
        hint: t('partnerGuide.card.slots.hint'),
        done: step.done,
        lockedHint: step.state === 'locked' ? t('partnerGuide.card.slots.locked') : undefined,
        onOpen: () => onOpenStep(step),
      };
    }
    if (step.id === 'offer') {
      return {
        key: step.id,
        title: t(`partnerFirstSteps.offer.${step.done ? 'done' : 'title'}_${segment}`),
        hint: t(`partnerFirstSteps.offer.hint_${segment}`),
        done: step.done,
        onOpen: () => onOpenStep(step),
      };
    }
    const hint =
      step.id === 'verify'
        ? step.state === 'pending'
          ? t('partnerFirstSteps.verify.pending')
          : showcase
            ? t('partnerFirstSteps.verify.hintShowcase')
            : t('partnerFirstSteps.verify.hint')
        : t(`partnerFirstSteps.${step.id}.hint`);
    return {
      key: step.id,
      title: t(`partnerFirstSteps.${step.id}.${step.done ? 'done' : 'title'}`),
      hint,
      done: step.done,
      lockedHint:
        step.state === 'locked' && step.id === 'account'
          ? t('partnerFirstSteps.account.locked')
          : undefined,
      waiting: step.state === 'pending',
      onOpen: () => onOpenStep(step),
    };
  };

  const guideRows = producer
    ? listingRows
    : listingOpen
      ? [...listingRows, ...(draft ? [publishRow] : [])]
      : [];
  const sellRows = data.steps.map(sellRow);
  const counted = [...guideRows, ...sellRows];
  const done = counted.filter((row) => row.done).length;
  const total = counted.length;
  const next = counted.find((row) => !row.done && !row.lockedHint && !row.waiting && row.onOpen);

  const title = producer
    ? t(
        data.title === 'prepare'
          ? 'partnerFirstSteps.title.prepare'
          : `partnerFirstSteps.title.${data.title}_${segment}`
      )
    : draft
      ? t('partnerGuide.card.listing')
      : listingOpen
        ? t('partnerGuide.card.complete')
        : t(
            data.title === 'prepare'
              ? 'partnerFirstSteps.title.prepare'
              : `partnerFirstSteps.title.${data.title}_${segment}`
          );

  const renderRows = (rows: Row[]) => (
    <ul className="divide-y divide-line border-t border-line">
      {rows.map((row) => {
        const isNext = row === next;
        const blocked = row.done || Boolean(row.lockedHint) || row.waiting || !row.onOpen;
        return (
          <li key={row.key}>
            <button
              type="button"
              disabled={blocked}
              onClick={row.onOpen}
              aria-label={row.done ? t('partnerGuide.card.done', { step: row.title }) : undefined}
              className={cn(
                'press w-full px-4 py-3 min-h-14 flex items-center gap-3 text-left disabled:cursor-default focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50',
                isNext && 'bg-partner-soft'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'w-[22px] h-[22px] shrink-0 rounded-full flex items-center justify-center',
                  row.done
                    ? 'bg-success text-app'
                    : isNext
                      ? 'border-2 border-partner'
                      : 'border-2 border-ink/35'
                )}
              >
                {row.done && <Check size={14} strokeWidth={3} />}
              </span>
              <span className="flex-1 min-w-0">
                <span
                  className={cn(
                    'block text-[15px]',
                    row.done ? 'text-ink/70' : 'font-semibold text-ink'
                  )}
                >
                  {row.title}
                </span>
                {!row.done && row.hint ? (
                  <span className="block text-[13px] text-ink/70">{row.hint}</span>
                ) : null}
              </span>
              {isNext ? (
                <span className="shrink-0 text-[13px] font-semibold text-partner">
                  {t('partnerGuide.card.continue')}
                </span>
              ) : row.lockedHint ? (
                <span className="shrink-0 max-w-[45%] text-right text-[12px] text-ink/60">
                  {row.lockedHint}
                </span>
              ) : !blocked ? (
                <ChevronRight size={18} className="shrink-0 text-ink/60" aria-hidden="true" />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const groupLabel = (text: string) => (
    <p className="px-4 pt-3 pb-1.5 border-t border-line text-[12px] font-medium uppercase tracking-[0.07em] text-ink/60">
      {text}
    </p>
  );

  return (
    <div className="rounded-[20px] bg-surface border border-line overflow-hidden">
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 text-[15px] font-semibold text-ink">
            {title}
            {draft && !producer ? (
              <span className="ml-2 align-middle inline-block px-2 py-0.5 rounded-full bg-warn-soft text-warn text-[11.5px] font-semibold">
                {t('partnerGuide.draft')}
              </span>
            ) : null}
          </h3>
          <span className="text-[14px] text-ink/70 tabular-nums">
            {t('partnerFirstSteps.progress', { done, total })}
          </span>
        </div>
        {producer ? null : (
          <p className="mt-0.5 text-[13px] text-ink/70 truncate">{listing.name}</p>
        )}
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          aria-label={title}
          className="mt-2.5 h-1.5 rounded-full bg-ink/10 overflow-hidden"
        >
          <span
            className="block h-full rounded-full bg-teal-400 transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${Math.max(4, (done / Math.max(1, total)) * 100)}%` }}
          />
        </div>
      </div>
      {guideRows.length > 0 ? (
        <>
          {producer ? null : groupLabel(t('partnerGuide.card.toGuide'))}
          {renderRows(guideRows)}
        </>
      ) : null}
      {sellRows.length > 0 ? (
        <>
          {groupLabel(showcase ? t('partnerGuide.card.seal') : t('partnerGuide.card.toSell'))}
          {renderRows(sellRows)}
        </>
      ) : null}
    </div>
  );
}
