import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

/** Progresso do cadastro: barras no roxo do parceiro e "2 de 5" (produtor tem 3 passos). */
export function StepNavigation({
  category,
  currentStep,
}: {
  category: string;
  currentStep: number;
}) {
  const { t } = useTranslation();
  const steps = category === 'producer' ? [1, 2, 5] : [1, 2, 3, 4, 5];
  const position = Math.max(0, steps.indexOf(currentStep)) + 1;
  return (
    <div className="mt-1.5 flex items-center gap-2" id="step-navigation-indicators">
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {steps.map((step, index) => (
          <span
            key={step}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none',
              index < position ? 'bg-partner' : 'bg-ink/10'
            )}
            id={`step-indicator-${step}`}
          />
        ))}
      </div>
      <span className="text-[13px] text-ink/70 tabular-nums">
        {t('partnerSignup.form.step', { current: position, total: steps.length })}
      </span>
    </div>
  );
}
