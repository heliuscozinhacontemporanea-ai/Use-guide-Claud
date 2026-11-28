import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { NAVIGATION, type NavTab, tabOfRoute } from '../../shared/constants/navigation';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import type { RouteKey } from '../../shared/i18n';
import { cn } from '../../shared/utils/cn';

interface BottomNavProps {
  /** Onde a aba estava (pílula e anúncio abertos), para voltar a esse lugar ao trocar de aba (P23). */
  rememberedPlace?: (tab: NavTab) => { routeKey: RouteKey; search: string } | null;
  /** Tocou na aba que já está ativa: leva ao topo e, se houver página aberta, volta à raiz (P23). */
  onReselect?: () => void;
}

/** Barra inferior da D37: três abas fixas; cada categoria acende a aba a que pertence. */
export function BottomNav({ rememberedPlace, onReselect }: BottomNavProps) {
  const { routeKey, pathFor } = useLocalizedRouting();
  const { t } = useTranslation();
  const activeTab = tabOfRoute(routeKey);

  return (
    <nav
      aria-label={t('navigation.label')}
      style={{
        zIndex: Z_INDEX.bottomNav,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
      }}
      className="fixed left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 flex justify-center pointer-events-none"
    >
      <div className="glassmorphism-vibrant rounded-full h-16 w-full max-w-sm px-2 flex items-center justify-around shadow-xl border-line pointer-events-auto">
        {NAVIGATION.map((item) => {
          const active = activeTab === item.tab;
          const place = active ? null : rememberedPlace?.(item.tab);
          const to = place ? `${pathFor(place.routeKey)}${place.search}` : pathFor(item.routeKey);
          return (
            <Link
              key={item.tab}
              to={to}
              aria-current={active ? 'page' : undefined}
              onClick={(event) => {
                if (!active || !onReselect) return;
                event.preventDefault();
                onReselect();
              }}
              className={cn(
                'press flex flex-col items-center justify-center gap-0.5 min-w-16 min-h-12 px-2 rounded-control focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
                active ? 'text-accent' : 'text-ink-muted hover:text-ink'
              )}
            >
              <item.icon size={24} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
              <span className={cn('text-caption', active ? 'font-semibold' : 'font-medium')}>
                {t(item.translationKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
