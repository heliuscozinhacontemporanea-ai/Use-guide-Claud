import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronLeft, MapPin, Star, Trash2 } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { FavoriteItem } from '../types/favorite';
import { databaseAdapter } from '../../database/factory';
import { GuideItem } from '../../guide';
import { Skeleton } from '../../../ui/components/Skeleton';

interface FavoritesListProps {
  onBack: () => void;
  onSelectItem?: ((item: GuideItem) => void) | undefined;
  onCloseMenu?: (() => void) | undefined;
}

export function FavoritesList({ onBack, onSelectItem, onCloseMenu }: FavoritesListProps) {
  const { favorites, loading, removeFavoriteItem } = useFavorites();
  const [openingId, setOpeningId] = React.useState<string | null>(null);

  const handleCardClick = async (fav: FavoriteItem) => {
    if (!onSelectItem) return;
    setOpeningId(fav.id);
    try {
      const colName = fav.itemCollection === 'events' ? 'events' : 'items';
      const doc = await databaseAdapter.getDocument<GuideItem>(colName, fav.itemId);
      if (doc) {
        onSelectItem(doc);
        onCloseMenu?.();
      } else if (fav.itemDetails) {
        const fallbackItem: GuideItem = {
          id: fav.itemId,
          name: fav.itemDetails.name,
          description: fav.itemDetails.description || '',
          category: (fav.itemDetails.category ||
            (fav.itemCollection === 'events' ? 'event' : 'sight')) as any,
          image: fav.itemDetails.image || '',
          location: (fav.itemDetails.location as any) || 'jeri',
          ownerId: fav.partnerId || '',
          rating: fav.itemDetails.rating,
        };
        onSelectItem(fallbackItem);
        onCloseMenu?.();
      }
    } catch (error) {
      console.error('[FavoritesList.handleCardClick Error]:', error);
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex items-center justify-between relative mb-2 pt-2">
        <button
          onClick={onBack}
          aria-label="Voltar para o menu principal"
          className="p-2 text-white/70 hover:text-white active:scale-90 transition-all rounded-full bg-white/5 border border-white/10"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="text-center flex-1 mx-2">
          <h2 className="text-xl font-display font-black text-white leading-tight">
            Meus Favoritos
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            Seus itens salvos
          </p>
        </div>
        <div className="w-9" />
      </div>

      {loading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl glassmorphism border border-white/10 flex items-center gap-3"
            >
              <Skeleton className="w-16 h-16 rounded-xl bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded bg-white/10" />
                <Skeleton className="h-3 w-1/2 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl glassmorphism border border-white/10 text-center space-y-4 my-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <Heart size={24} className="fill-rose-500/20" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white mb-1">
              Nenhum favorito salvo
            </h3>
            <p className="text-xs text-white/60 leading-relaxed max-w-xs mx-auto">
              Você ainda não favoritou nenhum item. Explore o guia e toque no ícone de coração para
              guardar suas preferências!
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3 pt-1 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {favorites.map((fav) => {
              const details = fav.itemDetails;
              const name = details?.name || fav.itemId;
              const image = details?.image || '';
              const location = details?.location;
              const rating = details?.rating;

              return (
                <motion.div
                  key={fav.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative flex items-center gap-3 p-3 rounded-2xl glassmorphism border border-white/10 hover:border-teal-500/30 transition-all bg-white/[0.03]"
                >
                  <button
                    onClick={() => handleCardClick(fav)}
                    disabled={openingId === fav.id}
                    className="flex-1 flex items-center gap-3 text-left overflow-hidden min-w-0"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                        <Heart size={20} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-teal-300 transition-colors">
                        {name}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-white/60">
                        {location && (
                          <span className="flex items-center gap-1 capitalize">
                            <MapPin size={12} className="text-teal-400 shrink-0" />
                            <span className="truncate">{location}</span>
                          </span>
                        )}
                        {rating && (
                          <span className="flex items-center gap-1 text-amber-400 ml-auto font-semibold">
                            <Star size={11} className="fill-amber-400" />
                            {rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavoriteItem(fav.itemId);
                    }}
                    aria-label={`Remover ${name} dos favoritos`}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30 text-white/50 hover:text-rose-400 flex items-center justify-center transition-all shrink-0 active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
