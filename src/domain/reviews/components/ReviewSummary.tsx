import { useMemo } from 'react';
import { StarRating } from './StarRating';
import { FirestoreReview } from '../types/review';
import { GlassCard } from '../../../ui/components/GlassCard';

interface ReviewSummaryProps {
  rating: number;
  reviewCount: number;
  reviews?: FirestoreReview[];
}

export function ReviewSummary({ rating, reviewCount, reviews = [] }: ReviewSummaryProps) {
  const normalizedRating = Number(Math.max(0, Math.min(5, rating)).toFixed(1));

  const distribution = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      const rounded = Math.round(r.rating);
      if (rounded >= 1 && rounded <= 5) {
        counts[rounded] = (counts[rounded] || 0) + 1;
      }
    }
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: counts[stars] || 0,
      percentage: Math.round(((counts[stars] || 0) / total) * 100),
    }));
  }, [reviews]);

  return (
    <GlassCard className="p-5 bg-white/5 border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-bold text-white">Avaliações</h3>
        <div className="flex items-center gap-2">
          <StarRating rating={normalizedRating} size={16} />
          <span className="font-bold text-sm text-white">{normalizedRating.toFixed(1)}</span>
          <span className="text-white/50 text-xs font-medium">({Math.max(0, reviewCount)})</span>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5">
          {distribution.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3 text-xs">
              <span className="w-12 text-white/50 font-medium shrink-0 flex items-center gap-1">
                <span>{stars}</span>
                <span className="text-[10px]">★</span>
              </span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-white/50 font-medium text-[11px] shrink-0">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
