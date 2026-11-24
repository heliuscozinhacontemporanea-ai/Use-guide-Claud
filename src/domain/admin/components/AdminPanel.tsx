import { RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../../../shared/constants/categories';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import { BackButton } from '../../../ui/components/BackButton';
import { ErrorState } from '../../../ui/components/ErrorState';
import { UserRole, useAuthContext } from '../../auth';
import { useAdminPartnerActions } from '../hooks/useAdminPartnerActions';
import { useAdminPartners } from '../hooks/useAdminPartners';
import { useAdminStats } from '../hooks/useAdminStats';
import { AdminAccessDenied } from './subcomponents/AdminAccessDenied';
import { AdminNavigation, type AdminTabId } from './subcomponents/AdminNavigation';
import { AdminNotificationsView } from './subcomponents/AdminNotificationsView';
import { AdminPartnersView } from './subcomponents/AdminPartnersView';
import { AdminPlansView } from './subcomponents/AdminPlansView';
import { AdminStatsView } from './subcomponents/AdminStatsView';

export interface AdminPanelProps {
  /**
   * Aba "Guia local" montada pela composição (escolhas da F4): anúncios e dicas no editor do
   * parceiro, com as páginas empilhadas.
   */
  renderGuideTab?: () => ReactNode;
  /** Aba "Agenda" montada pela composição: eventos no editor do parceiro (escolhas da F4). */
  renderEventsTab?: () => ReactNode;
  /** Fila de verificação dos estabelecimentos (domínio partners), montada pela composição. */
  renderVerificationQueue?: () => ReactNode;
  /** Filas financeiras (D16, domínio payment), montadas pela composição. */
  renderFinanceQueues?: () => ReactNode;
  /** Fila de denúncias de respostas (D19, domínio reviews), montada pela composição. */
  renderModerationQueue?: () => ReactNode;
}

export function AdminPanel({
  renderGuideTab,
  renderEventsTab,
  renderVerificationQueue,
  renderFinanceQueues,
  renderModerationQueue,
}: AdminPanelProps = {}) {
  const { t } = useTranslation();
  const { goTo } = useLocalizedRouting();
  const { user, loading: userLoading } = useAuthContext();
  const [activeTab, setActiveTab] = useState<AdminTabId>('reports');

  const isAdminUser = user?.role === UserRole.ADMIN;

  const {
    stats,
    error: statsError,
    isLoading: statsLoading,
    reload: fetchStatsData,
  } = useAdminStats(isAdminUser && activeTab === 'reports');
  const {
    partners,
    error: partnersError,
    isLoading: partnersLoading,
    reload: fetchPartners,
    patchPartner,
    removePartner,
  } = useAdminPartners(isAdminUser && activeTab === 'partners');

  const categories = useMemo(
    () => [
      { id: 'all', label: t('adminPanel.guide.filters.all'), color: 'bg-white/10' },
      ...Object.values(CATEGORIES).map((c) => ({
        id: c.id,
        label: c.label,
        color: `${c.bgClass} ${c.colorClass}`,
      })),
    ],
    [t]
  );

  const { handleToggleStatus, handleDeletePartner } = useAdminPartnerActions({
    patchPartner,
    removePartner,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  if (!user || !isAdminUser) {
    return <AdminAccessDenied onBack={() => goTo('explore')} />;
  }

  return (
    <div
      className="min-h-screen pt-[max(1rem,env(safe-area-inset-top))] pb-40 px-4 bg-app font-sans selection:bg-teal-500/30 relative"
      id="admin-panel-viewport"
    >
      <div className="max-w-4xl mx-auto space-y-6 relative">
        <div className="flex items-center gap-2">
          <BackButton label={t('adminPanel.back')} onClick={() => goTo('explore')} />
          <h1 className="text-[22px] font-display font-bold text-ink">{t('adminPanel.title')}</h1>
        </div>

        <AdminNavigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          showVerifications={Boolean(renderVerificationQueue)}
          showFinance={Boolean(renderFinanceQueues)}
          showModeration={Boolean(renderModerationQueue)}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            id="admin-rendered-content"
          >
            {activeTab === 'reports' ? (
              statsError ? (
                <div className="py-6">
                  <ErrorState message={statsError} onRetry={fetchStatsData} />
                </div>
              ) : (
                <AdminStatsView stats={stats} isLoading={statsLoading} categories={categories} />
              )
            ) : activeTab === 'partners' ? (
              partnersError ? (
                <div className="py-6">
                  <ErrorState message={partnersError} onRetry={fetchPartners} />
                </div>
              ) : (
                <AdminPartnersView
                  partners={partners}
                  isLoading={partnersLoading}
                  onToggleStatus={handleToggleStatus}
                  onDeletePartner={handleDeletePartner}
                />
              )
            ) : activeTab === 'verifications' ? (
              renderVerificationQueue?.()
            ) : activeTab === 'finance' ? (
              renderFinanceQueues?.()
            ) : activeTab === 'moderation' ? (
              renderModerationQueue?.()
            ) : activeTab === 'plans' ? (
              <AdminPlansView />
            ) : activeTab === 'notifications' ? (
              <AdminNotificationsView />
            ) : activeTab === 'items' ? (
              renderGuideTab?.()
            ) : (
              renderEventsTab?.()
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
