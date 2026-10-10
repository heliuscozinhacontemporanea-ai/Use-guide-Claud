import React from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, MotionValue } from 'motion/react';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useUI } from '../../../shared/stores/useUIStore';
import { cn } from '../../../shared/utils/cn';
import { useFavorites } from '../hooks/useFavorites';
import { FavoriteItemDetails } from '../types/favorite';
import { Z_INDEX } from '../../../shared/constants/zIndex';

interface FavoriteButtonProps {
  itemId: string;
  collectionName: 'items' | 'events';
  itemTypeLabel: string;
  partnerId?: string;
  itemDetails?: FavoriteItemDetails;
  scrollY?: MotionValue<number>;
}

export function FavoriteButton({
  itemId,
  collectionName,
  itemTypeLabel,
  partnerId,
  itemDetails,
  scrollY,
}: FavoriteButtonProps) {
  const { openLoginModal } = useUI();
  const { user } = useAuthContext();

  const { isFavorited, toggleFavorite } = useFavorites(itemId);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = React.useState(false);

  const fallbackScroll = useMotionValue(0);
  const baseOpacity = useTransform(scrollY || fallbackScroll, [0, 50], [0.8, 0.35]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowPrompt(true);
      setTimeout(() => setShowPrompt(false), 5000);
      return;
    }

    const nextStateWillBeFavorited = !isFavorited;
    await toggleFavorite({
      collectionName,
      itemTypeLabel,
      partnerId,
      itemDetails,
    });

    if (nextStateWillBeFavorited) {
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2500);
    }
  };

  return (
    <div className="relative flex items-center shrink-0">
      <motion.button
        id={`fav-btn-${itemId}`}
        onClick={handleFavorite}
        aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        style={
          {
            '--button-base-opacity': baseOpacity,
          } as any
        }
        className={cn(
          'w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 group/fav',
          isFavorited
            ? 'text-rose-500 scale-105'
            : 'text-[rgba(255,255,255,var(--button-base-opacity))] hover:text-rose-500'
        )}
      >
        <Heart
          size={24}
          className={cn(
            'transition-all duration-300',
            isFavorited ? 'fill-rose-500' : 'group-hover/fav:scale-110'
          )}
          strokeWidth={isFavorited ? 1.5 : 2}
        />
      </motion.button>

      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{ originX: 0.1, originY: 1, zIndex: Z_INDEX.dropdown }}
            className="absolute bottom-full left-0 mb-3 w-52 p-3.5 bg-gradient-to-b from-[#091f13]/95 via-[#0c2517]/95 to-[#0d2e1b]/95 border border-emerald-500/30 rounded-2xl rounded-bl-[4px] shadow-2xl backdrop-blur-2xl"
          >
            <div className="relative z-10">
              <p className="text-[11px] text-white/90 font-medium mb-2.5 leading-relaxed">
                Para favoritar este {itemTypeLabel}, você precisa fazer login.
              </p>
              <button
                onClick={() => {
                  setShowPrompt(false);
                  openLoginModal();
                }}
                className="w-full py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 text-[10px] font-black uppercase tracking-wider transition-colors shadow-lg shadow-emerald-950/20"
              >
                Entrar agora
              </button>
            </div>
            <div className="absolute bottom-[-6px] left-[16px] w-3 h-3 bg-[#0d2e1b] border-r border-b border-emerald-500/30 rotate-45" />
          </motion.div>
        )}

        {showSavedFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute left-full ml-2 px-3 py-1 bg-rose-500/20 border border-rose-500/40 rounded-full text-[9px] font-black uppercase tracking-widest text-rose-300 whitespace-nowrap shadow-lg backdrop-blur-md"
          >
            Salvo!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
