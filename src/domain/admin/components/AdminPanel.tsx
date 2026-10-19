import { type ReactNode, useMemo, useState } from 'react';
import { UserRole } from '../../auth/types/auth';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthContext } from '../../auth/context/AuthContext';
import { ChevronLeft, RefreshCw, X } from 'lucide-react';
import { useUI } from '../../../shared/stores/useUIStore';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';

import { BackgroundBlobs } from '../../../ui/components/BackgroundBlobs';
import { ErrorState } from '../../../ui/components/ErrorState';
import { CATEGORIES } from '../../../shared/constants/categories';
import {
  createAdminEventListingUseCase,
  deleteAdminEventListingUseCase,
  saveEventSessionsUseCase,
  updateAdminEventListingUseCase,
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
import { useAdminPartnerActions } from '../hooks/useAdminPartnerActions';
import { useAdminStats } from '../hooks/useAdminStats';

import { AdminNavigation, type AdminTabId } from './subcomponents/AdminNavigation';
import { AdminStatsView } from './subcomponents/AdminStatsView';
import { AdminPartnersView } from './subcomponents/AdminPartnersView';
import { AdminGuideView } from './subcomponents/AdminGuideView';
import { AdminEditorModal, type AdminEditorSaveData } from './subcomponents/AdminEditorModal';
import type { AdminEventSlots } from './subcomponents/AdminEditorEventFields';
import { AdminPlansView } from './subcomponents/AdminPlansView';
import { AdminNotificationsView } from './subcomponents/AdminNotificationsView';

function newRecord(category: 'tips' | 'event'): GuideItem {
  return {
    id: '',
    name: '',
    description: '',
    image: '',
    images: [],
    category,
    location: 'Jericoacoara',
  } as GuideItem;
}

export interface AdminListingEditorProps {
  /** Cadastro a editar; `null` cria um novo. */
  item: GuideItem | null;
  onClose: () => void;
}

export interface AdminPanelProps extends AdminEventSlots {
  /**
   * Editor de cadastro (o mesmo do parceiro), montado pela composição do app. Dicas e eventos
   * continuam no editor próprio do admin.
   */
  renderListingEditor?: (props: AdminListingEditorProps) => ReactNode;
}

export function AdminPanel({
  renderListingEditor,
  renderSessionsField,
  renderTicketingManager,
}: AdminPanelProps = {}) {
  const { goTo } = useLocalizedRouting();
  const { user, loading: userLoading } = useAuthContext();
  const { showToast, confirmAction } = useUI();
  const [activeTab, setActiveTab] = useState<AdminTabId>('reports');
  const [filter, setFilter] = useState<string>('all');
  const [isEditing, setIsEditing] = useState<GuideItem | null>(null);
  // `null` abre o editor de cadastro para um item novo; `undefined` mantém fechado.
  const [editingListing, setEditingListing] = useState<GuideItem | null | undefined>(undefined);

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
    error: catalogError,
    retry: fetchCatalog,
  } = useAdminGuideCatalog(isAdminUser && (activeTab === 'items' || activeTab === 'events'));

  const {
    handleToggleVerification,
    handleToggleStatus,
    handleDeletePartner,
  } = useAdminPartnerActions({
    reloadPartners: fetchPartners,
    patchPartner,
    removePartner,
  });

  const handleDelete = async (coll: string, id: string) => {
    if (!(await confirmAction('Excluir este registro?'))) return;
    try {
      if (coll === 'items' || activeTab === 'items') {
        await deleteGuideItemUseCase(id);
      } else {
        await deleteAdminEventListingUseCase(id);
      }
      showToast('Registro excluído.', 'success');
      fetchCatalog();
    } catch (err: unknown) {
      console.error('Erro ao excluir:', err);
      showToast('Não foi possível excluir o registro.', 'error');
    }
  };

  const handleSaveRecord = async (editorData: AdminEditorSaveData) => {
    try {
      if (editorData.category === 'tips') {
        const payload = toGuideItemInput(editorData);
        if (editorData.id) {
          await updateGuideItemUseCase(editorData.id, toGuideItemUpdateInput(editorData));
        } else {
          await createGuideItemUseCase(payload);
        }
      } else {
        const normalizedEventData: GuideItem = {
          ...editorData,
          endDate: editorData.endDate || editorData.date,
          eventCategory: editorData.eventCategory || 'geral',
        };
        const rawOccurrences = editorData.occurrences;

        if (editorData.id) {
          await updateAdminEventListingUseCase(
            editorData.id,
            toGuideEventUpdateInput(normalizedEventData)
          );
          await saveEventSessionsUseCase({
            eventListingId: editorData.id,
            scope: 'admin',
            savedIds: editorData.savedOccurrenceIds ?? [],
            sessions: rawOccurrences ?? [],
          });
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
              : [],
          });
        }
      }
      setIsEditing(null);
      fetchCatalog();
      showToast('Alterações salvas com sucesso!', 'success');
    } catch (err: unknown) {
      console.error('Erro ao salvar registro no admin:', err);
      showToast(err instanceof Error ? err.message : 'Erro ao salvar registro', 'error');
    }
  };

  const filteredItems = useMemo(() => {
    if (filter === 'all') return itemsList;
    return itemsList.filter((i) => i.category === filter);
  }, [itemsList, filter]);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return eventsList;
    return eventsList.filter((e) => e.eventCategory === filter);
  }, [eventsList, filter]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020508]">
        <RefreshCw className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-12 pb-40 px-4 bg-[#020508] font-sans selection:bg-teal-500/30 relative overflow-hidden"
      id="admin-panel-viewport"
    >
      <BackgroundBlobs />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => goTo('explore')}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
              aria-label="Voltar para a página principal"
            >
              <ChevronLeft size={22} />
            </button>
            <div>
              <h1 className="text-3xl font-display font-extrabold tracking-tight text-white">
                Painel Administrativo
              </h1>
              <p className="text-[10px] text-teal-400 font-semibold tracking-wide">
                Governança, Parceiros e Catálogo Geral
              </p>
            </div>
          </div>
        </div>

        <AdminNavigation activeTab={activeTab} onSelectTab={setActiveTab} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'reports' ? (
              statsError ? (
                <ErrorState message={statsError} onRetry={fetchStatsData} />
              ) : (
                <AdminStatsView
                  stats={stats}
                  isLoading={statsLoading}
                  categories={Object.values(CATEGORIES).map((c) => ({
                    id: c.id,
                    label: c.label,
                    color: c.colorClass,
                  }))}
                />
              )
            ) : activeTab === 'partners' ? (
              partnersError ? (
                <ErrorState message={partnersError} onRetry={fetchPartners} />
              ) : (
                <AdminPartnersView
                  partners={partners}
                  isLoading={partnersLoading}
                  onToggleVerification={handleToggleVerification}
                  onToggleStatus={handleToggleStatus}
                  onDeletePartner={handleDeletePartner}
                />
              )
            ) : activeTab === 'items' || activeTab === 'events' ? (
              catalogError ? (
                <ErrorState message={catalogError} onRetry={fetchCatalog} />
              ) : (
                <AdminGuideView
                  activeTab={activeTab}
                  categories={
                    activeTab === 'items'
                      ? Object.values(CATEGORIES).map((c) => ({
                          id: c.id,
                          label: c.label,
                          color: c.colorClass,
                        }))
                      : []
                  }
                  filter={filter}
                  setFilter={setFilter}
                  filteredItems={activeTab === 'items' ? filteredItems : filteredEvents}
                  dataLoading={dataLoading}
                  dataError={catalogError}
                  onRetry={fetchCatalog}
                  onInitNew={() => {
                    if (activeTab === 'items') {
                      setEditingListing(null);
                    } else {
                      setIsEditing(newRecord('event'));
                    }
                  }}
                  onEdit={(item) => {
                    if (activeTab === 'items') {
                      setEditingListing(item);
                    } else {
                      setIsEditing(item);
                    }
                  }}
                  onDelete={handleDelete}
                />
              )
            ) : activeTab === 'plans' ? (
              <AdminPlansView />
            ) : activeTab === 'notifications' ? (
              <AdminNotificationsView />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editingListing !== undefined &&
          renderListingEditor?.({
            item: editingListing,
            onClose: () => setEditingListing(undefined),
          })}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <AdminEditorModal
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            activeTab={activeTab as 'items' | 'events'}
            isAdminUser={isAdminUser}
            onSave={handleSaveRecord}
            renderSessionsField={renderSessionsField}
            renderTicketingManager={renderTicketingManager}
            onDeleteConfirm={async (id) => {
              if (activeTab === 'items') {
                await deleteGuideItemUseCase(id);
              } else {
                await deleteAdminEventListingUseCase(id);
              }
              showToast('Registro excluído.', 'success');
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
