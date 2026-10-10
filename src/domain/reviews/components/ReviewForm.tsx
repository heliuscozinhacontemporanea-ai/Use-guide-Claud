import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Send } from 'lucide-react';
import { GlassCard } from '../../../ui/components/GlassCard';
import { StarRating } from './StarRating';
import { FirestoreReview } from '../types/review';

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
    <GlassCard className="p-4 bg-white/5 border-white/10">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {existingReview && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs">
            <span className="text-teal-300 font-medium">Você já avaliou este local</span>
            <span className="text-white/50 text-[11px]">Editando sua avaliação</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70 font-medium">Sua nota:</span>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarRating
                rating={field.value}
                size={22}
                interactive
                onRatingChange={field.onChange}
              />
            )}
          />
        </div>
        {errors.rating && <p className="text-xs text-red-300">{errors.rating.message}</p>}
        <div className="relative">
          <textarea
            {...register('comment')}
            maxLength={500}
            placeholder="Conte-nos sua experiência sincera..."
            className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 pr-16 text-sm focus:outline-none focus:border-teal-500/50 transition-colors min-h-[100px] text-white placeholder:text-white/50"
          />
          <span className="absolute bottom-3 right-4 text-[10px] text-white/50">
            {comment.length}/500
          </span>
        </div>
        {errors.comment && <p className="text-xs text-red-300">{errors.comment.message}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[44px] py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>{existingReview ? 'Atualizando...' : 'Publicando...'}</span>
            </>
          ) : existingReview ? (
            <>
              Atualizar Avaliação
              <Send size={15} />
            </>
          ) : (
            <>
              Publicar Avaliação
              <Send size={15} />
            </>
          )}
        </button>
      </form>
    </GlassCard>
  );
}
