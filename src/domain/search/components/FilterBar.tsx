import { useState, useEffect, useRef } from 'react';
import { Search, Check, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../shared/utils/cn';
import { FilterBarProps } from '../types/search';
import { REGIONS, CATEGORY_FILTERS, PLACEHOLDER_PHRASES } from '../constants/filterOptions';
import { Z_INDEX } from '../../../shared/constants/zIndex';

export function FilterBar({
  searchQuery,
  onSearchQueryChange,
  appliedRegions,
  onAppliedRegionsChange,
  appliedCategories,
  onAppliedCategoriesChange,
  placeholder = 'Buscar...',
  onStickyChange,
}: FilterBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempSelectedRegions, setTempSelectedRegions] = useState<string[]>([]);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [activeFilterTab, setActiveFilterTab] = useState<'region' | 'category'>('region');
  const [isSticky, setIsSticky] = useState(false);

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_PHRASES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto') || window;

    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const sticky = rect.top <= 54;
        setIsSticky(sticky);
        onStickyChange?.(sticky);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const timer = setTimeout(handleScroll, 100);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [onStickyChange]);

  useEffect(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (!scrollContainer) return;

    if (isFilterOpen) {
      const originalOverflow = (scrollContainer as HTMLElement).style.overflowY;
      (scrollContainer as HTMLElement).style.overflowY = 'hidden';
      return () => {
        (scrollContainer as HTMLElement).style.overflowY = originalOverflow;
      };
    }
  }, [isFilterOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        isFilterOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isFilterOpen]);

  const scrollToSticky = () => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer && containerRef.current) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const rect = containerRef.current.getBoundingClientRect();
      const offsetDiff = rect.top - containerRect.top - 52;

      if (offsetDiff > 1) {
        scrollContainer.scrollBy({
          top: offsetDiff,
          behavior: 'smooth',
        });
      }
    }
  };

  const handleToggleFilterPanel = () => {
    if (!isFilterOpen) {
      setTempSelectedRegions(appliedRegions);
      setTempSelectedCategories(appliedCategories);
      setTimeout(scrollToSticky, 50);
    }
    setIsFilterOpen((prev) => !prev);
  };

  const handleToggleRegion = (region: string) => {
    setTempSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const handleToggleCategory = (category: string) => {
    setTempSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setTempSelectedRegions([]);
    setTempSelectedCategories([]);
    onAppliedRegionsChange([]);
    onAppliedCategoriesChange([]);
    setIsFilterOpen(false);
  };

  const handleApplyFilters = () => {
    onAppliedRegionsChange(tempSelectedRegions);
    onAppliedCategoriesChange(tempSelectedCategories);
    setIsFilterOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{ zIndex: Z_INDEX.header - 10 }}
      className="sticky top-[52px] px-6 py-4 bg-transparent relative"
    >
      <div
        className={cn(
          'absolute -top-[52px] left-0 right-0 bottom-0 z-[-1] pointer-events-none origin-top',
          isSticky
            ? 'glassmorphism-vibrant border-b border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] opacity-100 transition-all duration-200 ease-out'
            : 'opacity-0 border-b border-transparent shadow-none transition-none'
        )}
      />
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 flex items-center h-[34px] rounded-xl bg-white/10 border border-white/20 backdrop-blur-2xl shadow-md px-3 gap-2 focus-within:border-white/40 transition-all duration-300">
          <Search className="text-white/50 shrink-0" size={16} />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onFocus={scrollToSticky}
            onClick={scrollToSticky}
            placeholder={
              placeholder &&
              placeholder !== 'Buscar...' &&
              placeholder !== 'Buscar eventos, pousadas, restaurantes...'
                ? placeholder
                : PLACEHOLDER_PHRASES[currentPlaceholderIndex]
            }
            maxLength={100}
            className="w-full bg-transparent border-none text-white placeholder-white/45 focus:outline-none focus:ring-0 text-sm py-0 h-full pr-1"
          />
          {searchQuery.length > 0 && (
            <button
              onClick={() => onSearchQueryChange('')}
              type="button"
              className="text-white/60 hover:text-white/90 active:scale-95 transition-all p-1 pointer-events-auto shrink-0 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
              title="Limpar pesquisa"
            >
              <X size={12} className="text-white/60" />
            </button>
          )}
        </div>

        <button
          onClick={handleToggleFilterPanel}
          type="button"
          aria-label={isFilterOpen ? 'Fechar filtros' : 'Abrir filtros'}
          aria-expanded={isFilterOpen}
          className={cn(
            "h-[34px] w-[34px] shrink-0 rounded-xl border border-white/20 backdrop-blur-2xl flex items-center justify-center transition-all duration-300 relative shadow-md before:absolute before:inset-[-5px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none",
            isFilterOpen || appliedRegions.length > 0 || appliedCategories.length > 0
              ? 'bg-white/20 border-white/40 text-white shadow-[0_0_8px_rgba(255,255,255,0.15)] scale-105'
              : 'bg-white/10 border-white/20 text-white/60 hover:text-white/90 hover:bg-white/20'
          )}
          title="Filtrar locais"
        >
          <Filter size={14} />
          {(appliedRegions.length > 0 || appliedCategories.length > 0) && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] font-black text-black shadow-md border border-white/40 animate-pulse">
              {appliedRegions.length + appliedCategories.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ zIndex: Z_INDEX.dropdown }}
            className="absolute left-6 right-6 mt-2 rounded-[2rem] border border-white/20 bg-zinc-900/80 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] p-5"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-2.5 border-b border-white/5 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/45">
                  Filtrar por:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('region')}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 uppercase tracking-wider border outline-none',
                      activeFilterTab === 'region'
                        ? 'bg-white text-zinc-950 border-white shadow-md shadow-white/5'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    Região
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('category')}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 uppercase tracking-wider border outline-none',
                      activeFilterTab === 'category'
                        ? 'bg-white text-zinc-950 border-white shadow-md shadow-white/5'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    Categorias
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar py-1">
                {activeFilterTab === 'region'
                  ? REGIONS.map((region) => {
                      const isChecked = tempSelectedRegions.includes(region);
                      return (
                        <button
                          key={region}
                          onClick={() => handleToggleRegion(region)}
                          type="button"
                          className={cn(
                            'flex items-center text-left gap-3 px-3.5 py-3 rounded-xl border transition-all duration-200 select-none',
                            isChecked
                              ? 'bg-white/15 border-white/35 text-white'
                              : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/15 hover:text-white/80'
                          )}
                        >
                          <div
                            className={cn(
                              'w-5 h-5 rounded-md border flex items-center justify-center transition-all',
                              isChecked ? 'bg-white border-white text-[#0B0D13]' : 'border-white/30'
                            )}
                          >
                            {isChecked && <Check size={14} className="stroke-[3.5px]" />}
                          </div>
                          <span className="text-sm font-semibold tracking-wide">{region}</span>
                        </button>
                      );
                    })
                  : CATEGORY_FILTERS.map((cat) => {
                      const isChecked = tempSelectedCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleToggleCategory(cat.id)}
                          type="button"
                          className={cn(
                            'flex items-center text-left gap-3 px-3.5 py-3 rounded-xl border transition-all duration-200 select-none',
                            isChecked
                              ? 'bg-white/15 border-white/35 text-white'
                              : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/15 hover:text-white/80'
                          )}
                        >
                          <div
                            className={cn(
                              'w-5 h-5 rounded-md border flex items-center justify-center transition-all',
                              isChecked ? 'bg-white border-white text-[#0B0D13]' : 'border-white/30'
                            )}
                          >
                            {isChecked && <Check size={14} className="stroke-[3.5px]" />}
                          </div>
                          <span className="text-sm font-semibold tracking-wide">{cat.label}</span>
                        </button>
                      );
                    })}
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95"
                >
                  Limpar
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-[1.5] py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-black bg-teal-500 hover:bg-teal-400 shadow-lg shadow-teal-500/20 transition-all duration-200 active:scale-95 text-center flex items-center justify-center gap-1"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
