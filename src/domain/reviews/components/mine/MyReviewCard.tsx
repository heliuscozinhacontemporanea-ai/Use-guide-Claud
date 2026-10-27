import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, type DropdownMenuItem } from '../../../../ui/components/DropdownMenu';
import type { FirestoreReview } from '../../types/review';
import { StarRating } from '../StarRating';

interface MyReviewCardProps {
  review: FirestoreReview;
  title: string;
  onEdit: () => void;
  onDelete: () => void;
  /** Opções a mais no menu "…", montadas por quem usa o cartão. */
  extraMenuItems?: DropdownMenuItem[];
  /** Linha de status abaixo da resposta (ex.: denúncia em análise). */
  footer?: ReactNode;
}

/** Uma avaliação da própria pessoa (D19): lugar, nota, texto, resposta e o menu "…". A data fica no título do grupo. */
export function MyReviewCard({
  review,
  title,
  onEdit,
  onDelete,
  extraMenuItems = [],
  footer,
}: MyReviewCardProps) {
  const { t } = useTranslation();
  return (
    <li className="p-4 rounded-[20px] bg-surface border border-line">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-ink leading-snug break-words">{title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <StarRating rating={review.rating} />
            {review.verifiedAttendance && (
              <span className="text-[13px] text-ink/70">{t('myReviews.verified')}</span>
            )}
          </div>
        </div>
        <DropdownMenu
          trigger={
            <button
              type="button"
              aria-label={t('myReviews.moreOptions')}
              className="press w-11 h-11 -mt-2 -mr-2 shrink-0 rounded-full flex items-center justify-center text-ink/70 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
            >
              <MoreHorizontal size={20} aria-hidden="true" />
            </button>
          }
          items={[
            {
              label: t('myReviews.edit'),
              icon: <Pencil size={16} aria-hidden="true" />,
              onClick: onEdit,
            },
            ...extraMenuItems,
            {
              label: t('myReviews.delete'),
              icon: <Trash2 size={16} aria-hidden="true" />,
              onClick: onDelete,
              destructive: true,
            },
          ]}
        />
      </div>
      <p className="mt-2 text-sm text-ink/80 break-words">{review.comment}</p>
      {review.partnerResponse && (
        <div className="mt-3 p-3 rounded-2xl bg-ink/[0.04]">
          <p className="text-[13px] font-semibold text-ink">{t('myReviews.partnerResponse')}</p>
          <p className="text-[13px] text-ink/70 break-words">{review.partnerResponse}</p>
        </div>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </li>
  );
}
