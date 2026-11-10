import { useTranslation } from 'react-i18next';
import { StarRating } from './StarRating';

interface ReviewSummaryProps {
  rating: number;
  reviewCount: number;
}

/** Cabeçalho das avaliações do anúncio: título, estrelas, nota e total (print de 2026-11-10). */
export function ReviewSummary({ rating, reviewCount }: ReviewSummaryProps) {
  const { t, i18n } = useTranslation();
  const normalized = Math.max(0, Math.min(5, rating));
  return (
    <div className="rounded-[20px] bg-surface border border-line px-4 py-3.5 flex items-center justify-between gap-3">
      <h2 className="font-display text-[20px] font-bold text-ink">{t('reviewsUi.title')}</h2>
      <div className="flex items-center gap-2">
        <StarRating rating={normalized} size={16} />
        <span className="text-[15px] font-bold text-ink">
          {new Intl.NumberFormat(i18n.language, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }).format(normalized)}
        </span>
        <span className="text-[13px] text-ink/70">({Math.max(0, reviewCount)})</span>
      </div>
    </div>
  );
}
