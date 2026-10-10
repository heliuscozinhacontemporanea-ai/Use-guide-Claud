import { Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { ReviewSortOption } from '../types/review';

interface ReviewSortProps {
  value: ReviewSortOption;
  onChange: (value: ReviewSortOption) => void;
}

export function ReviewSort({ value, onChange }: ReviewSortProps) {
  const options = [
    {
      value: 'recent' as const,
      label: 'Mais recentes',
      icon: Clock,
    },
    {
      value: 'highest' as const,
      label: 'Melhor avaliadas',
      icon: TrendingUp,
    },
    {
      value: 'lowest' as const,
      label: 'Menores notas',
      icon: TrendingDown,
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {options.map(({ value: optionValue, label, icon: Icon }) => {
        const active = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            aria-pressed={active}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium border transition-all shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
              active
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/10'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
