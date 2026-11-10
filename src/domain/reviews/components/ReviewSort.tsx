import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import type { ReviewSortOption } from '../types/review';

const OPTIONS: ReviewSortOption[] = ['recent', 'highest', 'lowest'];

export function ReviewSort({
  value,
  onChange,
}: {
  value: ReviewSortOption;
  onChange: (value: ReviewSortOption) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {OPTIONS.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={cn(
              'press shrink-0 min-h-11 px-4 rounded-xl border text-[14px] font-medium focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
              active
                ? 'bg-accent-soft border-teal-400 text-accent'
                : 'bg-surface border-line text-ink/80'
            )}
          >
            {t(`reviewsUi.sort.${option}`)}
          </button>
        );
      })}
    </div>
  );
}
