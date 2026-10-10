import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../auth/types/auth';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthContext } from '../../auth/context/AuthContext';
import { ChevronLeft, RefreshCw, X } from 'lucide-react';
import { useUI } from '../../../shared/stores/useUIStore';

import {
  deletePartnerProfileUseCase,
  updatePartnerStatusUseCase,
  updatePartnerVerificationUseCase,
} from '../../partners';
import { BackgroundBlobs } from '../../../ui/components/BackgroundBlobs';
import { ErrorState } from '../../../ui/components/ErrorState';
import { CATEGORIES } from '../../../shared/constants/categories';
import {
  createAdminEventListingUseCase,
  createAdminEventOccurrenceUseCase,
  deleteAdminEventListingUseCase,
  updateAdminEventListingUseCase,
  updateAdminEventOccurrenceUseCase,
} from '../../events';
import {
  createGuideItemUseCase,
  deleteGuideItemUseCase,
  updateGuideItemUseCase,
  type GuideItem,
} from '../../guide';
import {
  toGuideEventInput,
  toGuideEventUpdateInput,
  toGuideItemInput,
  toGuideItemUpdateInput,
} from '../application/mappers/adminGuideEditorMapper';
import { useAdminGuideCatalog } from '../hooks/useAdminGuideCatalog';
import { useAdminPartners } from '../hooks/useAdminPartners';
import { useAdminStats } from '../hooks/useAdminStats';
import type { AdminPartnerSummary } from '../types/admin';

import { AdminNavigation, type AdminTabId } from './subcomponents/AdminNavigation';
import { AdminStatsView } from './subcomponents/AdminStatsView';
import { AdminPartnersView } from './subcomponents/AdminPartnersView';
import { AdminGuideView } from './subcomponents/AdminGuideView';
import {
  ADMIN_CREATABLE_ITEM_CATEGORIES,
  AdminEditorModal,
} from './subcomponents/AdminEditorModal';
import { AdminPlansView } from './subcomponents/AdminPlansView';
import { AdminNotificationsView } from './subcomponents/AdminNotificationsView';

export { ADMIN_CREATABLE_ITEM_CATEGORIES };

export function AdminPanel() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useAuthContext();
  const { showToast, confirmAction } = useUI();
  const [activeTab, setActiveTab] = useState<AdminTabId>('reports');
  const [filter, setFilter] = useState<string>('all');
  const [isEditing, setIsEditing] = useState<GuideItem | null>(null);

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
  const {
    items: itemsList,
    events: eventsList,
    isLoading: dataLoading,
    error: dataError,
    retry: retryCatalog,
  } = useAdminGuideCatalog(isAdminUser && (activeTab === 'items' || activeTab === 'events'));

  const currentList = activeTab === 'events' ? eventsList : itemsList;

  const filteredItems = useMemo(() => {
    if (filter === 'all') return currentList;
    return currentList.filter((item) => item.category === filter);
  }, [currentList, filter]);

  const categories = useMemo(
    () => [
      { id: 'all', label: 'Todos', color: 'bg-white/10' },
      ...Object.values(CATEGORIES).map((c) => ({
        id: c.id,
        label: c.label,
        color: `${c.bgClass} ${c.colorClass}`,
      })),
    ],
    []
  );

  const handleDelete = async (coll: string, id: string) => {
    if (!(await confirmAction('Excluir permanentemente?'))) return;
    try {
      if (coll === 'items') {
        await deleteGuideItemUseCase(id);
      } else if (coll === 'events') {
        await deleteAdminEventListingUseCase(id);
      }
    } catch (error) {
      console.error(`Erro ao deletar em ${coll}/${id}:`, error);
      showToast('Não foi possível excluir o registro.', 'error');
    }
  };

  const handleToggleVerification = async (partner: AdminPartnerSummary) => {
    if (!(await confirmAction('Alterar status de verificação do parceiro?'))) return;
    const newVerified = !partner.isVerified;
    const verifiedUntil = new Date();
    verifiedUntil.setFullYear(verifiedUntil.getFullYear() + 1);
    const verifiedUntilIso = newVerified ? verifiedUntil.toISOString() : null;
    const verificationType = newVerified ? ('annual' as const) : null;

    try {
      await updatePartnerVerificationUseCase(
        partner.id,
        newVerified,
        verifiedUntilIso,
        verificationType
      );
      patchPartner(partner.id, { isVerified: newVerified });
      showToast('Status de verificação atualizado com sucesso!', 'success');
    } catch {
      showToast('Erro ao atualizar verificação', 'error');
    }
  };

  const handleToggleStatus = async (partner: AdminPartnerSummary) => {
    if (!(await confirmAction('Alterar status do parceiro?'))) return;
    const newStatus = partner.status === 'active' ? 'pending' : 'active';
    try {
      await updatePartnerStatusUseCase(partner.id, newStatus);
      patchPartner(partner.id, { status: newStatus });
    } catch {
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const handleSaveRecord = async (editorData: GuideItem) => {
    try {
      if (activeTab === 'items') {
        if (editorData.id) {
          await updateGuideItemUseCase(editorData.id, toGuideItemUpdateInput(editorData));
        } else {
          await createGuideItemUseCase(toGuideItemInput(editorData));
        }
      } else {
        const normalizedEventData: GuideItem = {
          ...editorData,
          endDate: editorData.endDate || editorData.date,
          eventCategory: editorData.eventCategory || 'geral',
        };
        const rawOccurrences = (
          editorData as GuideItem & {
            occurrences?: Array<{
              id?: string;
              startsAt: string;
              endsAt: string;
              capacity: number;
            }>;
          }
        ).occurrences;

        if (editorData.id) {
          await updateAdminEventListingUseCase(
            editorData.id,
            toGuideEventUpdateInput(normalizedEventData)
          );
          if (Array.isArray(rawOccurrences)) {
            for (const occ of rawOccurrences) {
              if (occ.id) {
                await updateAdminEventOccurrenceUseCase(editorData.id, occ.id, {
                  startsAt: occ.startsAt,
                  endsAt: occ.endsAt,
                  capacity: occ.capacity,
                });
              } else {
                await createAdminEventOccurrenceUseCase(editorData.id, {
                  startsAt: occ.startsAt,
                  endsAt: occ.endsAt,
                  capacity: occ.capacity,
                });
              }
            }
          }
        } else {
          const eventPayload = toGuideEventInput(normalizedEventData);
          await createAdminEventListingUseCase({
            ...eventPayload,
            occurrences: Array.isArray(rawOccurrences)
              ? rawOccurrences.map((occ) => ({
                  startsAt: occ.startsAt,
                  endsAt: occ.endsAt,
                  capacity: occ.capacity,
                }))
              : undefined,
          });
        }
      }
      setIsEditing(null);
    } catch (error: unknown) {
      console.error('[AdminPanel.handleSaveRecord]', error);
      showToast(
        error instanceof Error ? error.message : 'Não foi possível salvar o conteúdo.',
        'error'
      );
      throw error;
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  if (!user || !isAdminUser) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center"
        id="denied-access-screen"
      >
        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
          <X size={40} />
        </div>
        <h2 className="text-2xl font-display font-extrabold mb-2">Acesso Restrito</h2>
        <p className="text-white/50 mb-8 max-w-xs text-sm">
          Você precisa estar autenticado com uma conta de administrador.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="min-h-[44px] px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          Voltar para o Início
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-12 pb-40 px-4 bg-[#020508] font-sans selection:bg-teal-500/30 relative overflow-hidden"
      id="admin-panel-viewport"
    >
      <BackgroundBlobs />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5"
        >
          <button
            type="button"
            aria-label="Voltar para Home"
            onClick={() => navigate('/')}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              CMS Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <p className="text-[10px] text-white/50 uppercase font-black tracking-[0.2em]">
                Gestão de Conteúdo
              </p>
            </div>
          </div>
        </motion.div>

        <AdminNavigation activeTab={activeTab} onSelectTab={setActiveTab} />

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
                  onToggleVerification={handleToggleVerification}
                  onToggleStatus={handleToggleStatus}
                  onDeletePartner={async (id) => {
                    await deletePartnerProfileUseCase(id);
                    removePartner(id);
                  }}
                />
              )
            ) : activeTab === 'plans' ? (
              <AdminPlansView />
            ) : activeTab === 'notifications' ? (
              <AdminNotificationsView />
            ) : (
              <AdminGuideView
                activeTab={activeTab}
                categories={categories}
                filter={filter}
                setFilter={setFilter}
                filteredItems={filteredItems}
                dataLoading={dataLoading}
                dataError={dataError}
                onRetry={retryCatalog}
                onInitNew={() => {
                  const initialCategory = activeTab === 'items' ? 'tips' : 'event';
                  setIsEditing({
                    id: '',
                    name: '',
                    description: '',
                    image: '',
                    images: [],
                    category: initialCategory,
                    location: 'Jericoacoara',
                  } as GuideItem);
                }}
                onEdit={(item) =>
                  setIsEditing({
                    ...item,
                    images: item.images || (item.image ? [item.image] : []),
                  })
                }
                onDelete={handleDelete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isEditing && (
          <AdminEditorModal
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            activeTab={activeTab as 'items' | 'events'}
            isAdminUser={isAdminUser}
            onSave={handleSaveRecord}
            onDeleteConfirm={async (id) => {
              if (activeTab === 'items') {
                await deleteGuideItemUseCase(id);
              } else {
                await deleteAdminEventListingUseCase(id);
              }
            }}
          />
        )}
      </AnimatePresence>

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

