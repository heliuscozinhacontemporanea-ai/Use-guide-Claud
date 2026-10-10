import { Star } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  inactiveColorClass?: string;
}

export function StarRating({
  rating,
  size = 14,
  interactive = false,
  onRatingChange,
  inactiveColorClass = 'text-white/50',
}: StarRatingProps) {
  if (interactive) {
    return (
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Avaliação por estrelas"
      >
        {[1, 2, 3, 4, 5].map((s) => {
          const isSelected = s <= rating;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onRatingChange?.(s)}
              className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/5 active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all"
              aria-label={`Avaliar com ${s} ${s === 1 ? 'estrela' : 'estrelas'}`}
              aria-checked={isSelected}
              role="radio"
            >
              <Star
                size={size}
                fill={isSelected ? 'currentColor' : 'none'}
                className={cn(
                  'transition-colors',
                  isSelected ? 'text-yellow-400' : 'text-white/50'
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Nota ${rating} de 5`} role="img">
      {[1, 2, 3, 4, 5].map((s) => {
        const fillPercent = Math.max(0, Math.min(100, (rating - (s - 1)) * 100));

        if (fillPercent >= 100) {
          return (
            <Star key={s} size={size} fill="currentColor" className="text-yellow-400 shrink-0" />
          );
        }

        if (fillPercent <= 0) {
          return (
            <Star key={s} size={size} fill="none" className={cn('shrink-0', inactiveColorClass)} />
          );
        }

        return (
          <div
            key={s}
            className="relative inline-block shrink-0"
            style={{ width: size, height: size }}
          >
            <Star size={size} fill="none" className={cn('absolute inset-0', inactiveColorClass)} />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fillPercent}%`, height: size }}
            >
              <Star size={size} fill="currentColor" className="text-yellow-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
