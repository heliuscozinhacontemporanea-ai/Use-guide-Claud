import { RefreshCw } from 'lucide-react';
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
import { ListingVerificationDialog } from './verification/ListingVerificationDialog';
import type { VerificationListingOption } from './verification/verificationListingOption';
import { ListingPlanDialog, type PaidPlanSelection } from './plan/ListingPlanDialog';
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
    /** Estabelecimento que recebe o plano (D11). */
    itemId: string;
    planId: string;
    itemName: string;
    amountMinor: number;
    onPaymentSuccess: () => void;
  }) => React.ReactNode;
  renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
  /** Campo de sessões do evento (domínio events), montado pela composição do app. */
  renderEventSessionsField?: (props: EventSessionsFieldProps) => React.ReactNode;
  /** Assinatura no cartão do plano de um estabelecimento, montada pela composição. */
  renderPlanSubscription?: (
    itemId: string,
    onLiveChange: (live: boolean) => void
  ) => React.ReactNode;
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
  renderPlanSubscription,
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

  const [verifyingListing, setVerifyingListing] = React.useState<VerificationListingOption | null>(
    null
  );
  // Troca a chave dos selos de verificação para relerem o status depois de um envio.
  const [verificationVersion, setVerificationVersion] = React.useState(0);

  const [planListing, setPlanListing] = React.useState<{ id: string; name: string } | null>(null);
  // Troca a chave dos selos de plano para relerem o estado depois do trial ou da compra.
  const [planVersion, setPlanVersion] = React.useState(0);
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [checkoutPlanInfo, setCheckoutPlanInfo] = React.useState<PaidPlanSelection>({
    itemId: '',
    planId: 'monthly',
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
      setPlanVersion((version) => version + 1);
      onPlanPurchased?.();
    }
  };

  if (userLoading || profileStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="animate-spin text-accent" size={32} />
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
          className="press px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-semibold tracking-wide text-white"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-40 px-4 bg-app/60 font-sans selection:bg-teal-500/30 relative overflow-x-hidden backdrop-blur-md">
      <BackgroundBlobs />

      <div
        className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-300 ${isEditing || editingListing !== undefined ? 'opacity-0 scale-[0.98] pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'}`}
      >
        <PartnerHeader
          partnerProfile={partnerProfile}
          onNavigateBack={() => goTo('explore')}
          notificationBell={renderNotificationBell?.(partnerProfile?.id || '')}
        />

        <PartnerTabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'reports' ? (
          renderReports?.({ partnerId: user.uid, items: itemsList, events: eventsList })
        ) : activeTab === 'items' ? (
          <>
            <PartnerItemsTable
              itemsList={itemsList}
              loading={dataLoading}
              onEditItem={(item) => setEditingListing(item)}
              onToggleActive={handleToggleActive}
              onCreateNew={() => setEditingListing(null)}
              verificationVersion={verificationVersion}
              onVerifyItem={(item) =>
                setVerifyingListing({ id: item.id, name: item.name, category: item.category })
              }
              planVersion={planVersion}
              onOpenPlan={(item) => setPlanListing({ id: item.id, name: item.name })}
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

      {verifyingListing && (
        <ListingVerificationDialog
          listing={verifyingListing}
          accountListings={itemsList.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
          }))}
          onClose={() => {
            setVerifyingListing(null);
            setVerificationVersion((version) => version + 1);
          }}
        />
      )}

      {planListing && (
        <ListingPlanDialog
          listing={planListing}
          plans={subscriptionPlans ?? []}
          onClose={() => {
            setPlanListing(null);
            setPlanVersion((version) => version + 1);
          }}
          onVerify={() => {
            const listing = itemsList.find((item) => item.id === planListing.id);
            setPlanListing(null);
            if (listing) {
              setVerifyingListing({
                id: listing.id,
                name: listing.name,
                category: listing.category,
              });
            }
          }}
          onSelectPaidPlan={(selection) => {
            setPlanListing(null);
            setCheckoutPlanInfo(selection);
            setShowCheckoutModal(true);
          }}
          renderSubscription={renderPlanSubscription}
        />
      )}

      {renderCheckoutModal?.({
        isOpen: showCheckoutModal,
        onClose: handleCheckoutClose,
        itemId: checkoutPlanInfo.itemId,
        planId: checkoutPlanInfo.planId,
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
