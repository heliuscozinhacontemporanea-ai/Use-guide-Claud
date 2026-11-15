import { RefreshCw, ShieldAlert } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import { MessagePage } from '../../../ui/components/MessagePage';
import { createPartnerContentItemUseCase } from '../application/usecases/createPartnerContentItemUseCase';
import { deletePartnerContentItemUseCase } from '../application/usecases/deletePartnerContentItemUseCase';
import { updatePartnerContentItemUseCase } from '../application/usecases/updatePartnerContentItemUseCase';
import { PanelTimeZoneProvider } from '../hooks/panelTimeZone';
import { useEditorScrollLock } from '../hooks/useEditorScrollLock';
import { usePanelNavigation } from '../hooks/usePanelNavigation';
import { usePanelTour } from '../hooks/usePanelTour';
import { usePartnerEventSessions } from '../hooks/usePartnerEventSessions';
import { usePartnerPanelActions } from '../hooks/usePartnerPanelActions';
import { usePartnerPanelHome } from '../hooks/usePartnerPanelHome';
import { usePartnerSegments } from '../hooks/usePartnerSegments';
import { usePlanCheckout } from '../hooks/usePlanCheckout';
import type { PartnerContentRecord } from '../types/partnerContent';
import type { PartnerTodayItem } from '../types/partnerHome';
import { newPartnerEventDraft } from '../utils/newPartnerEventDraft';
import { startingHomeCards } from '../utils/partnerSegments';
import { ListingEditor } from './ListingEditor';
import { PartnerEventEditor } from './PartnerEventEditor';
import { ListingPlanFlow } from './panel/ListingPlanFlow';
import type { PartnerPanelProps } from './partnerPanelProps';

export type { AgendaSheetProps, PartnerPanelProps } from './partnerPanelProps';

import { belongs } from '../utils/partnerHomeFilter';
import { AddSegmentSheet } from './panel/AddSegmentSheet';
import { EstablishmentFilterSheet } from './panel/EstablishmentFilterSheet';
import { PanelTourChooser } from './panel/PanelTourChooser';
import { PartnerAgendaTab } from './panel/PartnerAgendaTab';
import { PartnerAgoraSection } from './panel/PartnerAgoraSection';
import { ATTENTION_TAB } from './panel/PartnerAttentionList';
import { PartnerCatalogSection } from './panel/PartnerCatalogSection';
import type { CatalogSegment } from './panel/PartnerCatalogTab';
import { PartnerEarningsTab } from './panel/PartnerEarningsTab';
import { PartnerHomeTab } from './panel/PartnerHomeTab';
import { PartnerMoreSection } from './panel/PartnerMoreSection';
import {
  type PartnerPanelPageContext,
  PartnerPanelPageContent,
  partnerPanelPageTitle,
} from './panel/PartnerPanelPageContent';
import { PartnerPanelStack } from './panel/PartnerPanelStack';
import { PartnerPanelTop } from './panel/PartnerPanelTop';
import { PartnerPanelTour } from './panel/PartnerPanelTour';
import type { PartnerPanelTab } from './panel/partnerPanelTabs';
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
  renderGateStaff,
}: PartnerPanelProps) {
  const { goTo } = useLocalizedRouting();
  const { t } = useTranslation();
  const home = usePartnerPanelHome();
  const nav = usePanelNavigation();
  // Salvar do passo do guia aberto (D34): a página entrega, a barra chama.
  const listingSave = React.useRef<(() => void) | null>(null);
  const { panelTab, setPanelTab } = nav;
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
  const segments = usePartnerSegments(itemsList, eventsList);
  const catalogPart = segments.catalogParts.includes(catalogSegment)
    ? catalogSegment
    : (segments.catalogParts[0] ?? 'places');
  // Aba guardada que não existe nos segmentos (ex.: Agenda num restaurante) volta ao Início.
  React.useEffect(() => {
    if (!segments.tabs.includes(panelTab)) setPanelTab('home');
  }, [segments.tabs, panelTab, setPanelTab]);

  // Início por segmento (S4): só os cartões que fazem sentido para o que o parceiro faz.
  const homeCards = React.useMemo(() => {
    const allowed = segments.homeCards;
    if (!allowed) return home.cards;
    const ids = startingHomeCards(segments.segments, home.cards.cards).filter((id) =>
      allowed.includes(id)
    );
    return {
      ...home.cards,
      visible: ids
        .map(home.cards.dataOf)
        .filter((card): card is NonNullable<typeof card> => card !== null),
      available: home.cards.available.filter((id) => allowed.includes(id)),
      // "Personalizar início" parte do que está na tela.
      startEditing: () => home.cards.setDraft(ids),
    };
  }, [home.cards, segments.homeCards, segments.segments]);
  // Vitrine (sem venda pelo app): visitas do mês do estabelecimento em vista, como no print aprovado.
  const shownPlace =
    itemsList.find((entry) => entry.id === home.filter) ??
    (itemsList.length === 1 ? itemsList[0] : undefined);
  const visitsCard =
    !segments.tabs.includes('earnings') && shownPlace
      ? renderCatalog?.renderVisits?.(shownPlace.id, () =>
          setPlanListing({ id: shownPlace.id, name: shownPlace.name })
        )
      : undefined;
  const chapterLabel = (tab: PartnerPanelTab) =>
    tab === 'catalog' && segments.catalogLabel !== 'catalog'
      ? t(`partnerPanel.catalogTab.${segments.catalogLabel}`)
      : t(`partnerTour.chapters.${tab}`);

  // `null` abre o editor para um cadastro novo; `undefined` mantém fechado.
  const [editingListing, setEditingListing] = React.useState<
    PartnerContentRecord | null | undefined
  >(undefined);
  // Categorias aceitas no cadastro novo aberto pelo "Também trabalha com…?" (S3).
  const [newListingCategories, setNewListingCategories] = React.useState<string[] | undefined>();
  const [addSegmentOpen, setAddSegmentOpen] = React.useState(false);
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

  const pageContext: PartnerPanelPageContext = {
    items: itemsList,
    events: eventsList,
    establishments: home.establishments,
    eventReloadKey: agendaVersion,
    eventsVersion,
    verificationVersion,
    planVersion,
    catalogRenders: renderCatalog ?? {},
    earningsRenders: renderEarnings ?? {},
    reportsProfile: renderReports?.({
      partnerId: user.uid,
      items: itemsList,
      events: eventsList,
      unansweredReviews: Object.fromEntries(
        home.establishments.map((entry) => [entry.id, entry.unansweredReviews])
      ),
    }),
    onOpenSession: setAgendaItem,
    onEditItem: (item) => setEditingListing(item),
    onEditEvent: (item, hasSales) => {
      setEditingHasSales(hasSales);
      setIsEditing({ ...item, images: item.images || (item.image ? [item.image] : []) });
    },
    onOpenPlan: (listing) => setPlanListing({ id: listing.id, name: listing.name }),
    onVerify: (item) =>
      setVerifyingListing({ id: item.id, name: item.name, category: item.category }),
    onToggleActive: handleToggleActive,
    onOpenReportsProfile: nav.openReportsProfile,
    onOpenAccount: nav.openAccount,
    onOpenCoupons: renderCoupons ? nav.openCoupons : undefined,
    onOpenEarnings: segments.tabs.includes('earnings') ? () => nav.openTab('earnings') : undefined,
    listingSteps: home.data?.firstSteps?.listing.steps ?? [],
    registerListingSave: (save) => {
      listingSave.current = save;
    },
    onListingDone: () => {
      void home.reload();
      nav.pages.back();
    },
    renderAccountView,
    renderCoupons,
    renderGateStaff,
  };

  return (
    <PanelTimeZoneProvider timeZone={home.timeZone} establishments={home.establishments}>
      <PartnerPanelStack
        stack={nav.pages}
        root={
          <div className="min-h-full pt-12 pb-40 px-4 bg-app font-sans selection:bg-teal-500/30 relative overflow-x-hidden">
            <div
              className={`max-w-4xl mx-auto space-y-8 relative z-10 transition-all duration-300 ${isEditing || editingListing !== undefined ? 'opacity-0 scale-[0.98] pointer-events-none h-0 overflow-hidden' : 'opacity-100 scale-100'}`}
            >
              <PartnerPanelTop
                home={home}
                tab={panelTab}
                onTabChange={nav.openTab}
                onBack={() => goTo('explore')}
                tabs={segments.tabs}
                catalogLabel={segments.catalogLabel}
              />

              {panelTab === 'home' ? (
                <PartnerHomeTab
                  loading={home.loading}
                  error={home.error}
                  onRetry={() => void home.reload()}
                  view={home.data}
                  attention={home.attention}
                  cards={homeCards}
                  leadingCard={visitsCard}
                  labelFor={home.labelFor}
                  onOpenAttention={(item) => setPanelTab(ATTENTION_TAB[item.kind])}
                  onOpenListingStep={nav.openListingStep}
                  onOpenStep={(step) => {
                    const item = itemsList.find((entry) => entry.id === step.itemId);
                    if (step.id === 'verify' && item) {
                      setVerifyingListing({
                        id: item.id,
                        name: item.name,
                        category: item.category,
                      });
                    } else if (step.id === 'account') {
                      nav.openAccounts();
                    } else if ((step.id === 'offer' || step.id === 'slots') && item) {
                      nav.openPlace(item);
                    } else if (step.id === 'event') {
                      setEditingHasSales(false);
                      setIsEditing(newPartnerEventDraft(user?.uid ?? ''));
                    }
                  }}
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
                  timeZone={home.timeZone}
                />
              ) : panelTab === 'catalog' ? (
                <PartnerCatalogSection
                  segment={catalogPart}
                  parts={segments.catalogParts}
                  offersLabel={segments.offersLabel}
                  title={
                    segments.catalogLabel === 'catalog'
                      ? undefined
                      : t(`partnerPanel.catalogTab.${segments.catalogLabel}`)
                  }
                  onSegmentChange={(segment) => {
                    setCatalogSegment(segment);
                    setActiveTab(segment === 'events' ? 'events' : 'items');
                  }}
                  onOpenPlace={nav.openPlace}
                  onOpenEvent={nav.openEvent}
                  items={itemsList}
                  loading={dataLoading}
                  filter={home.filter}
                  establishments={home.establishments}
                  eventsVersion={eventsVersion}
                  onCreateItem={() => setEditingListing(null)}
                  onCreateEvent={() => {
                    setEditingHasSales(false);
                    setIsEditing(newPartnerEventDraft(user?.uid ?? ''));
                  }}
                  renders={renderCatalog ?? {}}
                  onOpenCoupons={renderCoupons ? nav.openCoupons : undefined}
                />
              ) : panelTab === 'earnings' ? (
                <PartnerEarningsTab
                  renders={renderEarnings ?? {}}
                  onOpenReports={nav.openReports}
                  onOpenAccounts={nav.openAccounts}
                />
              ) : (
                <PartnerMoreSection
                  showProducer={
                    segments.segments.length === 0 || segments.segments.includes('events')
                  }
                  showGateStaff={
                    segments.segments.length === 0 ||
                    segments.segments.includes('events') ||
                    segments.segments.includes('attraction')
                  }
                  sells={segments.tabs.includes('earnings')}
                  onAddSegment={() => setAddSegmentOpen(true)}
                  couponsSegment={segments.couponsLabel}
                  onOpenPage={nav.openMorePage}
                  summary={home.data?.summary ?? null}
                  withoutPlan={home.data?.plans.filter((plan) => !plan.until).length ?? 0}
                  onOpenProducer={() =>
                    setEditingListing(
                      itemsList.find((item) => item.category === 'producer') ?? null
                    )
                  }
                  onOpenEstablishments={() => {
                    setCatalogSegment('places');
                    setActiveTab('items');
                    setPanelTab('catalog');
                  }}
                  onOpenEarnings={() => setPanelTab('earnings')}
                  hasAccountViews={Boolean(renderAccountView)}
                  hasCoupons={Boolean(renderCoupons)}
                  hasGateStaff={Boolean(renderGateStaff)}
                  onReplayTour={() => tour.setChooserOpen(true)}
                  notificationsHint={renderNotificationsHint?.()}
                />
              )}
            </div>
          </div>
        }
        // Páginas por cima do painel (D33): barra fixa, mola e voltar arrastando.
        renderPage={(page) => ({
          title: partnerPanelPageTitle(page, t, segments.couponsLabel),
          content: <PartnerPanelPageContent page={page} context={pageContext} />,
          // Passo do guia (D34): "Salvar" na barra grava e volta ao Início.
          action:
            page.view === 'listing-step' && page.step !== 'publish'
              ? { label: t('partnerGuide.page.save'), onClick: () => listingSave.current?.() }
              : undefined,
        })}
      />

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
            establishments={itemsList}
            sessionsLoadState={eventSessions.loadState}
            renderSessionsField={renderEventSessionsField}
            renderEventTicketingManager={renderEventTicketingManager}
            renderAccountCard={renderEventAccountCard}
            hasSales={editingHasSales}
            showDeleteConfirm={showDeleteConfirm}
            onRequestDelete={setShowDeleteConfirm}
            onConfirmDelete={async () => {
              await handleDelete();
              // O evento excluído não tem mais página: fecha a dele, se estava aberta.
              if (nav.pages.getPages().at(-1)?.view === 'event') nav.pages.back();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingListing !== undefined && (
          <ListingEditor
            item={editingListing}
            allowedCategoryIds={editingListing ? undefined : newListingCategories}
            currentUser={user}
            onSave={async (input, itemId) => {
              if (itemId) {
                await updatePartnerContentItemUseCase(itemId, input);
              } else {
                await createPartnerContentItemUseCase(input);
              }
            }}
            onDelete={deletePartnerContentItemUseCase}
            onClose={() => {
              setEditingListing(undefined);
              setNewListingCategories(undefined);
            }}
          />
        )}
      </AnimatePresence>

      <AddSegmentSheet
        open={addSegmentOpen}
        onOpenChange={setAddSegmentOpen}
        segments={segments.segments}
        onChoose={(categories) => {
          setNewListingCategories(categories);
          setEditingListing(null);
        }}
      />

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
          tabs={segments.tabs}
          chapterLabel={chapterLabel}
          startChapter={tour.startChapter}
          onTabChange={nav.openTab}
          onClose={tour.close}
        />
      )}
      <PanelTourChooser
        open={tour.chooserOpen}
        onOpenChange={tour.setChooserOpen}
        onStart={tour.replay}
        tabs={segments.tabs}
        chapterLabel={chapterLabel}
      />

      {renderCheckoutModal?.({
        isOpen: checkout.open,
        onClose: checkout.onClose,
        ...checkout.selection,
        onPaymentSuccess: checkout.onSuccess,
      })}
    </PanelTimeZoneProvider>
  );
}
