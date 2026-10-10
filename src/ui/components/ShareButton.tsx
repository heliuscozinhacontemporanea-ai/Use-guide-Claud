import React from 'react';
import { Share2 } from 'lucide-react';
import { trackInteractionUseCase as trackInteraction } from '../../domain/insights';
import { motion, AnimatePresence, useMotionValue, useTransform, MotionValue } from 'motion/react';

interface ShareButtonProps {
  itemId: string;
  itemName: string;
  collectionName: 'items' | 'events';
  partnerId?: string;
  scrollY?: MotionValue<number>;
}

export function ShareButton({
  itemId,
  itemName,
  collectionName,
  partnerId,
  scrollY,
}: ShareButtonProps) {
  const [showCopied, setShowCopied] = React.useState(false);

  const fallbackScroll = useMotionValue(0);
  const baseOpacity = useTransform(scrollY || fallbackScroll, [0, 50], [0.8, 0.35]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Construct local share URL if needed, but for now we use location.href
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: itemName,
          text: `Confira ${itemName} no Guia Ceará!`,
          url: shareUrl,
        });
        trackInteraction(itemId, 'share', collectionName, partnerId);
      } catch (err) {
        console.warn('Error sharing:', err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
      trackInteraction(itemId, 'share', collectionName, partnerId);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className="relative flex items-center shrink-0">
      <AnimatePresence>
        {showCopied && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="absolute right-full mr-3 px-3 py-1 glassmorphism bg-blue-500/20 border border-blue-500/30 rounded-full text-[8px] font-black uppercase tracking-widest text-blue-400 whitespace-nowrap"
          >
            Link copiado!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleShare}
        style={
          {
            '--button-base-opacity': baseOpacity,
          } as any
        }
        className="p-2 rounded-full transition-all active:scale-95 text-[rgba(255,255,255,var(--button-base-opacity))] hover:text-blue-400 group/share"
      >
        <Share2
          size={24}
          className="transition-all duration-300 group-hover:scale-110"
          strokeWidth={2}
        />
      </motion.button>
    </div>
  );
}
