import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { SubscriptionPlan } from '../../types/partner';

export type ListingPlanChoice = SubscriptionPlan['id'];

interface ListingPlanOptionsProps {
  plans: SubscriptionPlan[];
  trialAvailable: boolean;
  selected: ListingPlanChoice | null;
  onSelect: (choice: ListingPlanChoice) => void;
}

const optionClass = (isSelected: boolean) =>
  cn(
    'press w-full min-h-[56px] p-4 rounded-2xl border text-left flex items-center justify-between gap-3 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50',
    isSelected
      ? 'bg-accent-soft border-accent-line'
      : 'bg-white/5 border-white/10 hover:bg-white/10'
  );

/** Períodos do plano; o preço vem do catálogo do admin, e o backend recalcula ao cobrar (§8.5). */
export function ListingPlanOptions({
  plans,
  trialAvailable,
  selected,
  onSelect,
}: ListingPlanOptionsProps) {
  const { t, i18n } = useTranslation();
  const paidPlans = plans.filter((plan) => plan.id !== 'trial' && plan.isActive !== false);

  return (
    <fieldset className="space-y-2.5">
      <legend className="text-xs font-bold text-white/80 mb-2">
        {t('listingPlan.options.title')}
      </legend>
      {trialAvailable && (
        <button
          type="button"
          aria-pressed={selected === 'trial'}
          onClick={() => onSelect('trial')}
          className={optionClass(selected === 'trial')}
        >
          <span>
            <span className="block text-xs font-bold text-white">
              {t('listingPlan.options.trialName')}
            </span>
            <span className="block text-[11px] text-white/60 mt-0.5">
              {t('listingPlan.options.trialHint')}
            </span>
          </span>
          <span className="text-sm font-black text-accent">{t('listingPlan.options.free')}</span>
        </button>
      )}
      {paidPlans.length === 0 ? (
        <p className="text-xs text-white/60">{t('listingPlan.options.empty')}</p>
      ) : (
        paidPlans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            aria-pressed={selected === plan.id}
            onClick={() => onSelect(plan.id)}
            className={optionClass(selected === plan.id)}
          >
            <span className="min-w-0">
              <span className="block text-xs font-bold text-white">{plan.name}</span>
              {plan.description && (
                <span className="block text-[11px] text-white/60 mt-0.5">{plan.description}</span>
              )}
            </span>
            <span className="text-right shrink-0">
              <span className="block text-sm font-black text-accent">
                {formatMoneyMinor(plan.priceMinor, i18n.language)}
              </span>
              {plan.monthlyEquivalentMinor ? (
                <span className="block text-[10px] text-white/60">
                  {t('listingPlan.options.perMonth', {
                    amount: formatMoneyMinor(plan.monthlyEquivalentMinor, i18n.language),
                  })}
                </span>
              ) : null}
            </span>
          </button>
        ))
      )}
    </fieldset>
  );
}
