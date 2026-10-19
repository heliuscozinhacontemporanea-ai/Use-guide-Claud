import React, { useState } from 'react';
import { Bike, Star, Utensils, MapPin, Compass, Home, Info, Calendar } from 'lucide-react';
import { GlassCard } from '../../../ui/components/GlassCard';
import { CATEGORIES } from '../../../shared/constants/categories';
import { GuideItem } from '../types/guide';
import { cn } from '../../../shared/utils/cn';
import { optimizeImage } from '../../../shared/utils/formatters';

interface StandardCardProps {
  key?: string | number;
  item: GuideItem;
  variant?: 'square' | 'portrait' | 'landscape' | 'video' | 'circle' | 'horizontal' | 'banner';
  onClick: () => void;
  className?: string;
}

// Nomes de ícone usados em CATEGORIES (src/shared/constants/categories.ts).
const IconMap: Record<string, typeof Info> = {
  Bike,
  Utensils,
  MapPin,
  Compass,
  Home,
  Info,
  Calendar,
};

import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';

export function StandardCard({ item, variant = 'square', onClick, className }: StandardCardProps) {
  const [imageError, setImageError] = useState(false);
  const cat = CATEGORIES[item.category];

  const variantClasses = {
    square: 'aspect-square min-w-[280px]',
    portrait: 'aspect-[3/4] min-w-[280px]',
    landscape: 'aspect-[4/3] min-w-[280px]',
    video: 'aspect-[16/9] min-w-[320px]',
    banner: 'aspect-[4/3] min-w-[90vw] md:min-w-[700px]',
    circle: 'aspect-square min-w-[200px] rounded-full',
    horizontal: 'h-40 w-full',
  };

  const CategoryIcon = IconMap[cat.icon] || Info;

  const isHorizontal = variant === 'horizontal';

  return (
    <div className={cn('snap-center shrink-0 py-2', !isHorizontal && 'snap-center', className)}>
      <GlassCard
        onClick={onClick}
        className={cn(
          'relative group shadow-2xl border-white/10 transition-all duration-500 overflow-hidden active:scale-[0.98]',
          variantClasses[variant],
          variant === 'circle' ? 'rounded-full' : 'rounded-arredondados-sm',
          isHorizontal && 'flex',
          className?.includes('min-w-0') && 'min-w-0'
        )}
      >
        {/* Image / Placeholder */}
        <div
          className={cn(
            'relative bg-slate-900 overflow-hidden',
            isHorizontal ? 'w-1/3 h-full' : 'absolute inset-0'
          )}
        >
          {!item.image || imageError ? (
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-3xl flex flex-col items-center justify-center border border-white/5">
              <div
                className={cn(
                  'rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl',
                  cat.bgClass,
                  isHorizontal ? 'w-12 h-12 mb-2' : 'w-16 h-16 mb-4'
                )}
              >
                <CategoryIcon
                  className={cn(cat.colorClass, isHorizontal ? 'w-6 h-6' : 'w-8 h-8')}
                />
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50">
                {cat.label}
              </span>
            </div>
          ) : (
            <img
              src={optimizeImage(item.image, 800)}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
              alt={item.name}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Overlays */}
        {!isHorizontal && (
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-20"></div>

        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
          {item.rating && item.rating > 0 ? (
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xl px-2 py-1 rounded-xl border border-white/10 shadow-2xl">
              <Star size={10} fill="currentColor" className="text-yellow-400" />
              <span className="text-[10px] font-black text-white">{item.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        {/* Content Area */}
        <div
          className={cn(
            isHorizontal
              ? 'w-2/3 p-5 flex flex-col justify-center'
              : 'absolute inset-x-0 bottom-0 p-3 pt-20 bg-gradient-to-t from-black/95 via-black/40 to-transparent'
          )}
        >
          <div className="relative">
            {/* Adaptive Text Overlay (Blur only on title area) - Only for stacked cards */}
            {!isHorizontal && (
              <div className="absolute -inset-x-3 -inset-y-2 bg-white/5 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100 border border-white/5" />
            )}

            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    'text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg border shadow-lg inline-block w-fit',
                    cat.colorClass,
                    cat.bgClass,
                    cat.borderClass
                  )}
                >
                  {cat.label}
                </p>
                {(variant === 'video' || variant === 'banner' || isHorizontal) && (
                  <p className="text-[10px] text-white/50 font-medium line-clamp-1 flex-1">
                    {item.description}
                  </p>
                )}
                {item.category === 'event' && item.entryType && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-teal-500/20 border border-teal-400/30 text-teal-300">
                    {item.entryType === 'gratuito' ? 'Entrada gratuita' : 'Ingressos'}
                  </span>
                )}
              </div>

              {item.category === 'event' && item.date && (
                <p className="text-[10px] font-semibold text-teal-300/90">
                  {new Date(item.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}

              <h4
                className={cn(
                  'font-bold leading-tight tracking-tight text-white transition-transform duration-500 group-hover:translate-x-1 flex items-center gap-2',
                  isHorizontal ? 'text-lg' : 'text-xl'
                )}
              >
                {item.name}
                {item.isVerified && !item.isVerificationSuspended && <VerifiedBadge size="sm" />}
              </h4>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
