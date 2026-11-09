import { CalendarDays, Home, LayoutGrid, type LucideIcon, Menu, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { PARTNER_PANEL_TABS, type PartnerPanelTab } from './partnerPanelTabs';

const COLS: Record<number, string> = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

const ICONS: Record<PartnerPanelTab, LucideIcon> = {
  home: Home,
  agenda: CalendarDays,
  catalog: LayoutGrid,
  earnings: Wallet,
  more: Menu,
};

/**
 * Atalhos no topo, em quadrados com ícone e nome (D27); o painel não tem barra inferior. Só as abas
 * dos segmentos do parceiro; a do catálogo leva o nome do que ele vende ("Passeios", "Ofertas").
 */
export function PartnerShortcuts({
  value,
  onChange,
  tabs = PARTNER_PANEL_TABS,
  catalogLabel = 'catalog',
}: {
  value: PartnerPanelTab;
  onChange: (tab: PartnerPanelTab) => void;
  tabs?: readonly PartnerPanelTab[];
  /** Chave em `partnerPanel.catalogTab` (ou `catalog`, o nome genérico). */
  catalogLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t('partnerPanel.shortcuts')}
      data-tour="shortcuts"
      className={cn('grid gap-2', COLS[tabs.length] ?? 'grid-cols-5')}
    >
      {tabs.map((tab) => {
        const Icon = ICONS[tab];
        const active = tab === value;
        return (
          <button
            key={tab}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange(tab)}
            className={cn(
              // Com menos abas os quadrados cresceriam demais: a altura fica a de cinco.
              'press min-h-11 rounded-2xl border flex flex-col items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-teal-400/50',
              tabs.length >= 5 ? 'aspect-square' : 'h-[68px]',
              active ? 'bg-ink text-app border-ink' : 'bg-surface border-line text-ink'
            )}
          >
            <Icon size={22} aria-hidden="true" />
            <span
              className={cn(
                'max-w-full text-[11px] font-semibold tracking-tight leading-tight text-center',
                active ? 'text-app' : 'text-ink/80'
              )}
            >
              {tab === 'catalog' && catalogLabel !== 'catalog'
                ? t(`partnerPanel.catalogTab.${catalogLabel}`)
                : t(`partnerPanel.tabs.${tab}`)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
