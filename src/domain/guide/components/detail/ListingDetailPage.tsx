import { MapPin, Star, X } from 'lucide-react';
import { motion, useScroll } from 'motion/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../../../../shared/constants/categories';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { cn } from '../../../../shared/utils/cn';
import { optimizeImage } from '../../../../shared/utils/formatters';
import { ShareButton } from '../../../../ui/components/ShareButton';
import { VerifiedSealButton } from '../../../../ui/components/VerifiedSealButton';
import { FavoriteButton } from '../../../favorites/components/FavoriteButton';
import { trackInteractionUseCase as trackInteraction } from '../../../insights';
import type { GuideItem } from '../../types/guide';
import { listingHeroLayoutId } from '../../utils/listingHero';
import { isListingSealVisible } from '../../utils/listingSeal';

// Curva de app nativo: começa rápido e assenta devagar (regra de movimento, 2026-11-09).
const EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Anúncio em tela cheia (aprovado em 2026-11-10): a foto vem do cartão e ocupa o topo, com
 * favoritar e compartilhar; embaixo, tag, nota, nome, local, descrição e as seções da categoria.
 * Fechar faz o caminho inverso (a foto volta para o cartão).
 */
export function ListingDetailPage({
  item,
  onClose,
  locationLabel,
  collectionName = 'items',
  favoriteLabel,
  children,
}: {
  item: GuideItem;
  onClose: () => void;
  /** Local já pronto para exibir (ex.: "Preá, Ceará"). */
  locationLabel: string;
  collectionName?: 'items' | 'events';
  /** Tipo do item no aviso de favorito (ex.: "passeio"). */
  favoriteLabel: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const [activeImage, setActiveImage] = useState(0);
  const category = CATEGORIES[item.category as keyof typeof CATEGORIES];
  const images = item.images?.length ? item.images.slice(0, 5) : item.image ? [item.image] : [];

  useEffect(() => {
    void trackInteraction(item.id, 'view', collectionName);
  }, [item.id, collectionName]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    scrollRef.current?.focus({ preventScroll: true });
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0" style={{ zIndex: Z_INDEX.modal }}>
      {/* O fundo aparece enquanto a foto cresce; a foto não some, ela muda de lugar. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-app"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
      />
      <div
        ref={scrollRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        tabIndex={-1}
        className="absolute inset-0 overflow-y-auto overscroll-contain outline-none"
      >
        <motion.div
          layoutId={listingHeroLayoutId(item.id)}
          transition={{ duration: 0.38, ease: EASE }}
          className="relative w-full h-[46vh] max-h-[460px] min-h-[260px] overflow-hidden bg-surface"
        >
          {images.length > 0 ? (
            <motion.div
              layout
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
              onScroll={(event) => {
                const { scrollLeft, clientWidth } = event.currentTarget;
                if (clientWidth > 0) setActiveImage(Math.round(scrollLeft / clientWidth));
              }}
            >
              {images.map((src, index) => (
                <img
                  key={src}
                  src={optimizeImage(src, 1200)}
                  alt={images.length > 1 ? `${item.name} ${index + 1}` : item.name}
                  className="w-full h-full shrink-0 snap-center object-cover"
                />
              ))}
            </motion.div>
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.22, duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[46vh] max-h-[460px] min-h-[260px]"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="press pointer-events-auto absolute right-4 top-[max(1rem,env(safe-area-inset-top))] size-11 rounded-full bg-black/55 text-white backdrop-blur-md flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          >
            <X size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
          <div className="pointer-events-auto absolute bottom-3 left-4">
            <FavoriteButton
              itemId={item.id}
              collectionName={collectionName}
              itemTypeLabel={favoriteLabel}
              partnerId={item.partnerId}
              scrollY={scrollY}
              itemDetails={{
                name: item.name,
                image: item.image,
                category: item.category,
                location: item.location,
                rating: item.rating,
                description: item.description,
              }}
            />
          </div>
          <div className="pointer-events-auto absolute bottom-3 right-4">
            <ShareButton
              itemId={item.id}
              itemName={item.name}
              collectionName={collectionName}
              partnerId={item.partnerId}
              scrollY={scrollY}
            />
          </div>
          {images.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5"
              aria-hidden="true"
            >
              {images.map((src, index) => (
                <span
                  key={src}
                  className={cn(
                    'size-1.5 rounded-full bg-white transition-opacity',
                    index === activeImage ? 'opacity-100' : 'opacity-45'
                  )}
                />
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.3, ease: EASE } }}
          exit={{ opacity: 0, y: 24, transition: { duration: 0.18 } }}
          className="relative mx-auto w-full max-w-2xl px-5 pt-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] space-y-4"
        >
          <header className="space-y-2">
            <div className="flex items-center gap-2">
              {category && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-lg border text-[11px] font-bold tracking-wide uppercase',
                    category.colorClass,
                    category.bgClass,
                    category.borderClass
                  )}
                >
                  {category.label}
                </span>
              )}
              {typeof item.rating === 'number' && item.rating > 0 && (
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-amber-400">
                  <Star size={13} fill="currentColor" aria-hidden="true" />
                  {item.rating.toFixed(1)}
                </span>
              )}
            </div>
            <h1 className="flex flex-wrap items-center gap-2 font-display text-[28px] font-bold leading-tight text-ink">
              {item.name}
              {isListingSealVisible(item) && <VerifiedSealButton size="md" />}
            </h1>
            {locationLabel && (
              <p className="flex items-center gap-1.5 text-[14px] text-ink/70">
                <MapPin size={15} aria-hidden="true" />
                {locationLabel}
              </p>
            )}
            {item.description && (
              <p className="pt-1 text-[15px] leading-relaxed text-ink/80 whitespace-pre-line">
                {item.description}
              </p>
            )}
          </header>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
