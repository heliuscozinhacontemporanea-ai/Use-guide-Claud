import { Check, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import type { PartnerFirstStep, PartnerFirstSteps } from '../../types/partnerHome';

/**
 * Primeiros passos dentro do "Resolva agora" (painel por segmento): barra de progresso e os passos
 * que abrem a tela certa. Some quando está tudo pronto.
 */
export function PartnerFirstStepsCard({
  data,
  onOpen,
}: {
  data: PartnerFirstSteps;
  onOpen: (step: PartnerFirstStep) => void;
}) {
  const { t } = useTranslation();
  const done = data.steps.filter((step) => step.done).length;
  const total = data.steps.length;
  const showcase = data.title === 'complete';
  const title =
    data.title === 'prepare'
      ? t('partnerFirstSteps.title.prepare')
      : t(`partnerFirstSteps.title.${data.title}_${data.segment}`);

  const label = (step: PartnerFirstStep) => {
    if (step.id === 'offer') {
      return {
        title: t(`partnerFirstSteps.offer.${step.done ? 'done' : 'title'}_${data.segment}`),
        hint: t(`partnerFirstSteps.offer.hint_${data.segment}`),
      };
    }
    const hint =
      step.id === 'verify'
        ? step.state === 'pending'
          ? t('partnerFirstSteps.verify.pending')
          : showcase
            ? t('partnerFirstSteps.verify.hintShowcase')
            : t('partnerFirstSteps.verify.hint')
        : step.id === 'account' && step.state === 'locked'
          ? t('partnerFirstSteps.account.locked')
          : t(`partnerFirstSteps.${step.id}.hint`);
    return {
      title: t(`partnerFirstSteps.${step.id}.${step.done ? 'done' : 'title'}`),
      hint,
    };
  };

  return (
    <div
      className="rounded-[20px] bg-surface border border-line overflow-hidden"
      data-tour="first-steps"
    >
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          <span className="text-[14px] text-ink/70 tabular-nums">
            {t('partnerFirstSteps.progress', { done, total })}
          </span>
        </div>
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
            style={{ width: `${Math.max(4, (done / total) * 100)}%` }}
          />
        </div>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {data.steps.map((step) => {
          const text = label(step);
          const blocked = step.done || step.state === 'locked' || step.state === 'pending';
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={blocked}
                onClick={() => onOpen(step)}
                className="press w-full px-4 py-3 min-h-14 flex items-center gap-3 text-left disabled:cursor-default focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-[22px] h-[22px] shrink-0 rounded-full flex items-center justify-center',
                    step.done ? 'bg-success text-app' : 'border-2 border-ink/35'
                  )}
                >
                  {step.done && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="flex-1 min-w-0">
                  <span
                    className={cn(
                      'block text-[15px]',
                      step.done ? 'text-ink/70' : 'font-semibold text-ink'
                    )}
                  >
                    {text.title}
                  </span>
                  {!step.done && <span className="block text-[13px] text-ink/70">{text.hint}</span>}
                </span>
                {!blocked && (
                  <ChevronRight size={18} className="shrink-0 text-ink/60" aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
