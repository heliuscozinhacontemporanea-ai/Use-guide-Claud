import { Bike, Calendar, Compass, Home, Info, MapPin, Star, Utensils } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../../../shared/constants/categories';
import { formatBusinessDateTime } from '../../../shared/utils/businessDateTime';
import { cn } from '../../../shared/utils/cn';
import { optimizeImage } from '../../../shared/utils/formatters';
import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
import {
  LISTING_CARD_ATTR,
  LISTING_PHOTO_ATTR,
  rememberTappedCard,
} from '../hooks/listingHeroOrigin';
import type { GuideItem } from '../types/guide';
import { isListingSealVisible } from '../utils/listingSeal';

interface StandardCardProps {
  item: GuideItem;
  variant?: 'square' | 'portrait' | 'landscape' | 'video' | 'circle' | 'horizontal' | 'banner';
  onClick: () => void;
  className?: string;
  /** Vaga paga do dia (D11): sempre identificada como "Destaque" (CDC art. 36). */
  featured?: boolean;
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

const VARIANT: Record<NonNullable<StandardCardProps['variant']>, string> = {
  square: 'aspect-square min-w-[280px]',
  portrait: 'aspect-[3/4] min-w-[280px]',
  landscape: 'aspect-[4/3] min-w-[280px]',
  video: 'aspect-[16/9] min-w-[320px]',
  banner: 'aspect-[4/3] min-w-[90vw] md:min-w-[700px]',
  circle: 'aspect-square min-w-[200px] rounded-full',
  horizontal: 'h-40 w-full',
};

/**
 * Cartão de anúncio das listas. A foto dele é de onde a capa do anúncio sai ao tocar, e para onde
 * ela volta ao fechar (`useListingHero`).
 */
export function StandardCard({
  item,
  variant = 'square',
  onClick,
  className,
  featured = false,
}: StandardCardProps) {
  const { t, i18n } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const cat = CATEGORIES[item.category];
  const CategoryIcon = IconMap[cat.icon] || Info;
  const isHorizontal = variant === 'horizontal';
  const categoryLabel = t(`listingDetail.category.${cat.id}`);

  return (
    <div className={cn('snap-center shrink-0 py-2', className)}>
      <button
        type="button"
        {...{ [LISTING_CARD_ATTR]: item.id }}
        onClick={(event) => {
          rememberTappedCard(event.currentTarget);
          onClick();
        }}
        className={cn(
          // P24: o toque longo não abre o menu do sistema nem seleciona o texto do cartão.
          'press glassmorphism relative block w-full overflow-hidden text-left select-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
          VARIANT[variant],
          variant === 'circle' ? 'rounded-full' : 'rounded-card',
          isHorizontal && 'flex',
          className?.includes('min-w-0') && 'min-w-0'
        )}
      >
        <span
          {...{ [LISTING_PHOTO_ATTR]: '' }}
          className={cn(
            'relative overflow-hidden bg-ink/[0.06]',
            isHorizontal ? 'w-1/3 h-full shrink-0' : 'absolute inset-0'
          )}
        >
          {!item.image || imageError ? (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span
                className={cn(
                  'rounded-card flex items-center justify-center border border-line',
                  cat.bgClass,
                  isHorizontal ? 'size-12' : 'size-16'
                )}
              >
                <CategoryIcon
                  aria-hidden="true"
                  className={cn(cat.colorClass, isHorizontal ? 'size-6' : 'size-8')}
                />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                {categoryLabel}
              </span>
            </span>
          ) : (
            <img
              src={optimizeImage(item.image, 800)}
              className="absolute inset-0 w-full h-full object-cover"
              alt={item.name}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
            />
          )}
        </span>

        {/* Escurece a foto onde o texto fica por cima (cartões em pé). */}
        {!isHorizontal && <span aria-hidden="true" className="absolute inset-0 bg-black/20" />}

        {featured && (
          <span className="absolute top-3 left-3 z-20 px-2 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-bold uppercase tracking-wide">
            {t('common.featured')}
          </span>
        )}

        {typeof item.rating === 'number' && item.rating > 0 && (
          <span className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-caption font-bold text-on-fill tabular-nums">
            <Star size={16} fill="currentColor" className="text-amber-300" aria-hidden="true" />
            {item.rating.toFixed(1)}
          </span>
        )}

        <span
          className={cn(
            'flex flex-col gap-2',
            isHorizontal
              ? 'w-2/3 p-5 justify-center'
              : 'absolute inset-x-0 bottom-0 p-3 pt-20 bg-gradient-to-t from-black/95 via-black/40 to-transparent'
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                'shrink-0 px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wide',
                cat.colorClass,
                cat.bgClass,
                cat.borderClass
              )}
            >
              {categoryLabel}
            </span>
            {(variant === 'video' || variant === 'banner' || isHorizontal) && item.description && (
              <span
                className={cn(
                  'flex-1 min-w-0 text-caption line-clamp-1',
                  isHorizontal ? 'text-ink-muted' : 'text-on-fill/70'
                )}
              >
                {item.description}
              </span>
            )}
            {item.category === 'event' && item.entryType && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-accent-soft border border-accent-line text-caption font-semibold text-accent">
                {t(
                  item.entryType === 'gratuito'
                    ? 'listingDetail.entry.free'
                    : 'listingDetail.entry.tickets'
                )}
              </span>
            )}
          </span>

          {item.category === 'event' && item.date && (
            <span
              className={cn(
                'text-caption font-semibold',
                isHorizontal ? 'text-accent' : 'text-on-fill'
              )}
            >
              {formatBusinessDateTime(item.date, i18n.language, item.timeZone)}
            </span>
          )}

          <span
            className={cn(
              'flex items-center gap-2 text-title leading-tight',
              isHorizontal ? 'text-ink' : 'text-on-fill'
            )}
          >
            {item.name}
            {isListingSealVisible(item) && <VerifiedBadge size="sm" />}
          </span>
        </span>
      </button>
    </div>
  );
}
