# Prompt 18.3.1a — Plano e selo por estabelecimento no painel do parceiro

> Lote 15, gerado do commit de referência `4f3fddb` da branch `claude/agents-md-v2`. Aplique depois do 18.3b.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3.1a — Plano e selo por estabelecimento no painel do parceiro (D11)

Telas do plano por estabelecimento, sobre o backend do lote 14.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D11 (docs/arquitetura/decisoes.md): o plano "Use Guide Verificado" e o selo são de cada estabelecimento. O selo só aparece com plano ativo E verificação aprovada pela equipe (D12). Avaliações e respostas continuam liberadas sem plano; as métricas exigem o plano.

O QUE MUDA:
1) Domínio partners (frontend):
   - fatia nova listingPlan: types/listingPlan.ts, ports/listingPlanPort.ts, adapters/apiListingPlanAdapter.ts (GET /api/listing-plans/:itemId e POST /:itemId/trial), getListingPlanUseCase, activateListingTrialUseCase, hooks/useListingPlan.ts, utils/listingPlanStatus.ts e utils/listingPlanErrorMessage.ts;
   - components/plan/: ListingPlanChip (selo de plano em cada cadastro), ListingPlanDialog (estado do plano, assinatura do cartão, benefícios, teste grátis e períodos pagos; sem verificação aprovada, mostra o aviso e leva ao diálogo de verificação), ListingPlanStatus, ListingPlanOptions e ListingPlanBenefits;
   - PartnerItemsTable mostra o selo de plano ao lado do selo de verificação; PartnerPanel abre o diálogo do plano por cadastro e manda itemId e planId para o checkout;
   - a conta deixa de ter selo: PartnerHeader sem o botão do selo, PartnerTabsNavigation sem o cadeado em Relatórios, usePartnerProfile e os tipos sem isVerified, verifiedUntil, verificationType, isVerificationSuspended e hasUsedTrial;
   - saem PlansModal.tsx, activateTrialUseCase.ts e activateTrial do port e do adapter da conta.
2) Domínio payment (frontend): Pix avulso, assinatura, leitura e renovação levam itemId (GET /api/payment/plans/subscription?itemId=, cancel e resume com { itemId }); CheckoutModal recebe itemId; PlanSubscriptionCard recebe itemId; erros novos traduzidos pelo code (LISTING_PENDING_VERIFICATION, PLAN_ALREADY_ACTIVE, PARTNER_SUSPENDED, NOT_FOUND).
3) Composição (PartnerPortalComposition): monta o checkout com itemId e planId e a assinatura de cada cadastro (renderPlanSubscription).
4) Relatórios (insights): o adapter lança o code do backend; sem plano (LISTING_PLAN_REQUIRED), a tela mostra o aviso do plano e as avaliações continuam visíveis.
5) i18n: src/shared/i18n/listingPlanResources.ts nos 3 idiomas, registrado em resources.ts; textos novos em insightsResources.ts e em errors.payment.

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/app/compositions/PartnerPortalComposition.tsx (alterar)
- src/domain/insights/adapters/InsightsAdapter.ts (alterar)
- src/domain/insights/components/ReportsView.tsx (alterar)
- src/domain/insights/hooks/useEntityReport.test.ts (criar)
- src/domain/insights/hooks/useEntityReport.ts (alterar)
- src/domain/partners/adapters/apiListingPlanAdapter.test.ts (criar)
- src/domain/partners/adapters/apiListingPlanAdapter.ts (criar)
- src/domain/partners/adapters/apiPartnerAdapter.ts (alterar)
- src/domain/partners/application/usecases/activateListingTrialUseCase.ts (criar)
- src/domain/partners/application/usecases/activateTrialUseCase.ts (apagar)
- src/domain/partners/application/usecases/getListingPlanUseCase.ts (criar)
- src/domain/partners/components/PartnerPanel.tsx (alterar)
- src/domain/partners/components/plan/ListingPlanBenefits.tsx (criar)
- src/domain/partners/components/plan/ListingPlanChip.tsx (criar)
- src/domain/partners/components/plan/ListingPlanDialog.test.tsx (criar)
- src/domain/partners/components/plan/ListingPlanDialog.tsx (criar)
- src/domain/partners/components/plan/ListingPlanOptions.tsx (criar)
- src/domain/partners/components/plan/ListingPlanStatus.tsx (criar)
- src/domain/partners/components/subcomponents/PartnerHeader.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerItemsTable.test.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerItemsTable.tsx (alterar)
- src/domain/partners/components/subcomponents/PartnerTabsNavigation.tsx (alterar)
- src/domain/partners/components/subcomponents/PlansModal.tsx (apagar)
- src/domain/partners/factory.ts (alterar)
- src/domain/partners/hooks/useListingPlan.ts (criar)
- src/domain/partners/hooks/usePartnerPanelActions.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.test.ts (alterar)
- src/domain/partners/hooks/usePartnerProfile.ts (alterar)
- src/domain/partners/index.ts (alterar)
- src/domain/partners/ports/listingPlanPort.ts (criar)
- src/domain/partners/ports/partnerPort.ts (alterar)
- src/domain/partners/types/listingPlan.ts (criar)
- src/domain/partners/types/partner.ts (alterar)
- src/domain/partners/utils/listingPlanErrorMessage.ts (criar)
- src/domain/partners/utils/listingPlanStatus.test.ts (criar)
- src/domain/partners/utils/listingPlanStatus.ts (criar)
- src/domain/payment/api/apiPaymentAdapter.test.ts (alterar)
- src/domain/payment/api/apiPaymentAdapter.ts (alterar)
- src/domain/payment/application/usecases/getPlanSubscriptionUseCase.ts (alterar)
- src/domain/payment/application/usecases/setPlanSubscriptionRenewalUseCase.ts (alterar)
- src/domain/payment/components/CheckoutModal.tsx (alterar)
- src/domain/payment/components/PlanSubscriptionCard.tsx (alterar)
- src/domain/payment/components/subcomponents/OneTimePlanCheckout.tsx (alterar)
- src/domain/payment/components/subcomponents/SubscriptionPlanCheckout.tsx (alterar)
- src/domain/payment/hooks/usePayment.ts (alterar)
- src/domain/payment/hooks/usePlanSubscriptionCheckout.test.ts (alterar)
- src/domain/payment/hooks/usePlanSubscriptionCheckout.ts (alterar)
- src/domain/payment/hooks/usePlanSubscriptionStatus.ts (alterar)
- src/domain/payment/ports/paymentApiPort.ts (alterar)
- src/domain/payment/types/payment.ts (alterar)
- src/domain/payment/utils/paymentErrorMessage.ts (alterar)
- src/shared/i18n/insightsResources.ts (alterar)
- src/shared/i18n/listingPlanResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== src/app/compositions/PartnerPortalComposition.tsx — diff ===
@@ -154,22 +154,24 @@ export function PartnerPortalComposition() {
         isOpen,
         onClose,
         itemId,
+        planId,
         itemName,
         amountMinor,
         onPaymentSuccess,
       }) =>
-        isPaidPlanId(itemId) ? (
+        isPaidPlanId(planId) ? (
           <CheckoutModal
             isOpen={isOpen}
             onClose={onClose}
-            planId={itemId}
+            itemId={itemId}
+            planId={planId}
             itemName={itemName}
             amountMinor={amountMinor}
             onPaymentSuccess={onPaymentSuccess}
           />
         ) : null
       }
-      planSubscriptionSlot={<PlanSubscriptionCard />}
+      renderPlanSubscription={(itemId) => <PlanSubscriptionCard itemId={itemId} />}
       renderBookableOffersManager={(items) => <PartnerBookingsComposition items={items} />}
       renderEventTicketingManager={(eventListingId) => (
         <PartnerEventTicketingManager eventListingId={eventListingId} />

=== src/domain/insights/adapters/InsightsAdapter.ts — diff ===
@@ -39,7 +39,9 @@ export class InsightsAdapter implements InsightsPort {
       { requireAuth: true }
     );
     if (!res.ok) {
-      throw new Error(`INSIGHTS_STATS_${res.status}`);
+      // Lança o `code` estável (AGENTS.md §10.2): LISTING_PLAN_REQUIRED vira o aviso de plano (D11).
+      const body = await res.json().catch(() => ({}));
+      throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
     }
     const json = (await res.json()) as { data: ItemStats };
     return json.data;

=== src/domain/insights/components/ReportsView.tsx — diff ===
@@ -1,4 +1,4 @@
-import { ArrowLeft } from 'lucide-react';
+import { ArrowLeft, Lock } from 'lucide-react';
 import { motion } from 'motion/react';
 import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
@@ -111,8 +111,23 @@ export function ReportsView({ items, events }: ReportsViewProps) {
           />
           <span className="sr-only">{t('insights.reports.loading')}</span>
         </div>
-      ) : report.error || !report.stats ? (
+      ) : report.error ? (
         <ErrorState message={t('insights.reports.loadError')} onRetry={report.reload} />
+      ) : report.statsLocked || !report.stats ? (
+        <div className="space-y-8">
+          <div className="p-6 rounded-[2rem] border border-amber-500/20 bg-amber-500/10 flex items-start gap-3">
+            <Lock size={18} className="text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
+            <div className="space-y-1">
+              <h4 className="text-sm font-bold text-white">
+                {t('insights.reports.planRequiredTitle')}
+              </h4>
+              <p className="text-xs text-amber-100 leading-relaxed">
+                {t('insights.reports.planRequired')}
+              </p>
+            </div>
+          </div>
+          <PendingReviewsPanel reviews={report.reviews} onReplied={report.markReplied} />
+        </div>
       ) : (
         <motion.div
           initial={{ opacity: 0, y: 20 }}

=== src/domain/insights/hooks/useEntityReport.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ stats: vi.fn(), reviews: vi.fn() }));
vi.mock('../application/usecases/getItemStatsUseCase', () => ({ getItemStatsUseCase: m.stats }));
vi.mock('../../reviews', () => ({ getReviewsUseCase: m.reviews }));

import { useEntityReport } from './useEntityReport';

const TARGET = { id: 'item-1', type: 'items' as const };
const REVIEW = { id: 'r1', rating: 5 };

describe('useEntityReport (D11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.reviews.mockResolvedValue({ items: [REVIEW] });
  });

  it('sem plano: métricas travadas, avaliações carregadas e sem erro', async () => {
    m.stats.mockRejectedValue(new Error('LISTING_PLAN_REQUIRED'));
    const { result } = renderHook(() => useEntityReport(TARGET));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.statsLocked).toBe(true);
    expect(result.current.error).toBe(false);
    expect(result.current.reviews).toEqual([REVIEW]);
  });

  it('outra falha nas métricas vira erro com nova tentativa', async () => {
    m.stats.mockRejectedValue(new Error('INTERNAL_ERROR'));
    const { result } = renderHook(() => useEntityReport(TARGET));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.statsLocked).toBe(false);
    expect(result.current.error).toBe(true);
  });

  it('com plano: métricas e avaliações', async () => {
    m.stats.mockResolvedValue({ views: 3 });
    const { result } = renderHook(() => useEntityReport(TARGET));
    await waitFor(() => expect(result.current.stats).toEqual({ views: 3 }));
    expect(result.current.reviews).toEqual([REVIEW]);
  });
});

=== src/domain/insights/hooks/useEntityReport.ts — diff ===
@@ -5,15 +5,20 @@ import type { ItemStats } from '../types/interaction';
 import type { PartnerReview, ReportCollection } from '../types/report';
 
 const REVIEWS_PAGE_SIZE = 50;
+const PLAN_REQUIRED = 'LISTING_PLAN_REQUIRED';
 
 interface ReportTarget {
   id: string;
   type: ReportCollection;
 }
 
-/** Métricas e avaliações do item selecionado no relatório do parceiro. */
+/**
+ * Métricas e avaliações do item selecionado no relatório do parceiro. As métricas exigem o plano
+ * do estabelecimento (D11); as avaliações não, por isso as duas cargas falham separadas.
+ */
 export function useEntityReport(target: ReportTarget | null) {
   const [stats, setStats] = useState<ItemStats | null>(null);
+  const [statsLocked, setStatsLocked] = useState(false);
   const [reviews, setReviews] = useState<PartnerReview[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(false);
@@ -25,19 +30,30 @@ export function useEntityReport(target: ReportTarget | null) {
     if (!targetId || !targetType) return;
     setLoading(true);
     setError(false);
-    try {
-      const [itemStats, reviewsPage] = await Promise.all([
-        getItemStatsUseCase(targetId, targetType),
-        getReviewsUseCase(targetId, REVIEWS_PAGE_SIZE, 'recent', null, targetType),
-      ]);
-      setStats(itemStats);
-      setReviews(reviewsPage.items);
-    } catch (err) {
-      console.error('[useEntityReport Error]:', err);
+    setStatsLocked(false);
+    const [statsResult, reviewsResult] = await Promise.allSettled([
+      getItemStatsUseCase(targetId, targetType),
+      getReviewsUseCase(targetId, REVIEWS_PAGE_SIZE, 'recent', null, targetType),
+    ]);
+    if (statsResult.status === 'fulfilled') {
+      setStats(statsResult.value);
+    } else {
+      setStats(null);
+      const locked =
+        statsResult.reason instanceof Error && statsResult.reason.message === PLAN_REQUIRED;
+      setStatsLocked(locked);
+      if (!locked) {
+        console.error('[useEntityReport Error]:', statsResult.reason);
+        setError(true);
+      }
+    }
+    if (reviewsResult.status === 'fulfilled') {
+      setReviews(reviewsResult.value.items);
+    } else {
+      console.error('[useEntityReport Error]:', reviewsResult.reason);
       setError(true);
-    } finally {
-      setLoading(false);
     }
+    setLoading(false);
   }, [targetId, targetType]);
 
   useEffect(() => {
@@ -50,5 +66,5 @@ export function useEntityReport(target: ReportTarget | null) {
     );
   }, []);
 
-  return { stats, reviews, loading, error, reload: load, markReplied };
+  return { stats, statsLocked, reviews, loading, error, reload: load, markReplied };
 }

=== src/domain/partners/adapters/apiListingPlanAdapter.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.hoisted(() => vi.fn());
vi.mock('../../../shared/infrastructure/firebase/firebaseApiFetch', () => ({
  firebaseApiFetch: fetchMock,
}));

import { ApiListingPlanAdapter } from './apiListingPlanAdapter';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe('ApiListingPlanAdapter', () => {
  const adapter = new ApiListingPlanAdapter();
  beforeEach(() => fetchMock.mockReset());

  it('lê o plano do estabelecimento com autenticação e App Check', async () => {
    fetchMock.mockResolvedValue(ok({ data: { itemId: 'item-1', planActive: false } }));
    await expect(adapter.get('item-1')).resolves.toMatchObject({ itemId: 'item-1' });
    const [path, init, options] = fetchMock.mock.calls[0] ?? [];
    expect(path).toBe('/api/listing-plans/item-1');
    expect(init).toMatchObject({ method: 'GET' });
    expect(options).toEqual({ requireAuth: true, requireAppCheck: true });
  });

  it('ativa o teste grátis por POST no estabelecimento', async () => {
    fetchMock.mockResolvedValue(ok({ data: { itemId: 'item-1', planType: 'trial' } }));
    await adapter.activateTrial('item-1');
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/listing-plans/item-1/trial');
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST' });
  });

  it('lança o code estável do erro', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'TRIAL_ALREADY_USED' } }), { status: 409 })
    );
    await expect(adapter.activateTrial('item-1')).rejects.toThrow('TRIAL_ALREADY_USED');
  });
});

=== src/domain/partners/adapters/apiListingPlanAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { ListingPlanPort } from '../ports/listingPlanPort';
import type { ListingPlanView } from '../types/listingPlan';

const OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

const planPath = (itemId: string) => `/api/listing-plans/${encodeURIComponent(itemId)}`;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function call(path: string, init: RequestInit): Promise<ListingPlanView> {
  const response = await firebaseApiFetch(path, init, OPTIONS);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
  }
  return (body as { data: ListingPlanView }).data;
}

export class ApiListingPlanAdapter implements ListingPlanPort {
  get(itemId: string): Promise<ListingPlanView> {
    return call(planPath(itemId), { method: 'GET' });
  }

  activateTrial(itemId: string): Promise<ListingPlanView> {
    return call(`${planPath(itemId)}/trial`, { method: 'POST' });
  }
}

=== src/domain/partners/adapters/apiPartnerAdapter.ts — diff ===
@@ -22,25 +22,6 @@ export class ApiPartnerAdapter implements PartnerPort {
     }
   }
 
-  async activateTrial(partnerId: string): Promise<void> {
-    const res = await firebaseApiFetch(
-      '/api/partners/activate-trial',
-      {
-        method: 'POST',
-        headers: {
-          'Content-Type': 'application/json',
-        },
-        body: JSON.stringify({ partnerId }),
-      },
-      { requireAuth: true }
-    );
-
-    if (!res.ok) {
-      const errorData = await res.json().catch(() => ({}));
-      throw new Error(errorData.error || 'Erro ao ativar o período de testes grátis no backend');
-    }
-  }
-
   async getPartnerProfile(partnerId: string): Promise<PartnerProfile | null> {
     const response = await firebaseApiFetch(
       `/api/partners/profile/${encodeURIComponent(partnerId)}`,

=== src/domain/partners/application/usecases/activateListingTrialUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanAdapter } from '../../factory';
import type { ListingPlanView } from '../../types/listingPlan';

export function activateListingTrialUseCase(itemId: string): Promise<ListingPlanView> {
  return listingPlanAdapter.activateTrial(itemId);
}

=== src/domain/partners/application/usecases/activateTrialUseCase.ts — APAGUE este arquivo ===

=== src/domain/partners/application/usecases/getListingPlanUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanAdapter } from '../../factory';
import type { ListingPlanView } from '../../types/listingPlan';

export function getListingPlanUseCase(itemId: string): Promise<ListingPlanView> {
  return listingPlanAdapter.get(itemId);
}

=== src/domain/partners/components/PartnerPanel.tsx — diff ===
@@ -1,4 +1,4 @@
-import { BarChart3, RefreshCw } from 'lucide-react';
+import { RefreshCw } from 'lucide-react';
 import { AnimatePresence } from 'motion/react';
 import React, { useRef } from 'react';
 
@@ -21,7 +21,7 @@ import { PartnerItemsTable } from './subcomponents/PartnerItemsTable';
 import { PartnerTabsNavigation } from './subcomponents/PartnerTabsNavigation';
 import { ListingVerificationDialog } from './verification/ListingVerificationDialog';
 import type { VerificationListingOption } from './verification/verificationListingOption';
-import { PlansModal } from './subcomponents/PlansModal';
+import { ListingPlanDialog, type PaidPlanSelection } from './plan/ListingPlanDialog';
 import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 
 export interface PartnerPanelProps {
@@ -36,7 +36,9 @@ export interface PartnerPanelProps {
   renderCheckoutModal?: (props: {
     isOpen: boolean;
     onClose: () => void;
+    /** Estabelecimento que recebe o plano (D11). */
     itemId: string;
+    planId: string;
     itemName: string;
     amountMinor: number;
     onPaymentSuccess: () => void;
@@ -44,7 +46,8 @@ export interface PartnerPanelProps {
   renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
   /** Campo de sessões do evento (domínio events), montado pela composição do app. */
   renderEventSessionsField?: (props: EventSessionsFieldProps) => React.ReactNode;
-  planSubscriptionSlot?: React.ReactNode;
+  /** Assinatura no cartão do plano de um estabelecimento, montada pela composição. */
+  renderPlanSubscription?: (itemId: string) => React.ReactNode;
   renderBookableOffersManager?: (
     items: Array<{ id: string; name: string; category: string }>
   ) => React.ReactNode;
@@ -60,7 +63,7 @@ export function PartnerPanel({
   renderCheckoutModal,
   renderEventTicketingManager,
   renderEventSessionsField,
-  planSubscriptionSlot,
+  renderPlanSubscription,
   renderBookableOffersManager,
   onPlanPurchased,
 }: PartnerPanelProps) {
@@ -80,7 +83,6 @@ export function PartnerPanel({
     showDeleteConfirm,
     setShowDeleteConfirm,
     dataLoading,
-    isVerified,
     itemsList,
     eventsList,
     handleDelete,
@@ -105,10 +107,13 @@ export function PartnerPanel({
   // Troca a chave dos selos de verificação para relerem o status depois de um envio.
   const [verificationVersion, setVerificationVersion] = React.useState(0);
 
-  const [showPlansModal, setShowPlansModal] = React.useState(false);
+  const [planListing, setPlanListing] = React.useState<{ id: string; name: string } | null>(null);
+  // Troca a chave dos selos de plano para relerem o estado depois do trial ou da compra.
+  const [planVersion, setPlanVersion] = React.useState(0);
   const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
-  const [checkoutPlanInfo, setCheckoutPlanInfo] = React.useState({
+  const [checkoutPlanInfo, setCheckoutPlanInfo] = React.useState<PaidPlanSelection>({
     itemId: '',
+    planId: 'monthly',
     itemName: '',
     amountMinor: 0,
   });
@@ -122,6 +127,7 @@ export function PartnerPanel({
     setShowCheckoutModal(false);
     if (planPurchasedRef.current) {
       planPurchasedRef.current = false;
+      setPlanVersion((version) => version + 1);
       onPlanPurchased?.();
     }
   };
@@ -161,42 +167,13 @@ export function PartnerPanel({
         <PartnerHeader
           partnerProfile={partnerProfile}
           onNavigateBack={() => goTo('explore')}
-          isVerified={isVerified}
-          onVerifyClick={() => setShowPlansModal(true)}
           notificationBell={renderNotificationBell?.(partnerProfile?.id || '')}
         />
 
-        {planSubscriptionSlot}
-
-        <PartnerTabsNavigation
-          activeTab={activeTab}
-          setActiveTab={setActiveTab}
-          isVerified={isVerified}
-        />
+        <PartnerTabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
 
         {activeTab === 'reports' ? (
-          isVerified ? (
-            renderReports?.({ partnerId: user.uid, items: itemsList, events: eventsList })
-          ) : (
-            <div className="py-24 text-center glassmorphism rounded-[3rem] border border-white/10 p-12">
-              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
-                <BarChart3 size={40} />
-              </div>
-              <h3 className="text-xl font-display font-black text-white mb-2">
-                Relatórios Bloqueados
-              </h3>
-              <p className="text-white/50 text-sm max-w-xs mx-auto mb-8">
-                O acesso aos relatórios é exclusivo para parceiros com o selo de verificação ativo.
-              </p>
-              <button
-                type="button"
-                onClick={() => setShowPlansModal(true)}
-                className="px-8 py-4 bg-blue-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-400 transition-all cursor-pointer"
-              >
-                Ativar Verificação
-              </button>
-            </div>
-          )
+          renderReports?.({ partnerId: user.uid, items: itemsList, events: eventsList })
         ) : activeTab === 'items' ? (
           <>
             <PartnerItemsTable
@@ -209,6 +186,8 @@ export function PartnerPanel({
               onVerifyItem={(item) =>
                 setVerifyingListing({ id: item.id, name: item.name, category: item.category })
               }
+              planVersion={planVersion}
+              onOpenPlan={(item) => setPlanListing({ id: item.id, name: item.name })}
             />
             {renderBookableOffersManager?.(
               itemsList.map((item) => ({ id: item.id, name: item.name, category: item.category }))
@@ -302,22 +281,39 @@ export function PartnerPanel({
         />
       )}
 
-      <PlansModal
-        isOpen={showPlansModal}
-        onClose={() => setShowPlansModal(false)}
-        userId={user.uid}
-        partnerProfile={partnerProfile || undefined}
-        plans={subscriptionPlans ?? []}
-        onSelectPaidPlan={(planId, planName, amountMinor) => {
-          setCheckoutPlanInfo({ itemId: planId, itemName: planName, amountMinor });
-          setShowCheckoutModal(true);
-        }}
-      />
+      {planListing && (
+        <ListingPlanDialog
+          listing={planListing}
+          plans={subscriptionPlans ?? []}
+          onClose={() => {
+            setPlanListing(null);
+            setPlanVersion((version) => version + 1);
+          }}
+          onVerify={() => {
+            const listing = itemsList.find((item) => item.id === planListing.id);
+            setPlanListing(null);
+            if (listing) {
+              setVerifyingListing({
+                id: listing.id,
+                name: listing.name,
+                category: listing.category,
+              });
+            }
+          }}
+          onSelectPaidPlan={(selection) => {
+            setPlanListing(null);
+            setCheckoutPlanInfo(selection);
+            setShowCheckoutModal(true);
+          }}
+          renderSubscription={renderPlanSubscription}
+        />
+      )}
 
       {renderCheckoutModal?.({
         isOpen: showCheckoutModal,
         onClose: handleCheckoutClose,
         itemId: checkoutPlanInfo.itemId,
+        planId: checkoutPlanInfo.planId,
         itemName: checkoutPlanInfo.itemName,
         amountMinor: checkoutPlanInfo.amountMinor,
         onPaymentSuccess: handleCheckoutSuccess,

=== src/domain/partners/components/plan/ListingPlanBenefits.tsx — ARQUIVO NOVO, conteúdo completo ===
import { BadgeCheck, BarChart3, MessageSquare, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BENEFITS = [
  { key: 'seal', Icon: BadgeCheck },
  { key: 'metrics', Icon: BarChart3 },
  { key: 'featured', Icon: Sparkles },
  { key: 'reviews', Icon: MessageSquare },
] as const;

export function ListingPlanBenefits() {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-white/80">{t('listingPlan.benefits.title')}</p>
      <ul className="space-y-2">
        {BENEFITS.map(({ key, Icon }) => (
          <li key={key} className="flex items-start gap-2 text-xs text-white/70">
            <Icon size={14} className="text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
            {t(`listingPlan.benefits.${key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}

=== src/domain/partners/components/plan/ListingPlanChip.tsx — ARQUIVO NOVO, conteúdo completo ===
import { BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { useListingPlan } from '../../hooks/useListingPlan';
import {
  formatPlanDate,
  type ListingPlanChipStatus,
  listingPlanChipStatus,
} from '../../utils/listingPlanStatus';

const CHIP_STYLE: Record<ListingPlanChipStatus, string> = {
  none: 'bg-white/5 text-white/70 border-white/10',
  trial: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  active: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  admin: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  suspended: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  pendingSeal: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

interface ListingPlanChipProps {
  itemId: string;
  name: string;
  onOpen: () => void;
}

export function ListingPlanChip({ itemId, name, onOpen }: ListingPlanChipProps) {
  const { t, i18n } = useTranslation();
  const { data, loading } = useListingPlan(itemId);
  const status = data ? listingPlanChipStatus(data) : 'none';
  const date = data?.planUntil ? formatPlanDate(data.planUntil, i18n.language) : '';
  const label = t(`listingPlan.chip.${status}`, { date });

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={loading}
      aria-label={t('listingPlan.chip.label', { name, status: label })}
      className={cn(
        'min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-xl border text-[10px] font-semibold transition-colors hover:bg-white/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
        CHIP_STYLE[status]
      )}
    >
      <BadgeCheck size={12} aria-hidden="true" />
      {label}
    </button>
  );
}

=== src/domain/partners/components/plan/ListingPlanDialog.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ getPlan: vi.fn(), trial: vi.fn(), getVerification: vi.fn() }));
vi.mock('../../../media', () => ({ uploadVerificationFileUseCase: vi.fn() }));
vi.mock('../../application/usecases/getListingPlanUseCase', () => ({
  getListingPlanUseCase: m.getPlan,
}));
vi.mock('../../application/usecases/activateListingTrialUseCase', () => ({
  activateListingTrialUseCase: m.trial,
}));
vi.mock('../../application/usecases/getListingVerificationUseCase', () => ({
  getListingVerificationUseCase: m.getVerification,
}));
vi.mock('../../application/usecases/submitListingVerificationUseCase', () => ({
  submitListingVerificationUseCase: vi.fn(),
}));

import type { SubscriptionPlan } from '../../types/partner';
import { ListingPlanDialog } from './ListingPlanDialog';

const LISTING = { id: 'item-1', name: 'Pousada Sol' };
const PLANS = [
  {
    id: 'annual',
    name: 'Anual',
    priceMinor: 49900,
    period: '/ano',
    monthlyEquivalentMinor: 4158,
    savingLabel: null,
    description: '',
    isActive: true,
  },
] as SubscriptionPlan[];
const NO_PLAN = {
  itemId: 'item-1',
  planType: null,
  planUntil: null,
  planActive: false,
  sealSuspended: false,
  seal: {
    isVerified: false,
    verifiedUntil: null,
    verificationType: null,
    isVerificationSuspended: false,
  },
  trialAvailable: true,
};

function renderDialog() {
  const props = { onClose: vi.fn(), onVerify: vi.fn(), onSelectPaidPlan: vi.fn() };
  render(<ListingPlanDialog listing={LISTING} plans={PLANS} {...props} />);
  return props;
}

describe('ListingPlanDialog (D11)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
    m.getPlan.mockResolvedValue(NO_PLAN);
  });

  it('estabelecimento sem verificação aprovada não mostra planos e leva à verificação', async () => {
    m.getVerification.mockResolvedValue({ itemId: 'item-1', status: 'pending' });
    const props = renderDialog();
    fireEvent.click(await screen.findByRole('button', { name: /Verificar estabelecimento/ }));
    expect(props.onVerify).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Anual/ })).toBeNull();
  });

  it('verificado escolhe o período pago e segue para o pagamento com o itemId', async () => {
    m.getVerification.mockResolvedValue({ itemId: 'item-1', status: 'approved' });
    const props = renderDialog();
    fireEvent.click(await screen.findByRole('button', { name: /Anual/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Seguir para o pagamento' }));
    expect(props.onSelectPaidPlan).toHaveBeenCalledWith({
      itemId: 'item-1',
      planId: 'annual',
      itemName: 'Use Guide Verificado · Anual · Pousada Sol',
      amountMinor: 49900,
    });
  });

  it('teste grátis ativa no estabelecimento', async () => {
    m.getVerification.mockResolvedValue({ itemId: 'item-1', status: 'approved' });
    m.trial.mockResolvedValue({ ...NO_PLAN, planType: 'trial', planActive: true });
    renderDialog();
    fireEvent.click(await screen.findByRole('button', { name: /Teste grátis de 7 dias/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ativar 7 dias grátis' }));
    await screen.findByText(/Plano Teste grátis em vigor/);
    expect(m.trial).toHaveBeenCalledWith('item-1');
  });
});

=== src/domain/partners/components/plan/ListingPlanDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { Dialog } from '../../../../ui/components/Dialog';
import { useListingPlan } from '../../hooks/useListingPlan';
import { useListingVerification } from '../../hooks/useListingVerification';
import type { PlanListingOption } from '../../types/listingPlan';
import type { SubscriptionPlan } from '../../types/partner';
import { formatPlanDate } from '../../utils/listingPlanStatus';
import { ListingPlanBenefits } from './ListingPlanBenefits';
import { type ListingPlanChoice, ListingPlanOptions } from './ListingPlanOptions';
import { ListingPlanStatus } from './ListingPlanStatus';

export interface PaidPlanSelection {
  itemId: string;
  planId: SubscriptionPlan['id'];
  itemName: string;
  amountMinor: number;
}

interface ListingPlanDialogProps {
  listing: PlanListingOption;
  plans: SubscriptionPlan[];
  onClose: () => void;
  onVerify: () => void;
  onSelectPaidPlan: (selection: PaidPlanSelection) => void;
  /** Assinatura no cartão deste estabelecimento (domínio payment), montada pela composição. */
  renderSubscription?: (itemId: string) => ReactNode;
}

const buttonClass =
  'w-full min-h-12 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function ListingPlanDialog({
  listing,
  plans,
  onClose,
  onVerify,
  onSelectPaidPlan,
  renderSubscription,
}: ListingPlanDialogProps) {
  const { t, i18n } = useTranslation();
  const { showToast } = useUI();
  const plan = useListingPlan(listing.id);
  const verification = useListingVerification(listing.id);
  const [choice, setChoice] = useState<ListingPlanChoice | null>(null);
  const loading = plan.loading || verification.loading;
  const error = plan.error ?? verification.error;
  const verified = verification.data?.status === 'approved';

  const proceed = async () => {
    if (choice === 'trial') {
      try {
        const view = await plan.activateTrial();
        showToast(
          t('listingPlan.trialActivated', {
            date: view.planUntil ? formatPlanDate(view.planUntil, i18n.language) : '',
          }),
          'success'
        );
      } catch (err: unknown) {
        showToast(
          err instanceof Error ? err.message : t('listingPlan.errors.INTERNAL_ERROR'),
          'error'
        );
      }
      return;
    }
    const selected = plans.find((option) => option.id === choice);
    if (!selected) return;
    onSelectPaidPlan({
      itemId: listing.id,
      planId: selected.id,
      itemName: t('listingPlan.checkoutName', { plan: selected.name, name: listing.name }),
      amountMinor: selected.priceMinor,
    });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('listingPlan.dialog.title')}
      description={listing.name}
      className="max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="space-y-5 pt-2">
        {loading ? (
          <p role="status" className="text-sm text-white/60">
            {t('listingPlan.dialog.loading')}
          </p>
        ) : error || !plan.data ? (
          <div className="space-y-3">
            <p className="text-sm text-rose-300">{error}</p>
            <button
              type="button"
              onClick={() => {
                void plan.reload();
                void verification.reload();
              }}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-2xl border border-white/10 text-xs text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <RefreshCw size={14} aria-hidden="true" />
              {t('listingPlan.dialog.retry')}
            </button>
          </div>
        ) : (
          <>
            <ListingPlanStatus view={plan.data} />
            {renderSubscription?.(listing.id)}
            <ListingPlanBenefits />
            {verified ? (
              <>
                <ListingPlanOptions
                  plans={plans}
                  trialAvailable={plan.data.trialAvailable}
                  selected={choice}
                  onSelect={setChoice}
                />
                <button
                  type="button"
                  onClick={() => void proceed()}
                  disabled={choice === null || plan.activating}
                  className={`${buttonClass} bg-teal-400 hover:bg-teal-300 text-slate-950`}
                >
                  {plan.activating
                    ? t('listingPlan.actions.processing')
                    : choice === 'trial'
                      ? t('listingPlan.actions.activateTrial')
                      : t('listingPlan.actions.continue')}
                </button>
              </>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-100 leading-relaxed">
                  {t('listingPlan.verificationRequired')}
                </p>
                <button
                  type="button"
                  onClick={onVerify}
                  className={`${buttonClass} bg-white/10 hover:bg-white/15 text-white`}
                >
                  <ShieldCheck size={14} aria-hidden="true" />
                  {t('listingPlan.verifyAction')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}

=== src/domain/partners/components/plan/ListingPlanOptions.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { SubscriptionPlan } from '../../types/partner';

export type ListingPlanChoice = SubscriptionPlan['id'];

interface ListingPlanOptionsProps {
  plans: SubscriptionPlan[];
  trialAvailable: boolean;
  selected: ListingPlanChoice | null;
  onSelect: (choice: ListingPlanChoice) => void;
}

const optionClass = (isSelected: boolean) =>
  cn(
    'w-full min-h-[56px] p-4 rounded-2xl border text-left flex items-center justify-between gap-3 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50',
    isSelected
      ? 'bg-teal-500/10 border-teal-500/40'
      : 'bg-white/5 border-white/10 hover:bg-white/10'
  );

/** Períodos do plano; o preço vem do catálogo do admin, e o backend recalcula ao cobrar (§8.5). */
export function ListingPlanOptions({
  plans,
  trialAvailable,
  selected,
  onSelect,
}: ListingPlanOptionsProps) {
  const { t, i18n } = useTranslation();
  const paidPlans = plans.filter((plan) => plan.id !== 'trial' && plan.isActive !== false);

  return (
    <fieldset className="space-y-2.5">
      <legend className="text-xs font-bold text-white/80 mb-2">
        {t('listingPlan.options.title')}
      </legend>
      {trialAvailable && (
        <button
          type="button"
          aria-pressed={selected === 'trial'}
          onClick={() => onSelect('trial')}
          className={optionClass(selected === 'trial')}
        >
          <span>
            <span className="block text-xs font-bold text-white">
              {t('listingPlan.options.trialName')}
            </span>
            <span className="block text-[11px] text-white/60 mt-0.5">
              {t('listingPlan.options.trialHint')}
            </span>
          </span>
          <span className="text-sm font-black text-teal-300">{t('listingPlan.options.free')}</span>
        </button>
      )}
      {paidPlans.length === 0 ? (
        <p className="text-xs text-white/60">{t('listingPlan.options.empty')}</p>
      ) : (
        paidPlans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            aria-pressed={selected === plan.id}
            onClick={() => onSelect(plan.id)}
            className={optionClass(selected === plan.id)}
          >
            <span className="min-w-0">
              <span className="block text-xs font-bold text-white">{plan.name}</span>
              {plan.description && (
                <span className="block text-[11px] text-white/60 mt-0.5">{plan.description}</span>
              )}
            </span>
            <span className="text-right shrink-0">
              <span className="block text-sm font-black text-teal-300">
                {formatMoneyMinor(plan.priceMinor, i18n.language)}
              </span>
              {plan.monthlyEquivalentMinor ? (
                <span className="block text-[10px] text-white/60">
                  {t('listingPlan.options.perMonth', {
                    amount: formatMoneyMinor(plan.monthlyEquivalentMinor, i18n.language),
                  })}
                </span>
              ) : null}
            </span>
          </button>
        ))
      )}
    </fieldset>
  );
}

=== src/domain/partners/components/plan/ListingPlanStatus.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import type { ListingPlanView } from '../../types/listingPlan';
import { formatPlanDate } from '../../utils/listingPlanStatus';

export function ListingPlanStatus({ view }: { view: ListingPlanView }) {
  const { t, i18n } = useTranslation();

  if (!view.planActive || !view.planType) {
    return <p className="text-sm text-white/80">{t('listingPlan.status.none')}</p>;
  }

  const sealMessage = view.sealSuspended
    ? t('listingPlan.status.sealSuspended')
    : view.seal.isVerified
      ? t('listingPlan.status.sealOn')
      : t('listingPlan.status.sealPendingVerification');

  return (
    <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
      <p className="text-sm font-semibold text-white">
        {view.planType === 'admin'
          ? t('listingPlan.status.adminGranted')
          : t('listingPlan.status.activeUntil', {
              plan: t(`listingPlan.planNames.${view.planType}`),
              date: view.planUntil ? formatPlanDate(view.planUntil, i18n.language) : '',
            })}
      </p>
      <p
        className={
          view.sealSuspended || !view.seal.isVerified
            ? 'text-xs text-amber-200'
            : 'text-xs text-white/70'
        }
      >
        {sealMessage}
      </p>
    </div>
  );
}

=== src/domain/partners/components/subcomponents/PartnerHeader.tsx — diff ===
@@ -1,34 +1,19 @@
-import { BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
+import { ChevronLeft } from 'lucide-react';
 import { motion } from 'motion/react';
 import React from 'react';
-import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
 import { PartnerProfile } from '../../types/partner';
 import { cn } from '../../../../shared/utils/cn';
 
 interface PartnerHeaderProps {
   partnerProfile: PartnerProfile | null;
   onNavigateBack: () => void;
-  isVerified: boolean;
-  onVerifyClick?: () => void;
   notificationBell?: React.ReactNode;
 }
 
-const PLAN_SUBTITLE: Record<string, string> = {
-  trial: 'Teste grátis',
-  monthly: 'Assinante plano “Mensal”',
-  'semi-annual': 'Assinante plano “Semestral”',
-  annual: 'Assinante plano “Anual”',
-  admin: 'Selo concedido pela equipe Use Guide',
-};
-
-const getPlanSubtitle = (type: string | null | undefined): string =>
-  (type && PLAN_SUBTITLE[type]) || 'Selo de empresa verificada';
-
+/** O selo e o plano são de cada estabelecimento (D11): ficam nos cartões de cadastro, não aqui. */
 export function PartnerHeader({
   partnerProfile,
   onNavigateBack,
-  isVerified,
-  onVerifyClick,
   notificationBell,
 }: PartnerHeaderProps) {
   return (
@@ -81,45 +66,6 @@ export function PartnerHeader({
           {notificationBell}
         </div>
       </motion.div>
-
-      <motion.button
-        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
-        whileTap={{ scale: 0.95 }}
-        initial={{ opacity: 0, y: 6 }}
-        animate={{ opacity: 1, y: 0 }}
-        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
-        onClick={onVerifyClick}
-        className="py-4 px-6 rounded-3xl border border-white/10 bg-white/5 glassmorphism-vibrant flex items-center justify-between gap-6 w-full text-left cursor-pointer"
-      >
-        <div className="flex items-center gap-4">
-          {isVerified ? (
-            <>
-              <VerifiedBadge size="lg" className="text-[41px]" />
-              <div className="flex flex-col">
-                <span className="text-base font-display font-black text-white">
-                  Sua empresa é verificada
-                </span>
-                <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest mt-1">
-                  {getPlanSubtitle(partnerProfile?.verificationType)}
-                </p>
-              </div>
-            </>
-          ) : (
-            <>
-              <BadgeCheck size={41} className="text-white/50" />
-              <div className="flex flex-col">
-                <span className="text-base font-display font-black text-white/80">
-                  Mostrar que sua empresa é verificada
-                </span>
-                <p className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest mt-1">
-                  Não assinante
-                </p>
-              </div>
-            </>
-          )}
-        </div>
-        <ChevronRight size={20} className="text-white/50 shrink-0" />
-      </motion.button>
     </div>
   );
 }

=== src/domain/partners/components/subcomponents/PartnerItemsTable.test.tsx — diff ===
@@ -10,6 +10,13 @@ vi.mock('../verification/VerificationStatusChip', () => ({
     </button>
   ),
 }));
+vi.mock('../plan/ListingPlanChip', () => ({
+  ListingPlanChip: ({ onOpen }: { onOpen: () => void }) => (
+    <button type="button" onClick={onOpen}>
+      plano
+    </button>
+  ),
+}));
 
 import { PartnerItemsTable } from './PartnerItemsTable';
 
@@ -28,6 +35,7 @@ function renderTable() {
     onEditItem: vi.fn(),
     onToggleActive: vi.fn().mockResolvedValue(undefined),
     onVerifyItem: vi.fn(),
+    onOpenPlan: vi.fn(),
   };
   render(
     <PartnerItemsTable
@@ -35,6 +43,7 @@ function renderTable() {
       loading={false}
       onCreateNew={vi.fn()}
       verificationVersion={0}
+      planVersion={0}
       {...props}
     />
   );
@@ -46,7 +55,7 @@ describe('PartnerItemsTable', () => {
     await i18n.changeLanguage('pt-BR');
   });
 
-  it('cartão sem botão dentro de botão: editar, selo e interruptor são irmãos', () => {
+  it('cartão sem botão dentro de botão: editar, selos e interruptor são irmãos', () => {
     const props = renderTable();
     const edit = screen.getByRole('button', { name: 'Editar Pousada Sol' });
     expect(edit.querySelector('button')).toBeNull();
@@ -56,6 +65,10 @@ describe('PartnerItemsTable', () => {
     expect(props.onVerifyItem).toHaveBeenCalledWith(item);
     expect(props.onEditItem).not.toHaveBeenCalled();
 
+    fireEvent.click(screen.getByRole('button', { name: 'plano' }));
+    expect(props.onOpenPlan).toHaveBeenCalledWith(item);
+    expect(props.onEditItem).not.toHaveBeenCalled();
+
     fireEvent.click(edit);
     expect(props.onEditItem).toHaveBeenCalledWith(item);
   });

=== src/domain/partners/components/subcomponents/PartnerItemsTable.tsx — diff ===
@@ -4,6 +4,7 @@ import { useTranslation } from 'react-i18next';
 import type { PartnerContentRecord } from '../../types/partnerContent';
 import { cn } from '../../../../shared/utils/cn';
 import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
+import { ListingPlanChip } from '../plan/ListingPlanChip';
 import { VerificationStatusChip } from '../verification/VerificationStatusChip';
 
 interface PartnerItemsTableProps {
@@ -15,6 +16,9 @@ interface PartnerItemsTableProps {
   /** Muda depois de um envio de verificação, para os selos relerem o status. */
   verificationVersion: number;
   onVerifyItem: (item: PartnerContentRecord) => void;
+  /** Muda depois de ativar ou comprar um plano, para os selos de plano relerem o estado. */
+  planVersion: number;
+  onOpenPlan: (item: PartnerContentRecord) => void;
 }
 
 export function PartnerItemsTable({
@@ -25,6 +29,8 @@ export function PartnerItemsTable({
   onCreateNew,
   verificationVersion,
   onVerifyItem,
+  planVersion,
+  onOpenPlan,
 }: PartnerItemsTableProps) {
   const { t } = useTranslation();
   return (
@@ -109,13 +115,19 @@ export function PartnerItemsTable({
                   )}
                 </div>
                 {item.id && (
-                  <div className="mt-2 relative w-fit">
+                  <div className="mt-2 relative flex flex-wrap gap-2">
                     <VerificationStatusChip
                       key={`${item.id}-${verificationVersion}`}
                       itemId={item.id}
                       name={item.name}
                       onOpen={() => onVerifyItem(item)}
                     />
+                    <ListingPlanChip
+                      key={`${item.id}-plan-${planVersion}-${verificationVersion}`}
+                      itemId={item.id}
+                      name={item.name}
+                      onOpen={() => onOpenPlan(item)}
+                    />
                   </div>
                 )}
               </div>

=== src/domain/partners/components/subcomponents/PartnerTabsNavigation.tsx — diff ===
@@ -1,17 +1,12 @@
-import { Layers, Calendar, BarChart3, Clock } from 'lucide-react';
+import { Layers, Calendar, BarChart3 } from 'lucide-react';
 import { cn } from '../../../../shared/utils/cn';
 
 interface PartnerTabsNavigationProps {
   activeTab: 'items' | 'events' | 'reports';
   setActiveTab: (tab: 'items' | 'events' | 'reports') => void;
-  isVerified: boolean;
 }
 
-export function PartnerTabsNavigation({
-  activeTab,
-  setActiveTab,
-  isVerified,
-}: PartnerTabsNavigationProps) {
+export function PartnerTabsNavigation({ activeTab, setActiveTab }: PartnerTabsNavigationProps) {
   return (
     <div className="grid grid-cols-3 gap-3">
       <button
@@ -27,7 +22,6 @@ export function PartnerTabsNavigation({
         <Layers size={14} /> Meus Itens
       </button>
 
-      {/* Aba de Agenda de Eventos */}
       <button
         type="button"
         onClick={() => setActiveTab('events')}
@@ -41,7 +35,6 @@ export function PartnerTabsNavigation({
         <Calendar size={14} /> Meus Eventos
       </button>
 
-      {/* Aba de Relatórios de Acessos de Usuários com Cadeado Visual Reativo */}
       <button
         type="button"
         onClick={() => setActiveTab('reports')}
@@ -52,12 +45,6 @@ export function PartnerTabsNavigation({
             : 'glassmorphism text-white/50 hover:bg-white/5 bg-white/3'
         )}
       >
-        {/* Caso o parceiro não seja verificado, colocamos uma sobreposição visual protetora que permite cliques com pointer-events-none */}
-        {!isVerified && (
-          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
-            <Clock size={12} className="text-white/60 animate-pulse" />
-          </div>
-        )}
         <BarChart3 size={14} /> Relatórios
       </button>

=== src/domain/partners/components/subcomponents/PlansModal.tsx — APAGUE este arquivo ===

=== src/domain/partners/factory.ts — diff ===
@@ -1,12 +1,14 @@
+import { ApiListingPlanAdapter } from './adapters/apiListingPlanAdapter';
+import { ApiListingVerificationAdapter } from './adapters/apiListingVerificationAdapter';
 import { ApiPartnerAdapter } from './adapters/apiPartnerAdapter';
 import { ApiPartnerContentAdapter } from './adapters/apiPartnerContentAdapter';
+import type { ListingPlanPort } from './ports/listingPlanPort';
+import type { ListingVerificationPort } from './ports/listingVerificationPort';
 import { PartnerPort } from './ports/partnerPort';
 import { PartnerContentPort } from './ports/partnerContentPort';
 
 export const partnerAdapter: PartnerPort = new ApiPartnerAdapter();
 export const partnerContentAdapter: PartnerContentPort = new ApiPartnerContentAdapter();
-import { ApiListingVerificationAdapter } from './adapters/apiListingVerificationAdapter';
-import type { ListingVerificationPort } from './ports/listingVerificationPort';
-
 export const listingVerificationAdapter: ListingVerificationPort =
   new ApiListingVerificationAdapter();
+export const listingPlanAdapter: ListingPlanPort = new ApiListingPlanAdapter();

=== src/domain/partners/hooks/useListingPlan.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { activateListingTrialUseCase } from '../application/usecases/activateListingTrialUseCase';
import { getListingPlanUseCase } from '../application/usecases/getListingPlanUseCase';
import type { ListingPlanView } from '../types/listingPlan';
import { getListingPlanErrorMessage } from '../utils/listingPlanErrorMessage';

export function useListingPlan(itemId: string) {
  const [data, setData] = useState<ListingPlanView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getListingPlanUseCase(itemId));
    } catch (err: unknown) {
      setError(getListingPlanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Lança a mensagem já traduzida para o diálogo mostrar no toast. */
  const activateTrial = useCallback(async () => {
    setActivating(true);
    try {
      const view = await activateListingTrialUseCase(itemId);
      setData(view);
      return view;
    } catch (err: unknown) {
      throw new Error(getListingPlanErrorMessage(err));
    } finally {
      setActivating(false);
    }
  }, [itemId]);

  return { data, loading, error, activating, reload, activateTrial };
}

=== src/domain/partners/hooks/usePartnerPanelActions.ts — diff ===
@@ -23,7 +23,6 @@ export function usePartnerPanelActions(profileData?: PartnerProfile) {
     userLoading: profile.userLoading,
     partnerProfile: profile.partnerProfile,
     profileStatus: profile.profileStatus,
-    isVerified: profile.isVerified,
 
     activeTab: layout.activeTab,
     setActiveTab: layout.setActiveTab,

=== src/domain/partners/hooks/usePartnerProfile.test.ts — diff ===
@@ -49,11 +49,6 @@ describe('usePartnerProfile', () => {
     businessName: 'Pousada Sol',
     businessId: 'bus-1',
     businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol', type: 'item' }],
-    verificationType: 'annual',
-    isVerified: true,
-    verifiedUntil: '2026-12-31T23:59:59.000Z',
-    isVerificationSuspended: false,
-    hasUsedTrial: true,
     status: 'active',
   };
 
@@ -98,9 +93,6 @@ describe('usePartnerProfile', () => {
     const mockPublicPartner: PublicPartnerProfile = {
       id: 'partner-user-1',
       businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol Atualizada', type: 'item' }],
-      isVerified: true,
-      verifiedUntil: '2026-12-31T23:59:59.000Z',
-      isVerificationSuspended: false,
       status: 'active',
     };
 
@@ -112,30 +104,24 @@ describe('usePartnerProfile', () => {
     expect(result.current.profileStatus).toBe('ready');
   });
 
-  it('publicPartner NÃO contém cpfCnpj e verificationType, confirmando que esses dados continuam vindos do perfil carregado', async () => {
+  it('a conta não carrega selo nem plano: eles são de cada estabelecimento (D11)', async () => {
     const { result } = renderHook(() => usePartnerProfile(mockLoadedProfile));
 
     await act(async () => {
       authCallback?.(mockPartnerUser);
     });
 
-    const mockPublicPartner: PublicPartnerProfile = {
-      id: 'partner-user-1',
-      businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol', type: 'item' }],
-      isVerified: true,
-      verifiedUntil: '2027-01-01T00:00:00.000Z',
-      isVerificationSuspended: false,
-      status: 'active',
-    };
-
-    expect(mockPublicPartner).not.toHaveProperty('verificationType');
-
     await act(async () => {
-      partnerProfileCallback?.(mockPublicPartner);
+      partnerProfileCallback?.({
+        id: 'partner-user-1',
+        businesses: [{ businessId: 'bus-1', businessName: 'Pousada Sol', type: 'item' }],
+        status: 'active',
+      });
     });
 
-    expect(result.current.partnerProfile?.verificationType).toBe('annual');
-    expect(result.current.partnerProfile?.verifiedUntil).toBe('2027-01-01T00:00:00.000Z');
+    expect(result.current.partnerProfile).not.toHaveProperty('isVerified');
+    expect(result.current.partnerProfile).not.toHaveProperty('verificationType');
+    expect(result.current).not.toHaveProperty('isVerified');
   });
 
   it('Firestore subscription error -> define profileError, faz fallback para o perfil carregado e não lança exceção incontrolável', async () => {

=== src/domain/partners/hooks/usePartnerProfile.ts — diff ===
@@ -141,11 +141,6 @@ export function usePartnerProfile(loadedProfile?: PartnerProfile) {
           address: loadedProfile?.address,
           region: loadedProfile?.region,
           images: loadedProfile?.images,
-          isVerified: publicPartner.isVerified,
-          verifiedUntil: publicPartner.verifiedUntil,
-          verificationType: loadedProfile?.verificationType ?? null,
-          isVerificationSuspended: publicPartner.isVerificationSuspended,
-          hasUsedTrial: loadedProfile?.hasUsedTrial ?? false,
           status: publicPartner.status,
         };
 
@@ -170,12 +165,6 @@ export function usePartnerProfile(loadedProfile?: PartnerProfile) {
     return () => unsubscribe();
   }, [user, userLoading, loadedProfile, userProfileData]);
 
-  const isVerified = !!(
-    partnerProfile?.isVerified &&
-    !partnerProfile?.isVerificationSuspended &&
-    (!partnerProfile?.verifiedUntil || new Date(partnerProfile.verifiedUntil) > new Date())
-  );
-
   return {
     user,
     userLoading,
@@ -187,6 +176,5 @@ export function usePartnerProfile(loadedProfile?: PartnerProfile) {
     isUploading,
     setIsUploading,
     profileError,
-    isVerified,
   };
 }

=== src/domain/partners/index.ts — diff ===
@@ -1,4 +1,3 @@
-export { activateTrialUseCase } from './application/usecases/activateTrialUseCase';
 export { createOrUpdatePartnerProfileUseCase } from './application/usecases/createOrUpdatePartnerProfileUseCase';
 export { createPartnerContentItemUseCase } from './application/usecases/createPartnerContentItemUseCase';
 export { updatePartnerContentItemUseCase } from './application/usecases/updatePartnerContentItemUseCase';

=== src/domain/partners/ports/listingPlanPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ListingPlanView } from '../types/listingPlan';

export interface ListingPlanPort {
  get(itemId: string): Promise<ListingPlanView>;
  /** Teste grátis de 7 dias, uma vez por conta, no estabelecimento escolhido (D11). */
  activateTrial(itemId: string): Promise<ListingPlanView>;
}

=== src/domain/partners/ports/partnerPort.ts — diff ===
@@ -2,7 +2,6 @@ import { PartnerAccountStatus, PartnerProfile, PartnerRegistrationPayload } from
 
 export interface PartnerPort {
   registerPartner(payload: PartnerRegistrationPayload): Promise<void>;
-  activateTrial(partnerId: string): Promise<void>;
   getPartnerProfile(partnerId: string): Promise<PartnerProfile | null>;
   getAllPartners(): Promise<PartnerProfile[]>;
   updatePartnerStatus(partnerId: string, status: PartnerAccountStatus): Promise<void>;

=== src/domain/partners/types/listingPlan.ts — ARQUIVO NOVO, conteúdo completo ===
/** `admin`: selo concedido pela equipe sem plano pago (D8, por estabelecimento na D11). */
export type ListingPlanType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin';

/** Cópia pública do selo gravada pelo backend no cadastro e nos eventos dele. */
export interface ListingSeal {
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: ListingPlanType | null;
  isVerificationSuspended: boolean;
}

/** Plano de um estabelecimento como o dono o vê (`GET /api/listing-plans/:itemId`). */
export interface ListingPlanView {
  itemId: string;
  planType: ListingPlanType | null;
  planUntil: string | null;
  planActive: boolean;
  sealSuspended: boolean;
  seal: ListingSeal;
  trialAvailable: boolean;
}

export interface PlanListingOption {
  id: string;
  name: string;
}

=== src/domain/partners/types/partner.ts — diff ===
@@ -17,12 +17,10 @@ export type PartnerSignupCategory =
 /** Status da conta só serve para suspensão; a verificação é por estabelecimento (D12). */
 export type PartnerAccountStatus = 'active' | 'suspended';
 
+/** Projeção pública da conta: o selo e o plano são de cada estabelecimento (D11). */
 export interface PublicPartnerProfile {
   id: string;
   businesses: PartnerBusiness[];
-  isVerified: boolean;
-  verifiedUntil: string | null;
-  isVerificationSuspended: boolean;
   status: PartnerAccountStatus;
 }
 
@@ -87,14 +85,6 @@ export interface PartnerSubmissionData {
   rentalIncludes?: string[];
 }
 
-export type PartnerVerificationType =
-  | 'trial'
-  | 'monthly'
-  | 'semi-annual'
-  | 'annual'
-  | 'admin'
-  | null;
-
 export interface PartnerProfile {
   id: string;
   businessId?: string | null;
@@ -109,11 +99,6 @@ export interface PartnerProfile {
   address?: string;
   region?: string;
   images?: string[];
-  isVerified?: boolean;
-  isVerificationSuspended?: boolean;
-  verifiedUntil?: string | null;
-  verificationType?: PartnerVerificationType;
-  hasUsedTrial?: boolean;
   status?: PartnerAccountStatus;
   firstName?: string;
   lastName?: string;

=== src/domain/partners/utils/listingPlanErrorMessage.ts — ARQUIVO NOVO, conteúdo completo ===
import { i18n } from '../../../shared/i18n';

const KNOWN_CODES = [
  'VALIDATION_ERROR',
  'FORBIDDEN',
  'NOT_FOUND',
  'LISTING_PENDING_VERIFICATION',
  'TRIAL_ALREADY_USED',
  'PLAN_ALREADY_ACTIVE',
  'PARTNER_SUSPENDED',
  'INTERNAL_ERROR',
] as const;

/** Traduz o `code` estável do backend (AGENTS.md §12.5). */
export function getListingPlanErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  const known = (KNOWN_CODES as readonly string[]).includes(code) ? code : 'INTERNAL_ERROR';
  return i18n.t(`listingPlan.errors.${known}`);
}

=== src/domain/partners/utils/listingPlanStatus.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import type { ListingPlanView } from '../types/listingPlan';
import { formatPlanDate, listingPlanChipStatus } from './listingPlanStatus';

const SEAL_ON = {
  isVerified: true,
  verifiedUntil: '2026-12-01T00:00:00.000Z',
  verificationType: 'annual' as const,
  isVerificationSuspended: false,
};
const view = (patch: Partial<ListingPlanView>): ListingPlanView => ({
  itemId: 'item-1',
  planType: 'annual',
  planUntil: '2026-12-01T00:00:00.000Z',
  planActive: true,
  sealSuspended: false,
  seal: SEAL_ON,
  trialAvailable: false,
  ...patch,
});

describe('listingPlanChipStatus (D11)', () => {
  it('sem plano em vigor', () => {
    expect(listingPlanChipStatus(view({ planActive: false }))).toBe('none');
  });

  it('selo retirado pela equipe vence o tipo do plano', () => {
    expect(listingPlanChipStatus(view({ sealSuspended: true }))).toBe('suspended');
  });

  it('plano ativo sem verificação aprovada ainda não mostra o selo', () => {
    expect(listingPlanChipStatus(view({ seal: { ...SEAL_ON, isVerified: false } }))).toBe(
      'pendingSeal'
    );
  });

  it('separa teste grátis, selo da equipe e plano pago', () => {
    expect(listingPlanChipStatus(view({ planType: 'trial' }))).toBe('trial');
    expect(listingPlanChipStatus(view({ planType: 'admin' }))).toBe('admin');
    expect(listingPlanChipStatus(view({ planType: 'monthly' }))).toBe('active');
  });
});

describe('formatPlanDate', () => {
  it('usa o fuso America/Fortaleza', () => {
    expect(formatPlanDate('2026-12-01T02:00:00.000Z', 'pt-BR')).toContain('30');
  });
});

=== src/domain/partners/utils/listingPlanStatus.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ListingPlanView } from '../types/listingPlan';

export type ListingPlanChipStatus =
  | 'none'
  | 'trial'
  | 'active'
  | 'admin'
  | 'suspended'
  | 'pendingSeal';

/** Resumo do plano para o selo do cadastro no painel; o selo público segue plano + verificação (D11). */
export function listingPlanChipStatus(view: ListingPlanView): ListingPlanChipStatus {
  if (!view.planActive) return 'none';
  if (view.sealSuspended) return 'suspended';
  if (!view.seal.isVerified) return 'pendingSeal';
  if (view.planType === 'trial') return 'trial';
  if (view.planType === 'admin') return 'admin';
  return 'active';
}

/** Data do plano no fuso do negócio (AGENTS.md §1, §12.4). */
export function formatPlanDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'America/Fortaleza',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

=== src/domain/payment/api/apiPaymentAdapter.test.ts — diff ===
@@ -24,6 +24,7 @@ describe('ApiPaymentAdapter — assinatura do plano', () => {
       intentType: 'payment',
     });
     const payload = {
+      itemId: 'item-1',
       planId: 'monthly' as const,
       locale: 'pt-BR' as const,
       idempotencyKey: 'key-12345',
@@ -42,6 +43,7 @@ describe('ApiPaymentAdapter — assinatura do plano', () => {
     mockResponse(false, { error: { code: 'SUBSCRIPTION_ALREADY_ACTIVE', message: 'x' } });
     await expect(
       new ApiPaymentAdapter().startPlanSubscription({
+        itemId: 'item-1',
         planId: 'monthly',
         locale: 'pt-BR',
         idempotencyKey: 'key-12345',
@@ -51,20 +53,41 @@ describe('ApiPaymentAdapter — assinatura do plano', () => {
 
   it('resposta de erro sem código vira BILLING_UNAVAILABLE', async () => {
     mockResponse(false, {});
-    await expect(new ApiPaymentAdapter().getPlanSubscription()).rejects.toThrow(
+    await expect(new ApiPaymentAdapter().getPlanSubscription('item-1')).rejects.toThrow(
       'BILLING_UNAVAILABLE'
     );
   });
 
-  it('cancelar e retomar usam rotas distintas', async () => {
+  it('lê a assinatura do estabelecimento pelo itemId na query', async () => {
+    mockResponse(true, { subscription: null });
+    await expect(new ApiPaymentAdapter().getPlanSubscription('item-1')).resolves.toBeNull();
+    expect(vi.mocked(firebaseApiFetch).mock.calls[0]?.[0]).toBe(
+      '/api/payment/plans/subscription?itemId=item-1'
+    );
+  });
+
+  it('cancelar e retomar usam rotas distintas e levam o itemId', async () => {
     mockResponse(true, { subscription: null });
     mockResponse(true, { subscription: null });
     const adapter = new ApiPaymentAdapter();
-    await adapter.setPlanSubscriptionRenewal(false);
-    await adapter.setPlanSubscriptionRenewal(true);
-    expect(vi.mocked(firebaseApiFetch).mock.calls.map((call) => call[0])).toEqual([
+    await adapter.setPlanSubscriptionRenewal('item-1', false);
+    await adapter.setPlanSubscriptionRenewal('item-1', true);
+    const calls = vi.mocked(firebaseApiFetch).mock.calls;
+    expect(calls.map((call) => call[0])).toEqual([
       '/api/payment/plans/subscription/cancel',
       '/api/payment/plans/subscription/resume',
     ]);
+    expect(calls[0]?.[1]).toMatchObject({ body: JSON.stringify({ itemId: 'item-1' }) });
+  });
+
+  it('Pix avulso lança o code do topo do corpo', async () => {
+    mockResponse(false, { error: 'Verifique antes.', code: 'LISTING_PENDING_VERIFICATION' });
+    await expect(
+      new ApiPaymentAdapter().createPlanPaymentIntent({
+        itemId: 'item-1',
+        planId: 'annual',
+        idempotencyKey: 'key-12345',
+      })
+    ).rejects.toThrow('LISTING_PENDING_VERIFICATION');
   });
 });

=== src/domain/payment/api/apiPaymentAdapter.ts — diff ===
@@ -16,7 +16,9 @@ const API_OPTIONS = { requireAuth: true, requireAppCheck: true } as const;
 async function readJsonOrThrow<T>(response: Response): Promise<T> {
   const data = await response.json().catch(() => ({}));
   if (!response.ok) {
-    throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'BILLING_UNAVAILABLE');
+    throw new Error(
+      typeof data?.error?.code === 'string' ? data.error.code : 'BILLING_UNAVAILABLE'
+    );
   }
   return data as T;
 }
@@ -44,14 +46,13 @@ export class ApiPaymentAdapter implements PaymentApiPort {
     );
     const data = await response.json().catch(() => ({}));
     if (!response.ok) {
-      throw new Error(data.error?.message ?? data.error ?? 'Erro ao iniciar pagamento do plano.');
+      // A rota de Pix devolve o code no topo do corpo; sem code, cai no erro genérico traduzido.
+      throw new Error(typeof data?.code === 'string' ? data.code : 'BILLING_UNAVAILABLE');
     }
     return data;
   }
 
-  async confirmPlanPaymentReturn(params: {
-    paymentIntentId: string;
-  }): Promise<{ status: string }> {
+  async confirmPlanPaymentReturn(params: { paymentIntentId: string }): Promise<{ status: string }> {
     const response = await firebaseApiFetch(
       '/api/payment/plans/intents/confirm',
       {
@@ -63,7 +64,9 @@ export class ApiPaymentAdapter implements PaymentApiPort {
     );
     const data = await response.json().catch(() => ({}));
     if (!response.ok) {
-      throw new Error(data.error?.message ?? data.error ?? 'Não foi possível verificar o pagamento.');
+      throw new Error(
+        data.error?.message ?? data.error ?? 'Não foi possível verificar o pagamento.'
+      );
     }
     return data;
   }
@@ -76,7 +79,9 @@ export class ApiPaymentAdapter implements PaymentApiPort {
     );
     const data = await response.json().catch(() => ({}));
     if (!response.ok) {
-      throw new Error(data.error?.message ?? data.error ?? 'Não foi possível carregar o status financeiro.');
+      throw new Error(
+        data.error?.message ?? data.error ?? 'Não foi possível carregar o status financeiro.'
+      );
     }
     return data;
   }
@@ -93,7 +98,9 @@ export class ApiPaymentAdapter implements PaymentApiPort {
     );
     const data = await response.json().catch(() => ({}));
     if (!response.ok) {
-      throw new Error(data.error?.message ?? data.error ?? 'Não foi possível criar a conta conectada.');
+      throw new Error(
+        data.error?.message ?? data.error ?? 'Não foi possível criar a conta conectada.'
+      );
     }
     return data;
   }
@@ -110,7 +117,9 @@ export class ApiPaymentAdapter implements PaymentApiPort {
     );
     const data = await response.json().catch(() => ({}));
     if (!response.ok || !data.clientSecret) {
-      throw new Error(data.error?.message ?? data.error ?? 'Não foi possível iniciar a sessão financeira.');
+      throw new Error(
+        data.error?.message ?? data.error ?? 'Não foi possível iniciar a sessão financeira.'
+      );
     }
     return { clientSecret: data.clientSecret };
   }
@@ -121,9 +130,10 @@ export class ApiPaymentAdapter implements PaymentApiPort {
     return readJsonOrThrow(await postJson('/api/payment/plans/subscriptions', payload));
   }
 
-  async getPlanSubscription(): Promise<PlanSubscription | null> {
+  async getPlanSubscription(itemId: string): Promise<PlanSubscription | null> {
+    const query = new URLSearchParams({ itemId });
     const response = await firebaseApiFetch(
-      '/api/payment/plans/subscription',
+      `/api/payment/plans/subscription?${query.toString()}`,
       { method: 'GET' },
       API_OPTIONS
     );
@@ -131,12 +141,15 @@ export class ApiPaymentAdapter implements PaymentApiPort {
     return data.subscription;
   }
 
-  async setPlanSubscriptionRenewal(renew: boolean): Promise<PlanSubscription | null> {
+  async setPlanSubscriptionRenewal(
+    itemId: string,
+    renew: boolean
+  ): Promise<PlanSubscription | null> {
     const path = renew
       ? '/api/payment/plans/subscription/resume'
       : '/api/payment/plans/subscription/cancel';
     const data = await readJsonOrThrow<{ subscription: PlanSubscription | null }>(
-      await postJson(path, {})
+      await postJson(path, { itemId })
     );
     return data.subscription;
   }

=== src/domain/payment/application/usecases/getPlanSubscriptionUseCase.ts — diff ===
@@ -1,6 +1,7 @@
 import { paymentApiAdapter } from '../../factory';
 import type { PlanSubscription } from '../../types/payment';
 
-export async function getPlanSubscriptionUseCase(): Promise<PlanSubscription | null> {
-  return paymentApiAdapter.getPlanSubscription();
+/** Assinatura do plano de um estabelecimento (D11); `null` se ele nunca assinou. */
+export async function getPlanSubscriptionUseCase(itemId: string): Promise<PlanSubscription | null> {
+  return paymentApiAdapter.getPlanSubscription(itemId);
 }

=== src/domain/payment/application/usecases/setPlanSubscriptionRenewalUseCase.ts — diff ===
@@ -3,7 +3,8 @@ import type { PlanSubscription } from '../../types/payment';
 
 /** `renew = false` agenda o cancelamento para o fim do período já pago; `true` desfaz o agendamento. */
 export async function setPlanSubscriptionRenewalUseCase(
+  itemId: string,
   renew: boolean
 ): Promise<PlanSubscription | null> {
-  return paymentApiAdapter.setPlanSubscriptionRenewal(renew);
+  return paymentApiAdapter.setPlanSubscriptionRenewal(itemId, renew);
 }

=== src/domain/payment/components/CheckoutModal.tsx — diff ===
@@ -13,6 +13,8 @@ import { SubscriptionPlanCheckout } from './subcomponents/SubscriptionPlanChecko
 interface CheckoutModalProps {
   isOpen: boolean;
   onClose: () => void;
+  /** Estabelecimento que recebe o plano (D11). */
+  itemId: string;
   planId: PaidPlanId;
   itemName: string;
   /** Valor do plano em centavos. */
@@ -23,6 +25,7 @@ interface CheckoutModalProps {
 export function CheckoutModal({
   isOpen,
   onClose,
+  itemId,
   planId,
   itemName,
   amountMinor,
@@ -97,6 +100,7 @@ export function CheckoutModal({
 
             {confirmedMethod === 'subscription' && (
               <SubscriptionPlanCheckout
+                itemId={itemId}
                 planId={planId}
                 itemName={itemName}
                 amountMinor={amountMinor}
@@ -107,6 +111,7 @@ export function CheckoutModal({
 
             {confirmedMethod === 'one_time' && (
               <OneTimePlanCheckout
+                itemId={itemId}
                 planId={planId}
                 itemName={itemName}
                 amountMinor={amountMinor}

=== src/domain/payment/components/PlanSubscriptionCard.tsx — diff ===
@@ -88,11 +88,11 @@ function SubscriptionDetails({
   );
 }
 
-/** Estado da assinatura do plano na área do parceiro. Não renderiza nada se ele nunca assinou. */
-export function PlanSubscriptionCard() {
+/** Assinatura do plano de um estabelecimento. Não renderiza nada se ele nunca assinou. */
+export function PlanSubscriptionCard({ itemId }: { itemId: string }) {
   const { t, i18n } = useTranslation();
   const { data, loading, error, acting, reload, setRenewal, openPortal } =
-    usePlanSubscriptionStatus();
+    usePlanSubscriptionStatus(itemId);
   const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
 
   if (!loading && !error && !data) {

=== src/domain/payment/components/subcomponents/OneTimePlanCheckout.tsx — diff ===
@@ -8,6 +8,7 @@ import { CheckoutError, CheckoutLoading, CheckoutPending } from './CheckoutStatu
 import { SuccessPaymentGlass } from './SuccessPaymentGlass';
 
 interface OneTimePlanCheckoutProps {
+  itemId: string;
   planId: PaidPlanId;
   itemName: string;
   amountMinor: number;
@@ -16,6 +17,7 @@ interface OneTimePlanCheckoutProps {
 }
 
 export function OneTimePlanCheckout({
+  itemId,
   planId,
   itemName,
   amountMinor,
@@ -33,7 +35,7 @@ export function OneTimePlanCheckout({
     initializePlanPayment,
     confirmPaymentOnBackend,
     resetAttempt,
-  } = usePayment({ planId, onSuccess: onPaymentSuccess });
+  } = usePayment({ itemId, planId, onSuccess: onPaymentSuccess });
 
   useEffect(() => {
     if (status === 'idle') {

=== src/domain/payment/components/subcomponents/SubscriptionPlanCheckout.tsx — diff ===
@@ -8,6 +8,7 @@ import { formatPlanAmount } from '../../utils/formatPlanAmount';
 import { CheckoutError, CheckoutLoading, CheckoutPending } from './CheckoutStatusNotice';
 
 interface SubscriptionPlanCheckoutProps {
+  itemId: string;
   planId: PaidPlanId;
   itemName: string;
   amountMinor: number;
@@ -16,6 +17,7 @@ interface SubscriptionPlanCheckoutProps {
 }
 
 export function SubscriptionPlanCheckout({
+  itemId,
   planId,
   itemName,
   amountMinor,
@@ -24,7 +26,7 @@ export function SubscriptionPlanCheckout({
 }: SubscriptionPlanCheckoutProps) {
   const { t, i18n } = useTranslation();
   const { status, error, checkout, start, waitForActivation, fail, reset } =
-    usePlanSubscriptionCheckout(planId);
+    usePlanSubscriptionCheckout(itemId, planId);
 
   useEffect(() => {
     if (status === 'idle') {

=== src/domain/payment/hooks/usePayment.ts — diff ===
@@ -2,13 +2,15 @@ import { useCallback, useRef, useState } from 'react';
 import { confirmPlanPaymentReturnUseCase } from '../application/usecases/confirmPlanPaymentReturnUseCase';
 import { createPlanPaymentIntentUseCase } from '../application/usecases/createPlanPaymentIntentUseCase';
 import type { PaidPlanId } from '../types/payment';
+import { getPaymentErrorMessage } from '../utils/paymentErrorMessage';
 
 interface UsePaymentProps {
+  itemId: string;
   planId: PaidPlanId;
   onSuccess?: (paymentId: string) => void;
 }
 
-export function usePayment({ planId, onSuccess }: UsePaymentProps) {
+export function usePayment({ itemId, planId, onSuccess }: UsePaymentProps) {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [clientSecret, setClientSecret] = useState<string | null>(null);
@@ -24,6 +26,7 @@ export function usePayment({ planId, onSuccess }: UsePaymentProps) {
     setError(null);
     try {
       const response = await createPlanPaymentIntentUseCase({
+        itemId,
         planId,
         idempotencyKey: idempotencyKeyRef.current,
       });
@@ -34,14 +37,12 @@ export function usePayment({ planId, onSuccess }: UsePaymentProps) {
         onSuccess?.(response.paymentIntentId);
       }
     } catch (err: unknown) {
-      setError(
-        err instanceof Error ? err.message : 'Não foi possível iniciar o pagamento via Stripe.'
-      );
+      setError(getPaymentErrorMessage(err));
       setStatus('failed');
     } finally {
       setLoading(false);
     }
-  }, [planId, onSuccess]);
+  }, [itemId, planId, onSuccess]);
 
   const confirmPaymentOnBackend = useCallback(
     async (resolvedPaymentIntentId?: string) => {
@@ -57,16 +58,12 @@ export function usePayment({ planId, onSuccess }: UsePaymentProps) {
           onSuccess?.(targetId);
         } else if (res.status === 'failed' || res.status === 'canceled') {
           setStatus('failed');
-          setError('O pagamento não foi aprovado.');
+          setError(getPaymentErrorMessage(new Error('PAYMENT_FAILED')));
         } else {
           setStatus('processing');
         }
       } catch (err: unknown) {
-        setError(
-          err instanceof Error
-            ? err.message
-            : 'Aguardando confirmação final do pagamento.'
-        );
+        setError(err instanceof Error ? err.message : 'Aguardando confirmação final do pagamento.');
       }
     },
     [paymentIntentId, onSuccess]

=== src/domain/payment/hooks/usePlanSubscriptionCheckout.test.ts — diff ===
@@ -13,6 +13,7 @@ vi.mock('../application/usecases/getPlanSubscriptionUseCase', () => ({
 }));
 
 const ACTIVE = {
+  itemId: 'item-1',
   planId: 'monthly' as const,
   status: 'active' as const,
   currentPeriodEnd: '2026-11-10T12:00:00.000Z',
@@ -33,12 +34,12 @@ describe('usePlanSubscriptionCheckout', () => {
       clientSecret: 'seti_secret',
       intentType: 'setup',
     });
-    const { result } = renderHook(() => usePlanSubscriptionCheckout('annual'));
+    const { result } = renderHook(() => usePlanSubscriptionCheckout('item-1', 'annual'));
     await act(async () => {
       await result.current.start();
     });
     expect(startPlanSubscriptionUseCase).toHaveBeenCalledWith(
-      expect.objectContaining({ planId: 'annual', locale: expect.any(String) })
+      expect.objectContaining({ itemId: 'item-1', planId: 'annual', locale: expect.any(String) })
     );
     expect(result.current.status).toBe('ready');
     expect(result.current.checkout?.intentType).toBe('setup');
@@ -49,7 +50,7 @@ describe('usePlanSubscriptionCheckout', () => {
     vi.mocked(startPlanSubscriptionUseCase).mockRejectedValue(
       new Error('SUBSCRIPTION_ALREADY_ACTIVE')
     );
-    const { result } = renderHook(() => usePlanSubscriptionCheckout('monthly'));
+    const { result } = renderHook(() => usePlanSubscriptionCheckout('item-1', 'monthly'));
     await act(async () => {
       await result.current.start();
     });
@@ -62,7 +63,7 @@ describe('usePlanSubscriptionCheckout', () => {
     vi.mocked(getPlanSubscriptionUseCase)
       .mockResolvedValueOnce({ ...ACTIVE, status: 'incomplete' })
       .mockResolvedValueOnce(ACTIVE);
-    const { result } = renderHook(() => usePlanSubscriptionCheckout('monthly'));
+    const { result } = renderHook(() => usePlanSubscriptionCheckout('item-1', 'monthly'));
     await act(async () => {
       result.current.waitForActivation();
       await vi.advanceTimersByTimeAsync(0);
@@ -73,11 +74,12 @@ describe('usePlanSubscriptionCheckout', () => {
     });
     expect(result.current.status).toBe('active');
     expect(getPlanSubscriptionUseCase).toHaveBeenCalledTimes(2);
+    expect(getPlanSubscriptionUseCase).toHaveBeenCalledWith('item-1');
   });
 
   it('para de consultar depois de 60 s e avisa que a confirmação atrasou', async () => {
     vi.mocked(getPlanSubscriptionUseCase).mockResolvedValue({ ...ACTIVE, status: 'incomplete' });
-    const { result } = renderHook(() => usePlanSubscriptionCheckout('monthly'));
+    const { result } = renderHook(() => usePlanSubscriptionCheckout('item-1', 'monthly'));
     await act(async () => {
       result.current.waitForActivation();
       await vi.advanceTimersByTimeAsync(61_000);

=== src/domain/payment/hooks/usePlanSubscriptionCheckout.ts — diff ===
@@ -18,7 +18,7 @@ export type PlanSubscriptionCheckoutStatus =
   | 'delayed'
   | 'failed';
 
-export function usePlanSubscriptionCheckout(planId: PaidPlanId) {
+export function usePlanSubscriptionCheckout(itemId: string, planId: PaidPlanId) {
   const { i18n } = useTranslation();
   const [status, setStatus] = useState<PlanSubscriptionCheckoutStatus>('idle');
   const [error, setError] = useState<string | null>(null);
@@ -40,6 +40,7 @@ export function usePlanSubscriptionCheckout(planId: PaidPlanId) {
     setError(null);
     try {
       const response = await startPlanSubscriptionUseCase({
+        itemId,
         planId,
         locale: normalizeLocale(i18n.language) ?? DEFAULT_LOCALE,
         idempotencyKey: idempotencyKeyRef.current,
@@ -50,7 +51,7 @@ export function usePlanSubscriptionCheckout(planId: PaidPlanId) {
       setError(getPaymentErrorMessage(err));
       setStatus('failed');
     }
-  }, [planId, i18n.language]);
+  }, [itemId, planId, i18n.language]);
 
   // O webhook é a fonte da verdade (AGENTS.md §8.4): consultamos o backend até ele confirmar.
   const waitForActivation = useCallback(() => {
@@ -59,7 +60,7 @@ export function usePlanSubscriptionCheckout(planId: PaidPlanId) {
     const deadline = Date.now() + POLL_TIMEOUT_MS;
     const poll = async () => {
       try {
-        const subscription = await getPlanSubscriptionUseCase();
+        const subscription = await getPlanSubscriptionUseCase(itemId);
         if (subscription?.status === 'active' || subscription?.status === 'trialing') {
           setStatus('active');
           return;
@@ -74,7 +75,7 @@ export function usePlanSubscriptionCheckout(planId: PaidPlanId) {
       pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
     };
     void poll();
-  }, [stopPolling]);
+  }, [itemId, stopPolling]);
 
   const fail = useCallback((message: string) => {
     setError(message);

=== src/domain/payment/hooks/usePlanSubscriptionStatus.ts — diff ===
@@ -7,7 +7,7 @@ import { setPlanSubscriptionRenewalUseCase } from '../application/usecases/setPl
 import type { PlanSubscription } from '../types/payment';
 import { getPaymentErrorMessage } from '../utils/paymentErrorMessage';
 
-export function usePlanSubscriptionStatus() {
+export function usePlanSubscriptionStatus(itemId: string) {
   const { i18n } = useTranslation();
   const [data, setData] = useState<PlanSubscription | null>(null);
   const [loading, setLoading] = useState(true);
@@ -18,29 +18,32 @@ export function usePlanSubscriptionStatus() {
     setLoading(true);
     setError(null);
     try {
-      setData(await getPlanSubscriptionUseCase());
+      setData(await getPlanSubscriptionUseCase(itemId));
     } catch (err: unknown) {
       setError(getPaymentErrorMessage(err));
     } finally {
       setLoading(false);
     }
-  }, []);
+  }, [itemId]);
 
   useEffect(() => {
     void reload();
   }, [reload]);
 
-  const setRenewal = useCallback(async (renew: boolean) => {
-    setActing(true);
-    setError(null);
-    try {
-      setData(await setPlanSubscriptionRenewalUseCase(renew));
-    } catch (err: unknown) {
-      setError(getPaymentErrorMessage(err));
-    } finally {
-      setActing(false);
-    }
-  }, []);
+  const setRenewal = useCallback(
+    async (renew: boolean) => {
+      setActing(true);
+      setError(null);
+      try {
+        setData(await setPlanSubscriptionRenewalUseCase(itemId, renew));
+      } catch (err: unknown) {
+        setError(getPaymentErrorMessage(err));
+      } finally {
+        setActing(false);
+      }
+    },
+    [itemId]
+  );
 
   const openPortal = useCallback(async () => {
     setActing(true);

=== src/domain/payment/ports/paymentApiPort.ts — diff ===
@@ -12,14 +12,14 @@ export interface PaymentApiPort {
   createPlanPaymentIntent(
     payload: CreatePlanPaymentIntentPayload
   ): Promise<CreatePaymentIntentResponse>;
-  confirmPlanPaymentReturn(params: {
-    paymentIntentId: string;
-  }): Promise<{ status: string }>;
+  confirmPlanPaymentReturn(params: { paymentIntentId: string }): Promise<{ status: string }>;
   getPartnerConnectStatus(): Promise<PartnerConnectStatusResponse>;
   createPartnerConnectAccount(): Promise<PartnerConnectStatusResponse>;
   createPartnerConnectAccountSession(): Promise<{ clientSecret: string }>;
-  startPlanSubscription(payload: StartPlanSubscriptionPayload): Promise<StartPlanSubscriptionResponse>;
-  getPlanSubscription(): Promise<PlanSubscription | null>;
-  setPlanSubscriptionRenewal(renew: boolean): Promise<PlanSubscription | null>;
+  startPlanSubscription(
+    payload: StartPlanSubscriptionPayload
+  ): Promise<StartPlanSubscriptionResponse>;
+  getPlanSubscription(itemId: string): Promise<PlanSubscription | null>;
+  setPlanSubscriptionRenewal(itemId: string, renew: boolean): Promise<PlanSubscription | null>;
   createBillingPortalSession(locale: PaymentLocale): Promise<{ url: string }>;
 }

=== src/domain/payment/types/payment.ts — diff ===
@@ -9,7 +9,9 @@ export type PaymentStatus =
 
 export type PaidPlanId = 'monthly' | 'semi-annual' | 'annual';
 
+/** O plano é de um estabelecimento (D11): o backend confere dono e verificação pelo `itemId`. */
 export interface CreatePlanPaymentIntentPayload {
+  itemId: string;
   planId: PaidPlanId;
   idempotencyKey: string;
 }
@@ -49,6 +51,7 @@ export type PlanSubscriptionStatus =
   | 'paused';
 
 export interface PlanSubscription {
+  itemId: string;
   planId: PaidPlanId;
   status: PlanSubscriptionStatus;
   currentPeriodEnd: string | null;
@@ -56,6 +59,7 @@ export interface PlanSubscription {
 }
 
 export interface StartPlanSubscriptionPayload {
+  itemId: string;
   planId: PaidPlanId;
   locale: PaymentLocale;
   idempotencyKey: string;

=== src/domain/payment/utils/paymentErrorMessage.ts — diff ===
@@ -8,6 +8,10 @@ const PAYMENT_ERROR_CODES = [
   'FORBIDDEN',
   'BILLING_UNAVAILABLE',
   'PAYMENT_FAILED',
+  'NOT_FOUND',
+  'LISTING_PENDING_VERIFICATION',
+  'PLAN_ALREADY_ACTIVE',
+  'PARTNER_SUSPENDED',
 ] as const;
 
 type PaymentErrorCode = (typeof PAYMENT_ERROR_CODES)[number];

=== src/shared/i18n/insightsResources.ts — diff ===
@@ -11,6 +11,8 @@ export interface InsightsTranslation {
     title: string;
     loading: string;
     loadError: string;
+    planRequiredTitle: string;
+    planRequired: string;
   };
   stats: {
     views: string;
@@ -58,6 +60,9 @@ export const insightsPtBR: InsightsTranslation = {
     title: 'Relatório de insights',
     loading: 'Carregando o relatório...',
     loadError: 'Não foi possível carregar o relatório deste item.',
+    planRequiredTitle: 'Métricas do plano Use Guide Verificado',
+    planRequired:
+      'As métricas deste cadastro fazem parte do plano do estabelecimento. Ative o plano em Meus Itens. As avaliações continuam liberadas.',
   },
   stats: {
     views: 'Visualizações',
@@ -105,6 +110,9 @@ export const insightsEn: InsightsTranslation = {
     title: 'Insights report',
     loading: 'Loading the report...',
     loadError: 'We could not load the report for this item.',
+    planRequiredTitle: 'Use Guide Verified plan metrics',
+    planRequired:
+      'Metrics for this listing are part of the business plan. Start the plan in My Items. Reviews stay available.',
   },
   stats: {
     views: 'Views',
@@ -152,6 +160,9 @@ export const insightsFr: InsightsTranslation = {
     title: 'Rapport de statistiques',
     loading: 'Chargement du rapport...',
     loadError: 'Impossible de charger le rapport de cet élément.',
+    planRequiredTitle: "Statistiques de l'offre Use Guide Vérifié",
+    planRequired:
+      "Les statistiques de cette fiche font partie de l'offre de l'établissement. Activez l'offre dans Mes éléments. Les avis restent disponibles.",
   },
   stats: {
     views: 'Vues',

=== src/shared/i18n/listingPlanResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos do plano "Use Guide Verificado" por estabelecimento (D11). pt-BR é a fonte. */
export interface ListingPlanTranslation {
  chip: {
    active: string;
    trial: string;
    admin: string;
    suspended: string;
    pendingSeal: string;
    none: string;
    label: string;
  };
  planNames: {
    trial: string;
    monthly: string;
    'semi-annual': string;
    annual: string;
    admin: string;
  };
  dialog: {
    title: string;
    close: string;
    loading: string;
    retry: string;
  };
  status: {
    activeUntil: string;
    adminGranted: string;
    none: string;
    sealOn: string;
    sealPendingVerification: string;
    sealSuspended: string;
  };
  benefits: {
    title: string;
    seal: string;
    metrics: string;
    featured: string;
    reviews: string;
  };
  verificationRequired: string;
  verifyAction: string;
  options: {
    title: string;
    trialName: string;
    trialHint: string;
    free: string;
    perMonth: string;
    empty: string;
  };
  actions: {
    activateTrial: string;
    continue: string;
    processing: string;
  };
  trialActivated: string;
  checkoutName: string;
  errors: {
    VALIDATION_ERROR: string;
    FORBIDDEN: string;
    NOT_FOUND: string;
    LISTING_PENDING_VERIFICATION: string;
    TRIAL_ALREADY_USED: string;
    PLAN_ALREADY_ACTIVE: string;
    PARTNER_SUSPENDED: string;
    INTERNAL_ERROR: string;
  };
}

export const listingPlanPtBR: ListingPlanTranslation = {
  chip: {
    active: 'Selo até {{date}}',
    trial: 'Teste grátis até {{date}}',
    admin: 'Selo da equipe',
    suspended: 'Selo suspenso',
    pendingSeal: 'Plano ativo, selo após a verificação',
    none: 'Ativar selo',
    label: 'Plano de {{name}}: {{status}}',
  },
  planNames: {
    trial: 'Teste grátis',
    monthly: 'Mensal',
    'semi-annual': 'Semestral',
    annual: 'Anual',
    admin: 'Concedido pela equipe',
  },
  dialog: {
    title: 'Use Guide Verificado',
    close: 'Fechar',
    loading: 'Carregando o plano…',
    retry: 'Tentar de novo',
  },
  status: {
    activeUntil: 'Plano {{plan}} em vigor até {{date}}.',
    adminGranted: 'Selo concedido pela equipe Use Guide.',
    none: 'Este estabelecimento ainda não tem plano.',
    sealOn: 'O selo aparece no estabelecimento e nos eventos dele.',
    sealPendingVerification:
      'O selo aparece depois que a equipe aprovar a verificação do estabelecimento.',
    sealSuspended: 'O selo foi retirado pela equipe Use Guide. O plano continua em vigor.',
  },
  benefits: {
    title: 'O plano inclui',
    seal: 'Selo "Use Guide Verificado" no estabelecimento e nos eventos dele',
    metrics: 'Métricas de visualizações e cliques',
    featured: 'Rodízio diário nas vagas "Destaque" do topo da lista',
    reviews: 'Avaliações e respostas continuam liberadas, com ou sem plano',
  },
  verificationRequired:
    'Para ativar um plano, envie a verificação deste estabelecimento e aguarde a aprovação da equipe.',
  verifyAction: 'Verificar estabelecimento',
  options: {
    title: 'Escolha o período',
    trialName: 'Teste grátis de 7 dias',
    trialHint: 'Uma vez por conta, no estabelecimento que você escolher.',
    free: 'Grátis',
    perMonth: '{{amount}}/mês',
    empty: 'Nenhum plano disponível no momento.',
  },
  actions: {
    activateTrial: 'Ativar 7 dias grátis',
    continue: 'Seguir para o pagamento',
    processing: 'Processando…',
  },
  trialActivated: 'Teste grátis ativado até {{date}}.',
  checkoutName: 'Use Guide Verificado · {{plan}} · {{name}}',
  errors: {
    VALIDATION_ERROR: 'Dados inválidos. Revise e tente novamente.',
    FORBIDDEN: 'Este estabelecimento não é da sua conta.',
    NOT_FOUND: 'Estabelecimento não encontrado.',
    LISTING_PENDING_VERIFICATION:
      'O estabelecimento precisa ser verificado pela equipe antes do plano.',
    TRIAL_ALREADY_USED: 'O teste grátis já foi usado nesta conta.',
    PLAN_ALREADY_ACTIVE: 'Este estabelecimento já tem um plano em vigor.',
    PARTNER_SUSPENDED: 'Sua conta está suspensa.',
    INTERNAL_ERROR: 'Não foi possível concluir agora. Tente novamente em instantes.',
  },
};

export const listingPlanEn: ListingPlanTranslation = {
  chip: {
    active: 'Badge until {{date}}',
    trial: 'Free trial until {{date}}',
    admin: 'Team badge',
    suspended: 'Badge suspended',
    pendingSeal: 'Plan active, badge after verification',
    none: 'Get the badge',
    label: 'Plan for {{name}}: {{status}}',
  },
  planNames: {
    trial: 'Free trial',
    monthly: 'Monthly',
    'semi-annual': 'Six-month',
    annual: 'Annual',
    admin: 'Granted by the team',
  },
  dialog: {
    title: 'Use Guide Verified',
    close: 'Close',
    loading: 'Loading the plan…',
    retry: 'Try again',
  },
  status: {
    activeUntil: '{{plan}} plan active until {{date}}.',
    adminGranted: 'Badge granted by the Use Guide team.',
    none: 'This business has no plan yet.',
    sealOn: 'The badge shows on the business and on its events.',
    sealPendingVerification: 'The badge shows once the team approves the business verification.',
    sealSuspended: 'The Use Guide team removed the badge. The plan is still active.',
  },
  benefits: {
    title: 'The plan includes',
    seal: '"Use Guide Verified" badge on the business and on its events',
    metrics: 'View and click metrics',
    featured: 'Daily rotation in the "Featured" spots at the top of the list',
    reviews: 'Reviews and replies stay available, with or without a plan',
  },
  verificationRequired:
    'To start a plan, submit this business for verification and wait for the team to approve it.',
  verifyAction: 'Verify business',
  options: {
    title: 'Choose the period',
    trialName: '7-day free trial',
    trialHint: 'Once per account, on the business you choose.',
    free: 'Free',
    perMonth: '{{amount}}/month',
    empty: 'No plans available right now.',
  },
  actions: {
    activateTrial: 'Start 7 free days',
    continue: 'Continue to payment',
    processing: 'Processing…',
  },
  trialActivated: 'Free trial active until {{date}}.',
  checkoutName: 'Use Guide Verified · {{plan}} · {{name}}',
  errors: {
    VALIDATION_ERROR: 'Invalid data. Please review and try again.',
    FORBIDDEN: 'This business does not belong to your account.',
    NOT_FOUND: 'Business not found.',
    LISTING_PENDING_VERIFICATION: 'The team must verify the business before a plan.',
    TRIAL_ALREADY_USED: 'This account has already used the free trial.',
    PLAN_ALREADY_ACTIVE: 'This business already has an active plan.',
    PARTNER_SUSPENDED: 'Your account is suspended.',
    INTERNAL_ERROR: 'Something went wrong. Please try again shortly.',
  },
};

export const listingPlanFr: ListingPlanTranslation = {
  chip: {
    active: "Badge jusqu'au {{date}}",
    trial: "Essai gratuit jusqu'au {{date}}",
    admin: "Badge de l'équipe",
    suspended: 'Badge suspendu',
    pendingSeal: 'Offre active, badge après la vérification',
    none: 'Obtenir le badge',
    label: 'Offre de {{name}} : {{status}}',
  },
  planNames: {
    trial: 'Essai gratuit',
    monthly: 'Mensuel',
    'semi-annual': 'Semestriel',
    annual: 'Annuel',
    admin: "Accordé par l'équipe",
  },
  dialog: {
    title: 'Use Guide Vérifié',
    close: 'Fermer',
    loading: "Chargement de l'offre…",
    retry: 'Réessayer',
  },
  status: {
    activeUntil: "Offre {{plan}} active jusqu'au {{date}}.",
    adminGranted: "Badge accordé par l'équipe Use Guide.",
    none: "Cet établissement n'a pas encore d'offre.",
    sealOn: "Le badge s'affiche sur l'établissement et sur ses événements.",
    sealPendingVerification:
      "Le badge s'affiche une fois la vérification de l'établissement approuvée par l'équipe.",
    sealSuspended: "L'équipe Use Guide a retiré le badge. L'offre reste active.",
  },
  benefits: {
    title: "L'offre comprend",
    seal: "Badge « Use Guide Vérifié » sur l'établissement et sur ses événements",
    metrics: 'Statistiques de vues et de clics',
    featured: 'Rotation quotidienne dans les places « À la une » en haut de la liste',
    reviews: 'Les avis et les réponses restent disponibles, avec ou sans offre',
  },
  verificationRequired:
    "Pour activer une offre, envoyez la vérification de cet établissement et attendez l'approbation de l'équipe.",
  verifyAction: "Vérifier l'établissement",
  options: {
    title: 'Choisissez la période',
    trialName: 'Essai gratuit de 7 jours',
    trialHint: "Une fois par compte, sur l'établissement de votre choix.",
    free: 'Gratuit',
    perMonth: '{{amount}}/mois',
    empty: 'Aucune offre disponible pour le moment.',
  },
  actions: {
    activateTrial: 'Activer 7 jours gratuits',
    continue: 'Passer au paiement',
    processing: 'Traitement…',
  },
  trialActivated: "Essai gratuit actif jusqu'au {{date}}.",
  checkoutName: 'Use Guide Vérifié · {{plan}} · {{name}}',
  errors: {
    VALIDATION_ERROR: 'Données invalides. Vérifiez et réessayez.',
    FORBIDDEN: "Cet établissement n'appartient pas à votre compte.",
    NOT_FOUND: 'Établissement introuvable.',
    LISTING_PENDING_VERIFICATION: "L'équipe doit vérifier l'établissement avant l'offre.",
    TRIAL_ALREADY_USED: "L'essai gratuit a déjà été utilisé sur ce compte.",
    PLAN_ALREADY_ACTIVE: 'Cet établissement a déjà une offre active.',
    PARTNER_SUSPENDED: 'Votre compte est suspendu.',
    INTERNAL_ERROR: 'Impossible de terminer pour le moment. Réessayez dans un instant.',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -10,6 +10,12 @@ import {
   insightsFr,
   insightsPtBR,
 } from './insightsResources';
+import {
+  type ListingPlanTranslation,
+  listingPlanEn,
+  listingPlanFr,
+  listingPlanPtBR,
+} from './listingPlanResources';
 import {
   type PartnersTranslation,
   partnersEn,
@@ -26,6 +32,7 @@ import {
 export interface TranslationResource {
   bookings: BookingsTranslation;
   insights: InsightsTranslation;
+  listingPlan: ListingPlanTranslation;
   partners: PartnersTranslation;
   verification: VerificationTranslation;
   common: {
@@ -106,6 +113,10 @@ export interface TranslationResource {
       FORBIDDEN: string;
       BILLING_UNAVAILABLE: string;
       PAYMENT_FAILED: string;
+      NOT_FOUND: string;
+      LISTING_PENDING_VERIFICATION: string;
+      PLAN_ALREADY_ACTIVE: string;
+      PARTNER_SUSPENDED: string;
     };
   };
   payment: {
@@ -223,6 +234,7 @@ export interface TranslationResource {
 const ptBR: TranslationResource = {
   bookings: bookingsPtBR,
   insights: insightsPtBR,
+  listingPlan: listingPlanPtBR,
   partners: partnersPtBR,
   verification: verificationPtBR,
   common: {
@@ -304,6 +316,11 @@ const ptBR: TranslationResource = {
       FORBIDDEN: 'Conclua seu cadastro de parceiro antes de assinar.',
       BILLING_UNAVAILABLE: 'Pagamentos indisponíveis no momento. Tente novamente em instantes.',
       PAYMENT_FAILED: 'O pagamento não foi aprovado.',
+      NOT_FOUND: 'Estabelecimento não encontrado.',
+      LISTING_PENDING_VERIFICATION:
+        'O estabelecimento precisa ser verificado pela equipe antes do plano.',
+      PLAN_ALREADY_ACTIVE: 'Este estabelecimento já tem um plano em vigor.',
+      PARTNER_SUSPENDED: 'Sua conta está suspensa.',
     },
   },
   payment: {
@@ -469,6 +486,7 @@ const ptBR: TranslationResource = {
 const en: TranslationResource = {
   bookings: bookingsEn,
   insights: insightsEn,
+  listingPlan: listingPlanEn,
   partners: partnersEn,
   verification: verificationEn,
   common: {
@@ -549,6 +567,10 @@ const en: TranslationResource = {
       FORBIDDEN: 'Complete your partner registration before subscribing.',
       BILLING_UNAVAILABLE: 'Payments are unavailable right now. Please try again shortly.',
       PAYMENT_FAILED: 'The payment was not approved.',
+      NOT_FOUND: 'Business not found.',
+      LISTING_PENDING_VERIFICATION: 'The team must verify the business before a plan.',
+      PLAN_ALREADY_ACTIVE: 'This business already has an active plan.',
+      PARTNER_SUSPENDED: 'Your account is suspended.',
     },
   },
   payment: {
@@ -711,6 +733,7 @@ const en: TranslationResource = {
 const fr: TranslationResource = {
   bookings: bookingsFr,
   insights: insightsFr,
+  listingPlan: listingPlanFr,
   partners: partnersFr,
   verification: verificationFr,
   common: {
@@ -793,6 +816,10 @@ const fr: TranslationResource = {
       BILLING_UNAVAILABLE:
         'Les paiements sont indisponibles pour le moment. Réessayez dans un instant.',
       PAYMENT_FAILED: 'Le paiement n’a pas été approuvé.',
+      NOT_FOUND: 'Établissement introuvable.',
+      LISTING_PENDING_VERIFICATION: "L'équipe doit vérifier l'établissement avant l'offre.",
+      PLAN_ALREADY_ACTIVE: 'Cet établissement a déjà une offre active.',
+      PARTNER_SUSPENDED: 'Votre compte est suspendu.',
     },
   },
   payment: {

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 177 arquivos, 936 testes, `npm run build`.
- no app (painel do parceiro → Meus Itens):
  - cada cadastro tem dois selos: verificação e plano;
  - cadastro sem verificação aprovada: o diálogo do plano pede a verificação e não mostra os períodos;
  - cadastro verificado: ativar o teste grátis, ou escolher um período e pagar com cartão de teste (4242 4242 4242 4242);
  - Relatórios de um cadastro sem plano mostram o aviso e as avaliações.
  Repita em `fr` para ver se o texto não corta.

Responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
