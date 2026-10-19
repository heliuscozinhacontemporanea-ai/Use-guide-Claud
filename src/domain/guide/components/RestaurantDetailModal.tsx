import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Star, MapPin, Utensils, MessageCircle } from 'lucide-react';
import { GlassCard } from '../../../ui/components/GlassCard';
import { ModalLayout } from '../../../ui/layouts/ModalLayout';
import { LOCATIONS } from '../../../shared/constants/locations';
import { CATEGORIES } from '../../../shared/constants/categories';
import { GuideItem } from '../types/guide';
import { ReviewSection } from '../../reviews';
import { optimizeImage } from '../../../shared/utils/formatters';
import { cn } from '../../../shared/utils/cn';
import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
import { trackInteractionUseCase as trackInteraction } from '../../insights';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';
import { ShareButton } from '../../../ui/components/ShareButton';
import { useScrollBorderRadius } from '../../../ui/hooks/useScrollBorderRadius';
import { whatsAppUrl } from '../../../shared/utils/phone';

interface RestaurantDetailModalProps {
  item: GuideItem | null;
  onClose: () => void;
}

export function RestaurantDetailModal({ item, onClose }: RestaurantDetailModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const { containerRef, borderRadius, scrollY } = useScrollBorderRadius();

  useEffect(() => {
    if (!item?.id) {
      return;
    }
    void trackInteraction(item.id, 'view', 'items');
  }, [item?.id]);

  if (!item) return null;

  const locationName = LOCATIONS.find((l) => l.id === item.location)?.name || item.location;

  return (
    <ModalLayout
      isOpen={!!item}
      onClose={onClose}
      overlayClassName="bg-black/[0.15] backdrop-blur-md"
      containerClassName="bg-slate-950 backdrop-blur-3xl rounded-[2.5rem] border border-white/20"
      scrollRef={containerRef}
    >
      <div className="sticky top-0 z-0 h-80 w-full overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <div
            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar bg-black/20"
            onScroll={(e) => {
              const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
              const width = (e.target as HTMLDivElement).clientWidth;
              if (width > 0) setActiveImage(Math.round(scrollLeft / width));
            }}
          >
            {item.images.slice(0, 5).map((img, idx) => (
              <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                <img
                  src={optimizeImage(img, 1200)}
                  className="w-full h-full object-cover"
                  alt={`${item.name} ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <img
            src={optimizeImage(item.image, 1200)}
            className="w-full h-full object-cover"
            alt={item.name}
          />
        )}

        {item.images && item.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 h-4">
            {item.images.slice(0, 5).map((_, i) => {
              const distance = Math.abs(activeImage - i);
              const scale = distance === 0 ? 1.2 : distance === 1 ? 0.9 : 0.6;
              const opacity = distance === 0 ? 0.6 : distance === 1 ? 0.4 : 0.2;
              return (
                <motion.div
                  key={i}
                  animate={{ scale, opacity }}
                  transition={{ duration: 0.3 }}
                  className="w-1.5 h-1.5 rounded-full bg-white shadow-lg"
                />
              );
            })}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-1 left-6 z-20">
          <FavoriteButton
            itemId={item.id}
            collectionName="items"
            itemTypeLabel="restaurante"
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
        <div className="absolute bottom-1 right-6 z-20">
          <ShareButton
            itemId={item.id}
            itemName={item.name}
            collectionName="items"
            partnerId={item.partnerId}
            scrollY={scrollY}
          />
        </div>
      </div>

      <div className="sticky top-0 z-30 h-0 flex justify-end items-start px-6 pt-6 pointer-events-none">
        <button
          onClick={onClose}
          className="pointer-events-auto p-3 rounded-full glassmorphism-vibrant border border-white/20 active:scale-90 transition-transform backdrop-blur-xl shadow-2xl shadow-black/80 group/close"
        >
          <X
            size={20}
            className="text-white group-hover/close:rotate-90 transition-transform duration-300"
            strokeWidth={3}
          />
        </button>
      </div>

      <motion.div
        style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
        className="relative z-20 bg-slate-900/60 backdrop-blur-[40px] -mt-6 p-8 space-y-8 shadow-[0_-20px_50px_-20px_rgba(0,0,0,1)] min-h-[60vh] border-t border-white/5"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg border shadow-lg',
                CATEGORIES.restaurant.colorClass,
                CATEGORIES.restaurant.bgClass,
                CATEGORIES.restaurant.borderClass
              )}
            >
              {CATEGORIES.restaurant.label}
            </span>
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold">{item.rating}</span>
            </div>
          </div>

          <div className="space-y-1 font-display">
            <h2 className="text-3xl font-display font-black text-white leading-tight flex items-center gap-2 flex-wrap mb-1">
              {item.name}
              {item.isVerified && !item.isVerificationSuspended && <VerifiedBadge size="md" />}
            </h2>
            <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
              <MapPin size={16} />
              <span>{locationName}, Ceará</span>
            </div>
          </div>
          <p className="text-base text-white/70 leading-relaxed font-medium">{item.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {item.operationalInfo?.cuisineType && (
            <GlassCard className="col-span-2 p-4 bg-rose-500/10 border-rose-500/20 text-center">
              <Utensils size={20} className="text-rose-300 mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-300/60">
                Culinária
              </p>
              <p className="text-sm font-bold mt-1 text-white">
                {item.operationalInfo.cuisineType}
              </p>
            </GlassCard>
          )}

          {whatsAppUrl(item.phone) && (
            <GlassCard
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                trackInteraction(item.id, 'whatsapp_click', 'items', item.partnerId);
                window.open(whatsAppUrl(item.phone) ?? '', '_blank', 'noopener,noreferrer');
              }}
              className="col-span-2 p-6 bg-[#25D366]/10 border-[#25D366]/20 text-center cursor-pointer hover:bg-[#25D366]/20 transition-all group"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle
                    size={24}
                    className="text-[#25D366]"
                    fill="currentColor"
                    fillOpacity={0.2}
                  />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#25D366]/60">
                    Fazer Reserva / Pedido
                  </p>
                  <p className="text-base font-bold text-white">Chamar no WhatsApp</p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        <ReviewSection
          itemId={item.id}
          itemRating={item.rating}
          itemReviewCount={item.reviewCount}
          partnerId={item.partnerId}
          ownerId={item.ownerId}
        />
        <div className="h-20" />
      </motion.div>
    </ModalLayout>
  );
}
