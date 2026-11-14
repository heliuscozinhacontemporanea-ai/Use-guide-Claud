import { Heart, MapPin, Star, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../../ui/components/Skeleton';
import { FADE } from '../../../ui/motion/tokens';
import { useFavorites } from '../hooks/useFavorites';
import type { FavoriteItem } from '../types/favorite';

export interface FavoriteSelection {
  id: string;
  category: string;
}

interface FavoritesListProps {
  onSelectItem?: ((item: FavoriteSelection) => void) | undefined;
}

/** Meus favoritos. O `<` e o título ficam na barra fixa da folha do perfil (D33). */
export function FavoritesList({ onSelectItem }: FavoritesListProps) {
  const { t } = useTranslation();
  const { favorites, loading, removeFavoriteItem } = useFavorites();

  const handleCardClick = (fav: FavoriteItem) => {
    if (!onSelectItem) return;
    // A composição só precisa do id e da categoria: o detalhe é lido do catálogo pela URL.
    const category =
      fav.itemCollection === 'events' ? 'event' : fav.itemDetails?.category || 'sight';
    onSelectItem({ id: fav.itemId, category });
  };

  if (loading) {
    return (
      <div role="status" className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3 rounded-card bg-surface border border-line flex items-center gap-3"
          >
            <Skeleton className="w-16 h-16 rounded-control shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
        <span className="sr-only">{t('favorites.title')}</span>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center text-center gap-3">
        <span className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center">
          <Heart size={24} aria-hidden="true" />
        </span>
        <p className="text-title font-semibold text-ink">{t('favorites.emptyTitle')}</p>
        <p className="max-w-xs text-meta text-ink-muted">{t('favorites.emptyDescription')}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {favorites.map((fav) => {
          const details = fav.itemDetails;
          const name = details?.name || fav.itemId;
          const image = details?.image || '';
          const location = details?.location;
          const rating = details?.rating;

          return (
            <motion.li
              key={fav.id}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="flex items-center gap-1 p-3 pr-1 rounded-card bg-surface border border-line"
            >
              <button
                type="button"
                onClick={() => handleCardClick(fav)}
                className="press flex-1 flex items-center gap-3 text-left min-w-0 rounded-control focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
              >
                {image ? (
                  <img
                    src={image}
                    alt=""
                    width={64}
                    height={64}
                    loading="lazy"
                    className="w-16 h-16 rounded-control object-cover shrink-0"
                  />
                ) : (
                  <span className="w-16 h-16 rounded-control bg-accent-soft text-accent flex items-center justify-center shrink-0">
                    <Heart size={20} aria-hidden="true" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-semibold text-ink truncate">{name}</span>
                  <span className="mt-1 flex items-center gap-2 text-meta text-ink-muted">
                    {location && (
                      <span className="flex items-center gap-1 min-w-0 capitalize">
                        <MapPin size={16} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{location}</span>
                      </span>
                    )}
                    {rating ? (
                      <span className="flex items-center gap-1 ml-auto font-semibold text-ink tabular-nums">
                        {/* Estrela amarela: exceção aprovada (DESIGN.md §2.2, D19). */}
                        <Star
                          size={16}
                          className="fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                        {rating.toFixed(1)}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeFavoriteItem(fav.itemId)}
                aria-label={t('favorites.removeItem', { name })}
                className="press w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink-muted hover:text-danger hover:bg-danger-soft focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
              >
                <Trash2 size={20} aria-hidden="true" />
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
