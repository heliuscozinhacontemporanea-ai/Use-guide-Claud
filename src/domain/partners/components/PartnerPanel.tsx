import { RefreshCw, ShieldAlert } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import type { EventSessionsFieldProps } from '../../events';
import { newPartnerEventDraft } from '../utils/newPartnerEventDraft';
import { MessagePage } from '../../../ui/components/MessagePage';
import { createPartnerContentItemUseCase } from '../application/usecases/createPartnerContentItemUseCase';
import { deletePartnerContentItemUseCase } from '../application/usecases/deletePartnerContentItemUseCase';
import { updatePartnerContentItemUseCase } from '../application/usecases/updatePartnerContentItemUseCase';
import { useEditorScrollLock } from '../hooks/useEditorScrollLock';
import { usePartnerEventSessions } from '../hooks/usePartnerEventSessions';
import { usePartnerPanelActions } from '../hooks/usePartnerPanelActions';
import { PartnerProfile, SubscriptionPlan } from '../types/partner';
import type { PartnerContentRecord } from '../types/partnerContent';
import { ListingEditor } from './ListingEditor';
import { PartnerEventEditor } from './PartnerEventEditor';
import type { PaidPlanSelection } from './plan/ListingPlanDialog';
import { ListingPlanFlow } from './panel/ListingPlanFlow';
import { usePartnerPanelHome } from '../hooks/usePartnerPanelHome';
import type { PartnerTodayItem } from '../types/partnerHome';
import { belongs } from '../utils/partnerHomeFilter';
import { EstablishmentFilterSheet } from './panel/EstablishmentFilterSheet';
import { ATTENTION_TAB } from './panel/PartnerAttentionList';
import { type CatalogSegment, PartnerCatalogTab } from './panel/PartnerCatalogTab';
import { PartnerHomeTab } from './panel/PartnerHomeTab';
import { PartnerEarningsTab } from './panel/PartnerEarningsTab';
import {
  type PartnerAccountView,
  PartnerMoreSection,
  type PartnerMoreView,
} from './panel/PartnerMoreSection';
import { PartnerPanelTop } from './panel/PartnerPanelTop';
import { PartnerAgendaTab } from './panel/PartnerAgendaTab';
import type { PartnerPanelTab } from './panel/partnerPanelTabs';
import type { VerificationListingOption } from './verification/verificationListingOption';

/** O que a composição recebe para abrir a folha de um item da Agenda. */
export interface AgendaSheetProps {
  item: PartnerTodayItem;
  onClose: () => void;
  onChanged: () => void;
}

export interface PartnerPanelProps {
  profile?: PartnerProfile;
  subscriptionPlans?: SubscriptionPlan[];
  renderReports?: (props: {
    partnerId: string;
    items: PartnerContentRecord[];
    events: PartnerContentRecord[];
  }) => React.ReactNode;
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
  /** Ganhos (domínio payment), montado pela composição. */
  renderEarnings?: () => React.ReactNode;
  /** Folha do horário de reserva (domínio bookings), montada pela composição. */
  renderSlotSheet?: (props: AgendaSheetProps) => React.ReactNode;
  /** Folha da sessão de evento (domínio ticketing), montada pela composição. */
  renderSessionSheet?: (props: AgendaSheetProps) => React.ReactNode;
  /** Notificações, termos do parceiro e ajuda (outros domínios), montados pela composição. */
  renderAccountView?: (view: PartnerAccountView, onBack: () => void) => React.ReactNode;
}

export function PartnerPanel({
  profile,
  subscriptionPlans,
  renderReports,
  renderCheckoutModal,
  renderEventTicketingManager,
  renderEventSessionsField,
  renderPlanSubscription,
  renderBookableOffersManager,
  onPlanPurchased,
  renderEarnings,
  renderAccountView,
  renderSlotSheet,
  renderSessionSheet,
}: PartnerPanelProps) {
  const { goTo } = useLocalizedRouting();
  const { t } = useTranslation();
  const home = usePartnerPanelHome();
  const [panelTab, setPanelTab] = React.useState<PartnerPanelTab>('home');
  const [catalogSegment, setCatalogSegment] = React.useState<CatalogSegment>('places');
  const [moreView, setMoreView] = React.useState<PartnerMoreView>('list');
  const [agendaItem, setAgendaItem] = React.useState<PartnerTodayItem | null>(null);
  const [agendaVersion, setAgendaVersion] = React.useState(0);
  const agendaChanged = () => {
    setAgendaVersion((version) => version + 1);
    void home.reload();
  };

  const {
    user,
    userLoading,
    partnerProfile,
    profileStatus,
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
  const eventSessions = usePartnerEventSessions(editingEventId, (details) =>
    setIsEditing((current) => (current ? { ...current, ...details } : current))
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
      <div className="min-h-screen flex items-center justify-center bg-app">
        <RefreshCw className="animate-spin text-accent" size={32} aria-hidden="true" />
      </div>
    );
  }

  if (!user || profileStatus === 'empty') {
    return (
      <MessagePage
        icon={ShieldAlert}
        title={t('pages.partnerAreaTitle')}
        description={t('pages.partnerProfileNotFound')}
        actionLabel={t('pages.backHome')}
        onAction={() => goTo('explore')}
      />
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-40 px-4 bg-app font-sans selection:bg-teal-500/30 relative overflow-x-hidden">
      <div
        className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-300 ${isEditing || editingListing !== undefined ? 'opacity-0 scale-[0.98] pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'}`}
      >
        <PartnerPanelTop
          home={home}
          tab={panelTab}
          onTabChange={(tab) => {
            setPanelTab(tab);
            setMoreView('list');
          }}
          onBack={() => goTo('explore')}
        />

        {panelTab === 'home' ? (
          <PartnerHomeTab
            loading={home.loading}
            error={home.error}
            onRetry={() => void home.reload()}
            view={home.data}
            attention={home.attention}
            cards={home.cards}
            labelFor={home.labelFor}
            onOpenAttention={(item) => setPanelTab(ATTENTION_TAB[item.kind])}
            onOpenTab={setPanelTab}
          />
        ) : panelTab === 'agenda' ? (
          <PartnerAgendaTab
            visible={(item) => belongs(item.establishmentIds, home.filter)}
            labelFor={home.labelFor}
            onOpenItem={setAgendaItem}
            reloadKey={agendaVersion}
          />
        ) : panelTab === 'catalog' ? (
          <PartnerCatalogTab
            segment={catalogSegment}
            onSegmentChange={(segment) => {
              setCatalogSegment(segment);
              setActiveTab(segment === 'events' ? 'events' : 'items');
            }}
            items={itemsList}
            events={eventsList}
            loading={dataLoading}
            onEditItem={(item) => setEditingListing(item)}
            onCreateItem={() => setEditingListing(null)}
            onEditEvent={(item) =>
              setIsEditing({ ...item, images: item.images || (item.image ? [item.image] : []) })
            }
            onCreateEvent={() => setIsEditing(newPartnerEventDraft(user?.uid ?? ''))}
            onToggleActive={handleToggleActive}
            verificationVersion={verificationVersion}
            onVerifyItem={(item) =>
              setVerifyingListing({ id: item.id, name: item.name, category: item.category })
            }
            planVersion={planVersion}
            onOpenPlan={(item) => setPlanListing({ id: item.id, name: item.name })}
            offers={renderBookableOffersManager?.(
              itemsList.map((item) => ({ id: item.id, name: item.name, category: item.category }))
            )}
          />
        ) : panelTab === 'earnings' ? (
          <PartnerEarningsTab
            earnings={renderEarnings?.()}
            reports={renderReports?.({ partnerId: user.uid, items: itemsList, events: eventsList })}
          />
        ) : (
          <PartnerMoreSection
            view={moreView}
            onViewChange={setMoreView}
            establishments={itemsList}
            summary={home.data?.summary ?? null}
            withoutPlan={home.data?.plans.filter((plan) => !plan.until).length ?? 0}
            onOpenProducer={() =>
              setEditingListing(itemsList.find((item) => item.category === 'producer') ?? null)
            }
            onOpenEstablishments={() => {
              setCatalogSegment('places');
              setActiveTab('items');
              setPanelTab('catalog');
            }}
            onOpenPlan={(item) => setPlanListing({ id: item.id, name: item.name })}
            onOpenEarnings={() => setPanelTab('earnings')}
            renderAccountView={renderAccountView}
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

      <ListingPlanFlow
        items={itemsList}
        plans={subscriptionPlans ?? []}
        verifying={verifyingListing}
        onVerifyingChange={setVerifyingListing}
        planListing={planListing}
        onPlanListingChange={setPlanListing}
        onClosedVerification={() => setVerificationVersion((version) => version + 1)}
        onClosedPlan={() => setPlanVersion((version) => version + 1)}
        onSelectPaidPlan={(selection) => {
          setCheckoutPlanInfo(selection);
          setShowCheckoutModal(true);
        }}
        renderSubscription={renderPlanSubscription}
      />

      {agendaItem &&
        (agendaItem.kind === 'slot' ? renderSlotSheet : renderSessionSheet)?.({
          item: agendaItem,
          onClose: () => setAgendaItem(null),
          onChanged: agendaChanged,
        })}

      <EstablishmentFilterSheet
        open={home.sheetOpen}
        onOpenChange={home.setSheetOpen}
        establishments={home.establishments}
        pendingById={home.pendingById}
        value={home.filter}
        onChange={home.setFilter}
        onCreate={() => setEditingListing(null)}
      />

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
