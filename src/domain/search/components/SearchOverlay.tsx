import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import { LOCATIONS } from '../../../shared/constants/locations';
import { CATEGORIES } from '../../../shared/constants/categories';
import { GuideItem, useGuideCatalog } from '../../guide';
import { useDynamicSuggestions } from '../hooks/useDynamicSuggestions';
import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
import { REGIONS } from '../constants/filterOptions';
import { SearchOverlayProps } from '../types/search';
import { cn } from '../../../shared/utils/cn';
import { optimizeImage } from '../../../shared/utils/formatters';
import { Z_INDEX } from '../../../shared/constants/zIndex';

const containerVariants: any = {
  closed: {
    left: 'calc(100% - 34px)',
    right: '0px',
    transition: {
      left: { delay: 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      right: { delay: 0, duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    },
  },
  open: {
    left: '0px',
    right: '70px',
    transition: {
      left: { delay: 0, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      right: { delay: 0.2, duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

const inputVariants: any = {
  closed: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
  open: {
    opacity: 1,
    transition: { delay: 0.18, duration: 0.2 },
  },
};

const buttonVariants: any = {
  closed: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
  open: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.22, duration: 0.25, ease: 'easeOut' },
  },
};

const contentVariants: any = {
  closed: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.1,
      ease: 'easeOut',
    },
  },
};

export function SearchOverlay({ isOpen, onClose, onSelectItem }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const { events: dbEvents, items: dbItems } = useGuideCatalog();
  const { routeKey } = useLocalizedRouting();
  const isMainPage = routeKey === 'explore';

  const activeCategory = useMemo(() => {
    switch (routeKey) {
      case 'events':
        return 'event';
      case 'tours':
        return 'tour';
      case 'stays':
        return 'hotel';
      case 'restaurants':
        return 'restaurant';
      case 'attractions':
        return 'sight';
      case 'guide':
        return 'tips';
      default:
        return null;
    }
  }, [routeKey]);

  const searchPlaceholder = useMemo(() => {
    switch (activeCategory) {
      case 'event':
        return 'Buscar eventos e experiências...';
      case 'tour':
        return 'Buscar passeios e aventuras...';
      case 'hotel':
        return 'Buscar hospedagens e pousadas...';
      case 'restaurant':
        return 'Buscar restaurantes e sabores...';
      case 'sight':
        return 'Buscar pontos turísticos e atrações...';
      case 'tips':
        return 'Buscar dicas e guia prático...';
      default:
        return 'Buscar dunas, picos...';
    }
  }, [activeCategory]);

  const searchSuggestions = useDynamicSuggestions(activeCategory);

  const results = useMemo(() => {
    const allData = [...dbItems, ...dbEvents];

    let filtered = allData;

    if (activeCategory) {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((item) => {
        const anyItem = item as any;
        const opInfo = (item.operationalInfo || {}) as any;

        if (item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
          return true;
        }

        if (
          Array.isArray(item.tags) &&
          item.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(q))
        ) {
          return true;
        }
        if (
          Array.isArray(opInfo.tags) &&
          opInfo.tags.some((t: string) => typeof t === 'string' && t.toLowerCase().includes(q))
        ) {
          return true;
        }

        const cuisine = anyItem.cuisineType || opInfo.cuisineType;
        if (cuisine && typeof cuisine === 'string' && cuisine.toLowerCase().includes(q)) {
          return true;
        }

        const sub = anyItem.subcategory || opInfo.subcategory;
        if (sub && typeof sub === 'string' && sub.toLowerCase().includes(q)) {
          return true;
        }

        const checkField = (field?: string[] | string) => {
          if (!field) return false;
          if (Array.isArray(field)) {
            return field.some((val) => typeof val === 'string' && val.toLowerCase().includes(q));
          } else if (typeof field === 'string') {
            return field.toLowerCase().includes(q);
          }
          return false;
        };

        if (checkField(anyItem.amenities) || checkField(opInfo.amenities)) return true;
        if (checkField(anyItem.amenitiesRestaurant) || checkField(opInfo.amenitiesRestaurant))
          return true;
        if (checkField(anyItem.additionalServices) || checkField(opInfo.additionalServices))
          return true;
        if (checkField(anyItem.mealTypes) || checkField(opInfo.mealTypes)) return true;
        if (checkField(anyItem.activities) || checkField(opInfo.activities)) return true;
        if (checkField(anyItem.services) || checkField(opInfo.services)) return true;
        if (checkField(opInfo.languages)) return true;
        if (
          opInfo.breakfast &&
          Array.isArray(opInfo.breakfast.types) &&
          opInfo.breakfast.types.some(
            (t: string) => typeof t === 'string' && t.toLowerCase().includes(q)
          )
        ) {
          return true;
        }

        return false;
      });
    }

    if (!isMainPage && selectedLocation) {
      filtered = filtered.filter((item) => {
        if (item.location === selectedLocation) return true;

        const normLoc = item.location
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const normRegion = selectedLocation
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        if (normLoc === normRegion) return true;

        if (selectedLocation === 'Jericoacoara' && item.location === 'jeri') return true;
        if (selectedLocation === 'Praia do Preá' && item.location === 'prea') return true;
        if (selectedLocation === 'Barrinha de Baixo' && item.location === 'barrinha') return true;
        if (
          selectedLocation === 'Guriú' &&
          (item.location === 'jeri' ||
            item.name?.toLowerCase().includes('guriu') ||
            item.description?.toLowerCase().includes('guriu') ||
            item.address?.toLowerCase().includes('guriu'))
        )
          return true;
        if (
          selectedLocation === 'Cavalo Bravo' &&
          (item.name?.toLowerCase().includes('cavalo bravo') ||
            item.description?.toLowerCase().includes('cavalo bravo') ||
            item.address?.toLowerCase().includes('cavalo bravo'))
        )
          return true;
        if (
          selectedLocation === 'Caiçara' &&
          (item.name?.toLowerCase().includes('caiçara') ||
            item.name?.toLowerCase().includes('caicara') ||
            item.description?.toLowerCase().includes('caiçara') ||
            item.description?.toLowerCase().includes('caicara') ||
            item.address?.toLowerCase().includes('caiçara') ||
            item.address?.toLowerCase().includes('caicara'))
        )
          return true;
        if (
          selectedLocation === 'Jijoca de Jericoacoara' &&
          (item.name?.toLowerCase().includes('jijoca') ||
            item.description?.toLowerCase().includes('jijoca') ||
            item.address?.toLowerCase().includes('jijoca'))
        )
          return true;
        if (
          selectedLocation === 'Lagamar' &&
          (item.name?.toLowerCase().includes('lagamar') ||
            item.description?.toLowerCase().includes('lagamar') ||
            item.address?.toLowerCase().includes('lagamar'))
        )
          return true;
        return false;
      });
    }

    if (!query && !selectedLocation) return [];

    return filtered.sort((a, b) => {
      if (query) {
        const q = query.toLowerCase();
        const aNameMatch = a.name?.toLowerCase().includes(q) ? 1 : 0;
        const bNameMatch = b.name?.toLowerCase().includes(q) ? 1 : 0;
        if (aNameMatch !== bNameMatch) {
          return bNameMatch - aNameMatch;
        }
      }

      const isAVerified = !!(a.isVerified && !a.isVerificationSuspended);
      const isBVerified = !!(b.isVerified && !b.isVerificationSuspended);
      if (isAVerified === isBVerified) return 0;
      return isAVerified ? -1 : 1;
    });
  }, [query, selectedLocation, isMainPage, activeCategory, dbItems, dbEvents]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        exit={{ y: '-100%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ zIndex: Z_INDEX.overlay }}
        className="fixed inset-0 bg-zinc-900/80 backdrop-blur-xl"
      />

      <div
        style={{ zIndex: Z_INDEX.overlay + 1 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-2xl h-[34px] pointer-events-none flex justify-end items-center"
      >
        <motion.div
          variants={containerVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="absolute h-[34px] bg-white/10 border border-white/20 backdrop-blur-2xl rounded-xl flex items-center pl-[9px] pr-2 shadow-md focus-within:border-white/40 pointer-events-auto overflow-hidden text-white"
        >
          <Search size={16} className="text-white/50 mr-2 shrink-0" />
          <motion.input
            variants={inputVariants}
            initial="closed"
            animate="open"
            exit="closed"
            autoFocus
            placeholder={searchPlaceholder}
            className="bg-transparent border-none outline-none flex-1 text-white placeholder-white/50 font-medium text-xs h-full w-full pr-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery('')}
              className="text-white/60 hover:text-white/90 active:scale-95 transition-all p-1 mr-1 pointer-events-auto shrink-0 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
              title="Limpar pesquisa"
            >
              <X size={12} className="text-white/60" />
            </button>
          )}
        </motion.div>

        <motion.button
          variants={buttonVariants}
          initial="closed"
          animate="open"
          exit="closed"
          onClick={onClose}
          aria-label="Fechar busca"
          className="relative px-2 text-xs font-bold text-teal-400 tracking-wider uppercase bg-transparent border-none outline-none pointer-events-auto h-[34px] flex items-center shrink-0 before:absolute before:inset-[-6px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none rounded-lg"
        >
          Fechar
        </motion.button>
      </div>

      <motion.div
        variants={contentVariants}
        initial="closed"
        animate="open"
        exit="closed"
        style={{ zIndex: Z_INDEX.overlay + 1 }}
        className="fixed left-1/2 -translate-x-1/2 w-full max-w-2xl bottom-0 top-[74px] px-6 flex flex-col pb-6"
      >
        {!isMainPage && (
          <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2 shrink-0 select-none">
            <button
              onClick={() => setSelectedLocation(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                selectedLocation === null
                  ? 'bg-white text-zinc-950 border-white shadow-md shadow-white/5'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              Todos
            </button>
            {REGIONS.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedLocation(reg)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                  selectedLocation === reg
                    ? 'bg-white text-zinc-950 border-white shadow-md shadow-white/5'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-6 overflow-y-auto flex-1 no-scrollbar pb-20">
          {results.length > 0 ? (
            results.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id}
                className="flex gap-4 items-center cursor-pointer active:scale-95 transition-transform"
                onClick={() => {
                  onSelectItem(item);
                }}
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden glassmorphism border-white/10 flex-shrink-0">
                  <img
                    src={optimizeImage(item.image, 200)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    alt={item.name}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-[9px] font-black tracking-widest uppercase',
                        CATEGORIES[item.category]?.colorClass || 'text-emerald-400'
                      )}
                    >
                      {CATEGORIES[item.category]?.label || item.category}
                    </span>
                    <span className="text-[10px] font-bold text-white/50">
                      {LOCATIONS.find((l) => l.id === item.location)?.name || item.location}
                    </span>
                  </div>
                  <h4 className="font-bold text-base flex items-center gap-2 text-white">
                    {item.name}
                    {item.isVerified && !item.isVerificationSuspended && (
                      <VerifiedBadge size="sm" />
                    )}
                  </h4>
                  <p className="text-xs text-white/35 line-clamp-1 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))
          ) : query || selectedLocation ? (
            <div className="flex flex-col items-center justify-center pt-20">
              <Search size={40} className="text-white/40 mb-4" />
              <p className="text-center text-white/50 font-medium leading-relaxed">
                Nenhum resultado encontrado
                <br />
                Tente mudar sua busca ou filtro.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-[10px] uppercase font-black text-white/50 tracking-[0.3em]">
                Buscas Sugeridas
              </p>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm font-medium text-white/60 hover:bg-white/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
