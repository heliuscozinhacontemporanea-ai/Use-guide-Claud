import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { NAVIGATION } from '../../shared/constants/navigation';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import type { RouteKey } from '../../shared/i18n';
import { cn } from '../../shared/utils/cn';

interface BottomNavProps {
  /** A página que estava aberta na aba (`?item=…`), para voltar a ela ao trocar de aba (P23). */
  searchFor?: (pathname: string) => string;
  /** Tocou na aba que já está ativa: leva ao topo e, se houver página aberta, volta à raiz (P23). */
  onReselect?: () => void;
}

export function BottomNav({ searchFor, onReselect }: BottomNavProps) {
  const { routeKey, pathFor } = useLocalizedRouting();
  const { t } = useTranslation();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navRef.current) return;

    const alignLeft: RouteKey[] = ['explore', 'events'];
    const alignCenter: RouteKey[] = ['tours', 'stays', 'restaurants'];
    const alignRight: RouteKey[] = ['attractions', 'guide'];
    if (!routeKey) return;

    const container = navRef.current;

    if (alignLeft.includes(routeKey)) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (alignCenter.includes(routeKey)) {
      const scrollAmount = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    } else if (alignRight.includes(routeKey)) {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }
  }, [routeKey]);

  return (
    <nav
      style={{
        zIndex: Z_INDEX.bottomNav,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
      }}
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 flex justify-center pointer-events-none"
    >
      <div
        ref={navRef}
        className="glassmorphism-vibrant rounded-full px-6 py-3 flex items-center gap-[18px] shadow-xl border-line max-w-full overflow-x-auto no-scrollbar scroll-smooth pointer-events-auto"
      >
        {NAVIGATION.map((item) => {
          const path = pathFor(item.routeKey);
          const current = routeKey === item.routeKey;
          return (
            <NavLink
              key={item.routeKey}
              to={current ? path : `${path}${searchFor?.(path) ?? ''}`}
              end
              aria-label={t(item.translationKey)}
              onClick={(event) => {
                if (!current || !onReselect) return;
                event.preventDefault();
                onReselect();
              }}
              className={({ isActive }) =>
                cn(
                  "press flex flex-col items-center justify-center gap-1 relative shrink-0 min-w-11 min-h-11 before:absolute before:inset-[-4px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none rounded-control",
                  isActive ? 'text-accent' : 'text-ink-muted hover:text-ink'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                  {/* Etiqueta curta em maiúsculas: 11 px é o mínimo permitido (DESIGN.md P3). */}
                  <span
                    className={cn(
                      'text-[11px] leading-none font-bold tracking-wide uppercase',
                      isActive ? 'mt-0.5' : 'sr-only'
                    )}
                  >
                    {t(item.translationKey)}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 w-1.5 h-1.5 bg-accent rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
