
import { motion } from 'motion/react';
import { Award, Bell, Calendar, Database, Layers, ShieldCheck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';

export type AdminTabId =
  | 'items'
  | 'events'
  | 'reports'
  | 'partners'
  | 'verifications'
  | 'plans'
  | 'notifications';

interface AdminNavigationProps {
  activeTab: AdminTabId;
  onSelectTab: (tab: AdminTabId) => void;
  /** A fila de verificação vem de outro domínio; a aba só aparece quando a composição a monta. */
  showVerifications?: boolean;
}

const ADMIN_TABS = [
  {
    id: 'reports' as const,
    label: 'Relatórios',
    icon: Database,
    color: 'bg-amber-500',
    shadow: 'shadow-amber-500/40',
  },
  {
    id: 'partners' as const,
    label: 'Parceiros',
    icon: Users,
    color: 'bg-indigo-500',
    shadow: 'shadow-indigo-500/40',
  },
  {
    id: 'verifications' as const,
    label: '',
    icon: ShieldCheck,
    color: 'bg-emerald-500',
    shadow: 'shadow-emerald-500/40',
  },
  {
    id: 'items' as const,
    label: 'Guia Local',
    icon: Layers,
    color: 'bg-teal-500',
    shadow: 'shadow-teal-500/40',
  },
  {
    id: 'events' as const,
    label: 'Agenda',
    icon: Calendar,
    color: 'bg-[#00D4FF]',
    shadow: 'shadow-[#00D4FF]/40',
  },
  {
    id: 'plans' as const,
    label: 'Planos',
    icon: Award,
    color: 'bg-fuchsia-500',
    shadow: 'shadow-fuchsia-500/40',
  },
  {
    id: 'notifications' as const,
    label: 'Avisos',
    icon: Bell,
    color: 'bg-rose-500',
    shadow: 'shadow-rose-500/40',
  },
];

export function AdminNavigation({
  activeTab,
  onSelectTab,
  showVerifications = false,
}: AdminNavigationProps) {
  const { t } = useTranslation();
  const tabs = ADMIN_TABS.filter((tab) => tab.id !== 'verifications' || showVerifications).map(
    (tab) => (tab.id === 'verifications' ? { ...tab, label: t('verification.admin.tab') } : tab)
  );
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex gap-2 p-2 glassmorphism rounded-[2rem] sticky top-20 z-50 shadow-2xl"
      id="admin-navigation-tabs"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelectTab(tab.id)}
          aria-label={tab.label}
          className={cn(
            'flex-1 min-h-[44px] flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-[10px] font-extrabold uppercase tracking-[0.1em] transition-all relative group overflow-hidden focus-visible:ring-2 focus-visible:ring-teal-400/50',
            activeTab === tab.id
              ? `${tab.color} text-black shadow-lg ${tab.shadow} scale-[1.02]`
              : 'text-white/50 hover:bg-white/5'
          )}
        >
          <tab.icon size={14} strokeWidth={activeTab === tab.id ? 3 : 2} />
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:sr-only">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-glow"
              className="absolute inset-0 bg-white/20 blur-xl -z-10"
            />
          )}
        </button>
      ))}
    </motion.div>
  );
}
