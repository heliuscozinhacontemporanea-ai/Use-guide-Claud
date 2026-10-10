import { useState } from 'react';
import { User } from 'lucide-react';
import { GlassCard } from '../../../ui/components/GlassCard';
import { FirestoreReview } from '../types/review';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  userName: string;
  userPhoto?: string | null;
  rating: number;
  comment: string;
  createdAt: FirestoreReview['createdAt'];
  partnerResponse?: string | null;
}

export function ReviewCard({
  userName,
  userPhoto,
  rating,
  comment,
  createdAt,
  partnerResponse,
}: ReviewCardProps) {
  const [imageError, setImageError] = useState(false);
  const relativeDate = formatRelativeTime(createdAt);

  return (
    <GlassCard className="p-4 bg-white/5 border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full glassmorphism flex items-center justify-center overflow-hidden border border-white/10 shrink-0 bg-white/5">
            {userPhoto && !imageError ? (
              <img
                src={userPhoto}
                alt={userName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
              />
            ) : (
              <User size={18} className="text-white/50" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm tracking-tight text-white truncate">{userName}</p>
            <p className="text-xs text-white/50 font-medium">{relativeDate}</p>
          </div>
        </div>
        <div className="shrink-0 pt-0.5">
          <StarRating rating={rating} size={14} />
        </div>
      </div>

      <p className="text-sm text-white/80 leading-relaxed font-normal pl-0 sm:pl-12 mt-2 break-words">
        {comment}
      </p>

      {partnerResponse && (
        <div className="mt-3 ml-0 sm:ml-12 p-3 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs space-y-1">
          <p className="font-bold text-teal-400 text-[11px] tracking-wide uppercase">
            Resposta do estabelecimento
          </p>
          <p className="text-white/80 leading-relaxed break-words">{partnerResponse}</p>
        </div>
      )}
    </GlassCard>
  );
}
