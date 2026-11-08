import { RefreshCw, ShieldAlert } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import { newPartnerEventDraft } from '../utils/newPartnerEventDraft';
import { MessagePage } from '../../../ui/components/MessagePage';
import { createPartnerContentItemUseCase } from '../application/usecases/createPartnerContentItemUseCase';
import { deletePartnerContentItemUseCase } from '../application/usecases/deletePartnerContentItemUseCase';
import { updatePartnerContentItemUseCase } from '../application/usecases/updatePartnerContentItemUseCase';
import { useEditorScrollLock } from '../hooks/useEditorScrollLock';
import { usePartnerEventSessions } from '../hooks/usePartnerEventSessions';
import { usePartnerPanelActions } from '../hooks/usePartnerPanelActions';
import { usePanelNavigation } from '../hooks/usePanelNavigation';
import { usePanelTour } from '../hooks/usePanelTour';
import { usePlanCheckout } from '../hooks/usePlanCheckout';
import type { PartnerContentRecord } from '../types/partnerContent';
import type { PartnerPanelProps } from './partnerPanelProps';
import { ListingEditor } from './ListingEditor';
import { PartnerEventEditor } from './PartnerEventEditor';
import { ListingPlanFlow } from './panel/ListingPlanFlow';
import { usePartnerPanelHome } from '../hooks/usePartnerPanelHome';
import type { PartnerTodayItem } from '../types/partnerHome';
export type { AgendaSheetProps, PartnerPanelProps } from './partnerPanelProps';
import { belongs } from '../utils/partnerHomeFilter';
import { EstablishmentFilterSheet } from './panel/EstablishmentFilterSheet';
import { ATTENTION_TAB } from './panel/PartnerAttentionList';
import type { CatalogSegment } from './panel/PartnerCatalogTab';
import { PartnerCatalogSection } from './panel/PartnerCatalogSection';
import { PartnerAgoraSection } from './panel/PartnerAgoraSection';
import { PartnerHomeTab } from './panel/PartnerHomeTab';
import { PartnerEarningsTab } from './panel/PartnerEarningsTab';
import { PartnerMoreSection } from './panel/PartnerMoreSection';
import { PartnerPanelTop } from './panel/PartnerPanelTop';
import { PanelTourChooser } from './panel/PanelTourChooser';
import { PartnerPanelTour } from './panel/PartnerPanelTour';
import { PartnerAgendaTab } from './panel/PartnerAgendaTab';
import type { VerificationListingOption } from './verification/verificationListingOption';

export function PartnerPanel({
  profile,
  subscriptionPlans,
  renderReports,
  renderCheckoutModal,
  renderEventTicketingManager,
  renderEventSessionsField,
  renderPlanSubscription,
  renderCatalog,
  onPlanPurchased,
  renderEarnings,
  renderAccountView,
  renderSlotSheet,
  renderSessionSheet,
  renderAgora,
  renderEventAccountCard,
  renderNotificationsHint,
  renderCoupons,
}: PartnerPanelProps) {
  const { goTo } = useLocalizedRouting();
  const { t } = useTranslation();
  const home = usePartnerPanelHome();
  const nav = usePanelNavigation();
  const { panelTab, setPanelTab, eventId } = nav;
  const [catalogSegment, setCatalogSegment] = React.useState<CatalogSegment>('places');
  const [eventsVersion, setEventsVersion] = React.useState(0);
  const [editingHasSales, setEditingHasSales] = React.useState(false);
  const [agendaItem, setAgendaItem] = React.useState<PartnerTodayItem | null>(null);
  const [agendaGate, setAgendaGate] = React.useState(false);
  const [agendaVersion, setAgendaVersion] = React.useState(0);
  const tour = usePanelTour({
    tour: home.data?.tour,
    tab: panelTab,
    editing: home.cards.editing,
    onTabChange: nav.openTab,
  });
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
  const checkout = usePlanCheckout(onPlanPurchased);
  const planVersion = checkout.planVersion;

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
        {!(
          (panelTab === 'catalog' && (nav.placeId || eventId)) ||
          (panelTab === 'earnings' && (nav.openReports || nav.openAccounts))
        ) && (
          <PartnerPanelTop
            home={home}
            tab={panelTab}
            onTabChange={nav.openTab}
            onBack={() => goTo('explore')}
          />
        )}

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
            onOpenCoupons={renderCoupons ? () => nav.openCoupons('home') : undefined}
            agora={
              renderAgora && (
                <PartnerAgoraSection
                  items={home.agora}
                  nameOf={home.placeName}
                  renders={renderAgora}
                  version={agendaVersion}
                  onOpenGate={(item) => {
                    setAgendaGate(true);
                    setAgendaItem(item);
                  }}
                  onChanged={agendaChanged}
                />
              )
            }
          />
        ) : panelTab === 'agenda' ? (
          <PartnerAgendaTab
            visible={(item) => belongs(item.establishmentIds, home.filter)}
            labelFor={home.labelFor}
            onOpenItem={setAgendaItem}
            reloadKey={agendaVersion}
          />
        ) : panelTab === 'catalog' ? (
          <PartnerCatalogSection
            segment={catalogSegment}
            onSegmentChange={(segment) => {
              setCatalogSegment(segment);
              setActiveTab(segment === 'events' ? 'events' : 'items');
            }}
            placeId={nav.placeId}
            onPlaceChange={nav.setPlaceId}
            eventId={eventId}
            onEventChange={nav.setEventId}
            eventReloadKey={agendaVersion}
            onOpenSession={setAgendaItem}
            items={itemsList}
            events={eventsList}
            loading={dataLoading}
            filter={home.filter}
            establishments={home.establishments}
            eventsVersion={eventsVersion}
            onEditItem={(item) => setEditingListing(item)}
            onCreateItem={() => setEditingListing(null)}
            onOpenEvent={(item, hasSales) => {
              setEditingHasSales(hasSales);
              setIsEditing({ ...item, images: item.images || (item.image ? [item.image] : []) });
            }}
            onCreateEvent={() => {
              setEditingHasSales(false);
              setIsEditing(newPartnerEventDraft(user?.uid ?? ''));
            }}
            onOpenPlan={(item) => setPlanListing({ id: item.id, name: item.name })}
            onVerify={(item) =>
              setVerifyingListing({ id: item.id, name: item.name, category: item.category })
            }
            onToggleActive={handleToggleActive}
            verificationVersion={verificationVersion}
            planVersion={planVersion}
            onOpenReviews={() => {
              nav.setOpenReports('reviews');
              setPanelTab('earnings');
            }}
            renders={renderCatalog ?? {}}
            onOpenCoupons={renderCoupons ? nav.openCoupons : undefined}
          />
        ) : panelTab === 'earnings' ? (
          <PartnerEarningsTab
            showReports={nav.openReports}
            onShowReportsChange={nav.setOpenReports}
            showAccounts={nav.openAccounts}
            onShowAccountsChange={nav.setOpenAccounts}
            renders={renderEarnings ?? {}}
            reports={renderReports?.({
              partnerId: user.uid,
              items: itemsList,
              events: eventsList,
              unansweredReviews: Object.fromEntries(
                home.establishments.map((entry) => [entry.id, entry.unansweredReviews])
              ),
            })}
          />
        ) : (
          <PartnerMoreSection
            view={nav.moreView}
            onViewChange={nav.setMoreView}
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
            onReplayTour={() => tour.setChooserOpen(true)}
            renderCoupons={
              renderCoupons
                ? () =>
                    renderCoupons({
                      scope: nav.couponsScope,
                      backLabel: t(nav.couponsBackKey),
                      onBack: () => nav.closeCoupons(() => setCatalogSegment('offers')),
                    })
                : undefined
            }
            notificationsHint={renderNotificationsHint?.()}
          />
        )}
      </div>

      <AnimatePresence>
        {isEditing && isEditing.category === 'event' && (
          <PartnerEventEditor
            item={isEditing}
            onChange={(updatedItem) => setIsEditing(updatedItem)}
            onClose={() => {
              setIsEditing(null);
              setEventsVersion((version) => version + 1);
            }}
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
            renderAccountCard={renderEventAccountCard}
            hasSales={editingHasSales}
            showDeleteConfirm={showDeleteConfirm}
            onRequestDelete={setShowDeleteConfirm}
            onConfirmDelete={async () => {
              await handleDelete();
              nav.setEventId(null);
            }}
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
        onClosedPlan={checkout.bumpPlanVersion}
        onSelectPaidPlan={(selection) => {
          checkout.start(selection);
        }}
        renderSubscription={renderPlanSubscription}
      />

      {agendaItem &&
        (agendaItem.kind === 'slot' ? renderSlotSheet : renderSessionSheet)?.({
          item: agendaItem,
          gate: agendaGate,
          onClose: () => {
            setAgendaItem(null);
            setAgendaGate(false);
          },
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

      {tour.open && (
        <PartnerPanelTour
          startChapter={tour.startChapter}
          onTabChange={nav.openTab}
          onClose={tour.close}
        />
      )}
      <PanelTourChooser
        open={tour.chooserOpen}
        onOpenChange={tour.setChooserOpen}
        onStart={tour.replay}
      />

      {renderCheckoutModal?.({
        isOpen: checkout.open,
        onClose: checkout.onClose,
        ...checkout.selection,
        onPaymentSuccess: checkout.onSuccess,
      })}
    </div>
  );
}
