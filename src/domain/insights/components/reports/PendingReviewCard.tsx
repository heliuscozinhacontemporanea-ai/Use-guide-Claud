import { MessageSquare, Send, Star } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { cn } from '../../../../shared/utils/cn';
import { respondToReviewUseCase } from '../../../reviews';
import type { PartnerReview } from '../../types/report';
import { formatReviewDate } from '../../utils/reviewDate';

interface PendingReviewCardProps {
  review: PartnerReview;
  onReplied: (reviewId: string, response: string) => void;
}

export function PendingReviewCard({ review, onReplied }: PendingReviewCardProps) {
  const { t, i18n } = useTranslation();
  const { showToast } = useUI();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const cancel = () => {
    setReplying(false);
    setReplyText('');
  };

  const send = async () => {
    const response = replyText.trim();
    if (!response) return;
    setSending(true);
    try {
      await respondToReviewUseCase(review.id, response);
      onReplied(review.id, response);
      cancel();
    } catch {
      showToast(t('insights.reviews.replyError'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 shrink-0 rounded-full bg-warn-soft flex items-center justify-center text-warn text-xs font-bold"
            aria-hidden="true"
          >
            {review.userName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white mb-0.5 truncate">
              {review.userName}
            </div>
            <div
              className="flex gap-0.5"
              role="img"
              aria-label={t('insights.reviews.rating', { rating: review.rating })}
            >
              {Array.from({ length: 5 }, (_, star) => (
                <Star
                  key={star}
                  size={8}
                  aria-hidden="true"
                  className={cn(
                    star < review.rating ? 'text-warn fill-amber-400' : 'text-white/20'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-[9px] text-white/60 font-bold tracking-wide shrink-0">
          {formatReviewDate(review.createdAt, i18n.language)}
        </div>
      </div>
      <p className="text-xs text-white/60 leading-relaxed italic">"{review.comment}"</p>

      {replying ? (
        <div className="space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={t('insights.reviews.replyPlaceholder')}
            aria-label={t('insights.reviews.replyLabel', { name: review.userName })}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white h-24 resize-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={send}
              disabled={sending || !replyText.trim()}
              className="press flex-1 min-h-[44px] bg-amber-500 text-black py-2.5 rounded-xl text-[9px] font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <Send size={12} aria-hidden="true" /> {t('insights.reviews.send')}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="press px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 text-[9px] font-semibold tracking-wide text-white/60 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('insights.reviews.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setReplying(true)}
          className="press text-[9px] font-bold tracking-wide text-warn hover:text-warn flex items-center gap-1.5 min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <MessageSquare size={12} aria-hidden="true" /> {t('insights.reviews.reply')}
        </button>
      )}
    </div>
  );
}
