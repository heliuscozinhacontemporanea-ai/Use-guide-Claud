import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
import { type EditReviewForm, editReviewSchema } from '../../schemas/editReviewSchema';
import type { FirestoreReview } from '../../types/review';
import { StarRating } from '../StarRating';

interface EditReviewSheetProps {
  review: FirestoreReview;
  title: string;
  onClose: () => void;
  onSave: (rating: number, comment: string) => Promise<void>;
}

/** Folha para editar nota e texto; salvar grava por cima da mesma avaliação. */
export function EditReviewSheet({ review, title, onClose, onSave }: EditReviewSheetProps) {
  const { t } = useTranslation();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditReviewForm>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: { rating: review.rating, comment: review.comment },
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('myReviews.editTitle')}
      description={title}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit((data) => onSave(data.rating, data.comment))}
      >
        <fieldset>
          <legend className="text-[13px] font-semibold text-ink/70 mb-1">
            {t('myReviews.ratingLabel')}
          </legend>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <StarRating
                rating={field.value}
                size={26}
                interactive
                onRatingChange={field.onChange}
              />
            )}
          />
          {errors.rating?.message && (
            <p role="alert" className="mt-1 text-xs text-danger">
              {t(errors.rating.message)}
            </p>
          )}
        </fieldset>
        <label className="block">
          <span className="block text-[13px] font-semibold text-ink/70 mb-1">
            {t('myReviews.commentLabel')}
          </span>
          <textarea
            {...register('comment')}
            rows={4}
            maxLength={500}
            className={`${INPUT} min-h-28 py-2.5`}
          />
          {errors.comment?.message && (
            <span role="alert" className="mt-1 block text-xs text-danger">
              {t(errors.comment.message)}
            </span>
          )}
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${BUTTON_PRIMARY} w-full min-h-12`}
        >
          {isSubmitting ? t('myReviews.saving') : t('myReviews.save')}
        </button>
      </form>
    </Dialog>
  );
}
