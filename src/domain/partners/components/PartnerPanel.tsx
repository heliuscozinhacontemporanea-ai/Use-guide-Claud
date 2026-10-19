import { BarChart3, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import React, { useRef } from 'react';

// Componentes estruturais e utilitários da UI
import { BackgroundBlobs } from '../../../ui/components/BackgroundBlobs';
import { createPartnerContentItemUseCase } from '../application/usecases/createPartnerContentItemUseCase';
import { deletePartnerContentItemUseCase } from '../application/usecases/deletePartnerContentItemUseCase';
import { updatePartnerContentItemUseCase } from '../application/usecases/updatePartnerContentItemUseCase';
import { type EventSessionsFieldProps, newEventSessionDraft } from '../../events';
import { useEditorScrollLock } from '../hooks/useEditorScrollLock';
import { usePartnerEventSessions } from '../hooks/usePartnerEventSessions';
import { usePartnerPanelActions } from '../hooks/usePartnerPanelActions';
import { PartnerProfile, SubscriptionPlan } from '../types/partner';
import type { PartnerContentRecord } from '../types/partnerContent';
import { ListingEditor } from './ListingEditor';
import { PartnerEventEditor } from './PartnerEventEditor';
import { PartnerEventsTable } from './subcomponents/PartnerEventsTable';
import { PartnerHeader } from './subcomponents/PartnerHeader';
import { PartnerItemsTable } from './subcomponents/PartnerItemsTable';
import { PartnerTabsNavigation } from './subcomponents/PartnerTabsNavigation';
import { PlansModal } from './subcomponents/PlansModal';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';

export interface PartnerPanelProps {
  profile?: PartnerProfile;
  subscriptionPlans?: SubscriptionPlan[];
  renderReports?: (props: {
    partnerId: string;
    items: PartnerContentRecord[];
    events: PartnerContentRecord[];
  }) => React.ReactNode;
  renderNotificationBell?: (partnerId: string) => React.ReactNode;
  renderCheckoutModal?: (props: {
    isOpen: boolean;
    onClose: () => void;
    itemId: string;
    itemName: string;
    amountMinor: number;
    onPaymentSuccess: () => void;
  }) => React.ReactNode;
  renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
  /** Campo de sessões do evento (domínio events), montado pela composição do app. */
  renderEventSessionsField?: (props: EventSessionsFieldProps) => React.ReactNode;
  planSubscriptionSlot?: React.ReactNode;
  renderBookableOffersManager?: (
    items: Array<{ id: string; name: string; category: string }>
  ) => React.ReactNode;
  /** Chamado ao fechar o checkout depois de um pagamento confirmado, para recarregar o perfil. */
  onPlanPurchased?: () => void;
}

export function PartnerPanel({
  profile,
  subscriptionPlans,
  renderReports,
  renderNotificationBell,
  renderCheckoutModal,
  renderEventTicketingManager,
  renderEventSessionsField,
  planSubscriptionSlot,
  renderBookableOffersManager,
  onPlanPurchased,
}: PartnerPanelProps) {
  const { goTo } = useLocalizedRouting();

  const {
    user,
    userLoading,
    partnerProfile,
    profileStatus,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    isLoading,
    isUploading,
    showDeleteConfirm,
    setShowDeleteConfirm,
    dataLoading,
    isVerified,
    itemsList,
    eventsList,
    handleDelete,
    handleToggleActive,
    handleImageUpload,
    handleSaveEvent,
  } = usePartnerPanelActions(profile);

  // `null` abre o editor para um cadastro novo; `undefined` mantém fechado.
  const [editingListing, setEditingListing] = React.useState<
    PartnerContentRecord | null | undefined
  >(undefined);
  useEditorScrollLock(Boolean(isEditing));
  const editingEventId = isEditing?.category === 'event' ? isEditing.id || undefined : undefined;
  const eventSessions = usePartnerEventSessions(editingEventId, (sessions) =>
    setIsEditing((current) => (current ? { ...current, sessions } : current))
  );

  const [showPlansModal, setShowPlansModal] = React.useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [checkoutPlanInfo, setCheckoutPlanInfo] = React.useState({
    itemId: '',
    itemName: '',
    amountMinor: 0,
  });

  // O modal mostra a própria tela de sucesso; o perfil é recarregado quando o parceiro fecha.
  const planPurchasedRef = useRef(false);
  const handleCheckoutSuccess = () => {
    planPurchasedRef.current = true;
  };
  const handleCheckoutClose = () => {
    setShowCheckoutModal(false);
    if (planPurchasedRef.current) {
      planPurchasedRef.current = false;
      onPlanPurchased?.();
    }
  };

  if (userLoading || profileStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  if (!user || profileStatus === 'empty') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <h2 className="text-2xl font-display font-extrabold mb-2 text-white">Acesso Restrito</h2>
        <p className="text-white/50 mb-8 max-w-xs">
          Este é o portal exclusivo para parceiros cadastrados.
        </p>
        <button
          onClick={() => goTo('explore')}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-semibold tracking-wide text-white"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-40 px-4 bg-[#020508]/60 font-sans selection:bg-teal-500/30 relative overflow-x-hidden backdrop-blur-md">
      <BackgroundBlobs />

      <div
        className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-300 ${isEditing || editingListing !== undefined ? 'opacity-0 scale-[0.98] pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'}`}
      >
        <PartnerHeader
          partnerProfile={partnerProfile}
          onNavigateBack={() => goTo('explore')}
          isVerified={isVerified}
          onVerifyClick={() => setShowPlansModal(true)}
          notificationBell={renderNotificationBell?.(partnerProfile?.id || '')}
        />

        {planSubscriptionSlot}

        <PartnerTabsNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isVerified={isVerified}
        />

        {activeTab === 'reports' ? (
          isVerified ? (
            renderReports?.({ partnerId: user.uid, items: itemsList, events: eventsList })
          ) : (
            <div className="py-24 text-center glassmorphism rounded-[3rem] border border-white/10 p-12">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <BarChart3 size={40} />
              </div>
              <h3 className="text-xl font-display font-black text-white mb-2">
                Relatórios Bloqueados
              </h3>
              <p className="text-white/50 text-sm max-w-xs mx-auto mb-8">
                O acesso aos relatórios é exclusivo para parceiros com o selo de verificação ativo.
              </p>
              <button
                type="button"
                onClick={() => setShowPlansModal(true)}
                className="px-8 py-4 bg-blue-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-400 transition-all cursor-pointer"
              >
                Ativar Verificação
              </button>
            </div>
          )
        ) : activeTab === 'items' ? (
          <>
            <PartnerItemsTable
              itemsList={itemsList}
              loading={dataLoading}
              onEditItem={(item) => setEditingListing(item)}
              onToggleActive={handleToggleActive}
              onCreateNew={() => setEditingListing(null)}
            />
            {renderBookableOffersManager?.(
              itemsList.map((item) => ({ id: item.id, name: item.name, category: item.category }))
            )}
          </>
        ) : (
          <PartnerEventsTable
            eventsList={eventsList}
            loading={dataLoading}
            onEditEvent={(item) =>
              setIsEditing({
                ...item,
                images: item.images || (item.image ? [item.image] : []),
              })
            }
            onToggleActive={handleToggleActive}
            onCreateNew={() =>
              setIsEditing({
                id: '',
                name: '',
                description: '',
                category: 'event',
                location: '',
                ownerId: user?.uid || '',
                image: '',
                images: [],
                operationalInfo: {},
                sessions: [newEventSessionDraft()],
              })
            }
          />
        )}
      </div>

      <AnimatePresence>
        {isEditing && isEditing.category === 'event' && (
          <PartnerEventEditor
            item={isEditing}
            onChange={(updatedItem) => setIsEditing(updatedItem)}
            onClose={() => setIsEditing(null)}
            onSave={() =>
              handleSaveEvent({
                sessionsLoadState: eventSessions.loadState,
                savedSessionIds: eventSessions.savedIds,
              })
            }
            isLoading={isLoading}
            isUploading={isUploading}
            onImageUpload={handleImageUpload}
            businesses={partnerProfile?.businesses}
            sessionsLoadState={eventSessions.loadState}
            renderSessionsField={renderEventSessionsField}
            renderEventTicketingManager={renderEventTicketingManager}
            showDeleteConfirm={showDeleteConfirm}
            onRequestDelete={setShowDeleteConfirm}
            onConfirmDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingListing !== undefined && (
          <ListingEditor
            item={editingListing}
            currentUser={user}
            onSave={async (input, itemId) => {
              if (itemId) {
                await updatePartnerContentItemUseCase(itemId, input);
              } else {
                await createPartnerContentItemUseCase(input);
              }
            }}
            onDelete={deletePartnerContentItemUseCase}
            onClose={() => setEditingListing(undefined)}
          />
        )}
      </AnimatePresence>

      <PlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        userId={user.uid}
        partnerProfile={partnerProfile || undefined}
        plans={subscriptionPlans ?? []}
        onSelectPaidPlan={(planId, planName, amountMinor) => {
          setCheckoutPlanInfo({ itemId: planId, itemName: planName, amountMinor });
          setShowCheckoutModal(true);
        }}
      />

      {renderCheckoutModal?.({
        isOpen: showCheckoutModal,
        onClose: handleCheckoutClose,
        itemId: checkoutPlanInfo.itemId,
        itemName: checkoutPlanInfo.itemName,
        amountMinor: checkoutPlanInfo.amountMinor,
        onPaymentSuccess: handleCheckoutSuccess,
      })}

      <style>{`
        .glassmorphism { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
