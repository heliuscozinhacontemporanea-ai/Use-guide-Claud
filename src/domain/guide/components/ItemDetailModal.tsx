import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Star,
  MapPin,
  Compass,
  Utensils,
  ExternalLink,
  MessageCircle,
  Clock,
  ChevronDown,
} from 'lucide-react';
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
import {
  getOperatingStatus,
  DAY_KEYS,
  DAY_LABELS_SHORT,
} from '../../../shared/utils/operatingHoursStatus';

interface ItemDetailModalProps {
  item: GuideItem | null;
  onClose: () => void;
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);

  useEffect(() => {
    if (!item?.id) {
      return;
    }
    void trackInteraction(item.id, 'view', 'items');
  }, [item?.id]);

  if (!item) return null;

  const locationName = LOCATIONS.find((l) => l.id === item.location)?.name || item.location;
  const operatingStatus = getOperatingStatus(item.operationalInfo?.operatingHours);
  const todayIndex = new Date().getDay();

  const handleOpenMap = () => {
    if (item.mapLink) {
      window.open(item.mapLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <ModalLayout
      isOpen={!!item}
      onClose={onClose}
      overlayClassName="bg-black/[0.15] backdrop-blur-md"
      containerClassName="bg-slate-950 backdrop-blur-3xl rounded-[2.5rem] border border-white/20"
    >
      {/* Header Content Wrapper - Contains fixed background elements */}
      <div className="sticky top-0 z-0 h-80 w-full overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <div
            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar bg-black/20"
            onScroll={(e) => {
              const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
              const width = (e.target as HTMLDivElement).clientWidth;
              if (width > 0) {
                const index = Math.round(scrollLeft / width);
                setActiveImage(index);
              }
            }}
          >
            {item.images.slice(0, 5).map((img, idx) => (
              <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                <img
                  src={optimizeImage(img, 1200)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  alt={`${item.name} ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <img
            src={optimizeImage(item.image, 1200)}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            alt={item.name}
          />
        )}
        {/* Image indicators if more than 1 image */}
        {item.images && item.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 h-4">
            {item.images.slice(0, 5).map((_, i) => {
              const distance = Math.abs(activeImage - i);
              // Ativo: 1.2 | Opacidade 0.6
              // Adjacente: 0.9 | Opacidade 0.4
              // Distante: 0.6 | Opacidade 0.2
              const scale = distance === 0 ? 1.2 : distance === 1 ? 0.9 : 0.6;
              const opacity = distance === 0 ? 0.6 : distance === 1 ? 0.4 : 0.2;
              return (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    scale: scale,
                    opacity: opacity,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-1.5 h-1.5 rounded-full bg-white shadow-lg"
                />
              );
            })}
          </div>
        )}
        {/* Gradient Overlay for bottom transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-1 left-6 z-20">
          <FavoriteButton
            itemId={item.id}
            collectionName="items"
            itemTypeLabel={
              CATEGORIES[item.category as keyof typeof CATEGORIES]?.label.toLowerCase() || 'item'
            }
            partnerId={item.partnerId}
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
          />
        </div>
      </div>

      {/* Sticky Actions Layer - Button that stays at top */}
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

      {/* Main Content Area - Overlaps the fixed header */}
      <div className="relative z-20 bg-slate-900/60 backdrop-blur-[40px] rounded-t-[3rem] -mt-6 p-8 space-y-8 shadow-[0_-20px_50px_-20px_rgba(0,0,0,1)] min-h-[60vh] border-t border-white/5">
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border',
                CATEGORIES[item.category as keyof typeof CATEGORIES]?.badgeClass ||
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
              )}
            >
              {(() => {
                if (item.category === 'tips') return CATEGORIES.tips.label;
                if (item.category === 'tour') return CATEGORIES.tour.label;
                if (
                  item.category === 'hotel' &&
                  (!item.googleMapsType || item.googleMapsType === 'Ponto')
                )
                  return CATEGORIES.hotel.label;
                if (
                  item.category === 'restaurant' &&
                  (!item.googleMapsType || item.googleMapsType === 'Ponto')
                )
                  return CATEGORIES.restaurant.label;
                if (
                  item.category === 'sight' &&
                  (!item.googleMapsType || item.googleMapsType === 'Ponto')
                )
                  return CATEGORIES.sight.label;

                return (
                  item.googleMapsType ||
                  CATEGORIES[item.category as keyof typeof CATEGORIES]?.label ||
                  'Atração Turística'
                );
              })()}
            </span>
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold">{item.rating}</span>
            </div>
          </div>

          <div className="space-y-1 font-display">
            <h2 className="text-3xl font-display font-black leading-tight text-white mb-1 flex items-center gap-2 flex-wrap">
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
          {item.mapLink ? (
            <GlassCard
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenMap}
              className="p-4 bg-teal-500/10 border-teal-500/20 text-center cursor-pointer hover:bg-teal-500/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
                <ExternalLink size={20} className="text-teal-300" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-300/60">
                Abrir no Mapa
              </p>
              <p className="text-sm font-bold mt-1">Google Maps</p>
            </GlassCard>
          ) : (
            <GlassCard className="p-4 bg-white/5 border-white/10 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Compass size={20} className="text-blue-300" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                Localização
              </p>
              <p className="text-sm font-bold mt-1">{locationName}</p>
            </GlassCard>
          )}
          <GlassCard
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsScheduleExpanded((prev) => !prev)}
            aria-expanded={isScheduleExpanded}
            aria-label="Ver horário de funcionamento completo"
            className={cn(
              'p-4 text-center cursor-pointer transition-colors',
              operatingStatus.isOpen
                ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3',
                operatingStatus.isOpen ? 'bg-emerald-500/20' : 'bg-white/10'
              )}
            >
              <Clock
                size={20}
                className={operatingStatus.isOpen ? 'text-emerald-300' : 'text-white/50'}
              />
            </div>
            <p
              className={cn(
                'text-[10px] font-black uppercase tracking-[0.2em]',
                operatingStatus.isOpen ? 'text-emerald-300/70' : 'text-white/50'
              )}
            >
              {operatingStatus.label}
            </p>
            <p className="text-sm font-bold mt-1 flex items-center justify-center gap-1">
              {operatingStatus.detail || '—'}
              <ChevronDown
                size={12}
                className={cn('transition-transform', isScheduleExpanded && 'rotate-180')}
              />
            </p>
          </GlassCard>

          {item.whatsappLink && (
            <GlassCard
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                trackInteraction(item.id, 'whatsapp_click', 'items', item.partnerId);
                window.open(item.whatsappLink, '_blank', 'noopener,noreferrer');
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
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#25D366]/60">
                    Contato Imediato
                  </p>
                  <p className="text-base font-bold text-white">Chamar no WhatsApp</p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
        <AnimatePresence>
          {isScheduleExpanded && item.operationalInfo?.operatingHours && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <GlassCard className="p-4 mt-3 space-y-2">
                {DAY_KEYS.map((dayKey, index) => {
                  const dayHours = item.operationalInfo?.operatingHours?.[dayKey];
                  const isToday = index === todayIndex;

                  return (
                    <div
                      key={dayKey}
                      className={cn(
                        'flex items-center justify-between text-sm py-1 px-2 rounded-lg',
                        isToday && 'bg-teal-500/10'
                      )}
                    >
                      <span className={cn('font-medium', isToday && 'text-teal-300')}>
                        {DAY_LABELS_SHORT[index]}
                        {isToday && (
                          <span className="text-[9px] uppercase tracking-wide ml-1.5 text-teal-400/70">
                            Hoje
                          </span>
                        )}
                      </span>
                      <span className={isToday ? 'text-teal-300 font-bold' : 'text-white/60'}>
                        {!dayHours || dayHours.closed
                          ? 'Fechado'
                          : `${dayHours.open} – ${dayHours.close}`}
                      </span>
                    </div>
                  );
                })}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
        <ReviewSection
          itemId={item.id}
          itemRating={item.rating}
          itemReviewCount={item.reviewCount}
          partnerId={item.partnerId}
          ownerId={item.ownerId}
        />
        <div className="h-20" /> {/* Spacer for bottom scroll */}
      </div>
    </ModalLayout>
  );
}
