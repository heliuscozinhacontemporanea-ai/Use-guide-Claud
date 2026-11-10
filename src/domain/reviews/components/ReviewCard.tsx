import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FirestoreReview } from '../types/review';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  userName: string;
  rating: number;
  comment: string;
  createdAt: FirestoreReview['createdAt'];
  partnerResponse?: string | null;
  verified?: boolean;
}

function toDate(value: FirestoreReview['createdAt'] | { toDate?: () => Date }): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Avaliação no anúncio: nome, selo de experiência verificada, mês, estrelas, texto e resposta. */
export function ReviewCard({
  userName,
  rating,
  comment,
  createdAt,
  partnerResponse,
  verified,
}: ReviewCardProps) {
  const { t, i18n } = useTranslation();
  const date = toDate(createdAt);
  return (
    <article className="rounded-[20px] bg-surface border border-line p-4 space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-[15px] font-semibold text-ink break-words">
          {userName}
          {verified && (
            <span className="ml-2 inline-flex items-center gap-1 text-[13px] font-medium text-success">
              <Check size={13} aria-hidden="true" />
              {t('reviewsUi.verified')}
            </span>
          )}
        </p>
        {date && (
          <span className="shrink-0 text-[13px] text-ink/60">
            {new Intl.DateTimeFormat(i18n.language, { month: 'short', year: 'numeric' }).format(
              date
            )}
          </span>
        )}
      </div>
      <StarRating rating={rating} size={15} />
      <p className="text-[14px] text-ink/80 leading-relaxed break-words">{comment}</p>
      {partnerResponse && (
        <p className="mt-2 pl-3 border-l-2 border-line text-[14px] text-ink/75 leading-relaxed break-words">
          <span className="font-semibold text-ink">{t('reviewsUi.partnerReply')}</span>{' '}
          {partnerResponse}
        </p>
      )}
    </article>
  );
}
