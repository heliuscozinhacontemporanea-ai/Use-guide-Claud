# Prompt 18.3a — Plano e selo por estabelecimento (backend)

> Lote 14, gerado do commit de referência `bd14c0f` da branch `claude/agents-md-v2`. Aplique depois do lote 13. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3a — Plano e selo por estabelecimento (D11, backend)

Decisão D11 (2026-10-19), detalhes de 2026-10-21.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). Dados de teste de plano e selo podem ser apagados e recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D11 (docs/arquitetura/decisoes.md): plano "Use Guide Verificado", selo e destaque por estabelecimento. O selo só aparece com plano ativo do estabelecimento E verificação aprovada pelo admin (D12).

ATENÇÃO: este prompt é só o BACKEND. As telas passam a usar as rotas novas no 18.3.1. Até lá, ativar trial, comprar plano e o selo do admin pelo painel deixam de funcionar; isso é esperado.

O QUE MUDA:
1) Domínio partners:
   - listingPlans/{itemId} (só backend): tipo do plano (trial, monthly, semi-annual, annual, admin), validade, selo suspenso pelo admin e sealActive (último selo público gravado);
   - utils/listingSeal.ts: cálculo do selo (plano ativo + verificação aprovada) e regra do selo do admin (D8);
   - ListingPlanService, port, adapter Firestore e casos de uso (um por arquivo);
   - a conta (partners/{uid} e publicPartners) deixa de ter isVerified, verifiedUntil, verificationType e isVerificationSuspended; fica só hasUsedTrial (um trial por conta);
   - saem: utils/adminVerification, os casos de uso de trial e de selo por conta e o VerifyPartnerDTO.
2) guide e events: a cópia pública do selo passa a ser por item (updateItemVerificationUseCase) e pelos eventos do estabelecimento (updateEstablishmentEventsVerificationUseCase, filtro establishmentId).
3) server/application/usecases/listingPlans/:
   - sync do selo (item + eventos + sealActive);
   - trial;
   - selo do admin (com log de auditoria);
   - leitura do plano;
   - revisão da verificação recalculando o selo do estabelecimento e dos perfis de produtor ligados;
   - job diário (desliga selos vencidos e avisa quem vence em 3 dias).
4) activatePaidPlanApplicationUseCase grava o plano no estabelecimento (exige itemId). Os webhooks só ativam quando a metadata traz itemId; o 18.3b passa a enviá-lo.
5) Evento novo herda o selo do estabelecimento. Excluir o estabelecimento ou a conta apaga os planos.
6) HTTP:
   - novas rotas /api/listing-plans: GET /:itemId, POST /:itemId/trial (checkRevoked), PUT /:itemId/seal (admin, corpo { grant });
   - saem PATCH /api/partners/verify e POST /api/partners/activate-trial;
   - a revisão em /api/listing-verifications/:itemId/review recalcula o selo;
   - o job interno de planos expirando agora roda a manutenção por estabelecimento.
7) firestore.rules (listingPlans com if false) + teste; índice listingPlans (sealActive + planUntil); firebase-blueprint.json; decisoes.md (detalhes da D11); debitos.md (B24).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- firebase-blueprint.json (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.security.test.ts (alterar)
- server.ts (alterar)
- server/application/usecases/activatePaidPlanApplicationUseCase.test.ts (alterar)
- server/application/usecases/activatePaidPlanApplicationUseCase.ts (alterar)
- server/application/usecases/activatePartnerTrialApplicationUseCase.test.ts (apagar)
- server/application/usecases/activatePartnerTrialApplicationUseCase.ts (apagar)
- server/application/usecases/applyPartnerVerification.ts (apagar)
- server/application/usecases/checkExpiringPartnerPlansApplicationUseCase.test.ts (apagar)
- server/application/usecases/checkExpiringPartnerPlansApplicationUseCase.ts (apagar)
- server/application/usecases/createPartnerEventApplicationUseCase.test.ts (alterar)
- server/application/usecases/createPartnerEventApplicationUseCase.ts (alterar)
- server/application/usecases/deletePartnerItemApplicationUseCase.test.ts (alterar)
- server/application/usecases/deletePartnerItemApplicationUseCase.ts (alterar)
- server/application/usecases/deleteUserAccountApplicationUseCase.ts (alterar)
- server/application/usecases/getAdminPartnersUseCase.test.ts (alterar)
- server/application/usecases/getAdminPartnersUseCase.ts (alterar)
- server/application/usecases/listingPlans/activateListingTrialApplicationUseCase.ts (criar)
- server/application/usecases/listingPlans/getListingPlanApplicationUseCase.ts (criar)
- server/application/usecases/listingPlans/listingPlanApplicationUseCases.test.ts (criar)
- server/application/usecases/listingPlans/loadPlanListing.ts (criar)
- server/application/usecases/listingPlans/reviewListingVerificationApplicationUseCase.ts (criar)
- server/application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase.ts (criar)
- server/application/usecases/listingPlans/setListingSealByAdminApplicationUseCase.ts (criar)
- server/application/usecases/listingPlans/syncListingSealApplicationUseCase.ts (criar)
- server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.test.ts (alterar)
- server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts (alterar)
- server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts (alterar)
- server/application/usecases/setPartnerVerificationByAdminApplicationUseCase.test.ts (apagar)
- server/application/usecases/setPartnerVerificationByAdminApplicationUseCase.ts (apagar)
- server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.test.ts (alterar)
- server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.ts (alterar)
- server/application/usecases/verifyPartnerApplicationUseCase.test.ts (apagar)
- server/application/usecases/verifyPartnerApplicationUseCase.ts (apagar)
- server/domain/events/adapters/firestoreEventAdapter.ts (alterar)
- server/domain/events/index.ts (alterar)
- server/domain/events/ports/eventsPort.ts (alterar)
- server/domain/events/services/eventsService.test.ts (alterar)
- server/domain/events/services/eventsService.ts (alterar)
- server/domain/events/usecases/updateEstablishmentEventsVerificationUseCase.ts (criar)
- server/domain/events/usecases/updateEventsOwnerVerificationUseCase.ts (apagar)
- server/domain/guide/adapters/firestoreGuideAdapter.ts (alterar)
- server/domain/guide/index.ts (alterar)
- server/domain/guide/ports/guidePort.ts (alterar)
- server/domain/guide/services/guideService.test.ts (alterar)
- server/domain/guide/services/guideService.ts (alterar)
- server/domain/guide/usecases/updateItemVerificationUseCase.ts (criar)
- server/domain/guide/usecases/updateOwnerVerificationUseCase.ts (apagar)
- server/domain/partners/adapters/firestoreListingPlanAdapter.ts (criar)
- server/domain/partners/adapters/firestoreListingVerificationAdapter.ts (alterar)
- server/domain/partners/adapters/firestorePartnerAdapter.test.ts (alterar)
- server/domain/partners/adapters/firestorePartnerAdapter.ts (alterar)
- server/domain/partners/controllers/partnerController.ts (alterar)
- server/domain/partners/dtos/VerifyPartnerDTO.ts (apagar)
- server/domain/partners/errors/listingPlanError.ts (criar)
- server/domain/partners/factory.ts (alterar)
- server/domain/partners/index.ts (alterar)
- server/domain/partners/mappers/partnerMapper.test.ts (alterar)
- server/domain/partners/mappers/partnerMapper.ts (alterar)
- server/domain/partners/ports/listingPlanRepositoryPort.ts (criar)
- server/domain/partners/ports/listingVerificationRepositoryPort.ts (alterar)
- server/domain/partners/ports/partnerPort.ts (alterar)
- server/domain/partners/routes/partnerRoutes.ts (alterar)
- server/domain/partners/schemas/partnerSchema.test.ts (alterar)
- server/domain/partners/schemas/partnerSchema.ts (alterar)
- server/domain/partners/services/listingPlanService.test.ts (criar)
- server/domain/partners/services/listingPlanService.ts (criar)
- server/domain/partners/services/listingVerificationService.test.ts (alterar)
- server/domain/partners/services/listingVerificationService.ts (alterar)
- server/domain/partners/services/partnerService.test.ts (alterar)
- server/domain/partners/services/partnerService.ts (alterar)
- server/domain/partners/types/listingPlan.ts (criar)
- server/domain/partners/types/partnerTypes.ts (alterar)
- server/domain/partners/usecases/activateListingTrialUseCase.ts (criar)
- server/domain/partners/usecases/activatePartnerTrialUseCase.ts (apagar)
- server/domain/partners/usecases/applyListingPaidPlanUseCase.ts (criar)
- server/domain/partners/usecases/assertListingPlanPurchasableUseCase.ts (criar)
- server/domain/partners/usecases/computeListingSealUseCase.ts (criar)
- server/domain/partners/usecases/deleteListingPlanUseCase.ts (criar)
- server/domain/partners/usecases/deleteOwnerListingPlansUseCase.ts (criar)
- server/domain/partners/usecases/getListingPlanUntilUseCase.ts (criar)
- server/domain/partners/usecases/getListingPlanViewUseCase.ts (criar)
- server/domain/partners/usecases/listExpiredListingSealsUseCase.ts (criar)
- server/domain/partners/usecases/listExpiringListingSealsUseCase.ts (criar)
- server/domain/partners/usecases/listLinkedListingIdsUseCase.ts (criar)
- server/domain/partners/usecases/restorePartnerTrialStateUseCase.ts (apagar)
- server/domain/partners/usecases/setListingSealActiveUseCase.ts (criar)
- server/domain/partners/usecases/setListingSealByAdminUseCase.ts (criar)
- server/domain/partners/usecases/updatePartnerVerificationProfileUseCase.ts (apagar)
- server/domain/partners/utils/adminVerification.test.ts (apagar)
- server/domain/partners/utils/adminVerification.ts (apagar)
- server/domain/partners/utils/listingSeal.test.ts (criar)
- server/domain/partners/utils/listingSeal.ts (criar)
- server/infrastructure/securityAudit.test.ts (alterar)
- server/interfaces/http/listingPlans/listingPlanController.test.ts (criar)
- server/interfaces/http/listingPlans/listingPlanController.ts (criar)
- server/interfaces/http/listingPlans/listingPlanRoutes.ts (criar)
- server/interfaces/http/listingPlans/schemas/listingPlanSchemas.ts (criar)
- server/interfaces/http/listingVerifications/listingVerificationController.test.ts (alterar)
- server/interfaces/http/listingVerifications/listingVerificationController.ts (alterar)
- server/interfaces/http/partners/internalPartnersController.test.ts (alterar)
- server/interfaces/http/partners/internalPartnersController.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -24,6 +24,7 @@
 | ID | Resolução |
 |---|---|
 | B23 | Prompt 18.3.0b (D12, P0): a conta do parceiro deixou de ter documento — o cadastro envia só `termsAccepted`; `partners/{uid}.cpfCnpj`, `cpfCnpjClean` e a coleção `partnerDocumentKeys` saíram do código, das regras e dos testes (resolve também o débito do §7.7); o status `pending` da conta saiu (só `active` e `suspended`); CPF/CNPJ existe apenas, cifrado e com índice cego, na verificação de cada estabelecimento (18.3.0a); `PartnersModal` dividido (529 → 257 linhas), com as condições de cada etapa em `utils/signupStepGates.ts` |
+| B24 | Excluir a conta ou o estabelecimento não cancela a assinatura do plano no Stripe (`partnerSubscriptions` hoje; `planSubscriptions` no 18.3b) | §7.5 e §8 (cobrança sem serviço) | alto — o cartão continua sendo cobrado | Prompt 18.3b: cancelar a assinatura do estabelecimento ao excluir o item ou a conta |
 | Erro no modal de detalhe e métricas zeradas — Prompt 18.2.3 | decisão de 2026-10-19 (opção B): `/api/insights/track` aceita visitante sem login (o token só é anexado quando há usuário); cada item grava dois contadores por dia (`viewsSignedIn`, `viewsAnonymous`) em `interactionStats`, sem uid nem IP; repetição em 30 min não soma (guarda `interactionGuards` com chave HMAC de uid/IP e TTL em `expiresAt`); o relatório mostra o total e a divisão em percentual; `/api/insights/stats/:colecao/:id` exige login e checa o dono no backend (antes o cliente chamava sem token e recebia sempre zero); `ReportsView` dividido e traduzido (sai de B16); `trust proxy` com número de proxies de `TRUST_PROXY_HOPS` (§7.4); handler global de erros do `server.ts` deixou de devolver `err.message` (§7.10 A05); `src/shared/lib/insights.ts` (sem uso, `shared → domain`) removido |
 | B19 | Prompt 18.2.2 (decisão de 2026-10-19): o contato do evento fica só nos campos do topo (`phone`, `websiteLink`, `instagramLink`, `bookingLink`), como nos itens do guia; o objeto `contact` deixou de ser lido e gravado; `eventsService` dividido em `EventsService` (anúncios) e `EventOccurrencesService` (sessões), com as regras de acesso em `eventAccess.ts` |
 | Sessões do evento no editor — Prompt 18.2.1 | `EventSessionsField` e `saveEventSessionsUseCase` (events) usados pelo parceiro e pelo admin (decisão de 2026-10-19, opção A): o parceiro passa a editar datas, horários e capacidade; a data do evento é derivada das sessões; o editor do admin deixa de importar o gerenciador de ingressos de outro domínio (§5.2); `PartnerEventForm` dividido em seções (634 → 67 linhas) e modal em `PartnerEventEditor` (`PartnerPanel` abaixo de 400 linhas); o editor de evento não fecha ao clicar fora; botões do editor de evento com nome acessível |

=== docs/arquitetura/decisoes.md — diff ===
@@ -137,7 +137,11 @@ Detalha o item "Selo e plano por estabelecimento" da D9. Modelo de referência:
 * **Expiração:** job diário desliga o selo vencido em itens e eventos; os cards públicos também conferem `verifiedUntil`. A folga de 2 dias da renovação no cartão continua.
 * **Benefícios:** avaliações e respostas **sempre liberadas**, com ou sem plano. As métricas (insights) de um estabelecimento exigem o plano daquele estabelecimento, conferido no backend.
 * **Destaque nas listas (opção C):** **3 vagas** "Destaque" no topo de cada lista (valor de configuração), em rodízio diário entre os estabelecimentos com plano ativo; o resto da lista em ordem orgânica (nota, avaliações), com assinantes e não assinantes juntos. A vaga paga é sempre identificada como "Destaque" (CDC art. 36).
-* **Prompts:** 18.3 (backend) e 18.3.1 (frontend).
+* **Detalhes de implementação (2026-10-21, aprovados):**
+  * **Divisão:** 18.3a (plano por estabelecimento, selo, trial, selo do admin, job diário) → 18.3b (cobrança no Stripe por estabelecimento) → 18.3c (métricas exigindo o plano e destaque) → 18.3.1 (telas).
+  * **Lista do destaque = categoria** (hospedagens, restaurantes, passeios, atrações, translados, aluguéis e eventos), cada uma com 3 vagas.
+  * **Rodízio por job diário no backend:** sorteio com semente fixa do dia, gravado numa projeção pública (`featuredListings/{categoria}`) lida pelos cards; igual para todos os visitantes.
+* **Prompts:** 18.3a, 18.3b, 18.3c (backend) e 18.3.1 (frontend).
 
 ## D12 — Verificação e documento por estabelecimento (2026-10-19)

=== firebase-blueprint.json — diff ===
@@ -216,15 +216,26 @@
             }
           }
         },
-        "hasUsedTrial": { "type": "boolean" },
-        "isVerified": { "type": "boolean" },
-        "verifiedUntil": { "type": "string", "format": "date-time" },
-        "isVerificationSuspended": { "type": "boolean" },
-        "verificationType": { "type": "string", "enum": ["trial", "monthly", "semi-annual", "annual"] },
-        "status": { "type": "string", "enum": ["active", "pending", "rejected", "suspended"] },
+        "hasUsedTrial": { "type": "boolean", "description": "One trial per account (D11); plan and seal live in listingPlans." },
+        "status": { "type": "string", "enum": ["active", "suspended"] },
         "createdAt": { "type": "string", "format": "date-time" }
       },
-      "required": ["businesses", "hasUsedTrial", "isVerified", "status", "createdAt"]
+      "required": ["businesses", "hasUsedTrial", "status", "createdAt"]
+    },
+    "ListingPlan": {
+      "title": "ListingPlan",
+      "description": "Backend-only plan of one establishment or producer profile (D11). Items and events carry the public seal copy.",
+      "type": "object",
+      "properties": {
+        "itemId": { "type": "string" },
+        "ownerId": { "type": "string" },
+        "planType": { "type": ["string", "null"], "enum": ["trial", "monthly", "semi-annual", "annual", "admin", null] },
+        "planUntil": { "type": ["string", "null"], "format": "date-time" },
+        "sealSuspended": { "type": "boolean" },
+        "sealActive": { "type": "boolean" },
+        "updatedAt": { "type": "string", "format": "date-time" }
+      },
+      "required": ["itemId", "ownerId", "planType", "planUntil", "sealSuspended", "sealActive", "updatedAt"]
     },
     "Transaction": {
       "title": "Transaction",
@@ -604,6 +615,10 @@
       "schema": "Partner",
       "description": "Partner profiles linked to their business items."
     },
+    "/listingPlans/{itemId}": {
+      "schema": "ListingPlan",
+      "description": "Plan and seal of each establishment (backend only)."
+    },
     "/transactions/{transactionId}": {
       "schema": "Transaction",
       "description": "Completed or pending merchant transactions made on the platform."

=== firestore.indexes.json — diff ===
@@ -299,6 +299,20 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "listingPlans",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "sealActive",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "planUntil",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== firestore.rules — diff ===
@@ -156,6 +156,10 @@ service cloud.firestore {
     match /verificationOwners/{ownerId} {
       allow read, write: if false;
     }
+    // Plano de cada estabelecimento (D11): só backend; o cliente lê a cópia pública do selo no item.
+    match /listingPlans/{itemId} {
+      allow read, write: if false;
+    }
     // Métricas lidas só pela API (dono do item ou admin); as guardas de deduplicação nunca saem do backend.
     match /interactionStats/{statId} {
       allow read, write: if false;

=== firestore.rules.security.test.ts — diff ===
@@ -357,6 +357,15 @@ describe('Firestore Rules — Security Suite', () => {
       }
     });
 
+    it('plano (D11): listingPlans negado até para o dono e admin', async () => {
+      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
+      const ownerDb = testEnv.authenticatedContext('partner-1').firestore();
+      for (const db of [adminDb, ownerDb]) {
+        await assertFails(getDoc(doc(db, 'listingPlans/item-1')));
+        await assertFails(setDoc(doc(db, 'listingPlans/item-1'), { planType: 'annual' }));
+      }
+    });
+
     it('client → interactionStats e interactionGuards write negado', async () => {
       const db = testEnv.authenticatedContext('user-1').firestore();
       const statPath = 'interactionStats/items_item-1_2026-10-19';

=== server.ts — diff ===
@@ -21,6 +21,7 @@ import favoriteRouter from './server/domain/favorites/routes/favoriteRoutes';
 import mediaRouter from './server/domain/media/routes/mediaRoutes';
 import billingRouter from './server/interfaces/http/billing/billingRoutes';
 import listingVerificationRouter from './server/interfaces/http/listingVerifications/listingVerificationRoutes';
+import listingPlanRouter from './server/interfaces/http/listingPlans/listingPlanRoutes';
 import {
   bookingsRouter,
   partnerOffersRouter,
@@ -195,6 +196,7 @@ async function startServer() {
   app.use('/api/notifications', notificationRouter);
   app.use('/api/users', userRouter);
   app.use('/api/listing-verifications', listingVerificationRouter);
+  app.use('/api/listing-plans', listingPlanRouter);
   app.use('/api/partners/offers', partnerOffersRouter);
   app.use('/api/partners', partnerRouter);
   app.use('/api/items', itemRouter);

=== server/application/usecases/activatePaidPlanApplicationUseCase.test.ts — diff ===
@@ -1,43 +1,57 @@
 import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
 
-vi.mock('../../domain/partners', () => ({ getPartnerProfileUseCase: vi.fn() }));
-vi.mock('./verifyPartnerApplicationUseCase', () => ({ verifyPartnerApplicationUseCase: vi.fn() }));
+const mocks = vi.hoisted(() => ({
+  applyPaid: vi.fn(),
+  planUntil: vi.fn(),
+  load: vi.fn(),
+  sync: vi.fn(),
+}));
+
+vi.mock('../../domain/partners', () => ({
+  applyListingPaidPlanUseCase: mocks.applyPaid,
+  getListingPlanUntilUseCase: mocks.planUntil,
+  isPaidListingPlanType: (value: string) =>
+    value === 'monthly' || value === 'semi-annual' || value === 'annual',
+}));
+vi.mock('./listingPlans/loadPlanListing', () => ({ loadPlanListing: mocks.load }));
+vi.mock('./listingPlans/syncListingSealApplicationUseCase', () => ({
+  syncListingSealApplicationUseCase: mocks.sync,
+}));
 
-import { getPartnerProfileUseCase } from '../../domain/partners';
 import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';
-import { verifyPartnerApplicationUseCase } from './verifyPartnerApplicationUseCase';
 
 const NOW = new Date('2026-10-10T12:00:00.000Z');
+const listing = { id: 'item-1', ownerId: 'p1' };
 
-function profileWithVerifiedUntil(verifiedUntil: string | null) {
-  vi.mocked(getPartnerProfileUseCase).mockResolvedValueOnce({ verifiedUntil } as never);
-}
-
-describe('activatePaidPlanApplicationUseCase', () => {
+describe('activatePaidPlanApplicationUseCase (D11)', () => {
   beforeEach(() => {
     vi.clearAllMocks();
     vi.useFakeTimers();
     vi.setSystemTime(NOW);
+    mocks.load.mockResolvedValue(listing);
+    mocks.planUntil.mockResolvedValue(null);
   });
 
   afterEach(() => {
     vi.useRealTimers();
   });
 
-  it('monthly sem selo ativo concede 1 mês a partir de agora', async () => {
-    profileWithVerifiedUntil(null);
+  it('pagamento avulso sem plano concede o período a partir de agora e recalcula o selo', async () => {
     const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
+      itemId: 'item-1',
       partnerId: 'p1',
       planId: 'monthly',
       paymentReference: 'pi_1',
     });
     expect(verifiedUntil).toBe('2026-11-10T12:00:00.000Z');
-    expect(verifyPartnerApplicationUseCase).toHaveBeenCalledWith('p1', true, verifiedUntil, 'monthly');
+    expect(mocks.applyPaid).toHaveBeenCalledWith(listing, 'monthly', verifiedUntil);
+    expect(mocks.sync).toHaveBeenCalledWith('item-1');
   });
 
-  it('semi-annual com selo ativo soma 6 meses ao vencimento atual', async () => {
-    profileWithVerifiedUntil('2026-10-20T12:00:00.000Z');
+  it('renovação antecipada soma ao vencimento atual do estabelecimento', async () => {
+    mocks.planUntil.mockResolvedValue('2026-10-20T12:00:00.000Z');
     const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
+      itemId: 'item-1',
       partnerId: 'p1',
       planId: 'semi-annual',
       paymentReference: 'pi_2',
@@ -45,31 +59,35 @@ describe('activatePaidPlanApplicationUseCase', () => {
     expect(verifiedUntil).toBe('2027-04-20T12:00:00.000Z');
   });
 
-  it('annual concede 12 meses', async () => {
-    profileWithVerifiedUntil('2026-01-01T00:00:00.000Z');
+  it('assinatura usa o fim do período mais 2 dias de folga', async () => {
     const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
+      itemId: 'item-1',
       partnerId: 'p1',
       planId: 'annual',
-      paymentReference: 'pi_3',
-    });
-    expect(verifiedUntil).toBe('2027-10-10T12:00:00.000Z');
-  });
-
-  it('assinatura usa o fim do período + 2 dias de margem', async () => {
-    const { verifiedUntil } = await activatePaidPlanApplicationUseCase({
-      partnerId: 'p1',
-      planId: 'monthly',
       paymentReference: 'in_1',
-      subscriptionPeriodEnd: '2026-11-10T12:00:00.000Z',
+      subscriptionPeriodEnd: '2027-10-10T12:00:00.000Z',
     });
-    expect(verifiedUntil).toBe('2026-11-12T12:00:00.000Z');
-    expect(getPartnerProfileUseCase).not.toHaveBeenCalled();
+    expect(verifiedUntil).toBe('2027-10-12T12:00:00.000Z');
+    expect(mocks.planUntil).not.toHaveBeenCalled();
   });
 
-  it('recusa plano que não é pago', async () => {
+  it('recusa plano inválido e estabelecimento de outro dono', async () => {
+    await expect(
+      activatePaidPlanApplicationUseCase({
+        itemId: 'item-1',
+        partnerId: 'p1',
+        planId: 'trial',
+        paymentReference: 'x',
+      })
+    ).rejects.toThrow('Plano pago inválido');
     await expect(
-      activatePaidPlanApplicationUseCase({ partnerId: 'p1', planId: 'trial', paymentReference: 'x' })
-    ).rejects.toThrow(/Plano pago inválido/);
-    expect(verifyPartnerApplicationUseCase).not.toHaveBeenCalled();
+      activatePaidPlanApplicationUseCase({
+        itemId: 'item-1',
+        partnerId: 'p2',
+        planId: 'monthly',
+        paymentReference: 'x',
+      })
+    ).rejects.toThrow('não pertence');
+    expect(mocks.applyPaid).not.toHaveBeenCalled();
   });
 });

=== server/application/usecases/activatePaidPlanApplicationUseCase.ts — diff ===
@@ -1,8 +1,14 @@
 import { addDays, addMonths } from 'date-fns';
-import { getPartnerProfileUseCase } from '../../domain/partners';
-import { verifyPartnerApplicationUseCase } from './verifyPartnerApplicationUseCase';
+import {
+  applyListingPaidPlanUseCase,
+  getListingPlanUntilUseCase,
+  isPaidListingPlanType,
+  type PaidListingPlanType,
+} from '../../domain/partners';
+import { loadPlanListing } from './listingPlans/loadPlanListing';
+import { syncListingSealApplicationUseCase } from './listingPlans/syncListingSealApplicationUseCase';
 
-export type PaidPlanId = 'monthly' | 'semi-annual' | 'annual';
+export type PaidPlanId = PaidListingPlanType;
 
 const PLAN_DURATION_MONTHS: Record<PaidPlanId, number> = {
   monthly: 1,
@@ -13,15 +19,15 @@ const PLAN_DURATION_MONTHS: Record<PaidPlanId, number> = {
 // Margem para a renovação automática do Stripe confirmar sem o selo piscar.
 const SUBSCRIPTION_GRACE_DAYS = 2;
 
-export function isPaidPlanId(value: string): value is PaidPlanId {
-  return Object.hasOwn(PLAN_DURATION_MONTHS, value);
-}
+export const isPaidPlanId = isPaidListingPlanType;
 
 export function getPaidPlanDurationMonths(planId: PaidPlanId): number {
   return PLAN_DURATION_MONTHS[planId];
 }
 
+/** Plano pago confirmado pelo Stripe (assinatura ou pagamento avulso) no estabelecimento (D11). */
 export async function activatePaidPlanApplicationUseCase(params: {
+  itemId: string;
   partnerId: string;
   planId: string;
   paymentReference: string;
@@ -30,22 +36,28 @@ export async function activatePaidPlanApplicationUseCase(params: {
   if (!isPaidPlanId(params.planId)) {
     throw new Error(`Plano pago inválido: ${params.planId}`);
   }
+  const listing = await loadPlanListing(params.itemId);
+  // A metadata é gravada pelo backend; dono diferente indica item transferido ou excluído.
+  if (listing.ownerId !== params.partnerId) {
+    throw new Error('Plano pago de estabelecimento que não pertence ao parceiro.');
+  }
 
   let verifiedUntil: Date;
   if (params.subscriptionPeriodEnd) {
     verifiedUntil = addDays(new Date(params.subscriptionPeriodEnd), SUBSCRIPTION_GRACE_DAYS);
   } else {
-    const profile = await getPartnerProfileUseCase(params.partnerId);
     const now = new Date();
-    const currentUntil = profile?.verifiedUntil ? new Date(profile.verifiedUntil) : null;
+    const currentUntil = await getListingPlanUntilUseCase(params.itemId);
     // Renovação antecipada não pode apagar os dias que o parceiro já pagou.
-    const base = currentUntil && currentUntil > now ? currentUntil : now;
+    const base = currentUntil && new Date(currentUntil) > now ? new Date(currentUntil) : now;
     verifiedUntil = addMonths(base, PLAN_DURATION_MONTHS[params.planId]);
   }
 
   const verifiedUntilIso = verifiedUntil.toISOString();
-  await verifyPartnerApplicationUseCase(params.partnerId, true, verifiedUntilIso, params.planId);
+  await applyListingPaidPlanUseCase(listing, params.planId, verifiedUntilIso);
+  await syncListingSealApplicationUseCase(params.itemId);
   console.info('[activatePaidPlanApplicationUseCase]', {
+    itemId: params.itemId,
     partnerId: params.partnerId,
     planId: params.planId,
     paymentReference: params.paymentReference,

=== server/application/usecases/activatePartnerTrialApplicationUseCase.test.ts — APAGUE este arquivo ===

=== server/application/usecases/activatePartnerTrialApplicationUseCase.ts — APAGUE este arquivo ===

=== server/application/usecases/applyPartnerVerification.ts — APAGUE este arquivo ===

=== server/application/usecases/checkExpiringPartnerPlansApplicationUseCase.test.ts — APAGUE este arquivo ===

=== server/application/usecases/checkExpiringPartnerPlansApplicationUseCase.ts — APAGUE este arquivo ===

=== server/application/usecases/createPartnerEventApplicationUseCase.test.ts — diff ===
@@ -21,6 +21,10 @@ vi.mock('../../domain/guide', () => ({
   getItemByIdUseCase: mocks.getItemByIdUseCase,
 }));
 
+vi.mock('./listingPlans/syncListingSealApplicationUseCase', () => ({
+  syncListingSealApplicationUseCase: vi.fn(),
+}));
+
 vi.mock('../../domain/events', () => ({
   createEventListingUseCase: mocks.createEventListingUseCase,
   deleteOrArchiveEventListingUseCase: mocks.deleteOrArchiveEventListingUseCase,

=== server/application/usecases/createPartnerEventApplicationUseCase.ts — diff ===
@@ -10,6 +10,7 @@ import {
   getPartnerProfileUseCase,
   linkBusinessUseCase,
 } from '../../domain/partners';
+import { syncListingSealApplicationUseCase } from './listingPlans/syncListingSealApplicationUseCase';
 
 export type CreatePartnerEventInput = Omit<CreateEventListingInput, 'ownerId'> & {
   name: string;
@@ -29,10 +30,7 @@ export async function createPartnerEventApplicationUseCase(
 ): Promise<string> {
   const partnerProfile = await getPartnerProfileUseCase(user.uid);
   if (!partnerProfile) {
-    throw new PartnerDomainError(
-      'NOT_FOUND',
-      'Perfil de parceiro não encontrado.'
-    );
+    throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado.');
   }
   // Todo evento pertence a um estabelecimento ou ao perfil de produtor do parceiro (decisão D9).
   if (!data.establishmentId) {
@@ -77,5 +75,7 @@ export async function createPartnerEventApplicationUseCase(
     }
     throw error;
   }
+  // O evento herda o selo do estabelecimento ou do perfil de produtor (D11).
+  await syncListingSealApplicationUseCase(data.establishmentId);
   return eventId;
 }

=== server/application/usecases/deletePartnerItemApplicationUseCase.test.ts — diff ===
@@ -22,6 +22,7 @@ vi.mock('../../domain/partners', () => ({
   linkBusinessUseCase: vi.fn(),
   unlinkBusinessUseCase: vi.fn(),
   deleteListingVerificationUseCase: vi.fn().mockResolvedValue(['verification/partner-B/c.pdf']),
+  deleteListingPlanUseCase: vi.fn(),
 }));
 
 vi.mock('../../domain/media', () => ({

=== server/application/usecases/deletePartnerItemApplicationUseCase.ts — diff ===
@@ -1,6 +1,7 @@
 import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
 import { getItemByIdUseCase, deleteGuideItemUseCase } from '../../domain/guide';
 import {
+  deleteListingPlanUseCase,
   deleteListingVerificationUseCase,
   linkBusinessUseCase,
   unlinkBusinessUseCase,
@@ -64,4 +65,5 @@ export async function deletePartnerItemApplicationUseCase(
 
   // Documento e arquivos de verificação saem junto com o estabelecimento (LGPD, §7.5).
   await deleteVerificationFiles(await deleteListingVerificationUseCase(id));
+  await deleteListingPlanUseCase(id);
 }

=== server/application/usecases/deleteUserAccountApplicationUseCase.ts — diff ===
@@ -1,6 +1,7 @@
 import { deleteResourcesByOwnerUseCase } from '../../domain/guide';
 import { deleteEventsByOwnerUseCase } from '../../domain/events';
 import {
+  deleteOwnerListingPlansUseCase,
   deleteOwnerListingVerificationsUseCase,
   deletePartnerProfileUseCase,
 } from '../../domain/partners';
@@ -15,6 +16,8 @@ export interface UserDeletionCoordinatorDependencies {
   deleteEventsByOwner?: (uid: string) => Promise<void>;
   /** Verificações, documentos cifrados e arquivos enviados (D12). */
   deleteListingVerifications?: (uid: string) => Promise<void>;
+  /** Planos dos estabelecimentos (D11). */
+  deleteListingPlans?: (uid: string) => Promise<void>;
   deleteUserAccount: (uid: string) => Promise<void>;
 }
 
@@ -27,6 +30,7 @@ export async function deleteUserAccountApplicationUseCase(
     deleteEventsByOwner: (id) => deleteEventsByOwnerUseCase(id),
     deleteListingVerifications: async (id) =>
       deleteVerificationFiles(await deleteOwnerListingVerificationsUseCase(id)),
+    deleteListingPlans: (id) => deleteOwnerListingPlansUseCase(id),
     deleteUserAccount: (id) => deleteUserAccountUseCase(id),
   }
 ): Promise<void> {
@@ -42,6 +46,9 @@ export async function deleteUserAccountApplicationUseCase(
   if (deps.deleteListingVerifications) {
     await deps.deleteListingVerifications(uid);
   }
+  if (deps.deleteListingPlans) {
+    await deps.deleteListingPlans(uid);
+  }
   await deps.deletePartnerProfile(uid);
   await deps.deleteUserAccount(uid);
 }

=== server/application/usecases/getAdminPartnersUseCase.test.ts — diff ===
@@ -24,13 +24,11 @@ describe('getAdminPartnersUseCase (anti-N+1)', () => {
       {
         id: 'partner-1',
         status: 'active',
-        isVerified: true,
         businesses: [{ businessId: 'b-1', businessName: 'Pousada A', type: 'item' }],
       },
       {
         id: 'partner-2',
         status: 'suspended',
-        isVerified: false,
         businesses: [{ businessId: 'b-2', businessName: 'Restaurante B', type: 'item' }],
       },
     ]);
@@ -77,9 +75,6 @@ describe('getAdminPartnersUseCase (anti-N+1)', () => {
         id: 'partner-1',
         category: 'hotel',
         status: 'active',
-        isVerified: true,
-        verifiedUntil: null,
-        verificationType: null,
         hasUsedTrial: true,
         termsAccepted: true,
         businesses: [],
@@ -93,19 +88,7 @@ describe('getAdminPartnersUseCase (anti-N+1)', () => {
     expect(result[0]).not.toHaveProperty('hasUsedTrial');
     expect(result[0]).not.toHaveProperty('termsAccepted');
     expect(Object.keys(result[0] ?? {}).sort()).toEqual(
-      [
-        'businessName',
-        'email',
-        'firstName',
-        'id',
-        'isVerificationSuspended',
-        'isVerified',
-        'lastName',
-        'listingsCount',
-        'status',
-        'verificationType',
-        'verifiedUntil',
-      ].sort()
+      ['businessName', 'email', 'firstName', 'id', 'lastName', 'listingsCount', 'status'].sort()
     );
   });
 });

=== server/application/usecases/getAdminPartnersUseCase.ts — diff ===
@@ -11,10 +11,6 @@ export interface AdminPartnerSummaryDTO {
   /** Estabelecimentos e eventos vinculados ao parceiro (a categoria é de cada estabelecimento). */
   listingsCount: number;
   status: PartnerProfileDTO['status'];
-  isVerified: boolean;
-  verifiedUntil: string | null;
-  verificationType: PartnerProfileDTO['verificationType'];
-  isVerificationSuspended: boolean;
 }
 
 export async function getAdminPartnersUseCase(): Promise<AdminPartnerSummaryDTO[]> {
@@ -35,10 +31,6 @@ export async function getAdminPartnersUseCase(): Promise<AdminPartnerSummaryDTO[
       email: user?.email || '',
       listingsCount: partner.businesses?.length ?? 0,
       status: partner.status,
-      isVerified: partner.isVerified,
-      verifiedUntil: partner.verifiedUntil,
-      verificationType: partner.verificationType,
-      isVerificationSuspended: partner.isVerificationSuspended,
     };
   });
 }

=== server/application/usecases/listingPlans/activateListingTrialApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  activateListingTrialUseCase,
  getListingVerificationStatusUseCase,
  type ListingPlanView,
} from '../../../domain/partners';
import { getListingPlanApplicationUseCase } from './getListingPlanApplicationUseCase';
import { loadPlanListing } from './loadPlanListing';
import { syncListingSealApplicationUseCase } from './syncListingSealApplicationUseCase';

/** Trial de 7 dias no estabelecimento escolhido, uma vez por conta (D11). */
export async function activateListingTrialApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string
): Promise<ListingPlanView> {
  const listing = await loadPlanListing(itemId);
  const verification = await getListingVerificationStatusUseCase(itemId);
  await activateListingTrialUseCase(actor, listing, verification);
  await syncListingSealApplicationUseCase(itemId);
  return getListingPlanApplicationUseCase(actor, itemId);
}

=== server/application/usecases/listingPlans/getListingPlanApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  getListingPlanViewUseCase,
  getListingVerificationStatusUseCase,
  type ListingPlanView,
} from '../../../domain/partners';
import { loadPlanListing } from './loadPlanListing';

export async function getListingPlanApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string
): Promise<ListingPlanView> {
  const listing = await loadPlanListing(itemId);
  const verification = await getListingVerificationStatusUseCase(itemId);
  return getListingPlanViewUseCase(actor, listing, verification);
}

=== server/application/usecases/listingPlans/listingPlanApplicationUseCases.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  status: vi.fn(),
  compute: vi.fn(),
  setActive: vi.fn(),
  updateItem: vi.fn(),
  updateEvents: vi.fn(),
  review: vi.fn(),
  linked: vi.fn(),
  expired: vi.fn(),
  expiring: vi.fn(),
  getItem: vi.fn(),
  notify: vi.fn(),
  trial: vi.fn(),
  view: vi.fn(),
  loadVerificationListing: vi.fn(),
}));

vi.mock('../../../domain/partners', async () => {
  const { ListingPlanError } = await import('../../../domain/partners/errors/listingPlanError');
  return {
    ListingPlanError,
    getListingVerificationStatusUseCase: m.status,
    computeListingSealUseCase: m.compute,
    setListingSealActiveUseCase: m.setActive,
    reviewListingVerificationUseCase: m.review,
    listLinkedListingIdsUseCase: m.linked,
    listExpiredListingSealsUseCase: m.expired,
    listExpiringListingSealsUseCase: m.expiring,
    activateListingTrialUseCase: m.trial,
    getListingPlanViewUseCase: m.view,
  };
});
vi.mock('../../../domain/guide', () => ({
  updateItemVerificationUseCase: m.updateItem,
  getItemByIdUseCase: m.getItem,
}));
vi.mock('../../../domain/events', () => ({
  updateEstablishmentEventsVerificationUseCase: m.updateEvents,
}));
vi.mock('../../../domain/notifications', () => ({ createNotificationUseCase: m.notify }));
vi.mock('../listingVerification/loadVerificationListing', () => ({
  loadVerificationListing: m.loadVerificationListing,
}));

import { activateListingTrialApplicationUseCase } from './activateListingTrialApplicationUseCase';
import { reviewListingVerificationApplicationUseCase } from './reviewListingVerificationApplicationUseCase';
import { runListingPlanMaintenanceApplicationUseCase } from './runListingPlanMaintenanceApplicationUseCase';
import { syncListingSealApplicationUseCase } from './syncListingSealApplicationUseCase';

const SEAL = {
  isVerified: true,
  verifiedUntil: '2026-11-21T12:00:00.000Z',
  verificationType: 'monthly',
  isVerificationSuspended: false,
};
const admin = { uid: 'admin-1', admin: true };

describe('casos de uso do plano por estabelecimento (D11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.status.mockResolvedValue('approved');
    m.compute.mockResolvedValue(SEAL);
    m.linked.mockResolvedValue([]);
    m.loadVerificationListing.mockResolvedValue({
      id: 'item-1',
      ownerId: 'owner-1',
      category: 'hotel',
    });
  });

  it('sync grava o selo no item, nos eventos do estabelecimento e marca o plano', async () => {
    await syncListingSealApplicationUseCase('item-1');
    expect(m.compute).toHaveBeenCalledWith('item-1', 'approved');
    expect(m.updateItem).toHaveBeenCalledWith('item-1', SEAL);
    expect(m.updateEvents).toHaveBeenCalledWith('item-1', SEAL);
    expect(m.setActive).toHaveBeenCalledWith('item-1', true);
  });

  it('revisão recalcula o selo do estabelecimento e dos perfis de produtor ligados', async () => {
    m.review.mockResolvedValue({ itemId: 'item-1', status: 'approved' });
    m.linked.mockResolvedValue(['item-3']);
    await reviewListingVerificationApplicationUseCase(admin, 'item-1', 'approve', null);
    expect(m.updateItem.mock.calls.map((call) => call[0])).toEqual(['item-1', 'item-3']);
  });

  it('trial: ativa no estabelecimento, recalcula o selo e devolve o plano', async () => {
    m.view.mockResolvedValue({ itemId: 'item-1', planType: 'trial' });
    const view = await activateListingTrialApplicationUseCase({ uid: 'owner-1' }, 'item-1');
    expect(m.trial).toHaveBeenCalledWith(
      { uid: 'owner-1' },
      { id: 'item-1', ownerId: 'owner-1' },
      'approved'
    );
    expect(m.updateItem).toHaveBeenCalled();
    expect(view).toMatchObject({ planType: 'trial' });
  });

  it('estabelecimento inexistente: NOT_FOUND', async () => {
    m.loadVerificationListing.mockResolvedValue(null);
    await expect(
      activateListingTrialApplicationUseCase({ uid: 'owner-1' }, 'item-x')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('job diário desliga selos vencidos e avisa quem vence em breve', async () => {
    m.compute.mockResolvedValue({ ...SEAL, isVerified: false });
    m.expired.mockResolvedValue([{ itemId: 'item-1' }]);
    m.expiring.mockResolvedValue([
      {
        itemId: 'item-2',
        ownerId: 'owner-1',
        planUntil: '2026-10-23T12:00:00.000Z',
        sealSuspended: false,
      },
      { itemId: 'item-4', ownerId: 'owner-1', planUntil: '2026-10-23', sealSuspended: true },
    ]);
    m.getItem.mockResolvedValue({ name: 'Pousada Sol' });
    m.notify.mockResolvedValue(true);

    const result = await runListingPlanMaintenanceApplicationUseCase(
      new Date('2026-10-21T12:00:00Z')
    );

    expect(m.setActive).toHaveBeenCalledWith('item-1', false);
    expect(m.notify).toHaveBeenCalledTimes(1);
    expect(m.notify.mock.calls[0]?.[0]).toMatchObject({
      id: 'plan_expiring_item-2_2d_2026-10-23',
      recipientPartnerId: 'owner-1',
    });
    expect(result).toEqual({ expired: 1, notified: 1 });
  });
});

=== server/application/usecases/listingPlans/loadPlanListing.ts — ARQUIVO NOVO, conteúdo completo ===
import { ListingPlanError, type PlanListing } from '../../../domain/partners';
import { loadVerificationListing } from '../listingVerification/loadVerificationListing';

export async function loadPlanListing(itemId: string): Promise<PlanListing> {
  const listing = await loadVerificationListing(itemId);
  if (!listing) throw new ListingPlanError('NOT_FOUND', 'Estabelecimento não encontrado.');
  return { id: listing.id, ownerId: listing.ownerId };
}

=== server/application/usecases/listingPlans/reviewListingVerificationApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type ListingVerificationView,
  listLinkedListingIdsUseCase,
  reviewListingVerificationUseCase,
  type VerificationDecision,
} from '../../../domain/partners';
import { syncListingSealApplicationUseCase } from './syncListingSealApplicationUseCase';

/**
 * Revisão do admin (D12) e recálculo do selo: o do estabelecimento e o dos perfis de produtor que
 * usam o documento dele, porque o selo só aparece com verificação aprovada (D11).
 */
export async function reviewListingVerificationApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  decision: VerificationDecision,
  reason: string | null
): Promise<ListingVerificationView> {
  const view = await reviewListingVerificationUseCase(actor, itemId, decision, reason);
  const linked = await listLinkedListingIdsUseCase(itemId);
  for (const id of [itemId, ...linked]) {
    await syncListingSealApplicationUseCase(id);
  }
  return view;
}

=== server/application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getItemByIdUseCase } from '../../../domain/guide';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  listExpiredListingSealsUseCase,
  listExpiringListingSealsUseCase,
} from '../../../domain/partners';
import { syncListingSealApplicationUseCase } from './syncListingSealApplicationUseCase';

const ALERT_DAYS_BEFORE = 3;
const BATCH_LIMIT = 200;
const MS_PER_DAY = 86_400_000;

/**
 * Job diário (D11): desliga o selo vencido nos itens e eventos e avisa o dono dos planos que
 * vencem nos próximos 3 dias. O aviso tem ID determinístico por dia restante (idempotente).
 */
export async function runListingPlanMaintenanceApplicationUseCase(
  now: Date = new Date()
): Promise<{ expired: number; notified: number }> {
  const expired = await listExpiredListingSealsUseCase(BATCH_LIMIT);
  for (const plan of expired) {
    await syncListingSealApplicationUseCase(plan.itemId);
  }

  let notified = 0;
  for (const plan of await listExpiringListingSealsUseCase(ALERT_DAYS_BEFORE, BATCH_LIMIT)) {
    if (!plan.planUntil || plan.sealSuspended) continue;
    const until = new Date(plan.planUntil);
    const daysRemaining = Math.max(1, Math.ceil((until.getTime() - now.getTime()) / MS_PER_DAY));
    const item = await getItemByIdUseCase(plan.itemId);
    const listingName = typeof item?.name === 'string' ? item.name : '';
    // TODO: notifications ainda não aceita chave i18n (AGENTS.md §12.5); texto em pt-BR por enquanto.
    const created = await createNotificationUseCase({
      id: `plan_expiring_${plan.itemId}_${daysRemaining}d_${plan.planUntil.slice(0, 10)}`,
      recipientPartnerId: plan.ownerId,
      type: 'plan_expiring',
      title: 'Seu plano está expirando',
      message: `O plano de ${listingName || 'um estabelecimento'} vence em ${daysRemaining} dia(s). Renove para manter o selo.`,
    });
    if (created) notified++;
  }

  return { expired: expired.length, notified };
}

=== server/application/usecases/listingPlans/setListingSealByAdminApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { type ListingPlanView, setListingSealByAdminUseCase } from '../../../domain/partners';
import { getListingPlanApplicationUseCase } from './getListingPlanApplicationUseCase';
import { loadPlanListing } from './loadPlanListing';
import { syncListingSealApplicationUseCase } from './syncListingSealApplicationUseCase';

/** Admin concede ou retira o selo de um estabelecimento sem mexer no plano pago (D8, D11). */
export async function setListingSealByAdminApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  grant: boolean
): Promise<ListingPlanView> {
  const listing = await loadPlanListing(itemId);
  await setListingSealByAdminUseCase(actor, listing, grant);
  await syncListingSealApplicationUseCase(itemId);
  console.info('[audit] listing_seal_admin', { adminUid: actor.uid, itemId, grant });
  return getListingPlanApplicationUseCase(actor, itemId);
}

=== server/application/usecases/listingPlans/syncListingSealApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { updateEstablishmentEventsVerificationUseCase } from '../../../domain/events';
import { updateItemVerificationUseCase } from '../../../domain/guide';
import {
  computeListingSealUseCase,
  getListingVerificationStatusUseCase,
  type ListingSeal,
  setListingSealActiveUseCase,
} from '../../../domain/partners';

/**
 * Recalcula o selo público do estabelecimento (plano + verificação, D11) e grava a cópia no item e
 * nos eventos dele. Chamado depois de toda mudança de plano, de selo do admin ou de verificação.
 */
export async function syncListingSealApplicationUseCase(itemId: string): Promise<ListingSeal> {
  const verification = await getListingVerificationStatusUseCase(itemId);
  const seal = await computeListingSealUseCase(itemId, verification);
  await updateItemVerificationUseCase(itemId, seal);
  await updateEstablishmentEventsVerificationUseCase(itemId, seal);
  await setListingSealActiveUseCase(itemId, seal.isVerified);
  return seal;
}

=== server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.test.ts — diff ===
@@ -22,7 +22,12 @@ const PLAN_SNAPSHOT = {
   status: 'active' as const,
   currentPeriodEnd: '2026-11-10T12:00:00.000Z',
   cancelAtPeriodEnd: false,
-  metadata: { referenceType: 'plan_subscription', partnerId: 'p1', planId: 'monthly' },
+  metadata: {
+    referenceType: 'plan_subscription',
+    partnerId: 'p1',
+    planId: 'monthly',
+    itemId: 'item-1',
+  },
 };
 
 function invoiceEvent(type: string) {
@@ -61,6 +66,7 @@ describe('reconcilePlanSubscriptionWebhookApplicationUseCase', () => {
     await reconcilePlanSubscriptionWebhookApplicationUseCase(invoiceEvent('invoice.paid'));
     expect(syncPlanSubscriptionUseCase).toHaveBeenCalledWith('sub_1');
     expect(activatePaidPlanApplicationUseCase).toHaveBeenCalledWith({
+      itemId: 'item-1',
       partnerId: 'p1',
       planId: 'monthly',
       paymentReference: 'in_1',

=== server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts — diff ===
@@ -41,11 +41,12 @@ export async function reconcilePlanSubscriptionWebhookApplicationUseCase(
 
   // Os eventos podem chegar fora de ordem: relemos a assinatura em vez de confiar no payload.
   const snapshot = await syncPlanSubscriptionUseCase(subscriptionId);
-  const { referenceType, partnerId, planId } = snapshot.metadata;
-  if (referenceType !== 'plan_subscription' || !partnerId || !planId) return;
+  const { referenceType, partnerId, planId, itemId } = snapshot.metadata;
+  if (referenceType !== 'plan_subscription' || !partnerId || !planId || !itemId) return;
 
   if (event.type === 'invoice.paid') {
     await activatePaidPlanApplicationUseCase({
+      itemId,
       partnerId,
       planId,
       paymentReference: String(obj.id || ''),

=== server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts — diff ===
@@ -59,8 +59,14 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
           message: `Pedido #${confirmed.order.id.slice(0, 8)} confirmado via Stripe (${confirmed.tickets.length} ingresso(s)).`,
         }).catch(() => undefined);
       }
-    } else if (metadata.referenceType === 'plan_payment' && metadata.partnerId && metadata.planId) {
+    } else if (
+      metadata.referenceType === 'plan_payment' &&
+      metadata.partnerId &&
+      metadata.planId &&
+      metadata.itemId
+    ) {
       await activatePaidPlanApplicationUseCase({
+        itemId: metadata.itemId,
         partnerId: metadata.partnerId,
         planId: metadata.planId,
         paymentReference: paymentIntentId,

=== server/application/usecases/setPartnerVerificationByAdminApplicationUseCase.test.ts — APAGUE este arquivo ===

=== server/application/usecases/setPartnerVerificationByAdminApplicationUseCase.ts — APAGUE este arquivo ===

=== server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.test.ts — diff ===
@@ -1,7 +1,11 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 
 vi.mock('../../domain/admin', () => ({ getSubscriptionPlanByIdUseCase: vi.fn() }));
-vi.mock('../../domain/partners', () => ({ getPartnerProfileUseCase: vi.fn() }));
+vi.mock('../../domain/partners', () => ({
+  getPartnerProfileUseCase: vi.fn(),
+  isPaidListingPlanType: (value: string) =>
+    value === 'monthly' || value === 'semi-annual' || value === 'annual',
+}));
 vi.mock('../../domain/payment', async () => {
   const { PaymentDomainError } = await import('../../domain/payment/services/stripePaymentService');
   return { PaymentDomainError, startPlanSubscriptionUseCase: vi.fn().mockResolvedValue({}) };
@@ -79,7 +83,7 @@ describe('startPartnerPlanSubscriptionApplicationUseCase', () => {
       amountMinor: 24990,
       interval: 'month',
       intervalCount: 6,
-      currentVerifiedUntil: '2026-12-01T00:00:00.000Z',
+      currentVerifiedUntil: null,
       idempotencyKey: 'key-12345',
     });
   });

=== server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.ts — diff ===
@@ -40,7 +40,7 @@ export async function startPartnerPlanSubscriptionApplicationUseCase(
     planName: plan.name,
     amountMinor: plan.priceMinor,
     ...BILLING_INTERVAL[input.planId],
-    currentVerifiedUntil: profile.verifiedUntil ?? null,
+    currentVerifiedUntil: null,
     idempotencyKey: input.idempotencyKey,
   });
 }

=== server/application/usecases/verifyPartnerApplicationUseCase.test.ts — APAGUE este arquivo ===

=== server/application/usecases/verifyPartnerApplicationUseCase.ts — APAGUE este arquivo ===

=== server/domain/events/adapters/firestoreEventAdapter.ts — diff ===
@@ -29,14 +29,20 @@ export class FirestoreEventAdapter implements EventsPort {
     if (!snap.exists) {
       return null;
     }
-    return EventListingPersistenceMapper.toDomain(snap.id, (snap.data() || {}) as Record<string, unknown>);
+    return EventListingPersistenceMapper.toDomain(
+      snap.id,
+      (snap.data() || {}) as Record<string, unknown>
+    );
   }
 
   async listPublicListings(): Promise<EventListing[]> {
     const snap = await adminDb.collection('events').get();
     return snap.docs
       .map((doc) =>
-        EventListingPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
+        EventListingPersistenceMapper.toDomain(
+          doc.id,
+          (doc.data() || {}) as Record<string, unknown>
+        )
       )
       .filter((item) => item.status === 'published' && item.visibility === 'public');
   }
@@ -80,8 +86,8 @@ export class FirestoreEventAdapter implements EventsPort {
     });
   }
 
-  async updateVerificationByOwner(
-    ownerId: string,
+  async updateVerificationByEstablishment(
+    establishmentId: string,
     verification: {
       isVerified: boolean;
       verifiedUntil: string | null;
@@ -89,7 +95,10 @@ export class FirestoreEventAdapter implements EventsPort {
       isVerificationSuspended: boolean;
     }
   ): Promise<void> {
-    const eventsSnapshot = await adminDb.collection('events').where('ownerId', '==', ownerId).get();
+    const eventsSnapshot = await adminDb
+      .collection('events')
+      .where('establishmentId', '==', establishmentId)
+      .get();
     if (eventsSnapshot.empty) {
       return;
     }

=== server/domain/events/index.ts — diff ===
@@ -21,7 +21,7 @@ export { updateEventListingPricingSummaryUseCase } from './usecases/updateEventL
 export { updateEventListingUseCase } from './usecases/updateEventListingUseCase';
 export { updateEventOccurrenceUseCase } from './usecases/updateEventOccurrenceUseCase';
 export { updateEventRatingSummaryUseCase } from './usecases/updateEventRatingSummaryUseCase';
-export { updateEventsOwnerVerificationUseCase } from './usecases/updateEventsOwnerVerificationUseCase';
+export { updateEstablishmentEventsVerificationUseCase } from './usecases/updateEstablishmentEventsVerificationUseCase';
 
 export {
   EventDomainError,

=== server/domain/events/ports/eventsPort.ts — diff ===
@@ -17,8 +17,9 @@ export interface EventsPort {
   updateListing(id: string, input: UpdateEventListingInput): Promise<EventListing>;
   deleteListing(id: string): Promise<void>;
   updateRatingSummary(id: string, summary: EventRatingSummary): Promise<void>;
-  updateVerificationByOwner(
-    ownerId: string,
+  /** Eventos herdam o selo do estabelecimento ou perfil de produtor ao qual pertencem (D11). */
+  updateVerificationByEstablishment(
+    establishmentId: string,
     verification: {
       isVerified: boolean;
       verifiedUntil: string | null;

=== server/domain/events/services/eventsService.test.ts — diff ===
@@ -13,7 +13,7 @@ function createMockPort(): EventsPort {
     updateListing: vi.fn(),
     deleteListing: vi.fn(),
     updateRatingSummary: vi.fn(),
-    updateVerificationByOwner: vi.fn(),
+    updateVerificationByEstablishment: vi.fn(),
     deleteListingsByOwner: vi.fn(),
     createOccurrence: vi.fn(),
     getOccurrenceById: vi.fn(),

=== server/domain/events/services/eventsService.ts — diff ===
@@ -236,8 +236,8 @@ export class EventsService {
     await this.eventsPort.updateRatingSummary(eventListingId, summary);
   }
 
-  async updateOwnerVerification(
-    ownerId: string,
+  async updateEstablishmentVerification(
+    establishmentId: string,
     verification: {
       isVerified: boolean;
       verifiedUntil: string | null;
@@ -245,10 +245,10 @@ export class EventsService {
       isVerificationSuspended: boolean;
     }
   ): Promise<void> {
-    if (!ownerId?.trim()) {
-      throw new EventDomainError('INVALID_ARGUMENT', 'ID do proprietário inválido');
+    if (!establishmentId?.trim()) {
+      throw new EventDomainError('INVALID_ARGUMENT', 'ID do estabelecimento inválido');
     }
-    await this.eventsPort.updateVerificationByOwner(ownerId, verification);
+    await this.eventsPort.updateVerificationByEstablishment(establishmentId, verification);
   }
 
   async deleteListingsByOwner(ownerId: string): Promise<void> {

=== server/domain/events/usecases/updateEstablishmentEventsVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';

export async function updateEstablishmentEventsVerificationUseCase(
  establishmentId: string,
  verification: {
    isVerified: boolean;
    verifiedUntil: string | null;
    verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
    isVerificationSuspended: boolean;
  }
): Promise<void> {
  return eventsService.updateEstablishmentVerification(establishmentId, verification);
}

=== server/domain/events/usecases/updateEventsOwnerVerificationUseCase.ts — APAGUE este arquivo ===

=== server/domain/guide/adapters/firestoreGuideAdapter.ts — diff ===
@@ -1,11 +1,7 @@
 import { FieldValue } from 'firebase-admin/firestore';
 import { adminDb } from '../../../infrastructure/firebase/adminClient';
 import { GuidePort, GuideVerificationUpdate } from '../ports/guidePort';
-import {
-  GuideCreateItemInput,
-  GuideItemRecord,
-  GuideUpdateItemInput,
-} from '../types/guideTypes';
+import { GuideCreateItemInput, GuideItemRecord, GuideUpdateItemInput } from '../types/guideTypes';
 
 export class FirestoreGuideAdapter implements GuidePort {
   async createItem(
@@ -57,19 +53,13 @@ export class FirestoreGuideAdapter implements GuidePort {
     await adminDb.collection('items').doc(id).delete();
   }
 
-  async updateVerificationByOwner(
-    ownerId: string,
+  async updateItemVerification(
+    itemId: string,
     verification: GuideVerificationUpdate
   ): Promise<void> {
-    const itemsSnapshot = await adminDb.collection('items').where('ownerId', '==', ownerId).get();
-    if (itemsSnapshot.empty) {
-      return;
-    }
-    const batch = adminDb.batch();
-    itemsSnapshot.forEach((document) => {
-      batch.update(document.ref, verification);
-    });
-    await batch.commit();
+    const ref = adminDb.collection('items').doc(itemId);
+    const snapshot = await ref.get();
+    if (snapshot.exists) await ref.update({ ...verification });
   }
 
   async updateReviewAggregate(

=== server/domain/guide/index.ts — diff ===
@@ -21,5 +21,5 @@ export { getPublicGuideItemUseCase } from './usecases/getPublicGuideItemUseCase'
 export { getResourceOwnerIdUseCase } from './usecases/getResourceOwnerIdUseCase';
 export { listPublicGuideItemsUseCase } from './usecases/listPublicGuideItemsUseCase';
 export { updateGuideItemUseCase } from './usecases/updateGuideItemUseCase';
-export { updateOwnerVerificationUseCase } from './usecases/updateOwnerVerificationUseCase';
+export { updateItemVerificationUseCase } from './usecases/updateItemVerificationUseCase';
 export { updateReviewAggregateUseCase } from './usecases/updateReviewAggregateUseCase';

=== server/domain/guide/ports/guidePort.ts — diff ===
@@ -22,7 +22,8 @@ export interface GuidePort {
   getItemById(id: string): Promise<GuideItemRecord | null>;
   updateItem(id: string, data: GuideUpdateItemInput): Promise<void>;
   deleteItem(id: string): Promise<void>;
-  updateVerificationByOwner(ownerId: string, verification: GuideVerificationUpdate): Promise<void>;
+  /** Cópia pública do selo do estabelecimento (D11); o plano fica em `listingPlans`. */
+  updateItemVerification(itemId: string, verification: GuideVerificationUpdate): Promise<void>;
   updateReviewAggregate(
     resourceType: 'items',
     resourceId: string,

=== server/domain/guide/services/guideService.test.ts — diff ===
@@ -10,7 +10,7 @@ function createGuidePortMock(): GuidePort {
     updateItem: vi.fn(),
     deleteItem: vi.fn(),
     getItemById: vi.fn(),
-    updateVerificationByOwner: vi.fn(),
+    updateItemVerification: vi.fn(),
     updateReviewAggregate: vi.fn(),
     deleteResourcesByOwner: vi.fn(),
     getAllItems: vi.fn(),
@@ -246,15 +246,15 @@ describe('GuideService', () => {
     });
   });
 
-  describe('updateOwnerVerification', () => {
+  describe('updateItemVerification', () => {
     it('delegates verification update to the Guide port', async () => {
-      await service.updateOwnerVerification('partner-1', {
+      await service.updateItemVerification('item-1', {
         isVerified: true,
         verifiedUntil: '2026-12-31T23:59:59.000Z',
         verificationType: 'annual',
         isVerificationSuspended: false,
       });
-      expect(port.updateVerificationByOwner).toHaveBeenCalledWith('partner-1', {
+      expect(port.updateItemVerification).toHaveBeenCalledWith('item-1', {
         isVerified: true,
         verifiedUntil: '2026-12-31T23:59:59.000Z',
         verificationType: 'annual',
@@ -262,9 +262,9 @@ describe('GuideService', () => {
       });
     });
 
-    it('rejeita ownerId vazio', async () => {
+    it('rejeita itemId vazio', async () => {
       await expect(
-        service.updateOwnerVerification('   ', {
+        service.updateItemVerification('   ', {
           isVerified: true,
           verifiedUntil: null,
           verificationType: null,
@@ -273,7 +273,7 @@ describe('GuideService', () => {
       ).rejects.toMatchObject({
         code: 'INVALID_ID',
       });
-      expect(port.updateVerificationByOwner).not.toHaveBeenCalled();
+      expect(port.updateItemVerification).not.toHaveBeenCalled();
     });
   });
 });

=== server/domain/guide/services/guideService.ts — diff ===
@@ -1,16 +1,9 @@
 import { GuideDomainError } from '../errors/guideDomainError';
 import { GuidePort, GuideVerificationUpdate } from '../ports/guidePort';
 import { AuthenticatedUserContext } from '../../../application/security/authenticatedUserContext';
-import {
-  GuideCreateItemInput,
-  GuideUpdateItemInput,
-} from '../types/guideTypes';
+import { GuideCreateItemInput, GuideUpdateItemInput } from '../types/guideTypes';
 
-const ADMIN_CREATABLE_ITEM_CATEGORIES = [
-  'sight',
-  'tour',
-  'tips',
-] as const;
+const ADMIN_CREATABLE_ITEM_CATEGORIES = ['sight', 'tour', 'tips'] as const;
 
 const PARTNER_CREATABLE_ITEM_CATEGORIES = [
   'sight',
@@ -49,11 +42,7 @@ function ensureCreateItemCategory(
     return;
   }
   if (user.role === 'partner') {
-    if (
-      !PARTNER_CREATABLE_ITEM_CATEGORIES.includes(
-        category as never
-      )
-    ) {
+    if (!PARTNER_CREATABLE_ITEM_CATEGORIES.includes(category as never)) {
       throw new GuideDomainError(
         'FORBIDDEN',
         'Parceiros não podem criar esta categoria de conteúdo'
@@ -61,10 +50,7 @@ function ensureCreateItemCategory(
     }
     return;
   }
-  throw new GuideDomainError(
-    'FORBIDDEN',
-    'Usuário sem permissão para criar conteúdo'
-  );
+  throw new GuideDomainError('FORBIDDEN', 'Usuário sem permissão para criar conteúdo');
 }
 
 function ensureValidId(id: string): void {
@@ -124,14 +110,14 @@ export class GuideService {
     await this.guidePort.deleteItem(id);
   }
 
-  async updateOwnerVerification(
-    ownerId: string,
+  async updateItemVerification(
+    itemId: string,
     verification: GuideVerificationUpdate
   ): Promise<void> {
-    if (!ownerId.trim()) {
-      throw new GuideDomainError('INVALID_ID', 'ID do proprietário é obrigatório');
+    if (!itemId.trim()) {
+      throw new GuideDomainError('INVALID_ID', 'ID do item é obrigatório');
     }
-    await this.guidePort.updateVerificationByOwner(ownerId, verification);
+    await this.guidePort.updateItemVerification(itemId, verification);
   }
 
   async updateReviewAggregate(

=== server/domain/guide/usecases/updateItemVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { guideService } from '../factory';
import type { GuideVerificationUpdate } from '../ports/guidePort';

export async function updateItemVerificationUseCase(
  itemId: string,
  verification: GuideVerificationUpdate
): Promise<void> {
  await guideService.updateItemVerification(itemId, verification);
}

=== server/domain/guide/usecases/updateOwnerVerificationUseCase.ts — APAGUE este arquivo ===

=== server/domain/partners/adapters/firestoreListingPlanAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { ListingPlanError } from '../errors/listingPlanError';
import type { ListingPlanRepositoryPort } from '../ports/listingPlanRepositoryPort';
import type { ListingPlanRecord } from '../types/listingPlan';

const PLANS = 'listingPlans';
const PARTNERS = 'partners';

/** `listingPlans` é só de backend (`allow read, write: if false`); o cliente lê a cópia pública no item. */
export class FirestoreListingPlanAdapter implements ListingPlanRepositoryPort {
  async get(itemId: string): Promise<ListingPlanRecord | null> {
    const snapshot = await adminDb.collection(PLANS).doc(itemId).get();
    return snapshot.exists ? (snapshot.data() as ListingPlanRecord) : null;
  }

  async save(record: ListingPlanRecord): Promise<void> {
    await adminDb.collection(PLANS).doc(record.itemId).set(record);
  }

  async activateTrial(record: ListingPlanRecord): Promise<void> {
    const partnerRef = adminDb.collection(PARTNERS).doc(record.ownerId);
    await adminDb.runTransaction(async (transaction) => {
      const partner = await transaction.get(partnerRef);
      // Rechecado na transação: dois pedidos simultâneos não podem usar o trial duas vezes.
      if (partner.get('hasUsedTrial') === true) {
        throw new ListingPlanError('TRIAL_ALREADY_USED', 'O período de testes já foi usado.');
      }
      transaction.set(
        partnerRef,
        { hasUsedTrial: true, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
      transaction.set(adminDb.collection(PLANS).doc(record.itemId), record);
    });
  }

  async hasUsedTrial(ownerId: string): Promise<boolean> {
    const snapshot = await adminDb.collection(PARTNERS).doc(ownerId).get();
    return snapshot.get('hasUsedTrial') === true;
  }

  async isOwnerSuspended(ownerId: string): Promise<boolean> {
    const snapshot = await adminDb.collection(PARTNERS).doc(ownerId).get();
    return snapshot.get('status') === 'suspended';
  }

  async setSealActive(itemId: string, sealActive: boolean): Promise<void> {
    const ref = adminDb.collection(PLANS).doc(itemId);
    const snapshot = await ref.get();
    if (snapshot.exists) await ref.update({ sealActive });
  }

  async listExpiredWithSeal(nowIso: string, limit: number): Promise<ListingPlanRecord[]> {
    const snapshot = await adminDb
      .collection(PLANS)
      .where('sealActive', '==', true)
      .where('planUntil', '<=', nowIso)
      .orderBy('planUntil', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as ListingPlanRecord);
  }

  async listExpiringWithSeal(
    fromIso: string,
    toIso: string,
    limit: number
  ): Promise<ListingPlanRecord[]> {
    const snapshot = await adminDb
      .collection(PLANS)
      .where('sealActive', '==', true)
      .where('planUntil', '>', fromIso)
      .where('planUntil', '<=', toIso)
      .orderBy('planUntil', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as ListingPlanRecord);
  }

  async delete(itemId: string): Promise<void> {
    await adminDb.collection(PLANS).doc(itemId).delete();
  }

  async deleteByOwner(ownerId: string): Promise<void> {
    const snapshot = await adminDb.collection(PLANS).where('ownerId', '==', ownerId).get();
    const batch = adminDb.batch();
    for (const doc of snapshot.docs) batch.delete(doc.ref);
    await batch.commit();
  }
}

=== server/domain/partners/adapters/firestoreListingVerificationAdapter.ts — diff ===
@@ -119,6 +119,14 @@ export class FirestoreListingVerificationAdapter implements ListingVerificationR
     };
   }
 
+  async listLinkedItemIds(sourceItemId: string): Promise<string[]> {
+    const snapshot = await adminDb
+      .collection(VERIFICATIONS)
+      .where('sourceItemId', '==', sourceItemId)
+      .get();
+    return snapshot.docs.map((doc) => doc.id);
+  }
+
   async getSalesDocumentIndex(ownerId: string): Promise<string | null> {
     const snapshot = await adminDb.collection(OWNERS).doc(ownerId).get();
     const value = snapshot.get('salesDocumentIndex');

=== server/domain/partners/adapters/firestorePartnerAdapter.test.ts — diff ===
@@ -274,10 +274,7 @@ describe('FirestorePartnerAdapter', () => {
       expect(result.created).toBe(true);
       const partner = store.get(getDocKey('partners', uid))?.data;
       expect(partner).toMatchObject({
-        isVerified: false,
-        verifiedUntil: null,
-        verificationType: null,
-        isVerificationSuspended: false,
+        hasUsedTrial: false,
         status: 'active',
         termsAccepted: true,
         businesses: [],
@@ -287,7 +284,6 @@ describe('FirestorePartnerAdapter', () => {
       expect([...store.keys()].some((key) => key.startsWith('partnerDocumentKeys/'))).toBe(false);
       expect(store.get(getDocKey('publicPartners', uid))?.data).toMatchObject({
         id: uid,
-        isVerified: false,
         status: 'active',
         businesses: [],
       });
@@ -417,30 +413,14 @@ describe('FirestorePartnerAdapter', () => {
     });
   });
 
-  describe('verification', () => {
-    it('persiste e projeta isVerificationSuspended', async () => {
-      const uid = 'partner-verification';
-
-      await adapter.registerPartner(uid, {
-        termsAccepted: true,
-      });
-
-      await adapter.updatePartnerVerificationProfile(uid, {
-        isVerified: true,
-        verifiedUntil: '2027-01-01T00:00:00.000Z',
-        verificationType: 'annual',
-        isVerificationSuspended: true,
-      });
-
-      expect(store.get(getDocKey('partners', uid))?.data).toMatchObject({
-        isVerified: true,
-        isVerificationSuspended: true,
-      });
-
-      expect(store.get(getDocKey('publicPartners', uid))?.data).toMatchObject({
-        isVerified: true,
-        isVerificationSuspended: true,
-      });
+  describe('plano e selo (D11)', () => {
+    it('a conta não guarda plano nem selo: só a marca do trial', async () => {
+      const uid = 'partner-sem-selo';
+      await adapter.registerPartner(uid, { termsAccepted: true });
+      const partner = store.get(getDocKey('partners', uid))?.data;
+      expect(partner).toMatchObject({ hasUsedTrial: false });
+      expect(partner).not.toHaveProperty('isVerified');
+      expect(store.get(getDocKey('publicPartners', uid))?.data).not.toHaveProperty('isVerified');
     });
   });
 });

=== server/domain/partners/adapters/firestorePartnerAdapter.ts — diff ===
@@ -11,8 +11,6 @@ import type {
   PartnerProfileDocument,
   PartnerRegistrationData,
   PartnerStatus,
-  PartnerTrialState,
-  PartnerVerificationData,
   RegisterPartnerResult,
 } from '../types/partnerTypes';
 
@@ -108,10 +106,6 @@ export class FirestorePartnerAdapter implements PartnerPort {
       const nextData = {
         businesses: [],
         hasUsedTrial: false,
-        isVerified: false,
-        verificationType: null,
-        verifiedUntil: null,
-        isVerificationSuspended: false,
         status: 'active',
         termsAccepted: data.termsAccepted,
       };
@@ -182,93 +176,4 @@ export class FirestorePartnerAdapter implements PartnerPort {
       );
     });
   }
-
-  async updatePartnerVerificationProfile(
-    partnerId: string,
-    verification: PartnerVerificationData
-  ): Promise<void> {
-    await this.mutatePartnerAtomically(partnerId, () => ({
-      ...verification,
-    }));
-  }
-
-  async activateTrialAtomically(partnerId: string, verifiedUntil: string): Promise<void> {
-    const ref = adminDb.collection('partners').doc(partnerId);
-    const publicPartnerRef = adminDb.collection('publicPartners').doc(partnerId);
-    await adminDb.runTransaction(async (transaction) => {
-      const snapshot = await transaction.get(ref);
-      if (!snapshot.exists) {
-        throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado');
-      }
-      const data = snapshot.data() ?? {};
-      if (data.status === 'suspended') {
-        throw new PartnerDomainError(
-          'FORBIDDEN',
-          'Parceiro suspenso não pode ativar o período de testes.'
-        );
-      }
-      if (data.hasUsedTrial === true) {
-        throw new PartnerDomainError('CONFLICT', 'O período de testes já foi utilizado.');
-      }
-      const currentExpiry = data.verifiedUntil;
-      if (data.isVerified === true && currentExpiry) {
-        const expiryDate =
-          typeof currentExpiry.toDate === 'function'
-            ? currentExpiry.toDate()
-            : new Date(currentExpiry);
-        if (
-          expiryDate instanceof Date &&
-          !Number.isNaN(expiryDate.getTime()) &&
-          expiryDate > new Date()
-        ) {
-          throw new PartnerDomainError('CONFLICT', 'O parceiro já possui uma verificação ativa.');
-        }
-      }
-
-      const nextData = {
-        ...data,
-        isVerified: true,
-        verifiedUntil,
-        verificationType: 'trial',
-        isVerificationSuspended: false,
-        hasUsedTrial: true,
-      };
-
-      transaction.update(ref, {
-        isVerified: true,
-        verifiedUntil,
-        verificationType: 'trial',
-        isVerificationSuspended: false,
-        hasUsedTrial: true,
-        updatedAt: FieldValue.serverTimestamp(),
-      });
-
-      transaction.set(publicPartnerRef, toPublicPartnerProfile(partnerId, nextData));
-    });
-  }
-
-  async restoreTrialStateAtomically(partnerId: string, state: PartnerTrialState): Promise<void> {
-    const partnerRef = adminDb.collection('partners').doc(partnerId);
-    const publicRef = adminDb.collection('publicPartners').doc(partnerId);
-
-    await adminDb.runTransaction(async (transaction) => {
-      const snapshot = await transaction.get(partnerRef);
-      if (!snapshot.exists) {
-        throw new PartnerDomainError('NOT_FOUND', 'Perfil de parceiro não encontrado');
-      }
-
-      const current = snapshot.data() ?? {};
-      const next = {
-        ...current,
-        ...state,
-      };
-
-      transaction.update(partnerRef, {
-        ...state,
-        updatedAt: FieldValue.serverTimestamp(),
-      });
-
-      transaction.set(publicRef, toPublicPartnerProfile(partnerId, next));
-    });
-  }
 }

=== server/domain/partners/controllers/partnerController.ts — diff ===
@@ -1,18 +1,10 @@
 import { Response } from 'express';
-import { activatePartnerTrialApplicationUseCase } from '../../../application/usecases/activatePartnerTrialApplicationUseCase';
 import { registerPartnerApplicationUseCase } from '../../../application/usecases/registerPartnerApplicationUseCase';
-import { setPartnerVerificationByAdminApplicationUseCase } from '../../../application/usecases/setPartnerVerificationByAdminApplicationUseCase';
 import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
 import { RegisterPartnerDTO } from '../dtos/RegisterPartnerDTO';
-import { VerifyPartnerDTO } from '../dtos/VerifyPartnerDTO';
 import { PartnerDomainError } from '../errors/partnerDomainError';
 import { partnerService } from '../factory';
-import {
-  activateTrialSchema,
-  registerPartnerSchema,
-  updatePartnerStatusSchema,
-  verifyPartnerSchema,
-} from '../schemas/partnerSchema';
+import { registerPartnerSchema, updatePartnerStatusSchema } from '../schemas/partnerSchema';
 
 function handleControllerError(res: Response, error: unknown, defaultMessage: string): Response {
   if (error instanceof PartnerDomainError) {
@@ -85,50 +77,6 @@ export class PartnerController {
     }
   }
 
-  static async verifyPartner(req: AuthenticatedRequest, res: Response) {
-    try {
-      const parsed = verifyPartnerSchema.safeParse(req.body);
-      if (!parsed.success) {
-        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.format() });
-      }
-
-      const dto = VerifyPartnerDTO.fromValidatedInput(parsed.data);
-      await setPartnerVerificationByAdminApplicationUseCase(dto.partnerId, dto.isVerified);
-      return res
-        .status(200)
-        .json({ status: 'success', message: 'Selo de verificação atualizado com sucesso' });
-    } catch (error: unknown) {
-      return handleControllerError(res, error, 'Erro ao alterar verificação');
-    }
-  }
-
-  static async activateTrial(req: AuthenticatedRequest, res: Response) {
-    try {
-      const uid = req.user?.uid;
-      if (!uid) {
-        return res.status(401).json({ error: 'Não autenticado' });
-      }
-
-      const parsed = activateTrialSchema.safeParse(req.body);
-      if (!parsed.success) {
-        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.format() });
-      }
-
-      if (parsed.data.partnerId && parsed.data.partnerId !== uid && !req.user?.admin) {
-        return res.status(403).json({ error: 'Não é permitido ativar trial para outro parceiro' });
-      }
-
-      const targetUid = req.user?.admin && parsed.data.partnerId ? parsed.data.partnerId : uid;
-
-      await activatePartnerTrialApplicationUseCase({ uid, admin: req.user?.admin }, targetUid);
-      return res
-        .status(200)
-        .json({ status: 'success', message: 'Período de testes de 7 dias grátis ativado' });
-    } catch (error: unknown) {
-      return handleControllerError(res, error, 'Erro ao ativar trial');
-    }
-  }
-
   static async getProfile(req: AuthenticatedRequest, res: Response) {
     try {
       const rawPartnerId = req.params.partnerId || req.user?.uid;

=== server/domain/partners/dtos/VerifyPartnerDTO.ts — APAGUE este arquivo ===

=== server/domain/partners/errors/listingPlanError.ts — ARQUIVO NOVO, conteúdo completo ===
export type ListingPlanErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'LISTING_PENDING_VERIFICATION'
  | 'TRIAL_ALREADY_USED'
  | 'PLAN_ALREADY_ACTIVE'
  | 'PARTNER_SUSPENDED';

const STATUS: Record<ListingPlanErrorCode, number> = {
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  LISTING_PENDING_VERIFICATION: 422,
  TRIAL_ALREADY_USED: 409,
  PLAN_ALREADY_ACTIVE: 409,
  PARTNER_SUSPENDED: 403,
};

export class ListingPlanError extends Error {
  readonly statusCode: number;

  constructor(
    public readonly code: ListingPlanErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ListingPlanError';
    this.statusCode = STATUS[code];
  }
}

=== server/domain/partners/factory.ts — diff ===
@@ -2,6 +2,8 @@ import { PartnerService } from './services/partnerService';
 import { FirestorePartnerAdapter } from './adapters/firestorePartnerAdapter';
 import { FirestoreListingVerificationAdapter } from './adapters/firestoreListingVerificationAdapter';
 import { ListingVerificationService } from './services/listingVerificationService';
+import { FirestoreListingPlanAdapter } from './adapters/firestoreListingPlanAdapter';
+import { ListingPlanService } from './services/listingPlanService';
 import { blindIndex, fieldEncryption } from '../../infrastructure/crypto/fieldEncryptionFactory';
 
 const partnerAdapter = new FirestorePartnerAdapter();
@@ -19,3 +21,5 @@ export function getListingVerificationService(): ListingVerificationService {
   );
   return listingVerificationService;
 }
+
+export const listingPlanService = new ListingPlanService(new FirestoreListingPlanAdapter());

=== server/domain/partners/index.ts — diff ===
@@ -2,10 +2,7 @@ export { registerPartnerUseCase } from './usecases/registerPartnerUseCase';
 export { getPartnerProfileUseCase } from './usecases/getPartnerProfileUseCase';
 export { getAllPartnersUseCase } from './usecases/getAllPartnersUseCase';
 export { getAllPartnerIdsUseCase } from './usecases/getAllPartnerIdsUseCase';
-export { updatePartnerVerificationProfileUseCase } from './usecases/updatePartnerVerificationProfileUseCase';
 export { updatePartnerStatusUseCase } from './usecases/updatePartnerStatusUseCase';
-export { activatePartnerTrialUseCase } from './usecases/activatePartnerTrialUseCase';
-export { restorePartnerTrialStateUseCase } from './usecases/restorePartnerTrialStateUseCase';
 export { linkBusinessUseCase } from './usecases/linkBusinessUseCase';
 export { updateBusinessUseCase } from './usecases/updateBusinessUseCase';
 export { unlinkBusinessUseCase } from './usecases/unlinkBusinessUseCase';
@@ -19,15 +16,25 @@ export { getListingVerificationStatusUseCase } from './usecases/getListingVerifi
 export { assertListingCanSellUseCase } from './usecases/assertListingCanSellUseCase';
 export { deleteListingVerificationUseCase } from './usecases/deleteListingVerificationUseCase';
 export { deleteOwnerListingVerificationsUseCase } from './usecases/deleteOwnerListingVerificationsUseCase';
+export { listLinkedListingIdsUseCase } from './usecases/listLinkedListingIdsUseCase';
+export { getListingPlanViewUseCase } from './usecases/getListingPlanViewUseCase';
+export { activateListingTrialUseCase } from './usecases/activateListingTrialUseCase';
+export { assertListingPlanPurchasableUseCase } from './usecases/assertListingPlanPurchasableUseCase';
+export { getListingPlanUntilUseCase } from './usecases/getListingPlanUntilUseCase';
+export { applyListingPaidPlanUseCase } from './usecases/applyListingPaidPlanUseCase';
+export { setListingSealByAdminUseCase } from './usecases/setListingSealByAdminUseCase';
+export { computeListingSealUseCase } from './usecases/computeListingSealUseCase';
+export { setListingSealActiveUseCase } from './usecases/setListingSealActiveUseCase';
+export { listExpiredListingSealsUseCase } from './usecases/listExpiredListingSealsUseCase';
+export { listExpiringListingSealsUseCase } from './usecases/listExpiringListingSealsUseCase';
+export { deleteListingPlanUseCase } from './usecases/deleteListingPlanUseCase';
+export { deleteOwnerListingPlansUseCase } from './usecases/deleteOwnerListingPlansUseCase';
 
 export type {
   PartnerStatus,
-  PartnerVerificationType,
   PartnerBusinessType,
   PartnerBusiness,
   PartnerRegistrationData,
-  PartnerVerificationData,
-  PartnerTrialState,
   PartnerProfileDocument,
   PartnerPersistenceDocument,
   PartnerProfileDTO,
@@ -47,4 +54,13 @@ export type {
 
 export { PartnerDomainError } from './errors/partnerDomainError';
 export { ListingVerificationError } from './errors/listingVerificationError';
-export { hasActivePlanVerification, resolveAdminVerification } from './utils/adminVerification';
+export { ListingPlanError } from './errors/listingPlanError';
+export { isPaidListingPlanType, isSealVisible, NO_SEAL } from './utils/listingSeal';
+export type {
+  ListingPlanRecord,
+  ListingPlanType,
+  ListingPlanView,
+  ListingSeal,
+  PaidListingPlanType,
+  PlanListing,
+} from './types/listingPlan';

=== server/domain/partners/mappers/partnerMapper.test.ts — diff ===
@@ -7,10 +7,6 @@ describe('partnerMapper', () => {
       { businessId: 'item-1', businessName: 'Restaurante Sabor', type: 'item' },
       { businessId: 'event-1', businessName: 'Festival Gastronômico', type: 'event' },
     ],
-    isVerified: true,
-    verifiedUntil: '2026-12-31T23:59:59.000Z',
-    verificationType: 'annual',
-    isVerificationSuspended: false,
     status: 'active',
     hasUsedTrial: true,
     termsAccepted: true,
@@ -28,10 +24,6 @@ describe('partnerMapper', () => {
           { businessId: 'item-1', businessName: 'Restaurante Sabor', type: 'item' },
           { businessId: 'event-1', businessName: 'Festival Gastronômico', type: 'event' },
         ],
-        isVerified: true,
-        verifiedUntil: '2026-12-31T23:59:59.000Z',
-        verificationType: 'annual',
-        isVerificationSuspended: false,
         status: 'active',
         hasUsedTrial: true,
         termsAccepted: true,
@@ -49,15 +41,6 @@ describe('partnerMapper', () => {
       ).toThrow('Status Partner inválido persistido no Firestore.');
     });
 
-    it('deve lançar erro se verificationType for inválido', () => {
-      expect(() =>
-        toPartnerProfileDTO('partner-123', {
-          ...rawPersistenceData,
-          verificationType: 'invalid-type',
-        })
-      ).toThrow('Tipo de verificação Partner inválido persistido no Firestore.');
-    });
-
     it('deve lançar erro se business.type for inválido e nunca converter silenciosamente para item', () => {
       expect(() =>
         toPartnerProfileDTO('partner-123', {
@@ -103,15 +86,12 @@ describe('partnerMapper', () => {
           { businessId: 'item-1', businessName: 'Restaurante Sabor', type: 'item' },
           { businessId: 'event-1', businessName: 'Festival Gastronômico', type: 'event' },
         ],
-        isVerified: true,
-        verifiedUntil: '2026-12-31T23:59:59.000Z',
-        isVerificationSuspended: false,
         status: 'active',
       });
 
       expect(publicDto).not.toHaveProperty('termsAccepted');
       expect(publicDto).not.toHaveProperty('hasUsedTrial');
-      expect(publicDto).not.toHaveProperty('verificationType');
+      expect(publicDto).not.toHaveProperty('isVerified');
     });
   });
 });

=== server/domain/partners/mappers/partnerMapper.ts — diff ===
@@ -4,7 +4,6 @@ import type {
   PartnerBusinessType,
   PartnerProfileDTO,
   PartnerStatus,
-  PartnerVerificationType,
   PublicPartnerProfileDTO,
 } from '../types/partnerTypes';
 
@@ -27,27 +26,6 @@ function toPartnerBusinessType(value: unknown): PartnerBusinessType {
   throw new PartnerDomainError('INVALID_ARGUMENT', 'Tipo de negócio Parceiro inválido.');
 }
 
-function toPartnerVerificationType(value: unknown): PartnerVerificationType {
-  if (value === null || value === undefined) {
-    return null;
-  }
-
-  if (
-    value === 'trial' ||
-    value === 'monthly' ||
-    value === 'semi-annual' ||
-    value === 'annual' ||
-    value === 'admin'
-  ) {
-    return value;
-  }
-
-  throw new PartnerDomainError(
-    'INVALID_ARGUMENT',
-    'Tipo de verificação Partner inválido persistido no Firestore.'
-  );
-}
-
 function toIsoString(value: unknown): string | null {
   if (!value) return null;
   if (typeof value === 'string') return value;
@@ -75,10 +53,6 @@ export function toPartnerProfileDTO(id: string, raw: Record<string, unknown>): P
   return {
     id,
     businesses,
-    isVerified: raw.isVerified === true,
-    verifiedUntil: toIsoString(raw.verifiedUntil),
-    verificationType: toPartnerVerificationType(raw.verificationType),
-    isVerificationSuspended: raw.isVerificationSuspended === true,
     status: toPartnerStatus(raw.status),
     hasUsedTrial: raw.hasUsedTrial === true,
     termsAccepted: raw.termsAccepted === true,
@@ -102,9 +76,6 @@ export function toPublicPartnerProfileDTO(
   return {
     id: partnerId,
     businesses,
-    isVerified: raw.isVerified === true,
-    verifiedUntil: raw.isVerified === true ? toIsoString(raw.verifiedUntil) : null,
-    isVerificationSuspended: raw.isVerificationSuspended === true,
     status: toPartnerStatus(raw.status),
   };
 }

=== server/domain/partners/ports/listingPlanRepositoryPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ListingPlanRecord } from '../types/listingPlan';

export interface ListingPlanRepositoryPort {
  get(itemId: string): Promise<ListingPlanRecord | null>;
  save(record: ListingPlanRecord): Promise<void>;
  /** Marca na conta que o trial foi usado e grava o plano, na mesma transação (um trial por conta, D11). */
  activateTrial(record: ListingPlanRecord): Promise<void>;
  hasUsedTrial(ownerId: string): Promise<boolean>;
  isOwnerSuspended(ownerId: string): Promise<boolean>;
  setSealActive(itemId: string, sealActive: boolean): Promise<void>;
  /** Planos com selo público ligado e validade já passada. */
  listExpiredWithSeal(nowIso: string, limit: number): Promise<ListingPlanRecord[]>;
  /** Planos com selo público ligado que vencem entre as duas datas. */
  listExpiringWithSeal(fromIso: string, toIso: string, limit: number): Promise<ListingPlanRecord[]>;
  delete(itemId: string): Promise<void>;
  deleteByOwner(ownerId: string): Promise<void>;
}

=== server/domain/partners/ports/listingVerificationRepositoryPort.ts — diff ===
@@ -25,6 +25,8 @@ export interface ListingVerificationRepositoryPort {
     cursor: string | null
   ): Promise<ListingVerificationPage>;
   getSalesDocumentIndex(ownerId: string): Promise<string | null>;
+  /** Perfis de produtor que usam o documento deste estabelecimento (modo `linked`). */
+  listLinkedItemIds(sourceItemId: string): Promise<string[]>;
   /** Apaga o registro e libera o CNPJ; devolve o registro apagado (para remover os arquivos). */
   delete(itemId: string): Promise<ListingVerificationRecord | null>;
   deleteByOwner(ownerId: string): Promise<ListingVerificationRecord[]>;

=== server/domain/partners/ports/partnerPort.ts — diff ===
@@ -3,21 +3,13 @@ import type {
   PartnerProfileDocument,
   PartnerRegistrationData,
   PartnerStatus,
-  PartnerTrialState,
-  PartnerVerificationData,
   RegisterPartnerResult,
 } from '../types/partnerTypes';
 
 export interface PartnerPort {
   registerPartner(uid: string, data: PartnerRegistrationData): Promise<RegisterPartnerResult>;
   getPartnerProfile(partnerId: string): Promise<PartnerProfileDocument | null>;
-  updatePartnerVerificationProfile(
-    partnerId: string,
-    verification: PartnerVerificationData
-  ): Promise<void>;
   updatePartnerStatus(partnerId: string, status: PartnerStatus): Promise<void>;
-  activateTrialAtomically(partnerId: string, verifiedUntil: string): Promise<void>;
-  restoreTrialStateAtomically(partnerId: string, state: PartnerTrialState): Promise<void>;
   linkBusiness(partnerId: string, business: PartnerBusiness): Promise<void>;
   updateBusiness(partnerId: string, business: PartnerBusiness): Promise<void>;
   unlinkBusiness(partnerId: string, businessId: string): Promise<void>;

=== server/domain/partners/routes/partnerRoutes.ts — diff ===
@@ -10,8 +10,6 @@ router.post('/register', verifyAuthToken, PartnerController.registerOrUpgrade);
 router.get('/profile', verifyAuthToken, PartnerController.getProfile);
 router.get('/profile/:partnerId', verifyAuthToken, PartnerController.getProfile);
 router.patch('/status', verifyAdminToken, PartnerController.updateStatus);
-router.patch('/verify', verifyAdminToken, PartnerController.verifyPartner);
-router.post('/activate-trial', verifyAuthToken, PartnerController.activateTrial);
 
 router.post('/items', verifyAuthToken, resolveGuideContext, PartnerContentController.createItem);
 router.put('/items/:id', verifyAuthToken, resolveGuideContext, PartnerContentController.updateItem);

=== server/domain/partners/schemas/partnerSchema.test.ts — diff ===
@@ -1,5 +1,5 @@
 import { describe, expect, it } from 'vitest';
-import { activateTrialSchema, registerPartnerSchema, verifyPartnerSchema } from './partnerSchema';
+import { registerPartnerSchema } from './partnerSchema';
 
 describe('Partner Validation Schemas (Backend)', () => {
   describe('registerPartnerSchema', () => {
@@ -26,44 +26,4 @@ describe('Partner Validation Schemas (Backend)', () => {
       expect(registerPartnerSchema.safeParse({}).success).toBe(false);
     });
   });
-
-  describe('verifyPartnerSchema', () => {
-    it('aceita só a decisão do admin (conceder ou retirar o selo)', () => {
-      expect(verifyPartnerSchema.safeParse({ partnerId: 'p1', isVerified: true }).success).toBe(
-        true
-      );
-      expect(verifyPartnerSchema.safeParse({ partnerId: 'p1', isVerified: false }).success).toBe(
-        true
-      );
-    });
-
-    it('rejeita tipo e validade vindos do cliente: o servidor decide e preserva o plano pago', () => {
-      const result = verifyPartnerSchema.safeParse({
-        partnerId: 'p1',
-        isVerified: true,
-        verifiedUntil: '2026-12-31T23:59:59.000Z',
-        verificationType: 'annual',
-      });
-      expect(result.success).toBe(false);
-    });
-
-    it('rejeita parceiro sem ID', () => {
-      expect(verifyPartnerSchema.safeParse({ partnerId: ' ', isVerified: true }).success).toBe(
-        false
-      );
-    });
-  });
-  describe('activateTrialSchema', () => {
-    it('should validate trial activation with required trimmed partnerId', () => {
-      const result = activateTrialSchema.safeParse({
-        partnerId: 'partner_123',
-      });
-      expect(result.success).toBe(true);
-    });
-
-    it('should fail when partnerId is empty or missing', () => {
-      expect(activateTrialSchema.safeParse({}).success).toBe(false);
-      expect(activateTrialSchema.safeParse({ partnerId: '  ' }).success).toBe(false);
-    });
-  });
 });

=== server/domain/partners/schemas/partnerSchema.ts — diff ===
@@ -13,21 +13,6 @@ export const registerPartnerSchema = z
   })
   .strict();
 
-// O admin só diz se concede ou retira o selo; tipo e validade são decididos no servidor
-// para nunca sobrescrever o plano pago do parceiro.
-export const verifyPartnerSchema = z
-  .object({
-    partnerId: z.string().trim().min(1, 'ID do parceiro é obrigatório'),
-    isVerified: z.boolean(),
-  })
-  .strict();
-
-export const activateTrialSchema = z
-  .object({
-    partnerId: z.string().trim().min(1),
-  })
-  .strict();
-
 export const updatePartnerStatusSchema = z
   .object({
     partnerId: z.string().trim().min(1),
@@ -36,6 +21,4 @@ export const updatePartnerStatusSchema = z
   .strict();
 
 export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;
-export type VerifyPartnerInput = z.infer<typeof verifyPartnerSchema>;
-export type ActivateTrialInput = z.infer<typeof activateTrialSchema>;
 export type UpdatePartnerStatusInput = z.infer<typeof updatePartnerStatusSchema>;

=== server/domain/partners/services/listingPlanService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it } from 'vitest';
import { ListingPlanError } from '../errors/listingPlanError';
import type { ListingPlanRepositoryPort } from '../ports/listingPlanRepositoryPort';
import type { ListingPlanRecord } from '../types/listingPlan';
import { ListingPlanService } from './listingPlanService';

class InMemoryPlans implements ListingPlanRepositoryPort {
  plans = new Map<string, ListingPlanRecord>();
  usedTrial = new Set<string>();
  suspended = new Set<string>();
  async get(itemId: string) {
    return this.plans.get(itemId) ?? null;
  }
  async save(record: ListingPlanRecord) {
    this.plans.set(record.itemId, record);
  }
  async activateTrial(record: ListingPlanRecord) {
    if (this.usedTrial.has(record.ownerId)) {
      throw new ListingPlanError('TRIAL_ALREADY_USED', 'usado');
    }
    this.usedTrial.add(record.ownerId);
    this.plans.set(record.itemId, record);
  }
  async hasUsedTrial(ownerId: string) {
    return this.usedTrial.has(ownerId);
  }
  async isOwnerSuspended(ownerId: string) {
    return this.suspended.has(ownerId);
  }
  async setSealActive(itemId: string, sealActive: boolean) {
    const record = this.plans.get(itemId);
    if (record) record.sealActive = sealActive;
  }
  async listExpiredWithSeal(nowIso: string) {
    return [...this.plans.values()].filter(
      (p) => p.sealActive && p.planUntil !== null && p.planUntil <= nowIso
    );
  }
  async listExpiringWithSeal(fromIso: string, toIso: string) {
    return [...this.plans.values()].filter(
      (p) => p.sealActive && p.planUntil !== null && p.planUntil > fromIso && p.planUntil <= toIso
    );
  }
  async delete(itemId: string) {
    this.plans.delete(itemId);
  }
  async deleteByOwner(ownerId: string) {
    for (const [id, p] of this.plans) if (p.ownerId === ownerId) this.plans.delete(id);
  }
}

const owner = { uid: 'owner-1' };
const admin = { uid: 'admin-1', admin: true };
const pousada = { id: 'item-1', ownerId: 'owner-1' };
const restaurante = { id: 'item-2', ownerId: 'owner-1' };

describe('ListingPlanService (D11)', () => {
  let repo: InMemoryPlans;
  let service: ListingPlanService;

  beforeEach(() => {
    repo = new InMemoryPlans();
    service = new ListingPlanService(repo, () => new Date('2026-10-21T12:00:00Z'));
  });

  it('trial e plano exigem verificação aprovada', async () => {
    await expect(service.activateTrial(owner, pousada, 'pending')).rejects.toMatchObject({
      code: 'LISTING_PENDING_VERIFICATION',
    });
    await expect(service.assertCanPurchase(owner, pousada, 'not_submitted')).rejects.toMatchObject({
      code: 'LISTING_PENDING_VERIFICATION',
    });
  });

  it('trial de 7 dias, uma vez por conta, no estabelecimento escolhido', async () => {
    const trial = await service.activateTrial(owner, pousada, 'approved');
    expect(trial).toMatchObject({ planType: 'trial', planUntil: '2026-10-28T12:00:00.000Z' });
    await expect(service.activateTrial(owner, restaurante, 'approved')).rejects.toMatchObject({
      code: 'TRIAL_ALREADY_USED',
    });
    const view = await service.getView(owner, restaurante, 'approved');
    expect(view.trialAvailable).toBe(false);
  });

  it('só o dono contrata; conta suspensa não contrata', async () => {
    await expect(service.activateTrial(admin, pousada, 'approved')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    repo.suspended.add('owner-1');
    await expect(service.activateTrial(owner, pousada, 'approved')).rejects.toMatchObject({
      code: 'PARTNER_SUSPENDED',
    });
  });

  it('plano pago mantém a suspensão do admin e o selo segue a verificação', async () => {
    await service.setAdminSeal(admin, pousada, true);
    await service.applyPaidPlan(pousada, 'annual', '2027-10-21T12:00:00.000Z');
    await service.setAdminSeal(admin, pousada, false);
    expect((await repo.get('item-1'))?.planType).toBe('annual');
    expect(await service.computeSeal('item-1', 'approved')).toMatchObject({
      isVerified: true,
      isVerificationSuspended: true,
    });
    expect((await service.computeSeal('item-1', 'rejected')).isVerified).toBe(false);
  });

  it('só admin mexe no selo; outro dono não vê o plano', async () => {
    await expect(service.setAdminSeal(owner, pousada, true)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(service.getView({ uid: 'intruso' }, pousada, 'approved')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('lista selos ligados já vencidos e os que vencem em breve', async () => {
    await repo.save({
      itemId: 'item-1',
      ownerId: 'owner-1',
      planType: 'monthly',
      planUntil: '2026-10-20T12:00:00.000Z',
      sealSuspended: false,
      sealActive: true,
      updatedAt: '',
    });
    await repo.save({
      itemId: 'item-2',
      ownerId: 'owner-1',
      planType: 'monthly',
      planUntil: '2026-10-23T12:00:00.000Z',
      sealSuspended: false,
      sealActive: true,
      updatedAt: '',
    });
    expect((await service.listExpiredWithSeal(50)).map((p) => p.itemId)).toEqual(['item-1']);
    expect((await service.listExpiringWithSeal(3, 50)).map((p) => p.itemId)).toEqual(['item-2']);
  });
});

=== server/domain/partners/services/listingPlanService.ts — ARQUIVO NOVO, conteúdo completo ===
import { ListingPlanError } from '../errors/listingPlanError';
import type { ListingPlanRepositoryPort } from '../ports/listingPlanRepositoryPort';
import type {
  ListingPlanRecord,
  ListingPlanView,
  ListingSeal,
  PaidListingPlanType,
  PlanListing,
} from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';
import {
  computeListingSeal,
  EMPTY_PLAN,
  hasActivePurchasedPlan,
  isPlanActive,
  resolveAdminPlan,
} from '../utils/listingSeal';

const TRIAL_DAYS = 7;
const DAY_MS = 86_400_000;

type VerificationState = ListingVerificationStatus | 'not_submitted';

interface Actor {
  uid: string;
  admin?: boolean;
}

/** Plano "Use Guide Verificado" por estabelecimento (D11): trial, plano pago e selo do admin. */
export class ListingPlanService {
  constructor(
    private readonly repository: ListingPlanRepositoryPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getView(
    actor: Actor,
    listing: PlanListing,
    verification: VerificationState
  ): Promise<ListingPlanView> {
    if (!actor.admin && actor.uid !== listing.ownerId) {
      throw new ListingPlanError('FORBIDDEN', 'Sem acesso ao plano deste estabelecimento.');
    }
    const [record, usedTrial] = await Promise.all([
      this.repository.get(listing.id),
      this.repository.hasUsedTrial(listing.ownerId),
    ]);
    const plan = record ?? EMPTY_PLAN;
    const now = this.now();
    const planActive = isPlanActive(plan, now);
    return {
      itemId: listing.id,
      planType: planActive ? plan.planType : null,
      planUntil: planActive ? plan.planUntil : null,
      planActive,
      sealSuspended: plan.sealSuspended,
      seal: computeListingSeal(plan, verification, now),
      trialAvailable: !usedTrial && !planActive,
    };
  }

  /** Trial de 7 dias, uma vez por conta, no estabelecimento que o parceiro escolher (D11). */
  async activateTrial(
    actor: Actor,
    listing: PlanListing,
    verification: VerificationState
  ): Promise<ListingPlanRecord> {
    await this.assertCanPurchase(actor, listing, verification);
    const current = await this.repository.get(listing.id);
    const now = this.now();
    if (current && hasActivePurchasedPlan(current, now)) {
      throw new ListingPlanError('PLAN_ALREADY_ACTIVE', 'Este estabelecimento já tem plano ativo.');
    }
    const record: ListingPlanRecord = {
      itemId: listing.id,
      ownerId: listing.ownerId,
      planType: 'trial',
      planUntil: new Date(now.getTime() + TRIAL_DAYS * DAY_MS).toISOString(),
      sealSuspended: current?.sealSuspended ?? false,
      sealActive: current?.sealActive ?? false,
      updatedAt: now.toISOString(),
    };
    await this.repository.activateTrial(record);
    return record;
  }

  /** Plano e trial só depois da verificação aprovada; avaliações e cadastro seguem livres (D11). */
  async assertCanPurchase(
    actor: Actor,
    listing: PlanListing,
    verification: VerificationState
  ): Promise<void> {
    if (actor.uid !== listing.ownerId) {
      throw new ListingPlanError('FORBIDDEN', 'Só o dono contrata o plano do estabelecimento.');
    }
    if (await this.repository.isOwnerSuspended(listing.ownerId)) {
      throw new ListingPlanError('PARTNER_SUSPENDED', 'Conta de parceiro suspensa.');
    }
    if (verification !== 'approved') {
      throw new ListingPlanError(
        'LISTING_PENDING_VERIFICATION',
        'O estabelecimento precisa ser verificado pelo Use Guide antes do plano.'
      );
    }
  }

  async getPlanUntil(itemId: string): Promise<string | null> {
    const record = await this.repository.get(itemId);
    return record && isPlanActive(record, this.now()) ? record.planUntil : null;
  }

  /** Grava o plano pago confirmado pelo Stripe; uma suspensão feita pelo admin é mantida (D8). */
  async applyPaidPlan(
    listing: PlanListing,
    planType: PaidListingPlanType,
    planUntil: string
  ): Promise<ListingPlanRecord> {
    const current = await this.repository.get(listing.id);
    const record: ListingPlanRecord = {
      itemId: listing.id,
      ownerId: listing.ownerId,
      planType,
      planUntil,
      sealSuspended: current?.sealSuspended ?? false,
      sealActive: current?.sealActive ?? false,
      updatedAt: this.now().toISOString(),
    };
    await this.repository.save(record);
    return record;
  }

  async setAdminSeal(actor: Actor, listing: PlanListing, grant: boolean): Promise<void> {
    if (!actor.admin) {
      throw new ListingPlanError('FORBIDDEN', 'Somente administradores alteram o selo.');
    }
    const current = await this.repository.get(listing.id);
    const now = this.now();
    const next = resolveAdminPlan(current ?? EMPTY_PLAN, grant, now);
    await this.repository.save({
      itemId: listing.id,
      ownerId: listing.ownerId,
      ...next,
      sealActive: current?.sealActive ?? false,
      updatedAt: now.toISOString(),
    });
  }

  async computeSeal(itemId: string, verification: VerificationState): Promise<ListingSeal> {
    const record = await this.repository.get(itemId);
    return computeListingSeal(record ?? EMPTY_PLAN, verification, this.now());
  }

  setSealActive(itemId: string, sealActive: boolean): Promise<void> {
    return this.repository.setSealActive(itemId, sealActive);
  }

  listExpiredWithSeal(limit: number): Promise<ListingPlanRecord[]> {
    return this.repository.listExpiredWithSeal(this.now().toISOString(), limit);
  }

  listExpiringWithSeal(withinDays: number, limit: number): Promise<ListingPlanRecord[]> {
    const now = this.now();
    const until = new Date(now.getTime() + withinDays * DAY_MS);
    return this.repository.listExpiringWithSeal(now.toISOString(), until.toISOString(), limit);
  }

  deleteForListing(itemId: string): Promise<void> {
    return this.repository.delete(itemId);
  }

  deleteForOwner(ownerId: string): Promise<void> {
    return this.repository.deleteByOwner(ownerId);
  }
}

=== server/domain/partners/services/listingVerificationService.test.ts — diff ===
@@ -56,6 +56,11 @@ class InMemoryRepository implements ListingVerificationRepositoryPort {
       nextCursor: null,
     };
   }
+  async listLinkedItemIds(sourceItemId: string) {
+    return [...this.records.values()]
+      .filter((r) => r.sourceItemId === sourceItemId)
+      .map((r) => r.itemId);
+  }
   async getSalesDocumentIndex(ownerId: string) {
     return this.salesDocuments.get(ownerId) ?? null;
   }

=== server/domain/partners/services/listingVerificationService.ts — diff ===
@@ -166,6 +166,11 @@ export class ListingVerificationService {
     }
   }
 
+  /** Perfis de produtor ligados a este estabelecimento: herdam a verificação dele. */
+  listLinkedItemIds(sourceItemId: string): Promise<string[]> {
+    return this.repository.listLinkedItemIds(sourceItemId);
+  }
+
   async deleteForListing(itemId: string): Promise<string[]> {
     const removed = await this.repository.delete(itemId);
     return removed ? filePaths(removed) : [];

=== server/domain/partners/services/partnerService.test.ts — diff ===
@@ -5,14 +5,11 @@ import { PartnerPort } from '../ports/partnerPort';
 function createPartnerPortMock(): PartnerPort {
   return {
     registerPartner: vi.fn(),
-    updatePartnerVerificationProfile: vi.fn(),
     getPartnerProfile: vi.fn(),
     updatePartnerStatus: vi.fn(),
     getAllPartnerIds: vi.fn(),
     getAllPartners: vi.fn(),
     deletePartnerProfile: vi.fn(),
-    activateTrialAtomically: vi.fn(),
-    restoreTrialStateAtomically: vi.fn(),
     linkBusiness: vi.fn(),
     updateBusiness: vi.fn(),
     unlinkBusiness: vi.fn(),
@@ -29,81 +26,6 @@ describe('PartnerService', () => {
     service = new PartnerService(partnerPort);
   });
 
-  describe('updatePartnerVerificationProfile', () => {
-    it('deve delegar a verificação para o PartnerPort', async () => {
-      await service.updatePartnerVerificationProfile('partner-123', {
-        isVerified: true,
-        verifiedUntil: '2026-12-31T23:59:59.000Z',
-        verificationType: 'annual',
-        isVerificationSuspended: false,
-      });
-
-      expect(partnerPort.updatePartnerVerificationProfile).toHaveBeenCalledWith('partner-123', {
-        isVerified: true,
-        verifiedUntil: '2026-12-31T23:59:59.000Z',
-        verificationType: 'annual',
-        isVerificationSuspended: false,
-      });
-    });
-
-    it('deve lançar erro se partnerId for vazio', async () => {
-      await expect(
-        service.updatePartnerVerificationProfile('', {
-          isVerified: true,
-          verifiedUntil: null,
-          verificationType: null,
-          isVerificationSuspended: false,
-        })
-      ).rejects.toThrow('ID do parceiro é obrigatório para verificação');
-
-      expect(partnerPort.updatePartnerVerificationProfile).not.toHaveBeenCalled();
-    });
-
-    it('deve lançar erro se isVerified=true mas verifiedUntil estiver ausente', async () => {
-      await expect(
-        service.updatePartnerVerificationProfile('partner-123', {
-          isVerified: true,
-          verifiedUntil: null,
-          verificationType: 'annual',
-          isVerificationSuspended: false,
-        })
-      ).rejects.toThrow('verifiedUntil é obrigatório quando o parceiro está verificado');
-    });
-
-    it('deve lançar erro se isVerified=true mas verificationType estiver ausente', async () => {
-      await expect(
-        service.updatePartnerVerificationProfile('partner-123', {
-          isVerified: true,
-          verifiedUntil: '2026-12-31T23:59:59.000Z',
-          verificationType: null,
-          isVerificationSuspended: false,
-        })
-      ).rejects.toThrow('verificationType é obrigatório quando o parceiro está verificado');
-    });
-
-    it('deve lançar erro se isVerified=false mas verifiedUntil não for null', async () => {
-      await expect(
-        service.updatePartnerVerificationProfile('partner-123', {
-          isVerified: false,
-          verifiedUntil: '2026-12-31T23:59:59.000Z',
-          verificationType: null,
-          isVerificationSuspended: false,
-        })
-      ).rejects.toThrow('verifiedUntil deve ser null quando o parceiro não está verificado');
-    });
-
-    it('deve lançar erro se isVerified=false mas verificationType não for null', async () => {
-      await expect(
-        service.updatePartnerVerificationProfile('partner-123', {
-          isVerified: false,
-          verifiedUntil: null,
-          verificationType: 'annual',
-          isVerificationSuspended: false,
-        })
-      ).rejects.toThrow('verificationType deve ser null quando o parceiro não está verificado');
-    });
-  });
-
   describe('registerPartner', () => {
     it('deve chamar registerPartner no port só com o aceite dos termos', async () => {
       await service.registerPartner('user-1', { termsAccepted: true });
@@ -117,34 +39,4 @@ describe('PartnerService', () => {
       ).rejects.toThrow('É necessário aceitar os termos de parceria');
     });
   });
-
-  describe('restoreTrialState', () => {
-    it('deve delegar a restauração atômica para o port', async () => {
-      const state = {
-        hasUsedTrial: false,
-        isVerified: false,
-        verifiedUntil: null,
-        verificationType: null,
-        isVerificationSuspended: false,
-      };
-
-      await service.restoreTrialState('partner-123', state);
-
-      expect(partnerPort.restoreTrialStateAtomically).toHaveBeenCalledWith('partner-123', state);
-    });
-
-    it('deve lançar erro se partnerId for vazio', async () => {
-      const state = {
-        hasUsedTrial: false,
-        isVerified: false,
-        verifiedUntil: null,
-        verificationType: null,
-        isVerificationSuspended: false,
-      };
-
-      await expect(service.restoreTrialState('', state)).rejects.toThrow(
-        'ID do parceiro é obrigatório'
-      );
-    });
-  });
 });

=== server/domain/partners/services/partnerService.ts — diff ===
@@ -5,8 +5,6 @@ import type {
   PartnerProfileDocument,
   PartnerRegistrationData,
   PartnerStatus,
-  PartnerTrialState,
-  PartnerVerificationData,
   RegisterPartnerResult,
 } from '../types/partnerTypes';
 
@@ -32,50 +30,6 @@ export class PartnerService {
     return this.partnerPort.registerPartner(uid, data);
   }
 
-  async updatePartnerVerificationProfile(
-    partnerId: string,
-    verification: PartnerVerificationData
-  ): Promise<void> {
-    if (!partnerId?.trim()) {
-      throw new PartnerDomainError(
-        'INVALID_ARGUMENT',
-        'ID do parceiro é obrigatório para verificação'
-      );
-    }
-
-    if (verification.isVerified) {
-      if (!verification.verifiedUntil) {
-        throw new PartnerDomainError(
-          'INVALID_ARGUMENT',
-          'verifiedUntil é obrigatório quando o parceiro está verificado'
-        );
-      }
-
-      if (!verification.verificationType) {
-        throw new PartnerDomainError(
-          'INVALID_ARGUMENT',
-          'verificationType é obrigatório quando o parceiro está verificado'
-        );
-      }
-    } else {
-      if (verification.verifiedUntil !== null) {
-        throw new PartnerDomainError(
-          'INVALID_ARGUMENT',
-          'verifiedUntil deve ser null quando o parceiro não está verificado'
-        );
-      }
-
-      if (verification.verificationType !== null) {
-        throw new PartnerDomainError(
-          'INVALID_ARGUMENT',
-          'verificationType deve ser null quando o parceiro não está verificado'
-        );
-      }
-    }
-
-    await this.partnerPort.updatePartnerVerificationProfile(partnerId, verification);
-  }
-
   async getProfile(partnerId: string): Promise<PartnerProfileDocument | null> {
     if (!partnerId?.trim()) {
       throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
@@ -113,33 +67,6 @@ export class PartnerService {
     return this.partnerPort.deletePartnerProfile(partnerId);
   }
 
-  async activateTrial(actor: { uid: string; admin?: boolean }, partnerId: string): Promise<string> {
-    if (!partnerId?.trim()) {
-      throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
-    }
-    if (!actor.admin && actor.uid !== partnerId) {
-      throw new PartnerDomainError(
-        'FORBIDDEN',
-        'Não autorizado a ativar trial para outro parceiro'
-      );
-    }
-
-    const expirationDate = new Date();
-    expirationDate.setDate(expirationDate.getDate() + 7);
-    const verifiedUntil = expirationDate.toISOString();
-
-    await this.partnerPort.activateTrialAtomically(partnerId, verifiedUntil);
-    return verifiedUntil;
-  }
-
-  async restoreTrialState(partnerId: string, state: PartnerTrialState): Promise<void> {
-    if (!partnerId?.trim()) {
-      throw new PartnerDomainError('INVALID_ARGUMENT', 'ID do parceiro é obrigatório');
-    }
-
-    return this.partnerPort.restoreTrialStateAtomically(partnerId, state);
-  }
-
   async linkBusiness(partnerId: string, business: PartnerBusiness): Promise<void> {
     if (!partnerId || !business?.businessId) {
       throw new PartnerDomainError(

=== server/domain/partners/types/listingPlan.ts — ARQUIVO NOVO, conteúdo completo ===
/** `admin`: selo concedido pelo admin sem plano pago (D8, por estabelecimento na D11). */
export type ListingPlanType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin';
export type PaidListingPlanType = 'monthly' | 'semi-annual' | 'annual';

/**
 * `listingPlans/{itemId}`: só backend. O plano é do estabelecimento ou do perfil de produtor (D11).
 * `sealActive` guarda o último selo público gravado no item, para o job diário achar os vencidos.
 */
export interface ListingPlanRecord {
  itemId: string;
  ownerId: string;
  planType: ListingPlanType | null;
  planUntil: string | null;
  /** Selo retirado pelo admin sem mexer no plano pago (D8). */
  sealSuspended: boolean;
  sealActive: boolean;
  updatedAt: string;
}

/** Cópia pública do selo em `items` e `events`: os campos que os cards já leem. */
export interface ListingSeal {
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: ListingPlanType | null;
  isVerificationSuspended: boolean;
}

/** O que o dono e o admin enxergam do plano de um estabelecimento. */
export interface ListingPlanView {
  itemId: string;
  planType: ListingPlanType | null;
  planUntil: string | null;
  planActive: boolean;
  sealSuspended: boolean;
  seal: ListingSeal;
  trialAvailable: boolean;
}

export interface PlanListing {
  id: string;
  ownerId: string;
}

=== server/domain/partners/types/partnerTypes.ts — diff ===
@@ -1,15 +1,6 @@
 /** A verificação é por estabelecimento (D12); o status da conta só serve para suspensão. */
 export type PartnerStatus = 'active' | 'suspended';
 
-/** `admin`: selo concedido pelo admin, sem plano pago. */
-export type PartnerVerificationType =
-  | 'trial'
-  | 'monthly'
-  | 'semi-annual'
-  | 'annual'
-  | 'admin'
-  | null;
-
 export type PartnerBusinessType = 'item' | 'event';
 
 export interface PartnerBusiness {
@@ -26,29 +17,11 @@ export interface RegisterPartnerResult {
   created: boolean;
 }
 
-export interface PartnerVerificationData {
-  isVerified: boolean;
-  verifiedUntil: string | null;
-  verificationType: PartnerVerificationType;
-  isVerificationSuspended: boolean;
-}
-
-export interface PartnerTrialState {
-  hasUsedTrial: boolean;
-  isVerified: boolean;
-  verifiedUntil: string | null;
-  verificationType: PartnerVerificationType;
-  isVerificationSuspended: boolean;
-}
-
 export interface PartnerPersistenceDocument {
   id: string;
   status: PartnerStatus;
   businesses: PartnerBusiness[];
-  isVerified: boolean;
-  verifiedUntil: string | null;
-  verificationType: PartnerVerificationType;
-  isVerificationSuspended: boolean;
+  /** Um trial por conta (D11); o plano e o selo são de cada estabelecimento (`listingPlans`). */
   hasUsedTrial: boolean;
   termsAccepted: boolean;
   createdAt?: unknown;
@@ -59,10 +32,7 @@ export interface PartnerProfileDTO {
   id: string;
   status: PartnerStatus;
   businesses: PartnerBusiness[];
-  isVerified: boolean;
-  verifiedUntil: string | null;
-  verificationType: PartnerVerificationType;
-  isVerificationSuspended: boolean;
+  /** Um trial por conta (D11); o plano e o selo são de cada estabelecimento (`listingPlans`). */
   hasUsedTrial: boolean;
   termsAccepted: boolean;
   createdAt?: string;
@@ -72,9 +42,6 @@ export interface PartnerProfileDTO {
 export interface PublicPartnerProfileDTO {
   id: string;
   businesses: PartnerBusiness[];
-  isVerified: boolean;
-  verifiedUntil: string | null;
-  isVerificationSuspended: boolean;
   status: PartnerStatus;
 }

=== server/domain/partners/usecases/activateListingTrialUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';
import type { ListingPlanRecord, PlanListing } from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function activateListingTrialUseCase(
  actor: { uid: string; admin?: boolean },
  listing: PlanListing,
  verification: ListingVerificationStatus | 'not_submitted'
): Promise<ListingPlanRecord> {
  return listingPlanService.activateTrial(actor, listing, verification);
}

=== server/domain/partners/usecases/activatePartnerTrialUseCase.ts — APAGUE este arquivo ===

=== server/domain/partners/usecases/applyListingPaidPlanUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';
import type { ListingPlanRecord, PaidListingPlanType, PlanListing } from '../types/listingPlan';

export function applyListingPaidPlanUseCase(
  listing: PlanListing,
  planType: PaidListingPlanType,
  planUntil: string
): Promise<ListingPlanRecord> {
  return listingPlanService.applyPaidPlan(listing, planType, planUntil);
}

=== server/domain/partners/usecases/assertListingPlanPurchasableUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';
import type { PlanListing } from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function assertListingPlanPurchasableUseCase(
  actor: { uid: string; admin?: boolean },
  listing: PlanListing,
  verification: ListingVerificationStatus | 'not_submitted'
): Promise<void> {
  return listingPlanService.assertCanPurchase(actor, listing, verification);
}

=== server/domain/partners/usecases/computeListingSealUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';
import type { ListingSeal } from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function computeListingSealUseCase(
  itemId: string,
  verification: ListingVerificationStatus | 'not_submitted'
): Promise<ListingSeal> {
  return listingPlanService.computeSeal(itemId, verification);
}

=== server/domain/partners/usecases/deleteListingPlanUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';

export function deleteListingPlanUseCase(itemId: string): Promise<void> {
  return listingPlanService.deleteForListing(itemId);
}

=== server/domain/partners/usecases/deleteOwnerListingPlansUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';

export function deleteOwnerListingPlansUseCase(ownerId: string): Promise<void> {
  return listingPlanService.deleteForOwner(ownerId);
}

=== server/domain/partners/usecases/getListingPlanUntilUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';

/** Validade do plano em vigor, ou `null`: base para somar meses num pagamento avulso. */
export function getListingPlanUntilUseCase(itemId: string): Promise<string | null> {
  return listingPlanService.getPlanUntil(itemId);
}

=== server/domain/partners/usecases/getListingPlanViewUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';
import type { ListingPlanView, PlanListing } from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function getListingPlanViewUseCase(
  actor: { uid: string; admin?: boolean },
  listing: PlanListing,
  verification: ListingVerificationStatus | 'not_submitted'
): Promise<ListingPlanView> {
  return listingPlanService.getView(actor, listing, verification);
}

=== server/domain/partners/usecases/listExpiredListingSealsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';
import type { ListingPlanRecord } from '../types/listingPlan';

export function listExpiredListingSealsUseCase(limit: number): Promise<ListingPlanRecord[]> {
  return listingPlanService.listExpiredWithSeal(limit);
}

=== server/domain/partners/usecases/listExpiringListingSealsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';
import type { ListingPlanRecord } from '../types/listingPlan';

export function listExpiringListingSealsUseCase(
  withinDays: number,
  limit: number
): Promise<ListingPlanRecord[]> {
  return listingPlanService.listExpiringWithSeal(withinDays, limit);
}

=== server/domain/partners/usecases/listLinkedListingIdsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';

/** Perfis de produtor que seguem a verificação deste estabelecimento (D12). */
export function listLinkedListingIdsUseCase(sourceItemId: string): Promise<string[]> {
  return getListingVerificationService().listLinkedItemIds(sourceItemId);
}

=== server/domain/partners/usecases/restorePartnerTrialStateUseCase.ts — APAGUE este arquivo ===

=== server/domain/partners/usecases/setListingSealActiveUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';

export function setListingSealActiveUseCase(itemId: string, sealActive: boolean): Promise<void> {
  return listingPlanService.setSealActive(itemId, sealActive);
}

=== server/domain/partners/usecases/setListingSealByAdminUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listingPlanService } from '../factory';
import type { PlanListing } from '../types/listingPlan';

export function setListingSealByAdminUseCase(
  actor: { uid: string; admin?: boolean },
  listing: PlanListing,
  grant: boolean
): Promise<void> {
  return listingPlanService.setAdminSeal(actor, listing, grant);
}

=== server/domain/partners/usecases/updatePartnerVerificationProfileUseCase.ts — APAGUE este arquivo ===

=== server/domain/partners/utils/adminVerification.test.ts — APAGUE este arquivo ===

=== server/domain/partners/utils/adminVerification.ts — APAGUE este arquivo ===

=== server/domain/partners/utils/listingSeal.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { computeListingSeal, EMPTY_PLAN, isSealVisible, resolveAdminPlan } from './listingSeal';

const now = new Date('2026-10-21T12:00:00Z');
const future = '2026-11-21T12:00:00.000Z';
const past = '2026-10-01T12:00:00.000Z';
const paid = { planType: 'monthly' as const, planUntil: future, sealSuspended: false };

describe('computeListingSeal (D11)', () => {
  it('selo só com plano ativo e verificação aprovada', () => {
    expect(isSealVisible(computeListingSeal(paid, 'approved', now))).toBe(true);
    expect(computeListingSeal(paid, 'pending', now).isVerified).toBe(false);
    expect(computeListingSeal(paid, 'not_submitted', now).isVerified).toBe(false);
    expect(computeListingSeal({ ...paid, planUntil: past }, 'approved', now).isVerified).toBe(
      false
    );
  });

  it('selo suspenso pelo admin fica marcado e invisível', () => {
    const seal = computeListingSeal({ ...paid, sealSuspended: true }, 'approved', now);
    expect(seal).toMatchObject({ isVerified: true, isVerificationSuspended: true });
    expect(isSealVisible(seal)).toBe(false);
  });
});

describe('resolveAdminPlan (D8 por estabelecimento)', () => {
  it('com plano pago só liga ou desliga a suspensão', () => {
    expect(resolveAdminPlan(paid, false, now)).toEqual({ ...paid, sealSuspended: true });
    expect(resolveAdminPlan({ ...paid, sealSuspended: true }, true, now)).toEqual(paid);
  });

  it('sem plano concede o selo admin por um ano ou remove', () => {
    const granted = resolveAdminPlan(EMPTY_PLAN, true, now);
    expect(granted.planType).toBe('admin');
    expect(granted.planUntil).toBe('2027-10-21T12:00:00.000Z');
    expect(resolveAdminPlan(granted, false, now)).toEqual(EMPTY_PLAN);
  });
});

=== server/domain/partners/utils/listingSeal.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  ListingPlanRecord,
  ListingPlanType,
  ListingSeal,
  PaidListingPlanType,
} from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';

const ADMIN_SEAL_DAYS = 365;
const DAY_MS = 86_400_000;

type PlanState = Pick<ListingPlanRecord, 'planType' | 'planUntil' | 'sealSuspended'>;

export const NO_SEAL: ListingSeal = {
  isVerified: false,
  verifiedUntil: null,
  verificationType: null,
  isVerificationSuspended: false,
};

export const EMPTY_PLAN: PlanState = { planType: null, planUntil: null, sealSuspended: false };

export function isPaidListingPlanType(value: string): value is PaidListingPlanType {
  return value === 'monthly' || value === 'semi-annual' || value === 'annual';
}

export function isPlanActive(plan: PlanState, now: Date): boolean {
  return Boolean(plan.planType && plan.planUntil && new Date(plan.planUntil) > now);
}

/** Plano pago ou trial em vigor: o admin nunca altera tipo nem validade dele (D8). */
export function hasActivePurchasedPlan(plan: PlanState, now: Date): boolean {
  return isPlanActive(plan, now) && plan.planType !== 'admin';
}

/**
 * Selo público (D11): plano ativo do estabelecimento **e** verificação aprovada pelo admin (D12).
 * Retirado pelo admin, o selo fica marcado como suspenso e os cards não o mostram.
 */
export function computeListingSeal(
  plan: PlanState,
  verification: ListingVerificationStatus | 'not_submitted',
  now: Date
): ListingSeal {
  if (!isPlanActive(plan, now) || verification !== 'approved') return NO_SEAL;
  return {
    isVerified: true,
    verifiedUntil: plan.planUntil,
    verificationType: plan.planType,
    isVerificationSuspended: plan.sealSuspended,
  };
}

/** O selo aparece nos cards: o mesmo critério que o frontend usa. */
export function isSealVisible(seal: ListingSeal): boolean {
  return seal.isVerified && !seal.isVerificationSuspended;
}

/**
 * Selo concedido ou retirado pelo admin. Com plano pago ou trial em vigor, só liga ou desliga a
 * suspensão; sem plano, concede o plano `admin` por um ano ou o remove.
 */
export function resolveAdminPlan(plan: PlanState, grant: boolean, now: Date): PlanState {
  if (hasActivePurchasedPlan(plan, now)) return { ...plan, sealSuspended: !grant };
  if (!grant) return EMPTY_PLAN;
  if (plan.planType === 'admin' && isPlanActive(plan, now)) {
    return { ...plan, sealSuspended: false };
  }
  return {
    planType: 'admin' satisfies ListingPlanType,
    planUntil: new Date(now.getTime() + ADMIN_SEAL_DAYS * DAY_MS).toISOString(),
    sealSuspended: false,
  };
}

=== server/infrastructure/securityAudit.test.ts — diff ===
@@ -79,7 +79,7 @@ describe('Security Audit - Mass Assignment and Cross-Owner Defenses', () => {
           category: 'restaurant',
           isActive: true,
         }),
-        updateVerificationByOwner: vi.fn(),
+        updateItemVerification: vi.fn(),
         updateReviewAggregate: vi.fn(),
         deleteResourcesByOwner: vi.fn(),
         getAllItems: vi.fn(),
@@ -108,7 +108,7 @@ describe('Security Audit - Mass Assignment and Cross-Owner Defenses', () => {
           category: 'tour',
           isActive: true,
         }),
-        updateVerificationByOwner: vi.fn(),
+        updateItemVerification: vi.fn(),
         updateReviewAggregate: vi.fn(),
         deleteResourcesByOwner: vi.fn(),
         getAllItems: vi.fn(),

=== server/interfaces/http/listingPlans/listingPlanController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ get: vi.fn(), trial: vi.fn(), seal: vi.fn() }));

vi.mock('../../../application/usecases/listingPlans/getListingPlanApplicationUseCase', () => ({
  getListingPlanApplicationUseCase: m.get,
}));
vi.mock(
  '../../../application/usecases/listingPlans/activateListingTrialApplicationUseCase',
  () => ({ activateListingTrialApplicationUseCase: m.trial })
);
vi.mock(
  '../../../application/usecases/listingPlans/setListingSealByAdminApplicationUseCase',
  () => ({ setListingSealByAdminApplicationUseCase: m.seal })
);

import { ListingPlanError } from '../../../domain/partners/errors/listingPlanError';
import { ListingPlanController } from './listingPlanController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const OWNER = { uid: 'owner-1', admin: false, emailVerified: true, authTime: 1 };

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return { params: { itemId: 'item-1' }, body: {}, user: OWNER, ...overrides } as never;
}

describe('ListingPlanController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem login: 401', async () => {
    const res = response();
    await ListingPlanController.get(request({ user: undefined }), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('itemId inválido: 400 sem chamar o caso de uso', async () => {
    const res = response();
    await ListingPlanController.activateTrial(
      request({ params: { itemId: '../x' } as never }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(m.trial).not.toHaveBeenCalled();
  });

  it('trial antes da verificação: 422 com o código estável', async () => {
    m.trial.mockRejectedValue(
      new ListingPlanError('LISTING_PENDING_VERIFICATION', 'Verifique antes.')
    );
    const res = response();
    await ListingPlanController.activateTrial(request({}), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'LISTING_PENDING_VERIFICATION', message: 'Verifique antes.' },
    });
  });

  it('selo do admin recusa campo extra no corpo', async () => {
    const res = response();
    await ListingPlanController.setSeal(
      request({ body: { grant: true, planType: 'annual' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(m.seal).not.toHaveBeenCalled();
  });

  it('erro inesperado: 500 sem detalhe interno', async () => {
    m.get.mockRejectedValue(new Error('firestore caiu'));
    const res = response();
    await ListingPlanController.get(request({}), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('firestore caiu');
  });
});

=== server/interfaces/http/listingPlans/listingPlanController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { activateListingTrialApplicationUseCase } from '../../../application/usecases/listingPlans/activateListingTrialApplicationUseCase';
import { getListingPlanApplicationUseCase } from '../../../application/usecases/listingPlans/getListingPlanApplicationUseCase';
import { setListingSealByAdminApplicationUseCase } from '../../../application/usecases/listingPlans/setListingSealByAdminApplicationUseCase';
import { ListingPlanError, ListingVerificationError } from '../../../domain/partners';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ListingPlanParamsSchema, SetListingSealSchema } from './schemas/listingPlanSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof ListingPlanError || error instanceof ListingVerificationError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[ListingPlanController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir a operação do plano.');
}

function actorOf(req: AuthenticatedRequest) {
  return req.user ? { uid: req.user.uid, admin: req.user.admin } : null;
}

export class ListingPlanController {
  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingPlanParamsSchema.safeParse(req.params);
    if (!params.success)
      return sendError(res, 400, 'VALIDATION_ERROR', 'Estabelecimento inválido.');
    try {
      return res
        .status(200)
        .json({ data: await getListingPlanApplicationUseCase(actor, params.data.itemId) });
    } catch (error) {
      return handleError(res, error, 'get');
    }
  }

  static async activateTrial(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingPlanParamsSchema.safeParse(req.params);
    if (!params.success)
      return sendError(res, 400, 'VALIDATION_ERROR', 'Estabelecimento inválido.');
    try {
      return res
        .status(200)
        .json({ data: await activateListingTrialApplicationUseCase(actor, params.data.itemId) });
    } catch (error) {
      return handleError(res, error, 'activateTrial');
    }
  }

  static async setSeal(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = ListingPlanParamsSchema.safeParse(req.params);
    const body = SetListingSealSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados do selo inválidos.');
    }
    try {
      const view = await setListingSealByAdminApplicationUseCase(
        actor,
        params.data.itemId,
        body.data.grant
      );
      return res.status(200).json({ data: view });
    } catch (error) {
      return handleError(res, error, 'setSeal');
    }
  }
}

=== server/interfaces/http/listingPlans/listingPlanRoutes.ts — ARQUIVO NOVO, conteúdo completo ===
import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAdminToken, verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { ListingPlanController } from './listingPlanController';

// Contratar plano é operação de pagamento: token revogado é recusado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

const router = Router();

router.get('/:itemId', verifyAuthToken, ListingPlanController.get);
router.post('/:itemId/trial', verifyAuthTokenStrict, ListingPlanController.activateTrial);
router.put('/:itemId/seal', verifyAdminToken, ListingPlanController.setSeal);

export default router;

=== server/interfaces/http/listingPlans/schemas/listingPlanSchemas.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

export const ListingPlanParamsSchema = z
  .object({
    itemId: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[\w-]+$/),
  })
  .strict();

// O admin só diz se concede ou retira o selo; tipo e validade são decididos no servidor (D8).
export const SetListingSealSchema = z.object({ grant: z.boolean() }).strict();

=== server/interfaces/http/listingVerifications/listingVerificationController.test.ts — diff ===
@@ -36,13 +36,18 @@ vi.mock(
     listListingVerificationsApplicationUseCase: mocks.list,
   })
 );
+vi.mock(
+  '../../../application/usecases/listingPlans/reviewListingVerificationApplicationUseCase',
+  () => ({
+    reviewListingVerificationApplicationUseCase: mocks.review,
+  })
+);
 vi.mock('../../../domain/partners', async () => {
   const { ListingVerificationError } = await import(
     '../../../domain/partners/errors/listingVerificationError'
   );
   return {
     ListingVerificationError,
-    reviewListingVerificationUseCase: mocks.review,
   };
 });

=== server/interfaces/http/listingVerifications/listingVerificationController.ts — diff ===
@@ -1,12 +1,10 @@
 import type { Response } from 'express';
 import { getListingVerificationApplicationUseCase } from '../../../application/usecases/listingVerification/getListingVerificationApplicationUseCase';
 import { listListingVerificationsApplicationUseCase } from '../../../application/usecases/listingVerification/listListingVerificationsApplicationUseCase';
+import { reviewListingVerificationApplicationUseCase } from '../../../application/usecases/listingPlans/reviewListingVerificationApplicationUseCase';
 import { readListingVerificationFileApplicationUseCase } from '../../../application/usecases/listingVerification/readListingVerificationFileApplicationUseCase';
 import { submitListingVerificationApplicationUseCase } from '../../../application/usecases/listingVerification/submitListingVerificationApplicationUseCase';
-import {
-  ListingVerificationError,
-  reviewListingVerificationUseCase,
-} from '../../../domain/partners';
+import { ListingVerificationError } from '../../../domain/partners';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { CryptoUnavailableError } from '../../../shared/kernel/fieldEncryption';
 import {
@@ -100,7 +98,7 @@ export class ListingVerificationController {
       return sendError(res, 400, 'VALIDATION_ERROR', 'Revisão inválida.');
     }
     try {
-      const view = await reviewListingVerificationUseCase(
+      const view = await reviewListingVerificationApplicationUseCase(
         actor,
         params.data.itemId,
         body.data.decision,

=== server/interfaces/http/partners/internalPartnersController.test.ts — diff ===
@@ -2,14 +2,13 @@ import type { Request, Response } from 'express';
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 
 const mocks = vi.hoisted(() => ({
-  checkExpiringPartnerPlansApplicationUseCase: vi.fn(),
+  runListingPlanMaintenanceApplicationUseCase: vi.fn(),
 }));
 
 vi.mock(
-  '../../../application/usecases/checkExpiringPartnerPlansApplicationUseCase',
+  '../../../application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase',
   () => ({
-    checkExpiringPartnerPlansApplicationUseCase:
-      mocks.checkExpiringPartnerPlansApplicationUseCase,
+    runListingPlanMaintenanceApplicationUseCase: mocks.runListingPlanMaintenanceApplicationUseCase,
   })
 );
 
@@ -31,27 +30,24 @@ describe('InternalPartnersController.checkExpiringPlans', () => {
     };
   });
 
-  it('retorna 200 com a quantidade de parceiros notificados', async () => {
-    mocks.checkExpiringPartnerPlansApplicationUseCase.mockResolvedValue(3);
+  it('retorna 200 com os selos vencidos e os avisos enviados', async () => {
+    mocks.runListingPlanMaintenanceApplicationUseCase.mockResolvedValue({
+      expired: 1,
+      notified: 3,
+    });
 
-    await InternalPartnersController.checkExpiringPlans(
-      req as Request,
-      res as Response
-    );
+    await InternalPartnersController.checkExpiringPlans(req as Request, res as Response);
 
     expect(statusMock).toHaveBeenCalledWith(200);
-    expect(jsonMock).toHaveBeenCalledWith({ notified: 3 });
+    expect(jsonMock).toHaveBeenCalledWith({ expired: 1, notified: 3 });
   });
 
   it('retorna 500 com código de erro interno em caso de falha', async () => {
-    mocks.checkExpiringPartnerPlansApplicationUseCase.mockRejectedValue(
+    mocks.runListingPlanMaintenanceApplicationUseCase.mockRejectedValue(
       new Error('Database unavailable')
     );
 
-    await InternalPartnersController.checkExpiringPlans(
-      req as Request,
-      res as Response
-    );
+    await InternalPartnersController.checkExpiringPlans(req as Request, res as Response);
 
     expect(statusMock).toHaveBeenCalledWith(500);
     expect(jsonMock).toHaveBeenCalledWith({

=== server/interfaces/http/partners/internalPartnersController.ts — diff ===
@@ -1,12 +1,12 @@
 import type { Request, Response } from 'express';
-import { checkExpiringPartnerPlansApplicationUseCase } from '../../../application/usecases/checkExpiringPartnerPlansApplicationUseCase';
+import { runListingPlanMaintenanceApplicationUseCase } from '../../../application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase';
 
 // Chamado pelo job agendado checkExpiringPlans; a chave já foi conferida por verifyInternalJobKey.
 export class InternalPartnersController {
   static async checkExpiringPlans(_req: Request, res: Response): Promise<Response> {
     try {
-      const notified = await checkExpiringPartnerPlansApplicationUseCase();
-      return res.status(200).json({ notified });
+      const result = await runListingPlanMaintenanceApplicationUseCase();
+      return res.status(200).json(result);
     } catch (error) {
       console.error('[partners.checkExpiringPlansJob]', {
         name: error instanceof Error ? error.name : 'UnknownError',

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 167 arquivos, 893 testes, `npm run build`;
- `npm run test:rules` → 4 arquivos, 62 testes.

FIREBASE: publique o índice novo (`firebase deploy --only firestore:indexes`) e as regras.

Responda no formato do AGENTS.md §16.3.
~~~~
