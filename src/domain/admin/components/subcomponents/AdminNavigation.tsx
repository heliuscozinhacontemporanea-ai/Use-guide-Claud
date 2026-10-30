import { useEffect, useRef } from 'react';
import {
  Award,
  Bell,
  Calendar,
  Database,
  Flag,
  Landmark,
  Layers,
  type LucideIcon,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

export type AdminTabId =
  | 'items'
  | 'events'
  | 'reports'
  | 'partners'
  | 'verifications'
  | 'finance'
  | 'moderation'
  | 'plans'
  | 'notifications';

interface AdminNavigationProps {
  activeTab: AdminTabId;
  onSelectTab: (tab: AdminTabId) => void;
  /** A fila de verificação vem de outro domínio; a aba só aparece quando a composição a monta. */
  showVerifications?: boolean;
  /** As filas financeiras vêm do payment; a aba só aparece quando a composição as monta. */
  showFinance?: boolean;
  /** A fila de denúncias vem do reviews (D19); a aba só aparece quando a composição a monta. */
  showModeration?: boolean;
}

// Ordem das abas; o rótulo de cada uma vem da tradução (as de outros domínios usam o namespace deles).
const ADMIN_TABS: { id: AdminTabId; icon: LucideIcon; labelKey: string }[] = [
  { id: 'reports', icon: Database, labelKey: 'adminPanel.tabs.reports' },
  { id: 'partners', icon: Users, labelKey: 'adminPanel.tabs.partners' },
  { id: 'verifications', icon: ShieldCheck, labelKey: 'verification.admin.tab' },
  { id: 'finance', icon: Landmark, labelKey: 'adminFinance.title' },
  { id: 'moderation', icon: Flag, labelKey: 'reviewReports.admin.tab' },
  { id: 'items', icon: Layers, labelKey: 'adminPanel.tabs.items' },
  { id: 'events', icon: Calendar, labelKey: 'adminPanel.tabs.events' },
  { id: 'plans', icon: Award, labelKey: 'adminPanel.tabs.plans' },
  { id: 'notifications', icon: Bell, labelKey: 'adminPanel.tabs.notifications' },
];

/**
 * Abas do painel admin (D17): rolam para o lado no celular, com o nome inteiro, e a ativa fica
 * invertida, sem cor de destaque. A aba escolhida rola para ficar visível.
 */
export function AdminNavigation({
  activeTab,
  onSelectTab,
  showVerifications = false,
  showFinance = false,
  showModeration = false,
}: AdminNavigationProps) {
  const { t } = useTranslation();
  const activeRef = useRef<HTMLButtonElement>(null);
  const shown: Partial<Record<AdminTabId, boolean>> = {
    verifications: showVerifications,
    finance: showFinance,
    moderation: showModeration,
  };
  const tabs = ADMIN_TABS.filter((tab) => shown[tab.id] ?? true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: rolar de novo só quando a aba muda
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeTab]);

  return (
    <nav
      aria-label={t('adminPanel.tabsLabel')}
      id="admin-navigation-tabs"
      className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-app"
    >
      <div className="flex gap-1 p-1 rounded-full bg-ink/[0.06] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const label = t(tab.labelKey);
          return (
            <button
              key={tab.id}
              ref={active ? activeRef : undefined}
              type="button"
              aria-pressed={active}
              aria-label={label}
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                'press shrink-0 min-h-11 px-4 rounded-full inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
                active ? 'bg-ink text-app' : 'text-ink/70 hover:text-ink'
              )}
            >
              <tab.icon size={16} aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
