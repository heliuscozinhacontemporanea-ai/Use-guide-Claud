import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { BUTTON_PRIMARY, INPUT } from '../../../ui/styles/controls';
import { FirestoreReview } from '../types/review';
import { StarRating } from './StarRating';

const reviewFormSchema = z.object({
  rating: z.number().int().min(1, 'Selecione uma nota'),
  comment: z
    .string()
    .trim()
    .min(1, 'Escreva um comentário sobre sua experiência')
    .max(500, 'O comentário deve possuir no máximo 500 caracteres'),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  existingReview: FirestoreReview | null;
  isSubmitting: boolean;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function ReviewForm({ existingReview, isSubmitting, onSubmit }: ReviewFormProps) {
  const { t } = useTranslation();
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? '',
    },
  });

  useEffect(() => {
    if (existingReview) {
      reset({
        rating: existingReview.rating ?? 0,
        comment: existingReview.comment ?? '',
      });
    }
  }, [existingReview, reset]);

  const comment = watch('comment') || '';

  const submit = async (data: ReviewFormData) => {
    await onSubmit(data.rating, data.comment);
    reset(data);
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="rounded-[20px] bg-surface border border-line p-4 space-y-3"
    >
      {existingReview && (
        <p className="text-[13px] text-ink/70">
          {t('reviewsUi.alreadyReviewed')} · {t('reviewsUi.editing')}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-semibold text-ink">{t('reviewsUi.yourRating')}</span>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarRating
              rating={field.value}
              size={26}
              interactive
              onRatingChange={field.onChange}
            />
          )}
        />
      </div>
      {errors.rating && <p className="text-[13px] text-danger">{errors.rating.message}</p>}
      <div className="relative">
        <textarea
          {...register('comment')}
          maxLength={500}
          aria-label={t('reviewsUi.placeholder')}
          placeholder={t('reviewsUi.placeholder')}
          className={`${INPUT} min-h-[110px] py-3 pr-14 resize-none text-[15px]`}
        />
        <span className="absolute bottom-3 right-4 text-[12px] text-ink/60 tabular-nums">
          {comment.length}/500
        </span>
      </div>
      {errors.comment && <p className="text-[13px] text-danger">{errors.comment.message}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${BUTTON_PRIMARY} w-full min-h-12 inline-flex items-center justify-center gap-2`}
      >
        {isSubmitting && (
          <Loader2
            size={16}
            className="animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
        {t(existingReview ? 'reviewsUi.update' : 'reviewsUi.submit')}
      </button>
    </form>
  );
}
