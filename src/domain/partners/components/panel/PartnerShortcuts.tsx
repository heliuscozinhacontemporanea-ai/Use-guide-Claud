import { CalendarDays, Home, LayoutGrid, type LucideIcon, Menu, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { PARTNER_PANEL_TABS, type PartnerPanelTab } from './partnerPanelTabs';

const ICONS: Record<PartnerPanelTab, LucideIcon> = {
  home: Home,
  agenda: CalendarDays,
  catalog: LayoutGrid,
  earnings: Wallet,
  more: Menu,
};

/** Cinco atalhos no topo, em quadrados com ícone e nome (D27); o painel não tem barra inferior. */
export function PartnerShortcuts({
  value,
  onChange,
}: {
  value: PartnerPanelTab;
  onChange: (tab: PartnerPanelTab) => void;
}) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t('partnerPanel.shortcuts')}
      data-tour="shortcuts"
      className="grid grid-cols-5 gap-2"
    >
      {PARTNER_PANEL_TABS.map((tab) => {
        const Icon = ICONS[tab];
        const active = tab === value;
        return (
          <button
            key={tab}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange(tab)}
            className={cn(
              'press aspect-square min-h-11 rounded-2xl border flex flex-col items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-teal-400/50',
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
              {t(`partnerPanel.tabs.${tab}`)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
