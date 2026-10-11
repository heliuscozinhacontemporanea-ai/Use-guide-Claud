import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NAVIGATION } from '../../shared/constants/navigation';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import type { RouteKey } from '../../shared/i18n';
import { motion } from 'motion/react';
import { cn } from '../../shared/utils/cn';
import { useEffect, useRef } from 'react';
import { Z_INDEX } from '../../shared/constants/zIndex';

export function BottomNav() {
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
        className="glassmorphism-vibrant rounded-full px-6 py-3 flex items-center gap-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-white/10 max-w-full overflow-x-auto no-scrollbar scroll-smooth pointer-events-auto"
      >
        {NAVIGATION.map((item) => (
          <NavLink
            key={item.routeKey}
            to={pathFor(item.routeKey)}
            end
            aria-label={t(item.translationKey)}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative shrink-0 min-w-[50px] before:absolute before:inset-[-4px] before:content-[''] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none rounded-xl",
                isActive ? 'text-teal-400 scale-105' : 'text-white/50 hover:text-white/60'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                <span
                  className={cn(
                    'text-[8px] font-black tracking-widest uppercase transition-all duration-300',
                    isActive ? 'opacity-100 mt-1' : 'sr-only'
                  )}
                >
                  {t(item.translationKey)}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 w-1.5 h-1.5 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
