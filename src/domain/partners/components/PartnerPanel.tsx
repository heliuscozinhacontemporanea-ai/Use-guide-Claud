import { BarChart3, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  onPlanPurchased?: () => void;
  renderReports?: (props: {
    partnerId: string;
    items: PartnerContentRecord[];
    events: PartnerContentRecord[];
  }) => React.ReactNode;
  renderNotificationBell?: (partnerId: string) => React.ReactNode;
  renderCheckoutModal?: (props: {
    isOpen: boolean;
    onClose: () => void;
    planId: string;
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
}

export function PartnerPanel({
  profile,
  subscriptionPlans = [],
  onPlanPurchased,
  renderReports,
  renderNotificationBell,
  renderCheckoutModal,
  renderEventTicketingManager,
  renderEventSessionsField,
  planSubscriptionSlot,
  renderBookableOffersManager,
  onPlanPurchased: _onPlanPurchased,
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
    isUploading,
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

  if (!user || !partnerProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <h2 className="text-xl font-display font-bold text-white mb-4">Portal do Parceiro</h2>
        <p className="text-white/50 text-xs mb-6 max-w-xs">
          Faça login para gerenciar seu estabelecimento ou eventos.
        </p>
        <button
          type="button"
          onClick={() => goTo('explore')}
          className="px-6 py-3 rounded-2xl bg-teal-500 text-black font-black uppercase tracking-widest text-[10px]"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-12 pb-40 px-4 bg-[#020508] font-sans selection:bg-teal-500/30 relative overflow-hidden"
      id="partner-panel-viewport"
    >
      <BackgroundBlobs />

      <div
        className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-300 ${isEditing || editingListing !== undefined ? 'opacity-0 scale-[0.98] pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'}`}
      >
        <PartnerHeader
          partnerProfile={partnerProfile}
          isVerified={isVerified}
          onNavigateBack={() => goTo('explore')}
          onOpenPlansModal={() => setShowPlansModal(true)}
          renderNotificationBell={renderNotificationBell}
        />

        {planSubscriptionSlot}

        <PartnerTabsNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isVerified={isVerified}
          hasItems={itemsList.length > 0}
          hasEvents={eventsList.length > 0}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            id="partner-tab-content"
          >
            {activeTab === 'items' ? (
              <PartnerItemsTable
                itemsList={itemsList}
                loading={dataLoading}
                onEditItem={(item) => setEditingListing(item)}
                onToggleActive={handleToggleActive}
                onCreateNew={() => setEditingListing(null)}
              />
            ) : activeTab === 'events' ? (
              <PartnerEventsTable
                eventsList={eventsList}
                loading={dataLoading}
                onEditEvent={(event) => setIsEditing(event)}
                onToggleActive={handleToggleActive}
                onCreateNew={() =>
                  setIsEditing({
                    id: '',
                    name: '',
                    description: '',
                    category: 'event',
                    eventCategory: '',
                    location: partnerProfile.region || 'Jericoacoara',
                    googleMapsLink: '',
                    image: '',
                    images: [],
                    operationalInfo: {},
                    sessions: [newEventSessionDraft()],
                  })
                }
              />
            ) : (
              renderReports?.({
                partnerId: partnerProfile.id,
                items: itemsList,
                events: eventsList,
              }) || (
                <div className="py-20 text-center glassmorphism rounded-[3rem] p-10 border border-white/10">
                  <BarChart3 className="mx-auto text-teal-400 mb-4" size={48} />
                  <h3 className="text-white font-bold text-lg">Métricas e Relatórios</h3>
                  <p className="text-white/50 text-xs mt-1">
                    Visualize o desempenho dos seus anúncios em breve.
                  </p>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>

        {renderEventTicketingManager && (
          <div className="pt-6">{renderEventTicketingManager(partnerProfile.id)}</div>
        )}
      </div>

      <AnimatePresence>
        {isEditing && isEditing.category === 'event' && (
          <PartnerEventEditor
            item={isEditing}
            onChange={(updatedItem) => setIsEditing(updatedItem)}
            onClose={() => setIsEditing(null)}
            onSave={handleSaveEvent}
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
            cpfCnpj={partnerProfile?.cpfCnpj}
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
        userId={user?.uid || ''}
        partnerProfile={partnerProfile || undefined}
        plans={subscriptionPlans}
        onSelectPaidPlan={(planId, itemName, amountMinor) => {
          setCheckoutPlanInfo({ itemId: planId, itemName, amountMinor });
          setShowCheckoutModal(true);
        }}
      />

      <AnimatePresence>
        {showCheckoutModal && renderCheckoutModal?.({
          isOpen: showCheckoutModal,
          onClose: handleCheckoutClose,
          planId: checkoutPlanInfo.itemId,
          itemName: checkoutPlanInfo.itemName,
          amountMinor: checkoutPlanInfo.amountMinor,
          onPaymentSuccess: handleCheckoutSuccess,
        })}
      </AnimatePresence>
    </div>
  );
}
