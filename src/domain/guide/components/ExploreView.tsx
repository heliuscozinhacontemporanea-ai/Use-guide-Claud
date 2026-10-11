import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import { SectionTitle } from './SectionTitle';
import { StandardCard } from './StandardCard';
import { LiveConditions } from '../../climawind/components/LiveConditions';
import { Skeleton } from '../../../ui/components/Skeleton';
import { ErrorState } from '../../../ui/components/ErrorState';
import { GuideItem } from '../types/guide';
import { useGuideCatalog } from '../hooks/useGuideCatalog';
import { cn } from '../../../shared/utils/cn';
import { Search } from 'lucide-react';
import { FilterBar, filterItemsList } from '../../search';
import { Z_INDEX } from '../../../shared/constants/zIndex';

interface ExploreViewProps {
  onSelectItem: (item: GuideItem) => void;
  onStickyChange?: (isSticky: boolean) => void;
}

export function ExploreView({ onSelectItem, onStickyChange }: ExploreViewProps) {
  const { goTo } = useLocalizedRouting();
  const { items: dbItems, events: dbEvents, loading, error, retry } = useGuideCatalog();

  const [searchQuery, setSearchQuery] = useState('');

  // Estados e refs para o Pull-to-Refresh
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const isMouseActiveRef = useRef(false);

  useEffect(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (!scrollContainer) return;

    const handleStart = (clientY: number, clientX: number, isMouse: boolean) => {
      if (isRefreshing) return;
      if (
        document.documentElement.classList.contains('scroll-locked') ||
        (scrollContainer as HTMLElement).style.overflowY === 'hidden'
      )
        return;

      // Só inicia se estiver no topo absoluto da rolagem (scrollTop <= 0)
      if (scrollContainer.scrollTop <= 0) {
        startYRef.current = clientY;
        startXRef.current = clientX;
        isPullingRef.current = true;
        isMouseActiveRef.current = isMouse;
      }
    };

    const handleMove = (clientY: number, clientX: number, e: TouchEvent | MouseEvent) => {
      if (!isPullingRef.current || isRefreshing) return;
      if (startYRef.current === null || startXRef.current === null) return;

      const deltaY = clientY - startYRef.current;
      const deltaX = clientX - startXRef.current;

      // Se mover horizontalmente mais do que verticalmente, cancela o puxão
      // Isso evita acidentes ao arrastar carrosséis de banners
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isPullingRef.current = false;
        setIsPulling(false);
        setPullDistance(0);
        return;
      }

      if (deltaY > 0) {
        if (scrollContainer.scrollTop <= 0) {
          if (e.cancelable) {
            e.preventDefault();
          }
          // Resistência elástica amortecida
          const distance = Math.min(deltaY * 0.42, 120);
          setPullDistance(distance);
          setIsPulling(true);
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    const handleEnd = () => {
      if (!isPullingRef.current || isRefreshing) return;
      isPullingRef.current = false;
      isMouseActiveRef.current = false;

      const threshold = 76; // Círculo se forma por completo com 76px de puxão
      if (pullDistance >= threshold) {
        // Dispara o reload um pouco depois para o sumiço visual terminar
        setTimeout(() => {
          window.location.reload();
        }, 150);

        // Zera o estado para o círculo sumir instantaneamente com transição elástica ao soltar
        setPullDistance(0);
        setIsPulling(false);
        setIsRefreshing(false);
      } else {
        // Retorno elástico suave à posição inicial
        const current = pullDistance;
        const duration = 200;
        const startTime = performance.now();

        const animateBack = (time: number) => {
          const elapsed = time - startTime;
          const pct = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - pct, 3); // ease-out cubic
          const val = current * (1 - ease);

          if (pct < 1) {
            setPullDistance(val);
            requestAnimationFrame(animateBack);
          } else {
            setPullDistance(0);
            setIsPulling(false);
          }
        };
        requestAnimationFrame(animateBack);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      handleStart(touch.clientY, touch.clientX, false);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      handleMove(touch.clientY, touch.clientX, e);
    };

    const onTouchEnd = () => {
      handleEnd();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Apenas clique esquerdo
      handleStart(e.clientY, e.clientX, true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseActiveRef.current) return;
      handleMove(e.clientY, e.clientX, e);
    };

    const onMouseUp = () => {
      if (isMouseActiveRef.current) {
        handleEnd();
      }
    };

    scrollContainer.addEventListener('touchstart', onTouchStart as any, { passive: true });
    scrollContainer.addEventListener('touchmove', onTouchMove as any, { passive: false });
    scrollContainer.addEventListener('touchend', onTouchEnd as any, { passive: true });

    scrollContainer.addEventListener('mousedown', onMouseDown as any, { passive: true });
    window.addEventListener('mousemove', onMouseMove as any, { passive: false });
    window.addEventListener('mouseup', onMouseUp as any, { passive: true });

    return () => {
      scrollContainer.removeEventListener('touchstart', onTouchStart as any);
      scrollContainer.removeEventListener('touchmove', onTouchMove as any);
      scrollContainer.removeEventListener('touchend', onTouchEnd as any);

      scrollContainer.removeEventListener('mousedown', onMouseDown as any);
      window.removeEventListener('mousemove', onMouseMove as any);
      window.removeEventListener('mouseup', onMouseUp as any);
    };
  }, [pullDistance, isRefreshing]);

  const [appliedRegions, setAppliedRegions] = useState<string[]>([]);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);

  const sections = useMemo(() => {
    const filterByCategory = (dbData: GuideItem[], category: GuideItem['category']) => {
      if (appliedCategories.length > 0 && !appliedCategories.includes(category)) {
        return [];
      }
      const filtered = filterItemsList(dbData, searchQuery, appliedRegions);
      return filtered
        .filter((item) => item.category === category)
        .sort((a, b) => {
          const isAVerified = !!(a.isVerified && !a.isVerificationSuspended);
          const isBVerified = !!(b.isVerified && !b.isVerificationSuspended);
          if (isAVerified === isBVerified) return 0;
          return isAVerified ? -1 : 1;
        })
        .slice(0, 10);
    };

    return {
      events: filterByCategory(dbEvents, 'event'),
      hotels: filterByCategory(dbItems, 'hotel'),
      restaurants: filterByCategory(dbItems, 'restaurant'),
      tours: filterByCategory(dbItems, 'tour'),
      sights: filterByCategory(dbItems, 'sight'),
      tips: filterByCategory(dbItems, 'tips'),
    };
  }, [searchQuery, appliedRegions, appliedCategories, dbEvents, dbItems]);

  const transformStyle =
    pullDistance > 0
      ? {
          transform: `translate3d(0, ${pullDistance}px, 0)`,
          transition: isPulling ? 'none' : 'transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }
      : undefined;

  const hasActiveFiltersOrSearch =
    searchQuery.trim().length > 0 || appliedRegions.length > 0 || appliedCategories.length > 0;
  const hasAnyResults =
    sections.events.length > 0 ||
    sections.hotels.length > 0 ||
    sections.restaurants.length > 0 ||
    sections.tours.length > 0 ||
    sections.sights.length > 0 ||
    sections.tips.length > 0;

  return (
    <>
      {(pullDistance >= 20 || isRefreshing) && (
        <div
          className="fixed left-0 right-0 pointer-events-none select-none flex justify-center"
          style={{
            zIndex: Z_INDEX.toast,
            top: isRefreshing ? '84px' : `${54 + pullDistance * 0.45}px`,
            opacity: isRefreshing ? 1 : Math.min((pullDistance - 20) / 36, 1),
            transform: `scale(${isRefreshing ? 1 : Math.min(0.5 + (pullDistance / 76) * 0.5, 1)})`,
            transition: isPulling
              ? 'none'
              : 'top 200ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms, transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          <div
            className={cn(
              'w-11 h-11 rounded-full backdrop-blur-xl flex items-center justify-center relative transition-all duration-300',
              pullDistance >= 76
                ? 'bg-white/25 border border-white/40 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                : 'bg-white/10 border border-white/20 shadow-md'
            )}
            style={{
              maskImage: 'radial-gradient(circle, transparent 52%, black 53%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 52%, black 53%)',
            }}
          >
            <svg
              className={cn(
                'w-8 h-8 transform -rotate-90 origin-center absolute',
                isRefreshing && 'animate-spin'
              )}
              viewBox="0 0 36 36"
            >
              <circle
                cx="18"
                cy="18"
                r="13"
                fill="none"
                className="stroke-white/5"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="13"
                fill="none"
                className={cn(
                  'transition-all duration-300',
                  pullDistance >= 76
                    ? 'stroke-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.9)]'
                    : 'stroke-indigo-300/70'
                )}
                strokeWidth="2.5"
                strokeDasharray={isRefreshing ? '22 60' : '81.68'} // 2 * pi * r = 2 * 3.14159 * 13 ≈ 81.68
                strokeDashoffset={isRefreshing ? 0 : 81.68 - 81.68 * Math.min(pullDistance / 76, 1)}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      )}

      <div className="space-y-4 pb-32 relative z-10" style={transformStyle}>
        <div className="px-10 mb-1 mt-0">
          <h2 className="text-2xl font-display font-bold tracking-tight text-white">Explorar</h2>
        </div>

        <FilterBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          appliedRegions={appliedRegions}
          onAppliedRegionsChange={setAppliedRegions}
          appliedCategories={appliedCategories}
          onAppliedCategoriesChange={setAppliedCategories}
          placeholder="Buscar eventos, pousadas, restaurantes..."
          onStickyChange={onStickyChange}
        />

        {(appliedCategories.length === 0 || appliedCategories.includes('event')) &&
          (!hasActiveFiltersOrSearch || sections.events.length > 0) && (
            <>
              <SectionTitle title="Próximos Eventos" onSeeAll={() => goTo('events')} />
              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
                {error ? (
                  <ErrorState message={error} onRetry={retry} />
                ) : loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[90vw] md:min-w-[700px] snap-center">
                      <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
                    </div>
                  ))
                ) : (
                  sections.events
                    .slice(0, 10)
                    .map((item) => (
                      <StandardCard
                        key={item.id}
                        item={item}
                        variant="banner"
                        onClick={() => onSelectItem(item)}
                      />
                    ))
                )}
                {!loading && !error && sections.events.length === 0 && (
                  <div className="flex-1 text-center py-12 text-white/50 font-medium">
                    Nenhum evento agendado.
                  </div>
                )}
              </div>
            </>
          )}

        {(appliedCategories.length === 0 || appliedCategories.includes('restaurant')) &&
          (!hasActiveFiltersOrSearch || sections.restaurants.length > 0) && (
            <>
              <SectionTitle title="Sabores Locais" onSeeAll={() => goTo('restaurants')} />
              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
                {error ? (
                  <ErrorState message={error} onRetry={retry} />
                ) : loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[280px] snap-center">
                      <Skeleton className="aspect-square w-full rounded-3xl" />
                    </div>
                  ))
                ) : (
                  sections.restaurants
                    .slice(0, 10)
                    .map((item) => (
                      <StandardCard
                        key={item.id}
                        item={item}
                        variant="square"
                        onClick={() => onSelectItem(item)}
                      />
                    ))
                )}
              </div>
            </>
          )}

        {(appliedCategories.length === 0 || appliedCategories.includes('hotel')) &&
          (!hasActiveFiltersOrSearch || sections.hotels.length > 0) && (
            <>
              <SectionTitle title="Hospedagem" onSeeAll={() => goTo('stays')} />
              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
                {error ? (
                  <ErrorState message={error} onRetry={retry} />
                ) : loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[280px] snap-center">
                      <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
                    </div>
                  ))
                ) : (
                  sections.hotels
                    .slice(0, 10)
                    .map((item) => (
                      <StandardCard
                        key={item.id}
                        item={item}
                        variant="portrait"
                        onClick={() => onSelectItem(item)}
                      />
                    ))
                )}
              </div>
            </>
          )}

        {(appliedCategories.length === 0 || appliedCategories.includes('tour')) &&
          (!hasActiveFiltersOrSearch || sections.tours.length > 0) && (
            <>
              <SectionTitle title="Aventura & Passeios" onSeeAll={() => goTo('tours')} />
              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
                {error ? (
                  <ErrorState message={error} onRetry={retry} />
                ) : loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[300px] snap-center">
                      <Skeleton className="aspect-video w-full rounded-3xl" />
                    </div>
                  ))
                ) : (
                  sections.tours
                    .slice(0, 10)
                    .map((item) => (
                      <StandardCard
                        key={item.id}
                        item={item}
                        variant="landscape"
                        onClick={() => onSelectItem(item)}
                      />
                    ))
                )}
              </div>
            </>
          )}

        {(appliedCategories.length === 0 || appliedCategories.includes('sight')) &&
          (!hasActiveFiltersOrSearch || sections.sights.length > 0) && (
            <>
              <SectionTitle title="Atrações" onSeeAll={() => goTo('attractions')} />
              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
                {error ? (
                  <ErrorState message={error} onRetry={retry} />
                ) : loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[280px] snap-center">
                      <Skeleton className="aspect-square w-full rounded-full" />
                    </div>
                  ))
                ) : (
                  sections.sights
                    .slice(0, 10)
                    .map((item) => (
                      <StandardCard
                        key={item.id}
                        item={item}
                        variant="square"
                        onClick={() => onSelectItem(item)}
                      />
                    ))
                )}
              </div>
            </>
          )}

        {(appliedCategories.length === 0 || appliedCategories.includes('tips')) &&
          (!hasActiveFiltersOrSearch || sections.tips.length > 0) && (
            <>
              <SectionTitle title="Guia Prático" onSeeAll={() => goTo('guide')} />
              <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
                {error ? (
                  <ErrorState message={error} onRetry={retry} />
                ) : loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[280px] snap-center">
                      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                    </div>
                  ))
                ) : (
                  sections.tips
                    .slice(0, 10)
                    .map((item) => (
                      <StandardCard
                        key={item.id}
                        item={item}
                        variant="landscape"
                        onClick={() => onSelectItem(item)}
                      />
                    ))
                )}
              </div>
            </>
          )}

        {hasActiveFiltersOrSearch && !hasAnyResults && !loading && !error && (
          <div className="mx-10 py-12 px-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center text-center shadow-lg animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Search size={20} className="text-white/50" />
            </div>
            <h3 className="text-base font-display font-bold text-white/90">
              Nenhum resultado encontrado
            </h3>
            <p className="text-xs text-white/45 mt-2 max-w-xs leading-relaxed">
              {searchQuery.trim()
                ? `Não encontramos itens correspondentes a "${searchQuery}" com os filtros aplicados.`
                : 'Não encontramos itens correspondentes aos filtros selecionados neste momento.'}
            </p>
          </div>
        )}

        <LiveConditions />
      </div>
    </>
  );
}
