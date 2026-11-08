# Prompt 18.2.3 — Visualizações de visitantes nos insights

> Lote 12, gerado do commit de referência `45b17ec` da branch `claude/agents-md-v2`. Aplique depois do 18.2.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.2.3 — Visualizações de visitantes nos insights

Decisão de 2026-10-19 (opção B): visitante sem login conta visualização; relatório com total e divisão em percentual.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint (AGENTS.md §13).

CONTEXTO: o modal de detalhe dava erro para quem não estava logado ("Usuário não autenticado"), porque o registro de visualização exigia login. A visualização do visitante não era contada. Além disso, o relatório do parceiro chamava as métricas sem token e mostrava sempre zero.

DECISÃO (2026-10-19, opção B):
- o número principal "Visualizações" conta todas as aberturas, com ou sem login;
- logo abaixo aparece a divisão em percentual: "Com conta no Use Guide" e "Visitantes";
- não se grava uid nem IP;
- a mesma pessoa abrindo o mesmo item de novo em até 30 minutos não soma.

O QUE MUDA:
1) Servidor, domínio insights:
   - POST /api/insights/track usa identifyUserIfPresent (novo em authMiddleware): segue sem token e verifica o token quando ele existe;
   - o serviço grava dois contadores por item e por dia, em interactionStats/{colecao}_{itemId}_{AAAA-MM-DD} (dia no fuso de Fortaleza): viewsSignedIn e viewsAnonymous (além de whatsapp_click, share e favorite);
   - a deduplicação usa interactionGuards/{chave HMAC}, com expiresAt para o TTL; a chave vem de INSIGHTS_VIEWER_KEY e é calculada por ViewerKeyPort e HmacViewerKeyAdapter;
   - sem a chave, a rota responde 503 INSIGHTS_UNAVAILABLE;
   - GET /api/insights/stats/:itemCollection/:itemId exige login e checa no backend se quem pede é o dono ou admin (403 FORBIDDEN);
   - schemas Zod em schemas/insightsSchemas.ts; o TrackInteractionDTO e a coleção interactions saem.
2) server/infrastructure/config/trustProxy.ts (novo): `trust proxy` recebe o número exato de proxies, vindo de TRUST_PROXY_HOPS (§7.4).
3) server.ts:
   - usa resolveTrustProxyHops;
   - o handler global de erros deixa de devolver err.message (§7.10 A05).
4) Cliente:
   - firebaseApiFetch ganha optionalAuth;
   - InsightsAdapter rastreia com optionalAuth e lê as métricas com requireAuth, lançando erro se a resposta não for ok;
   - src/shared/lib/insights.ts (sem uso) sai.
5) ReportsView (473 linhas) foi dividido em components/reports/* e hooks/useEntityReport.ts, e traduzido. As traduções novas ficam em src/shared/i18n/insightsResources.ts (pt-BR, en, fr), registradas em resources.ts.
6) firestore.rules: interactionStats e interactionGuards com `allow read, write: if false`, com testes. firestore.indexes.json: o TTL passa para interactionGuards.expiresAt.
7) .env.example: TRUST_PROXY_HOPS e INSIGHTS_VIEWER_KEY. docs/arquitetura/debitos.md atualizado.

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- docs/arquitetura/debitos.md (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.security.test.ts (alterar)
- server.ts (alterar)
- server/domain/insights/adapters/firebaseAdminInsightsAdapter.ts (alterar)
- server/domain/insights/adapters/hmacViewerKeyAdapter.test.ts (criar)
- server/domain/insights/adapters/hmacViewerKeyAdapter.ts (criar)
- server/domain/insights/controllers/insightsController.test.ts (criar)
- server/domain/insights/controllers/insightsController.ts (alterar)
- server/domain/insights/dtos/TrackInteractionDTO.ts (apagar)
- server/domain/insights/errors/insightsErrors.ts (criar)
- server/domain/insights/factory.ts (alterar)
- server/domain/insights/ports/insightsRepositoryPort.ts (alterar)
- server/domain/insights/ports/viewerKeyPort.ts (criar)
- server/domain/insights/routes/insightsRoutes.ts (alterar)
- server/domain/insights/schemas/insightsSchemas.ts (criar)
- server/domain/insights/services/insightsService.test.ts (alterar)
- server/domain/insights/services/insightsService.ts (alterar)
- server/domain/insights/types/interaction.ts (alterar)
- server/domain/insights/utils/businessDay.ts (criar)
- server/infrastructure/auth/authMiddleware.ts (alterar)
- server/infrastructure/config/trustProxy.test.ts (criar)
- server/infrastructure/config/trustProxy.ts (criar)
- server/infrastructure/securityAudit.test.ts (alterar)
- src/domain/insights/adapters/InsightsAdapter.ts (alterar)
- src/domain/insights/application/usecases/getItemStatsUseCase.ts (alterar)
- src/domain/insights/components/ReportsView.tsx (alterar)
- src/domain/insights/components/reports/PendingReviewCard.tsx (criar)
- src/domain/insights/components/reports/PendingReviewsPanel.tsx (criar)
- src/domain/insights/components/reports/ReportsEntityPicker.tsx (criar)
- src/domain/insights/components/reports/ReportsStatsGrid.test.tsx (criar)
- src/domain/insights/components/reports/ReportsStatsGrid.tsx (criar)
- src/domain/insights/components/reports/ReportsViewsChart.tsx (criar)
- src/domain/insights/hooks/useEntityReport.ts (criar)
- src/domain/insights/ports/insightsPort.ts (alterar)
- src/domain/insights/types/interaction.ts (alterar)
- src/domain/insights/types/report.ts (criar)
- src/domain/insights/utils/audienceShare.test.ts (criar)
- src/domain/insights/utils/audienceShare.ts (criar)
- src/domain/insights/utils/reviewDate.ts (criar)
- src/shared/i18n/insightsResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/infrastructure/firebase/firebaseApiFetch.ts (alterar)
- src/shared/lib/insights.ts (apagar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -55,3 +55,11 @@ FIREBASE_PROJECT_ID=
 FIRESTORE_DATABASE_ID=
 FIREBASE_STORAGE_BUCKET=
 APP_CHECK_REQUIRED=false
+
+# Proxies na frente do Express (AGENTS.md §7.4). Cloud Run atrás do Firebase Hosting: confira nos logs
+# o X-Forwarded-For e ajuste. Obrigatório em produção; em desenvolvimento o padrão é 1.
+TRUST_PROXY_HOPS=
+
+# Insights: chave HMAC (≥ 32 caracteres) que pseudonimiza uid/IP na deduplicação de visualizações.
+# Secret Manager em produção; chave diferente no AI Studio. Sem ela, /api/insights/track responde 503.
+INSIGHTS_VIEWER_KEY=

=== docs/arquitetura/debitos.md — diff ===
@@ -12,7 +12,7 @@
 | B12 | `application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts` (notificação de falha de cobrança) | §12.5 (texto do backend em pt-BR) | baixo | `notifications` passar a aceitar chave de tradução e gerar no idioma do parceiro |
 | B13 | `application/usecases/bookings/*` (horário cancelado, reembolso que falhou) | §8.7 (avisar o comprador) e §7.10 A09 (alerta ao admin) | médio — o comprador só descobre o cancelamento em "Minhas reservas" e a falha de reembolso fica só no log | `notifications` aceitar destinatário usuário e admin (hoje só `recipientPartnerId`) |
 | B14 | UX — itens da auditoria de 2026-10-12 que pedem decisão de produto | §11 (UX) e §15 item 4 | baixo a médio | (a) preferências de notificação do parceiro estão em "Sobre o app" (`content/components/AboutView.tsx`), deveriam ir para Configurações; (b) "Ver todos" da Explore abre a listagem sem a busca e os filtros aplicados (`GridView` não tem filtros); (c) modais de hospedagem e restaurante não têm botão de mapa (`mapLink`); (d) "Programa de Parceiros" aberto pelo menu não volta ao menu ao fechar |
-| B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `insights/components/ReportsView.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |
+| B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |
 | B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7, §13 | médio | seção de reservas aparece para hospedagem/restaurante; ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; `PartnerItemForms.tsx` sem uso; `Step2ContactInfo.tsx` (516 linhas) e `Step5Media.tsx` (756) acima de 400 linhas |
 | B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
@@ -21,6 +21,7 @@
 
 | ID | Resolução |
 |---|---|
+| Erro no modal de detalhe e métricas zeradas — Prompt 18.2.3 | decisão de 2026-10-19 (opção B): `/api/insights/track` aceita visitante sem login (o token só é anexado quando há usuário); cada item grava dois contadores por dia (`viewsSignedIn`, `viewsAnonymous`) em `interactionStats`, sem uid nem IP; repetição em 30 min não soma (guarda `interactionGuards` com chave HMAC de uid/IP e TTL em `expiresAt`); o relatório mostra o total e a divisão em percentual; `/api/insights/stats/:colecao/:id` exige login e checa o dono no backend (antes o cliente chamava sem token e recebia sempre zero); `ReportsView` dividido e traduzido (sai de B16); `trust proxy` com número de proxies de `TRUST_PROXY_HOPS` (§7.4); handler global de erros do `server.ts` deixou de devolver `err.message` (§7.10 A05); `src/shared/lib/insights.ts` (sem uso, `shared → domain`) removido |
 | B19 | Prompt 18.2.2 (decisão de 2026-10-19): o contato do evento fica só nos campos do topo (`phone`, `websiteLink`, `instagramLink`, `bookingLink`), como nos itens do guia; o objeto `contact` deixou de ser lido e gravado; `eventsService` dividido em `EventsService` (anúncios) e `EventOccurrencesService` (sessões), com as regras de acesso em `eventAccess.ts` |
 | Sessões do evento no editor — Prompt 18.2.1 | `EventSessionsField` e `saveEventSessionsUseCase` (events) usados pelo parceiro e pelo admin (decisão de 2026-10-19, opção A): o parceiro passa a editar datas, horários e capacidade; a data do evento é derivada das sessões; o editor do admin deixa de importar o gerenciador de ingressos de outro domínio (§5.2); `PartnerEventForm` dividido em seções (634 → 67 linhas) e modal em `PartnerEventEditor` (`PartnerPanel` abaixo de 400 linhas); o editor de evento não fecha ao clicar fora; botões do editor de evento com nome acessível |
 | Editor único de cadastro — Prompt 18.2 | `ListingEditor` (partners) usado pelo painel do parceiro e pelo admin (composição `AdminPanelComposition`); o admin edita hospedagem, restaurante, atração, passeio, translado, aluguel e perfil de produtor com os mesmos campos da inscrição; o editor não fecha ao clicar fora; `PartnerPanel.tsx` abaixo de 400 linhas; datas no fuso de Fortaleza no gerenciador de ingressos (AI Studio, lote 9); três critérios de "pronto para receber" unificados (17.2); preço de plano por `Intl` (17.1) |

=== firestore.indexes.json — diff ===
@@ -295,8 +295,8 @@
       "indexes": []
     },
     {
-      "collectionGroup": "interactions",
-      "fieldPath": "timestamp",
+      "collectionGroup": "interactionGuards",
+      "fieldPath": "expiresAt",
       "ttl": true,
       "indexes": []
     }

=== firestore.rules — diff ===
@@ -149,10 +149,12 @@ service cloud.firestore {
     match /paymentTransactions/{transactionId} {
       allow read, write: if false;
     }
-    match /interactions/{interactionId} {
-      allow read:
-        if isAdmin();
-      allow create, update, delete: if false;
+    // Métricas lidas só pela API (dono do item ou admin); as guardas de deduplicação nunca saem do backend.
+    match /interactionStats/{statId} {
+      allow read, write: if false;
+    }
+    match /interactionGuards/{guardId} {
+      allow read, write: if false;
     }
     match /{document=**} {
       allow read, write: if false;

=== firestore.rules.security.test.ts — diff ===
@@ -142,12 +142,15 @@ describe('Firestore Rules — Security Suite', () => {
         status: 'approved',
       });
 
-      await db.doc('interactions/inter-1').set({
+      await db.doc('interactionStats/items_item-1_2026-10-19').set({
         itemId: 'item-1',
         itemCollection: 'items',
-        type: 'view',
+        day: '2026-10-19',
+        viewsSignedIn: 1,
       });
 
+      await db.doc('interactionGuards/guard-1').set({ expiresAt: new Date() });
+
       await db.doc('favorites/fav-1').set({
         userId: 'user-1',
         itemId: 'item-1',
@@ -247,25 +250,31 @@ describe('Firestore Rules — Security Suite', () => {
       await assertFails(setDoc(doc(db, 'partnerSubscriptions/partner-1'), { status: 'active' }));
     });
 
-    it('admin with admin=true claim → interactions and partners read allowed', async () => {
+    it('admin with admin=true claim → partners read allowed', async () => {
       const db = testEnv
         .authenticatedContext('admin-user', { admin: true })
         .firestore();
-      await assertSucceeds(getDoc(doc(db, 'interactions/inter-1')));
       await assertSucceeds(getDoc(doc(db, 'partners/partner-1')));
     });
 
-    it('fake admin with admin=false and role=admin → interactions and partners read denied', async () => {
+    it('fake admin with admin=false and role=admin → partners read denied', async () => {
       const fakeAdminDb = testEnv
         .authenticatedContext('user-1', { admin: false, role: 'admin' })
         .firestore();
-      await assertFails(getDoc(doc(fakeAdminDb, 'interactions/inter-1')));
       await assertFails(getDoc(doc(fakeAdminDb, 'partners/partner-1')));
     });
 
-    it('non-admin → interactions read denied', async () => {
-      const db = testEnv.authenticatedContext('user-1').firestore();
-      await assertFails(getDoc(doc(db, 'interactions/inter-1')));
+    it('insights → interactionStats e interactionGuards negados até para admin', async () => {
+      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
+      const ownerDb = testEnv.authenticatedContext('partner-1').firestore();
+      const anonDb = testEnv.unauthenticatedContext().firestore();
+      for (const db of [adminDb, ownerDb, anonDb]) {
+        await assertFails(getDoc(doc(db, 'interactionStats/items_item-1_2026-10-19')));
+        await assertFails(getDoc(doc(db, 'interactionGuards/guard-1')));
+        await assertFails(
+          setDoc(doc(db, 'interactionStats/items_item-1_2026-10-19'), { viewsAnonymous: 999 })
+        );
+      }
     });
   });
 
@@ -336,11 +345,13 @@ describe('Firestore Rules — Security Suite', () => {
       await assertFails(deleteDoc(doc(db, 'transactions/tx-1')));
     });
 
-    it('client → interactions write negado', async () => {
+    it('client → interactionStats e interactionGuards write negado', async () => {
       const db = testEnv.authenticatedContext('user-1').firestore();
-      await assertFails(setDoc(doc(db, 'interactions/inter-new'), { type: 'view' }));
-      await assertFails(updateDoc(doc(db, 'interactions/inter-1'), { type: 'share' }));
-      await assertFails(deleteDoc(doc(db, 'interactions/inter-1')));
+      const statPath = 'interactionStats/items_item-1_2026-10-19';
+      await assertFails(updateDoc(doc(db, statPath), { viewsSignedIn: 999 }));
+      await assertFails(deleteDoc(doc(db, statPath)));
+      await assertFails(setDoc(doc(db, 'interactionGuards/guard-new'), { expiresAt: new Date() }));
+      await assertFails(deleteDoc(doc(db, 'interactionGuards/guard-1')));
     });
 
     it('client → favorites write negado', async () => {

=== server.ts — diff ===
@@ -20,10 +20,14 @@ import adminRouter from './server/domain/admin/routes/adminRoutes';
 import favoriteRouter from './server/domain/favorites/routes/favoriteRoutes';
 import mediaRouter from './server/domain/media/routes/mediaRoutes';
 import billingRouter from './server/interfaces/http/billing/billingRoutes';
-import { bookingsRouter, partnerOffersRouter } from './server/interfaces/http/bookings/bookingsRoutes';
+import {
+  bookingsRouter,
+  partnerOffersRouter,
+} from './server/interfaces/http/bookings/bookingsRoutes';
 import { InternalBookingsController } from './server/interfaces/http/bookings/internalBookingsController';
 import { InternalPartnersController } from './server/interfaces/http/partners/internalPartnersController';
 import { verifyInternalJobKey } from './server/infrastructure/auth/internalJobAuth';
+import { resolveTrustProxyHops } from './server/infrastructure/config/trustProxy';
 import { renderSeoPageApplicationUseCase } from './server/application/usecases/renderSeoPageApplicationUseCase';
 import { renderSitemapApplicationUseCase } from './server/application/usecases/renderSitemapApplicationUseCase';
 import { verifyAppCheck } from './server/infrastructure/auth/appCheckMiddleware';
@@ -35,7 +39,7 @@ async function startServer() {
   if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
     throw new Error(`PORT inválida: ${rawPort}`);
   }
-  app.set('trust proxy', true);
+  app.set('trust proxy', resolveTrustProxyHops());
   const isProduction = process.env.NODE_ENV === 'production';
   if (isProduction) {
     app.use(
@@ -135,7 +139,11 @@ async function startServer() {
     TicketingController.expireOrdersInternalJob
   );
   app.post('/internal/bookings/expire', verifyInternalJobKey, InternalBookingsController.expire);
-  app.post('/internal/bookings/complete', verifyInternalJobKey, InternalBookingsController.complete);
+  app.post(
+    '/internal/bookings/complete',
+    verifyInternalJobKey,
+    InternalBookingsController.complete
+  );
   app.post(
     '/internal/partners/check-expiring-plans',
     verifyInternalJobKey,
@@ -198,16 +206,27 @@ async function startServer() {
   app.use('/api/favorites', favoriteRouter);
   app.use('/api/media', mediaRouter);
 
-  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
-    console.error('[Error Handler]', err);
-    const statusCode = err.status || err.statusCode || 500;
-    res.status(statusCode).json({
-      error: {
-        message: err.message || 'Erro interno do servidor',
-        status: statusCode,
-      },
-    });
-  });
+  // Erros não tratados (inclusive do body-parser) nunca devolvem a mensagem interna (AGENTS.md §10.2).
+  app.use(
+    (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
+      const details = (err ?? {}) as {
+        name?: string;
+        type?: string;
+        status?: number;
+        statusCode?: number;
+      };
+      const rawStatus = details.status ?? details.statusCode;
+      const statusCode = rawStatus && rawStatus >= 400 && rawStatus < 500 ? rawStatus : 500;
+      console.error('[Error Handler]', { name: details.name, type: details.type, statusCode });
+      const error =
+        statusCode === 413
+          ? { code: 'PAYLOAD_TOO_LARGE', message: 'Requisição grande demais.' }
+          : statusCode < 500
+            ? { code: 'BAD_REQUEST', message: 'Requisição inválida.' }
+            : { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' };
+      res.status(statusCode).json({ error });
+    }
+  );
 
   app.get('/sitemap.xml', async (_req, res) => {
     try {

=== server/domain/insights/adapters/firebaseAdminInsightsAdapter.ts — diff ===
@@ -1,85 +1,110 @@
-import { InsightsRepositoryPort, CreateInteractionData } from '../ports/insightsRepositoryPort';
-import type { InteractionType, ItemStats } from '../types/interaction';
+import { FieldValue, Timestamp } from 'firebase-admin/firestore';
 import { adminDb } from '../../../infrastructure/firebase/adminClient';
-import { FieldValue } from 'firebase-admin/firestore';
+import type {
+  InsightsRepositoryPort,
+  RecordInteractionInput,
+} from '../ports/insightsRepositoryPort';
+import type { InteractionCounter, ItemStats } from '../types/interaction';
+import { lastBusinessDays } from '../utils/businessDay';
 
-// O tipo gravado é singular ('view'); o contador da resposta é 'views'.
-const STAT_COUNTER: Record<InteractionType, 'views' | 'whatsapp_click' | 'share' | 'favorite'> = {
-  view: 'views',
-  whatsapp_click: 'whatsapp_click',
-  share: 'share',
-  favorite: 'favorite',
-};
+// Coleções só do backend (firestore.rules nega leitura e escrita ao cliente).
+const STATS_COLLECTION = 'interactionStats';
+const GUARDS_COLLECTION = 'interactionGuards';
+const HISTORY_DAYS = 7;
+const COUNTERS: InteractionCounter[] = [
+  'viewsSignedIn',
+  'viewsAnonymous',
+  'whatsapp_click',
+  'share',
+  'favorite',
+];
 
-/** Dia no fuso do negócio, para o gráfico dos últimos 7 dias não depender do fuso do servidor. */
-function formatBusinessDay(date: Date): string {
-  return date.toLocaleDateString('pt-BR', {
-    day: '2-digit',
-    month: '2-digit',
-    timeZone: 'America/Fortaleza',
-  });
+function statsDocId(itemCollection: string, itemId: string, day: string): string {
+  return `${itemCollection}_${itemId}_${day}`;
+}
+
+function counterValue(data: Record<string, unknown>, counter: InteractionCounter): number {
+  const value = data[counter];
+  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
+}
+
+/** Rótulo dd/mm do gráfico a partir do dia AAAA-MM-DD. */
+function dayLabel(day: string): string {
+  const [, month, date] = day.split('-');
+  return `${date}/${month}`;
 }
 
 export class FirebaseAdminInsightsAdapter implements InsightsRepositoryPort {
-  async recordInteraction(data: CreateInteractionData): Promise<void> {
-    await adminDb.collection('interactions').add({
-      itemId: data.itemId,
-      itemCollection: data.itemCollection,
-      type: data.type,
-      timestamp: FieldValue.serverTimestamp(),
-      userId: data.userId || null,
-      partnerId: data.partnerId || null,
+  async recordInteraction(input: RecordInteractionInput): Promise<boolean> {
+    const guardRef = adminDb.collection(GUARDS_COLLECTION).doc(input.guardId);
+    const statsRef = adminDb
+      .collection(STATS_COLLECTION)
+      .doc(statsDocId(input.itemCollection, input.itemId, input.day));
+
+    return adminDb.runTransaction(async (transaction) => {
+      const guard = await transaction.get(guardRef);
+      const expiresAt = guard.exists ? guard.get('expiresAt') : null;
+      if (expiresAt instanceof Timestamp && expiresAt.toMillis() > input.now.getTime()) {
+        return false;
+      }
+      // expiresAt também alimenta a política de TTL do Firestore, que apaga as chaves vencidas.
+      transaction.set(guardRef, {
+        expiresAt: Timestamp.fromMillis(input.now.getTime() + input.guardWindowMs),
+      });
+      transaction.set(
+        statsRef,
+        {
+          itemId: input.itemId,
+          itemCollection: input.itemCollection,
+          day: input.day,
+          [input.counter]: FieldValue.increment(1),
+        },
+        { merge: true }
+      );
+      return true;
     });
   }
 
-  async getItemStats(itemId: string, itemCollection: 'items' | 'events'): Promise<ItemStats> {
+  async getItemStats(
+    itemId: string,
+    itemCollection: 'items' | 'events',
+    today: Date
+  ): Promise<ItemStats> {
     const snapshot = await adminDb
-      .collection('interactions')
+      .collection(STATS_COLLECTION)
       .where('itemId', '==', itemId)
       .where('itemCollection', '==', itemCollection)
       .get();
 
-    const stats: ItemStats = {
-      views: 0,
-      whatsapp_click: 0,
-      share: 0,
-      favorite: 0,
-      history: [],
-    };
-
-    const last7Days: Record<string, number> = {};
-    for (let i = 6; i >= 0; i--) {
-      const d = new Date();
-      d.setDate(d.getDate() - i);
-      const dateStr = formatBusinessDay(d);
-      last7Days[dateStr] = 0;
-    }
-
-    snapshot.forEach((doc) => {
-      const docData = doc.data();
-      const counter = STAT_COUNTER[docData.type as InteractionType];
-      if (counter) {
-        stats[counter] += 1;
+    const totals = Object.fromEntries(COUNTERS.map((counter) => [counter, 0])) as Record<
+      InteractionCounter,
+      number
+    >;
+    const viewsByDay = new Map<string, number>();
+    for (const doc of snapshot.docs) {
+      const data = doc.data();
+      for (const counter of COUNTERS) {
+        totals[counter] += counterValue(data, counter);
       }
-
-      if (docData.type === 'view' && docData.timestamp) {
-        let dateVal: Date;
-        if (typeof docData.timestamp.toDate === 'function') {
-          dateVal = docData.timestamp.toDate();
-        } else if (typeof docData.timestamp.seconds === 'number') {
-          dateVal = new Date(docData.timestamp.seconds * 1000);
-        } else {
-          dateVal = new Date(docData.timestamp);
-        }
-
-        const date = formatBusinessDay(dateVal);
-        if (date in last7Days && typeof last7Days[date] === 'number') {
-          last7Days[date] += 1;
-        }
+      if (typeof data.day === 'string') {
+        viewsByDay.set(
+          data.day,
+          counterValue(data, 'viewsSignedIn') + counterValue(data, 'viewsAnonymous')
+        );
       }
-    });
+    }
 
-    stats.history = Object.entries(last7Days).map(([date, views]) => ({ date, views }));
-    return stats;
+    return {
+      views: totals.viewsSignedIn + totals.viewsAnonymous,
+      viewsSignedIn: totals.viewsSignedIn,
+      viewsAnonymous: totals.viewsAnonymous,
+      whatsapp_click: totals.whatsapp_click,
+      share: totals.share,
+      favorite: totals.favorite,
+      history: lastBusinessDays(today, HISTORY_DAYS).map((day) => ({
+        date: dayLabel(day),
+        views: viewsByDay.get(day) ?? 0,
+      })),
+    };
   }
 }

=== server/domain/insights/adapters/hmacViewerKeyAdapter.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InsightsUnavailableError } from '../errors/insightsErrors';
import { HmacViewerKeyAdapter } from './hmacViewerKeyAdapter';

const KEY = 'k'.repeat(32);

describe('HmacViewerKeyAdapter', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('gera a mesma chave para o mesmo visitante e não expõe o valor original', () => {
    vi.stubEnv('INSIGHTS_VIEWER_KEY', KEY);
    const adapter = new HmacViewerKeyAdapter();
    const key = adapter.keyFor('ip:203.0.113.9|view|items|item-1');
    expect(key).toBe(adapter.keyFor('ip:203.0.113.9|view|items|item-1'));
    expect(key).not.toContain('203.0.113.9');
    expect(key).not.toBe(adapter.keyFor('ip:203.0.113.10|view|items|item-1'));
  });

  it('falha na primeira chamada sem chave ou com chave curta', () => {
    vi.stubEnv('INSIGHTS_VIEWER_KEY', 'curta');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => new HmacViewerKeyAdapter().keyFor('u:1')).toThrow(InsightsUnavailableError);
  });
});

=== server/domain/insights/adapters/hmacViewerKeyAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { createHmac } from 'crypto';
import { InsightsUnavailableError } from '../errors/insightsErrors';
import type { ViewerKeyPort } from '../ports/viewerKeyPort';

/**
 * HMAC-SHA-256 com a chave `INSIGHTS_VIEWER_KEY` (Secret Manager): a chave gravada não revela o
 * uid nem o IP. Sem segredo configurado, falha na primeira chamada (AGENTS.md §2.2 item 4, §7.7).
 */
export class HmacViewerKeyAdapter implements ViewerKeyPort {
  keyFor(viewer: string): string {
    const secret = process.env.INSIGHTS_VIEWER_KEY?.trim();
    if (!secret || secret.length < 32) {
      console.error('[insights] INSIGHTS_VIEWER_KEY ausente ou com menos de 32 caracteres.');
      throw new InsightsUnavailableError();
    }
    return createHmac('sha256', secret).update(viewer).digest('base64url');
  }
}

=== server/domain/insights/controllers/insightsController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { InsightsAccessError, InsightsUnavailableError } from '../errors/insightsErrors';
import { insightsService } from '../factory';
import { InsightsController } from './insightsController';

vi.mock('../factory', () => ({
  insightsService: { trackInteraction: vi.fn(), getItemStats: vi.fn() },
}));

const USER = { uid: 'partner-1', admin: false, emailVerified: true, authTime: 1 };

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

function request(partial: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return partial as AuthenticatedRequest;
}

describe('InsightsController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('track sem login conta como visitante e responde 202', async () => {
    vi.mocked(insightsService.trackInteraction).mockResolvedValue(true);
    const res = mockResponse();
    await InsightsController.trackInteraction(
      request({
        body: { itemId: 'item-1', itemCollection: 'items', type: 'view' },
        ip: '203.0.113.9',
      }),
      res as unknown as Response
    );
    expect(insightsService.trackInteraction).toHaveBeenCalledWith(
      expect.objectContaining({ uid: null, ip: '203.0.113.9' })
    );
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({ counted: true });
  });

  it('track com campo extra responde 400 VALIDATION_ERROR', async () => {
    const res = mockResponse();
    await InsightsController.trackInteraction(
      request({
        body: { itemId: 'item-1', itemCollection: 'items', type: 'view', uid: 'forjado' },
      }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('VALIDATION_ERROR');
    expect(insightsService.trackInteraction).not.toHaveBeenCalled();
  });

  it('track sem chave HMAC responde 503 INSIGHTS_UNAVAILABLE', async () => {
    vi.mocked(insightsService.trackInteraction).mockRejectedValue(new InsightsUnavailableError());
    const res = mockResponse();
    await InsightsController.trackInteraction(
      request({ body: { itemId: 'item-1', itemCollection: 'items', type: 'view' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('INSIGHTS_UNAVAILABLE');
  });

  it('stats de item de outro parceiro responde 403 FORBIDDEN', async () => {
    vi.mocked(insightsService.getItemStats).mockRejectedValue(new InsightsAccessError());
    const res = mockResponse();
    await InsightsController.getItemStats(
      request({ user: USER, params: { itemCollection: 'items', itemId: 'item-b' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('FORBIDDEN');
  });

  it('stats sem login responde 401', async () => {
    const res = mockResponse();
    await InsightsController.getItemStats(
      request({ params: { itemCollection: 'items', itemId: 'item-1' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(insightsService.getItemStats).not.toHaveBeenCalled();
  });
});

=== server/domain/insights/controllers/insightsController.ts — diff ===
@@ -1,80 +1,66 @@
-import { Response } from 'express';
-import { z } from 'zod';
+import type { Response } from 'express';
+import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
+import { InsightsAccessError, InsightsUnavailableError } from '../errors/insightsErrors';
 import { insightsService } from '../factory';
-import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
+import { getItemStatsParamsSchema, trackInteractionSchema } from '../schemas/insightsSchemas';
 
-const trackInteractionSchema = z
-  .object({
-    itemId: z.string().trim().min(1, 'ID do item é obrigatório'),
-    itemCollection: z.enum(['items', 'events']),
-    type: z.enum(['view', 'whatsapp_click', 'share', 'favorite']),
-  })
-  .strict();
-
-const getItemStatsParamsSchema = z.object({
-  itemId: z.string().trim().min(1, 'ID do item é obrigatório'),
-  itemCollection: z.enum(['items', 'events']).optional(),
-});
+function sendError(res: Response, status: number, code: string, message: string): void {
+  res.status(status).json({ error: { code, message } });
+}
 
 export class InsightsController {
   static async trackInteraction(req: AuthenticatedRequest, res: Response): Promise<void> {
+    const parsed = trackInteractionSchema.safeParse(req.body);
+    if (!parsed.success) {
+      sendError(res, 400, 'VALIDATION_ERROR', 'Interação inválida.');
+      return;
+    }
     try {
-      const parseResult = trackInteractionSchema.safeParse(req.body);
-      if (!parseResult.success) {
-        res.status(400).json({
-          error: 'Erro de validação no payload de interação',
-          details: parseResult.error.issues,
-        });
+      const counted = await insightsService.trackInteraction({
+        ...parsed.data,
+        uid: req.user?.uid ?? null,
+        ip: req.ip ?? null,
+      });
+      // 202: a interação foi aceita; repetida na janela de 30 min não soma de novo.
+      res.status(202).json({ counted });
+    } catch (error) {
+      if (error instanceof InsightsUnavailableError) {
+        sendError(res, 503, error.code, error.message);
         return;
       }
-
-      const userId = req.user?.uid ?? null;
-
-      await insightsService.trackInteraction({
-        itemId: parseResult.data.itemId,
-        itemCollection: parseResult.data.itemCollection,
-        type: parseResult.data.type,
-        userId,
+      console.error('[InsightsController.trackInteraction]', {
+        name: error instanceof Error ? error.name : 'UnknownError',
       });
-
-      res.status(200).json({ success: true, message: 'Interação registrada com sucesso.' });
-    } catch (error) {
-      console.error('[InsightsController.trackInteraction Error]:', error);
-      res.status(500).json({ error: 'Erro interno ao registrar interação.' });
+      sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível registrar a interação.');
     }
   }
 
   static async getItemStats(req: AuthenticatedRequest, res: Response): Promise<void> {
+    if (!req.user) {
+      sendError(res, 401, 'UNAUTHENTICATED', 'Faça login para ver as métricas.');
+      return;
+    }
+    const parsed = getItemStatsParamsSchema.safeParse(req.params);
+    if (!parsed.success) {
+      sendError(res, 400, 'VALIDATION_ERROR', 'Item inválido.');
+      return;
+    }
     try {
-      if (!req.user) {
-        res.status(401).json({ error: 'Não autenticado' });
-        return;
-      }
-
-      const parseResult = getItemStatsParamsSchema.safeParse(req.params);
-      if (!parseResult.success) {
-        res.status(400).json({
-          error: 'Erro de validação no parâmetro da requisição',
-          details: parseResult.error.issues,
-        });
-        return;
-      }
-
-      const itemCollection = (parseResult.data.itemCollection ||
-        req.query.itemCollection ||
-        'items') as 'items' | 'events';
-      const stats = await insightsService.getItemStats(parseResult.data.itemId, itemCollection, {
-        uid: req.user.uid,
-        admin: req.user.admin,
-      });
+      const stats = await insightsService.getItemStats(
+        parsed.data.itemId,
+        parsed.data.itemCollection,
+        { uid: req.user.uid, admin: req.user.admin }
+      );
       res.status(200).json({ success: true, data: stats });
-    } catch (error: any) {
-      if (error?.message === 'FORBIDDEN') {
-        res.status(403).json({ error: 'Acesso não autorizado às métricas deste item.' });
+    } catch (error) {
+      if (error instanceof InsightsAccessError) {
+        sendError(res, 403, error.code, error.message);
         return;
       }
-      console.error('[InsightsController.getItemStats Error]:', error);
-      res.status(500).json({ error: 'Erro interno ao obter estatísticas.' });
+      console.error('[InsightsController.getItemStats]', {
+        name: error instanceof Error ? error.name : 'UnknownError',
+      });
+      sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível carregar as métricas.');
     }
   }
 }

=== server/domain/insights/dtos/TrackInteractionDTO.ts — APAGUE este arquivo ===

=== server/domain/insights/errors/insightsErrors.ts — ARQUIVO NOVO, conteúdo completo ===
export class InsightsAccessError extends Error {
  readonly code = 'FORBIDDEN';

  constructor() {
    super('Acesso não autorizado às métricas deste item.');
    this.name = 'InsightsAccessError';
  }
}

/** Integração obrigatória ausente (ex.: chave HMAC); a rota responde 503 em vez de derrubar o processo. */
export class InsightsUnavailableError extends Error {
  readonly code = 'INSIGHTS_UNAVAILABLE';

  constructor() {
    super('Métricas indisponíveis no momento.');
    this.name = 'InsightsUnavailableError';
  }
}

=== server/domain/insights/factory.ts — diff ===
@@ -1,5 +1,8 @@
 import { FirebaseAdminInsightsAdapter } from './adapters/firebaseAdminInsightsAdapter';
+import { HmacViewerKeyAdapter } from './adapters/hmacViewerKeyAdapter';
 import { InsightsService } from './services/insightsService';
 
-const repoAdapter = new FirebaseAdminInsightsAdapter();
-export const insightsService = new InsightsService(repoAdapter);
+export const insightsService = new InsightsService(
+  new FirebaseAdminInsightsAdapter(),
+  new HmacViewerKeyAdapter()
+);

=== server/domain/insights/ports/insightsRepositoryPort.ts — diff ===
@@ -1,14 +1,19 @@
-import { InteractionType, ItemStats } from '../types/interaction';
+import type { InteractionCounter, ItemStats } from '../types/interaction';
 
-export interface CreateInteractionData {
+export interface RecordInteractionInput {
   itemId: string;
   itemCollection: 'items' | 'events';
-  type: InteractionType;
-  userId?: string | null | undefined;
-  partnerId?: string | null | undefined;
+  counter: InteractionCounter;
+  /** Dia no fuso do negócio (AAAA-MM-DD). */
+  day: string;
+  /** Chave opaca de quem interagiu com este item; só serve para não contar duas vezes. */
+  guardId: string;
+  now: Date;
+  guardWindowMs: number;
 }
 
 export interface InsightsRepositoryPort {
-  recordInteraction(data: CreateInteractionData): Promise<void>;
-  getItemStats(itemId: string, itemCollection: 'items' | 'events'): Promise<ItemStats>;
+  /** Soma 1 no contador do dia, salvo se o mesmo visitante já contou dentro da janela. */
+  recordInteraction(input: RecordInteractionInput): Promise<boolean>;
+  getItemStats(itemId: string, itemCollection: 'items' | 'events', today: Date): Promise<ItemStats>;
 }

=== server/domain/insights/ports/viewerKeyPort.ts — ARQUIVO NOVO, conteúdo completo ===
/** Transforma a identidade de quem visitou (uid ou IP) numa chave opaca, sem guardar o original. */
export interface ViewerKeyPort {
  keyFor(viewer: string): string;
}

=== server/domain/insights/routes/insightsRoutes.ts — diff ===
@@ -1,11 +1,14 @@
 import { Router } from 'express';
+import {
+  identifyUserIfPresent,
+  verifyAuthToken,
+} from '../../../infrastructure/auth/authMiddleware';
 import { InsightsController } from '../controllers/insightsController';
-import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
 
 const router = Router();
 
-router.post('/track', verifyAuthToken, InsightsController.trackInteraction);
+// Visitante sem login também é contado (decisão de 2026-10-19); o App Check de /api continua valendo.
+router.post('/track', identifyUserIfPresent, InsightsController.trackInteraction);
 router.get('/stats/:itemCollection/:itemId', verifyAuthToken, InsightsController.getItemStats);
-router.get('/stats/:itemId', verifyAuthToken, InsightsController.getItemStats);
 
 export default router;

=== server/domain/insights/schemas/insightsSchemas.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

export const trackInteractionSchema = z
  .object({
    itemId: z.string().trim().min(1, 'ID do item é obrigatório').max(200),
    itemCollection: z.enum(['items', 'events']),
    type: z.enum(['view', 'whatsapp_click', 'share', 'favorite']),
  })
  .strict();

export const getItemStatsParamsSchema = z
  .object({
    itemId: z.string().trim().min(1, 'ID do item é obrigatório').max(200),
    itemCollection: z.enum(['items', 'events']).default('items'),
  })
  .strict();

=== server/domain/insights/services/insightsService.test.ts — diff ===
@@ -1,72 +1,114 @@
-import { describe, it, expect, vi, beforeEach } from 'vitest';
-import { InsightsService } from './insightsService';
-import { InsightsRepositoryPort } from '../ports/insightsRepositoryPort';
+import { beforeEach, describe, expect, it, vi } from 'vitest';
 import { getResourceOwnerIdUseCase } from '../../guide';
+import { InsightsAccessError } from '../errors/insightsErrors';
+import type { InsightsRepositoryPort } from '../ports/insightsRepositoryPort';
+import type { ViewerKeyPort } from '../ports/viewerKeyPort';
+import { INTERACTION_GUARD_WINDOW_MS, InsightsService } from './insightsService';
 
 vi.mock('../../guide', () => ({
   getResourceOwnerIdUseCase: vi.fn(),
 }));
+vi.mock('../../events', () => ({
+  getEventListingByIdUseCase: vi.fn(),
+}));
+
+const stats = {
+  views: 10,
+  viewsSignedIn: 4,
+  viewsAnonymous: 6,
+  whatsapp_click: 2,
+  share: 1,
+  favorite: 3,
+  history: [],
+};
 
 describe('InsightsService', () => {
   let repoPort: InsightsRepositoryPort;
+  let viewerKeys: ViewerKeyPort;
   let service: InsightsService;
+  // 23:30 em Fortaleza ainda é o dia 18, embora já seja dia 19 em UTC.
+  const now = new Date('2026-10-19T02:30:00.000Z');
 
   beforeEach(() => {
     vi.clearAllMocks();
     repoPort = {
-      recordInteraction: vi.fn(),
-      getItemStats: vi.fn().mockResolvedValue({
-        views: 10,
-        whatsapp_click: 2,
-        share: 1,
-        favorite: 3,
-        history: [],
-      }),
+      recordInteraction: vi.fn().mockResolvedValue(true),
+      getItemStats: vi.fn().mockResolvedValue(stats),
     };
-    service = new InsightsService(repoPort);
+    viewerKeys = { keyFor: vi.fn((viewer: string) => `key(${viewer})`) };
+    service = new InsightsService(repoPort, viewerKeys);
   });
 
-  it('allows owner to access item stats', async () => {
-    vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('user-123');
-
-    const stats = await service.getItemStats('item-1', 'items', {
-      uid: 'user-123',
-      admin: false,
+  describe('trackInteraction', () => {
+    it('visitante sem login conta como visualização anônima, pela chave do IP', async () => {
+      await service.trackInteraction(
+        { itemId: 'item-1', itemCollection: 'items', type: 'view', ip: '203.0.113.7' },
+        now
+      );
+      expect(viewerKeys.keyFor).toHaveBeenCalledWith('ip:203.0.113.7|view|items|item-1');
+      expect(repoPort.recordInteraction).toHaveBeenCalledWith({
+        itemId: 'item-1',
+        itemCollection: 'items',
+        counter: 'viewsAnonymous',
+        day: '2026-10-18',
+        guardId: 'key(ip:203.0.113.7|view|items|item-1)',
+        now,
+        guardWindowMs: INTERACTION_GUARD_WINDOW_MS,
+      });
     });
 
-    expect(stats.views).toBe(10);
-    expect(getResourceOwnerIdUseCase).toHaveBeenCalledWith('items', 'item-1');
-  });
+    it('usuário logado conta pelo uid, mesmo com IP', async () => {
+      await service.trackInteraction(
+        { itemId: 'item-1', itemCollection: 'items', type: 'view', uid: 'u1', ip: '203.0.113.7' },
+        now
+      );
+      expect(viewerKeys.keyFor).toHaveBeenCalledWith('u:u1|view|items|item-1');
+      expect(vi.mocked(repoPort.recordInteraction).mock.calls[0]?.[0].counter).toBe(
+        'viewsSignedIn'
+      );
+    });
 
-  it('allows admin to access any item stats without checking ownership', async () => {
-    const stats = await service.getItemStats('item-1', 'items', {
-      uid: 'admin-999',
-      admin: true,
+    it('outras interações usam o próprio contador', async () => {
+      await service.trackInteraction(
+        { itemId: 'ev-1', itemCollection: 'events', type: 'share', ip: '203.0.113.7' },
+        now
+      );
+      expect(vi.mocked(repoPort.recordInteraction).mock.calls[0]?.[0].counter).toBe('share');
     });
 
-    expect(stats.views).toBe(10);
-    expect(getResourceOwnerIdUseCase).not.toHaveBeenCalled();
+    it('sem uid nem IP não conta', async () => {
+      expect(
+        await service.trackInteraction({ itemId: 'item-1', itemCollection: 'items', type: 'view' })
+      ).toBe(false);
+      expect(repoPort.recordInteraction).not.toHaveBeenCalled();
+    });
   });
 
-  it('throws FORBIDDEN when user is neither owner nor admin', async () => {
-    vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('different-owner');
+  describe('getItemStats', () => {
+    it('dono do item vê as métricas', async () => {
+      vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('user-123');
+      const result = await service.getItemStats('item-1', 'items', { uid: 'user-123' }, now);
+      expect(result.views).toBe(10);
+      expect(repoPort.getItemStats).toHaveBeenCalledWith('item-1', 'items', now);
+    });
 
-    await expect(
-      service.getItemStats('item-1', 'items', {
-        uid: 'attacker-uid',
-        admin: false,
-      })
-    ).rejects.toThrow('FORBIDDEN');
-  });
+    it('admin vê sem checar o dono', async () => {
+      await service.getItemStats('item-1', 'items', { uid: 'admin-1', admin: true });
+      expect(getResourceOwnerIdUseCase).not.toHaveBeenCalled();
+    });
 
-  it('throws FORBIDDEN when item does not exist or has no owner', async () => {
-    vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue(null);
+    it('quem não é dono nem admin recebe InsightsAccessError', async () => {
+      vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('outro-dono');
+      await expect(
+        service.getItemStats('item-1', 'items', { uid: 'intruso' })
+      ).rejects.toBeInstanceOf(InsightsAccessError);
+    });
 
-    await expect(
-      service.getItemStats('missing-item', 'items', {
-        uid: 'user-123',
-        admin: false,
-      })
-    ).rejects.toThrow('FORBIDDEN');
+    it('item sem dono também é recusado', async () => {
+      vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue(null);
+      await expect(
+        service.getItemStats('sumido', 'items', { uid: 'user-123' })
+      ).rejects.toBeInstanceOf(InsightsAccessError);
+    });
   });
 });

=== server/domain/insights/services/insightsService.ts — diff ===
@@ -1,32 +1,68 @@
-import { InsightsRepositoryPort, CreateInteractionData } from '../ports/insightsRepositoryPort';
-import { ItemStats } from '../types/interaction';
-import { getResourceOwnerIdUseCase } from '../../guide';
 import { getEventListingByIdUseCase } from '../../events';
+import { getResourceOwnerIdUseCase } from '../../guide';
+import { InsightsAccessError } from '../errors/insightsErrors';
+import type { InsightsRepositoryPort } from '../ports/insightsRepositoryPort';
+import type { ViewerKeyPort } from '../ports/viewerKeyPort';
+import type { InteractionCounter, InteractionType, ItemStats } from '../types/interaction';
+import { businessDayKey } from '../utils/businessDay';
+
+/** O mesmo visitante abrindo o mesmo item de novo em até 30 minutos conta uma vez só. */
+export const INTERACTION_GUARD_WINDOW_MS = 30 * 60 * 1000;
+
+export interface TrackInteractionInput {
+  itemId: string;
+  itemCollection: 'items' | 'events';
+  type: InteractionType;
+  /** Usuário logado, quando houver. */
+  uid?: string | null;
+  /** IP do visitante (resolvido pelo `trust proxy`); só vira chave opaca, nunca é gravado. */
+  ip?: string | null;
+}
+
+function counterFor(type: InteractionType, signedIn: boolean): InteractionCounter {
+  if (type === 'view') return signedIn ? 'viewsSignedIn' : 'viewsAnonymous';
+  return type;
+}
 
 export class InsightsService {
-  constructor(private repoPort: InsightsRepositoryPort) {}
+  constructor(
+    private readonly repoPort: InsightsRepositoryPort,
+    private readonly viewerKeys: ViewerKeyPort
+  ) {}
 
-  async trackInteraction(data: CreateInteractionData): Promise<void> {
-    await this.repoPort.recordInteraction(data);
+  /** Devolve `false` quando a interação não foi contada (repetida na janela ou sem visitante). */
+  async trackInteraction(input: TrackInteractionInput, now: Date = new Date()): Promise<boolean> {
+    const viewer = input.uid ? `u:${input.uid}` : input.ip ? `ip:${input.ip}` : null;
+    if (!viewer) return false;
+    const guardId = this.viewerKeys.keyFor(
+      `${viewer}|${input.type}|${input.itemCollection}|${input.itemId}`
+    );
+    return this.repoPort.recordInteraction({
+      itemId: input.itemId,
+      itemCollection: input.itemCollection,
+      counter: counterFor(input.type, Boolean(input.uid)),
+      day: businessDayKey(now),
+      guardId,
+      now,
+      guardWindowMs: INTERACTION_GUARD_WINDOW_MS,
+    });
   }
 
   async getItemStats(
     itemId: string,
-    itemCollection: 'items' | 'events' = 'items',
-    userContext?: { uid: string; admin?: boolean }
+    itemCollection: 'items' | 'events',
+    userContext: { uid: string; admin?: boolean },
+    now: Date = new Date()
   ): Promise<ItemStats> {
-    if (userContext && !userContext.admin) {
-      let ownerId: string | null = null;
-      if (itemCollection === 'events') {
-        const event = await getEventListingByIdUseCase(itemId);
-        ownerId = event?.ownerId ?? null;
-      } else {
-        ownerId = await getResourceOwnerIdUseCase('items', itemId);
-      }
+    if (!userContext.admin) {
+      const ownerId =
+        itemCollection === 'events'
+          ? ((await getEventListingByIdUseCase(itemId))?.ownerId ?? null)
+          : await getResourceOwnerIdUseCase('items', itemId);
       if (!ownerId || ownerId !== userContext.uid) {
-        throw new Error('FORBIDDEN');
+        throw new InsightsAccessError();
       }
     }
-    return this.repoPort.getItemStats(itemId, itemCollection);
+    return this.repoPort.getItemStats(itemId, itemCollection, now);
   }
 }

=== server/domain/insights/types/interaction.ts — diff ===
@@ -6,9 +6,20 @@ export interface InteractionHistoryItem {
 }
 
 export interface ItemStats {
+  /** Todas as visualizações: com e sem login (decisão de 2026-10-19). */
   views: number;
+  viewsSignedIn: number;
+  viewsAnonymous: number;
   whatsapp_click: number;
   share: number;
   favorite: number;
   history: InteractionHistoryItem[];
 }
+
+/** Contadores gravados por item e por dia; nenhum identifica quem visitou. */
+export type InteractionCounter =
+  | 'viewsSignedIn'
+  | 'viewsAnonymous'
+  | 'whatsapp_click'
+  | 'share'
+  | 'favorite';

=== server/domain/insights/utils/businessDay.ts — ARQUIVO NOVO, conteúdo completo ===
const BUSINESS_TIME_ZONE = 'America/Fortaleza';

/** Dia (AAAA-MM-DD) no fuso do negócio, para o contador diário não depender do fuso do servidor. */
export function businessDayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Os últimos `count` dias de negócio até `today`, do mais antigo para o mais recente. */
export function lastBusinessDays(today: Date, count: number): string[] {
  const days: string[] = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    days.push(businessDayKey(new Date(today.getTime() - offset * 86_400_000)));
  }
  return days;
}

=== server/infrastructure/auth/authMiddleware.ts — diff ===
@@ -1,6 +1,6 @@
 import { Response, NextFunction } from 'express';
 import { AuthenticatedRequest, AuthenticatedUser } from './authenticatedRequest';
-import { AuthTokenVerifier, AuthTokenVerifierOptions } from './ports/authTokenVerifier';
+import { AuthTokenVerifier } from './ports/authTokenVerifier';
 import { defaultAuthTokenVerifier } from './adapters/firebaseAuthTokenVerifier';
 
 export type { AuthenticatedRequest, AuthenticatedUser };
@@ -46,6 +46,21 @@ export async function verifyAuthToken(
   }
 }
 
+/**
+ * Rotas públicas que aceitam visitante sem login: identifica o usuário quando há token. Token
+ * presente e inválido continua sendo recusado, para não contar um usuário como anônimo por engano.
+ */
+export async function identifyUserIfPresent(
+  req: AuthenticatedRequest,
+  res: Response,
+  next: NextFunction
+) {
+  if (!extractBearerToken(req.headers.authorization)) {
+    return next();
+  }
+  return verifyAuthToken(req, res, next);
+}
+
 export async function verifyAdminToken(
   req: AuthenticatedRequest,
   res: Response,

=== server/infrastructure/config/trustProxy.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { resolveTrustProxyHops } from './trustProxy';

describe('resolveTrustProxyHops', () => {
  it('usa o valor configurado', () => {
    expect(resolveTrustProxyHops('2', true)).toBe(2);
    expect(resolveTrustProxyHops(' 0 ', false)).toBe(0);
  });

  it('em desenvolvimento, sem valor, confia no proxy do AI Studio', () => {
    expect(resolveTrustProxyHops(undefined, false)).toBe(1);
  });

  it('em produção, exige o valor', () => {
    expect(() => resolveTrustProxyHops(undefined, true)).toThrow('TRUST_PROXY_HOPS');
  });

  it('recusa valores que não são número de proxies', () => {
    expect(() => resolveTrustProxyHops('true', false)).toThrow();
    expect(() => resolveTrustProxyHops('-1', false)).toThrow();
  });
});

=== server/infrastructure/config/trustProxy.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Quantos proxies confiáveis ficam entre o visitante e o Express (AGENTS.md §7.4: número exato,
 * nunca `true`). Com `true`, o IP viria do X-Forwarded-For que o próprio cliente pode forjar.
 * Em produção o valor é obrigatório; no AI Studio há um proxy na frente do servidor.
 */
export function resolveTrustProxyHops(
  raw: string | undefined = process.env.TRUST_PROXY_HOPS,
  isProduction: boolean = process.env.NODE_ENV === 'production'
): number {
  const trimmed = (raw ?? '').trim();
  if (trimmed === '') {
    if (isProduction) {
      throw new Error(
        'TRUST_PROXY_HOPS não configurado (número de proxies na frente do servidor).'
      );
    }
    return 1;
  }
  const hops = Number(trimmed);
  if (!Number.isInteger(hops) || hops < 0 || hops > 10) {
    throw new Error('TRUST_PROXY_HOPS deve ser um número inteiro entre 0 e 10.');
  }
  return hops;
}

=== server/infrastructure/securityAudit.test.ts — diff ===
@@ -7,6 +7,7 @@ import { GuidePort } from '../domain/guide/ports/guidePort';
 import { GuideDomainError } from '../domain/guide/errors/guideDomainError';
 import { InsightsService } from '../domain/insights/services/insightsService';
 import { InsightsRepositoryPort } from '../domain/insights/ports/insightsRepositoryPort';
+import { InsightsAccessError } from '../domain/insights/errors/insightsErrors';
 import { getResourceOwnerIdUseCase } from '../domain/guide/usecases/getResourceOwnerIdUseCase';
 
 vi.mock('../domain/guide/usecases/getResourceOwnerIdUseCase', () => ({
@@ -129,20 +130,22 @@ describe('Security Audit - Mass Assignment and Cross-Owner Defenses', () => {
         getItemStats: vi.fn(),
       };
 
-      const insightsService = new InsightsService(mockRepo);
+      const insightsService = new InsightsService(mockRepo, { keyFor: (viewer) => viewer });
 
       await expect(
         insightsService.getItemStats('item-secret-id', 'items', {
           uid: 'intruder-user-id',
           admin: false,
         })
-      ).rejects.toThrow('FORBIDDEN');
+      ).rejects.toBeInstanceOf(InsightsAccessError);
     });
 
     it('InsightsService: allows item owner to access their item stats', async () => {
       vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('partner-legitimate-owner');
       const mockStats = {
         views: 120,
+        viewsSignedIn: 20,
+        viewsAnonymous: 100,
         whatsapp_click: 15,
         share: 5,
         favorite: 10,
@@ -154,7 +157,7 @@ describe('Security Audit - Mass Assignment and Cross-Owner Defenses', () => {
         getItemStats: vi.fn().mockResolvedValue(mockStats),
       };
 
-      const insightsService = new InsightsService(mockRepo);
+      const insightsService = new InsightsService(mockRepo, { keyFor: (viewer) => viewer });
 
       const stats = await insightsService.getItemStats('item-secret-id', 'items', {
         uid: 'partner-legitimate-owner',
@@ -169,6 +172,8 @@ describe('Security Audit - Mass Assignment and Cross-Owner Defenses', () => {
       vi.mocked(getResourceOwnerIdUseCase).mockResolvedValue('partner-legitimate-owner');
       const mockStats = {
         views: 50,
+        viewsSignedIn: 10,
+        viewsAnonymous: 40,
         whatsapp_click: 5,
         share: 2,
         favorite: 3,
@@ -180,7 +185,7 @@ describe('Security Audit - Mass Assignment and Cross-Owner Defenses', () => {
         getItemStats: vi.fn().mockResolvedValue(mockStats),
       };
 
-      const insightsService = new InsightsService(mockRepo);
+      const insightsService = new InsightsService(mockRepo, { keyFor: (viewer) => viewer });
 
       const stats = await insightsService.getItemStats('item-secret-id', 'items', {
         uid: 'admin-user-id',

=== src/domain/insights/adapters/InsightsAdapter.ts — diff ===
@@ -6,9 +6,7 @@ export class InsightsAdapter implements InsightsPort {
   async trackInteraction(
     itemId: string,
     type: InteractionType,
-    collectionName: 'items' | 'events',
-    _partnerId?: string,
-    _userId?: string | null
+    collectionName: 'items' | 'events'
   ): Promise<void> {
     try {
       await firebaseApiFetch(
@@ -24,7 +22,7 @@ export class InsightsAdapter implements InsightsPort {
             type,
           }),
         },
-        { requireAuth: true }
+        { optionalAuth: true }
       );
     } catch (error) {
       console.error('[InsightsAdapter.trackInteraction Error]:', error);
@@ -34,17 +32,16 @@ export class InsightsAdapter implements InsightsPort {
   async getItemStats(
     itemId: string,
     itemCollection: 'items' | 'events' = 'items'
-  ): Promise<ItemStats | null> {
-    try {
-      const res = await firebaseApiFetch(`/api/insights/stats/${itemCollection}/${itemId}`);
-      if (res.ok) {
-        const json = await res.json();
-        return json.data || null;
-      }
-      return null;
-    } catch (error) {
-      console.error('[InsightsAdapter.getItemStats Error]:', error);
-      return null;
+  ): Promise<ItemStats> {
+    const res = await firebaseApiFetch(
+      `/api/insights/stats/${itemCollection}/${encodeURIComponent(itemId)}`,
+      {},
+      { requireAuth: true }
+    );
+    if (!res.ok) {
+      throw new Error(`INSIGHTS_STATS_${res.status}`);
     }
+    const json = (await res.json()) as { data: ItemStats };
+    return json.data;
   }
 }

=== src/domain/insights/application/usecases/getItemStatsUseCase.ts — diff ===
@@ -10,7 +10,7 @@ const getItemStatsSchema = z.object({
 export async function getItemStatsUseCase(
   itemId: string,
   itemCollection: 'items' | 'events' = 'items'
-): Promise<ItemStats | null> {
+): Promise<ItemStats> {
   getItemStatsSchema.parse({ itemId, itemCollection });
   return insightsAdapter.getItemStats(itemId, itemCollection);
 }

=== src/domain/insights/components/ReportsView.tsx — diff ===
@@ -1,58 +1,17 @@
-import React, { useState, useEffect } from 'react';
-import {
-  BarChart,
-  Bar,
-  XAxis,
-  YAxis,
-  CartesianGrid,
-  Tooltip,
-  ResponsiveContainer,
-  Cell,
-} from 'recharts';
-import {
-  Eye,
-  MessageSquare,
-  Heart,
-  MessageCircle,
-  ChevronRight,
-  ArrowLeft,
-  Send,
-  Star,
-  Share2,
-} from 'lucide-react';
+import { ArrowLeft } from 'lucide-react';
 import { motion } from 'motion/react';
+import { useState } from 'react';
+import { useTranslation } from 'react-i18next';
 import { cn } from '../../../shared/utils/cn';
-import { getItemStatsUseCase } from '../application/usecases/getItemStatsUseCase';
-import { getReviewsUseCase, respondToReviewUseCase } from '../../reviews';
-import { GuideItem } from '../../guide';
-import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
-import { useUI } from '../../../shared/stores/useUIStore';
 import { ErrorState } from '../../../ui/components/ErrorState';
-
-interface InteractionHistory {
-  date: string;
-  [key: string]: any;
-}
-
-interface ReportData {
-  views: number;
-  whatsapp: number;
-  favorites: number;
-  shares: number;
-  history: InteractionHistory[];
-}
-
-interface PartnerReview {
-  id: string;
-  itemId: string;
-  userId?: string;
-  userName?: string;
-  rating?: number;
-  comment?: string;
-  createdAt?: any;
-  partnerResponse?: string;
-  respondedAt?: any;
-}
+import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
+import type { GuideItem } from '../../guide';
+import { useEntityReport } from '../hooks/useEntityReport';
+import type { ReportEntity } from '../types/report';
+import { PendingReviewsPanel } from './reports/PendingReviewsPanel';
+import { ReportsEntityPicker } from './reports/ReportsEntityPicker';
+import { ReportsStatsGrid } from './reports/ReportsStatsGrid';
+import { ReportsViewsChart } from './reports/ReportsViewsChart';
 
 interface ReportsViewProps {
   partnerId: string;
@@ -60,412 +19,109 @@ interface ReportsViewProps {
   events: GuideItem[];
 }
 
-const PENDING_PREVIEW_COUNT = 3;
-
-export function ReportsView({ items, events }: ReportsViewProps) {
-  const { showToast } = useUI();
-  const [selectedEntity, setSelectedEntity] = useState<{
-    id: string;
-    type: 'items' | 'events';
-  } | null>(
-    items.length === 1 && events.length === 0 && items[0]
-      ? { id: items[0].id, type: 'items' }
-      : events.length === 1 && items.length === 0 && events[0]
-        ? { id: events[0].id, type: 'events' }
-        : null
-  );
-  const [loading, setLoading] = useState(false);
-  const [reportData, setReportData] = useState<ReportData | null>(null);
-  const [reviews, setReviews] = useState<PartnerReview[]>([]);
-  const [replyText, setReplyText] = useState('');
-  const [replyingTo, setReplyingTo] = useState<string | null>(null);
-  const [showAllPending, setShowAllPending] = useState(false);
-  const [loadError, setLoadError] = useState(false);
-
-  useEffect(() => {
-    if (selectedEntity) {
-      loadReports(selectedEntity.id, selectedEntity.type);
-    }
-  }, [selectedEntity]);
-
-  const loadReports = async (itemId: string, type: 'items' | 'events') => {
-    setLoading(true);
-    setLoadError(false);
-    try {
-      const realStats = await getItemStatsUseCase(itemId, type);
-
-      const statsData = {
-        views: realStats?.views || 0,
-        whatsapp: realStats?.whatsapp_click || 0,
-        favorites: realStats?.favorite || 0,
-        shares: realStats?.share || 0,
-        history: realStats?.history || [],
-      };
-
-      setReportData(statsData);
-
-      const reviewsPage = await getReviewsUseCase(itemId, 50);
-      setReviews(reviewsPage.items as PartnerReview[]);
-    } catch (error) {
-      console.error('[loadReports Error]:', error);
-      setLoadError(true);
-    } finally {
-      setLoading(false);
-    }
-  };
-
-  const unansweredReviews = reviews.filter((r) => !r.partnerResponse);
-
-  const handleReplyReview = async (reviewId: string) => {
-    if (!replyText.trim()) return;
-    try {
-      await respondToReviewUseCase(reviewId, replyText);
-      setReviews((prev) =>
-        prev.map((r) => (r.id === reviewId ? { ...r, partnerResponse: replyText } : r))
-      );
-      setReplyingTo(null);
-      setReplyText('');
-    } catch {
-      showToast('Erro ao enviar resposta.', 'error');
-    }
+function toEntity(item: GuideItem, type: ReportEntity['type']): ReportEntity {
+  return {
+    id: item.id,
+    type,
+    name: item.name,
+    image: item.image,
+    location: item.location,
+    isVerified: item.isVerified,
+    isVerificationSuspended: item.isVerificationSuspended,
   };
+}
 
-  const allEntities = [
-    ...items.map((i) => ({ ...i, type: 'items' as const })),
-    ...events.map((e) => ({ ...e, type: 'events' as const })),
+export function ReportsView({ items, events }: ReportsViewProps) {
+  const { t } = useTranslation();
+  const entities = [
+    ...items.map((item) => toEntity(item, 'items')),
+    ...events.map((event) => toEntity(event, 'events')),
   ];
+  const [selected, setSelected] = useState<ReportEntity | null>(
+    entities.length === 1 ? (entities[0] ?? null) : null
+  );
+  const report = useEntityReport(selected);
 
-  if (allEntities.length === 0) {
+  if (entities.length === 0) {
     return (
       <div className="py-20 text-center glassmorphism rounded-[2rem] border border-white/5">
-        <p className="text-[11px] text-white/50 font-medium tracking-wide">
-          Nenhum registro encontrado para relatório
+        <p className="text-[11px] text-white/60 font-medium tracking-wide">
+          {t('insights.reports.empty')}
         </p>
       </div>
     );
   }
 
-  if (!selectedEntity) {
-    return (
-      <div className="space-y-6">
-        <h3 className="text-sm font-semibold text-white/50 tracking-wide px-4">
-          Selecione um item ou evento para ver o relatório
-        </h3>
-        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
-          {allEntities.map((entity) => (
-            <div
-              key={entity.id}
-              onClick={() => setSelectedEntity({ id: entity.id, type: entity.type })}
-              className="glassmorphism rounded-3xl p-5 flex items-center gap-4 cursor-pointer hover:bg-white/5 hover:border-amber-500/30 transition-all border border-white/5"
-            >
-              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 relative">
-                <img src={entity.image} alt="" className="w-full h-full object-cover" />
-                <div
-                  className={cn(
-                    'absolute top-1 right-1 px-1.5 py-0.5 rounded text-[7px] font-bold tracking-widest',
-                    entity.type === 'items' ? 'bg-teal-500 text-black' : 'bg-[#00D4FF] text-black'
-                  )}
-                >
-                  {entity.type === 'items' ? 'Item' : 'Evento'}
-                </div>
-              </div>
-              <div className="flex-1 min-w-0">
-                <div className="flex items-center gap-1.5 min-w-0">
-                  <h4 className="text-sm font-bold text-white truncate">{entity.name}</h4>
-                  {entity.type === 'items' &&
-                    entity.isVerified &&
-                    !entity.isVerificationSuspended && (
-                      <VerifiedBadge size="sm" className="text-[14px] flex-shrink-0" />
-                    )}
-                </div>
-                <p className="text-[10px] text-white/50 font-semibold tracking-wide">
-                  {entity.location}
-                </p>
-              </div>
-              <ChevronRight size={16} className="text-white/50" />
-            </div>
-          ))}
-        </div>
-      </div>
-    );
+  if (!selected) {
+    return <ReportsEntityPicker entities={entities} onSelect={setSelected} />;
   }
 
-  const currentEntity = allEntities.find((e) => e.id === selectedEntity.id);
+  const canGoBack = entities.length > 1;
 
   return (
-    <div className="space-y-8 pb-20">
-      <div className="flex items-center justify-between">
-        <button
-          onClick={() => (allEntities.length > 1 ? setSelectedEntity(null) : null)}
-          aria-label="Ver Todos os itens e eventos"
-          className={cn(
-            'p-3 min-w-[44px] min-h-[44px] rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all flex items-center gap-2',
-            allEntities.length === 1 && 'opacity-0 pointer-events-none'
-          )}
-        >
-          <ArrowLeft size={18} />
-          <span className="text-[10px] font-semibold tracking-wide">Ver Todos</span>
-        </button>
-        <div className="text-right">
-          <div className="flex items-center justify-end gap-2 mb-1">
-            <span
-              className={cn(
-                'px-2 py-0.5 rounded text-[8px] font-bold tracking-widest',
-                selectedEntity.type === 'items'
-                  ? 'bg-teal-500/20 text-teal-400'
-                  : 'bg-[#00D4FF]/20 text-[#00D4FF]'
-              )}
-            >
-              {selectedEntity.type === 'items' ? 'Estabelecimento' : 'Evento'}
+    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
+      <div className="flex items-center justify-between gap-4">
+        {canGoBack ? (
+          <button
+            type="button"
+            onClick={() => setSelected(null)}
+            aria-label={t('insights.reports.seeAllLabel')}
+            className="p-3 min-w-[44px] min-h-[44px] rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+          >
+            <ArrowLeft size={18} aria-hidden="true" />
+            <span className="text-[10px] font-semibold tracking-wide">
+              {t('insights.reports.seeAll')}
             </span>
-          </div>
+          </button>
+        ) : (
+          <span />
+        )}
+        <div className="text-right min-w-0">
+          <span
+            className={cn(
+              'inline-block mb-1 px-2 py-0.5 rounded text-[8px] font-bold tracking-widest',
+              selected.type === 'items'
+                ? 'bg-teal-500/20 text-teal-400'
+                : 'bg-[#00D4FF]/20 text-[#00D4FF]'
+            )}
+          >
+            {selected.type === 'items'
+              ? t('insights.reports.typeBusiness')
+              : t('insights.reports.typeEvent')}
+          </span>
           <h3 className="text-lg font-display font-black text-white tracking-tight flex items-center justify-end gap-1.5">
-            {currentEntity?.name}
-            {currentEntity?.type === 'items' &&
-              currentEntity?.isVerified &&
-              !currentEntity?.isVerificationSuspended && (
+            <span className="truncate">{selected.name}</span>
+            {selected.type === 'items' &&
+              selected.isVerified &&
+              !selected.isVerificationSuspended && (
                 <VerifiedBadge size="md" className="text-[18px] flex-shrink-0" />
               )}
           </h3>
           <p className="text-[10px] text-amber-500 font-semibold tracking-wide">
-            Relatório de Insights
+            {t('insights.reports.title')}
           </p>
         </div>
       </div>
 
-      {loading ? (
-        <div className="py-20 text-center">
-          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
+      {report.loading ? (
+        <div className="py-20 text-center" role="status">
+          <div
+            className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"
+            aria-hidden="true"
+          />
+          <span className="sr-only">{t('insights.reports.loading')}</span>
         </div>
-      ) : loadError && selectedEntity ? (
-        <ErrorState
-          message="Não foi possível carregar o relatório deste item."
-          onRetry={() => loadReports(selectedEntity.id, selectedEntity.type)}
-        />
+      ) : report.error || !report.stats ? (
+        <ErrorState message={t('insights.reports.loadError')} onRetry={report.reload} />
       ) : (
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-8"
         >
-          <div className="grid grid-cols-2 gap-4">
-            {[
-              {
-                label: 'Visualizações',
-                value: reportData?.views,
-                icon: Eye,
-                color: 'text-blue-400',
-                bg: 'bg-blue-400/10',
-              },
-              {
-                label: 'Cliques WhatsApp',
-                value: reportData?.whatsapp,
-                icon: MessageCircle,
-                color: 'text-emerald-400',
-                bg: 'bg-emerald-400/10',
-              },
-              {
-                label: 'Favoritados',
-                value: reportData?.favorites,
-                icon: Heart,
-                color: 'text-rose-400',
-                bg: 'bg-rose-400/10',
-              },
-              {
-                label: 'Compartilhados',
-                value: reportData?.shares,
-                icon: Share2,
-                color: 'text-cyan-400',
-                bg: 'bg-cyan-400/10',
-              },
-            ].map((stat, i) => (
-              <div key={i} className="glassmorphism rounded-3xl p-6 border border-white/5">
-                <div
-                  className={cn(
-                    'w-10 h-10 rounded-2xl flex items-center justify-center mb-4',
-                    stat.bg,
-                    stat.color
-                  )}
-                >
-                  <stat.icon size={20} />
-                </div>
-                <div className="text-2xl font-display font-black text-white leading-none">
-                  {stat.value?.toLocaleString()}
-                </div>
-                <div className="text-[10px] font-semibold tracking-wide text-white/50 mt-2">
-                  {stat.label}
-                </div>
-              </div>
-            ))}
-          </div>
-
-          <div className="glassmorphism rounded-[2rem] p-8 border border-white/5 overflow-hidden">
-            <div className="flex items-center justify-between mb-8">
-              <div>
-                <h4 className="text-sm font-semibold text-white tracking-wide">Fluxo de Visitas</h4>
-                <p className="text-[10px] text-white/50 font-medium tracking-wide">
-                  Últimos 7 dias
-                </p>
-              </div>
-            </div>
-
-            <div className="h-64 w-full">
-              <ResponsiveContainer width="100%" height="100%">
-                <BarChart data={reportData?.history || []}>
-                  <CartesianGrid
-                    strokeDasharray="3 3"
-                    stroke="rgba(255,255,255,0.05)"
-                    vertical={false}
-                  />
-                  <XAxis
-                    dataKey="date"
-                    axisLine={false}
-                    tickLine={false}
-                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }}
-                    dy={10}
-                  />
-                  <YAxis hide />
-                  <Tooltip
-                    contentStyle={{
-                      backgroundColor: '#0F172A',
-                      border: '1px solid rgba(255,255,255,0.1)',
-                      borderRadius: '12px',
-                    }}
-                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}
-                    labelStyle={{
-                      color: 'rgba(255,255,255,0.5)',
-                      fontSize: '9px',
-                      fontWeight: 500,
-                    }}
-                  />
-                  <Bar dataKey="views" radius={[6, 6, 0, 0]}>
-                    {(reportData?.history || []).map((_: InteractionHistory, index: number) => (
-                      <Cell
-                        key={`cell-${index}`}
-                        fill={index === 6 ? '#F59E0B' : 'rgba(245, 158, 11, 0.3)'}
-                      />
-                    ))}
-                  </Bar>
-                </BarChart>
-              </ResponsiveContainer>
-            </div>
-          </div>
-
-          <div className="glassmorphism rounded-[2rem] p-8 border border-white/5">
-            <div className="flex items-center justify-between mb-8">
-              <div>
-                <h4 className="text-sm font-semibold text-white tracking-wide">
-                  Avaliações Pendentes
-                </h4>
-                <p className="text-[10px] text-white/50 font-medium tracking-wide">
-                  {unansweredReviews.length} aguardando resposta
-                </p>
-              </div>
-              {unansweredReviews.length > PENDING_PREVIEW_COUNT && (
-                <button
-                  type="button"
-                  onClick={() => setShowAllPending((prev) => !prev)}
-                  aria-expanded={showAllPending}
-                  className="px-4 py-2 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-[9px] font-semibold tracking-wide text-white/50 hover:text-white hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
-                >
-                  {showAllPending ? 'Mostrar menos' : 'Ver todas'}
-                </button>
-              )}
-            </div>
-
-            <div className="space-y-4">
-              {unansweredReviews.length > 0 ? (
-                (showAllPending
-                  ? unansweredReviews
-                  : unansweredReviews.slice(0, PENDING_PREVIEW_COUNT)
-                ).map((review) => (
-                  <div
-                    key={review.id}
-                    className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4"
-                  >
-                    <div className="flex items-center justify-between">
-                      <div className="flex items-center gap-3">
-                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs font-bold">
-                          {review.userName?.charAt(0).toUpperCase()}
-                        </div>
-                        <div>
-                          <div className="text-[11px] font-bold text-white mb-0.5">
-                            {review.userName}
-                          </div>
-                          <div className="flex gap-0.5">
-                            {[...Array(5)].map((_, i) => (
-                              <Star
-                                key={i}
-                                size={8}
-                                className={cn(
-                                  i < (review.rating ?? 0)
-                                    ? 'text-amber-400 fill-amber-400'
-                                    : 'text-white/20'
-                                )}
-                              />
-                            ))}
-                          </div>
-                        </div>
-                      </div>
-                      <div className="text-[9px] text-white/50 font-bold tracking-wide">
-                        {review.createdAt?.toDate
-                          ? review.createdAt.toDate().toLocaleDateString('pt-BR')
-                          : ''}
-                      </div>
-                    </div>
-                    <p className="text-xs text-white/60 leading-relaxed italic">
-                      "{review.comment}"
-                    </p>
-
-                    {replyingTo === review.id ? (
-                      <motion.div
-                        initial={{ opacity: 0, scale: 0.95 }}
-                        animate={{ opacity: 1, scale: 1 }}
-                        className="space-y-3"
-                      >
-                        <textarea
-                          value={replyText}
-                          onChange={(e) => setReplyText(e.target.value)}
-                          placeholder="Escreva sua resposta..."
-                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white h-24 resize-none"
-                        />
-                        <div className="flex gap-2">
-                          <button
-                            onClick={() => handleReplyReview(review.id)}
-                            className="flex-1 min-h-[44px] bg-amber-500 text-black py-2.5 rounded-xl text-[9px] font-semibold tracking-wide flex items-center justify-center gap-2"
-                          >
-                            <Send size={12} /> Enviar Resposta
-                          </button>
-                          <button
-                            onClick={() => {
-                              setReplyingTo(null);
-                              setReplyText('');
-                            }}
-                            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 text-[9px] font-semibold tracking-wide text-white/50"
-                          >
-                            Cancelar
-                          </button>
-                        </div>
-                      </motion.div>
-                    ) : (
-                      <button
-                        onClick={() => setReplyingTo(review.id)}
-                        className="text-[9px] font-bold tracking-wide text-amber-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors min-h-[44px]"
-                      >
-                        <MessageSquare size={12} /> Responder Avaliação
-                      </button>
-                    )}
-                  </div>
-                ))
-              ) : (
-                <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
-                  <p className="text-[11px] text-white/50 font-medium tracking-wide">
-                    Nenhuma avaliação pendente
-                  </p>
-                </div>
-              )}
-            </div>
-          </div>
+          <ReportsStatsGrid stats={report.stats} />
+          <ReportsViewsChart history={report.stats.history} />
+          <PendingReviewsPanel reviews={report.reviews} onReplied={report.markReplied} />
         </motion.div>
       )}
     </div>

=== src/domain/insights/components/reports/PendingReviewCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { MessageSquare, Send, Star } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { cn } from '../../../../shared/utils/cn';
import { respondToReviewUseCase } from '../../../reviews';
import type { PartnerReview } from '../../types/report';
import { formatReviewDate } from '../../utils/reviewDate';

interface PendingReviewCardProps {
  review: PartnerReview;
  onReplied: (reviewId: string, response: string) => void;
}

export function PendingReviewCard({ review, onReplied }: PendingReviewCardProps) {
  const { t, i18n } = useTranslation();
  const { showToast } = useUI();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const cancel = () => {
    setReplying(false);
    setReplyText('');
  };

  const send = async () => {
    const response = replyText.trim();
    if (!response) return;
    setSending(true);
    try {
      await respondToReviewUseCase(review.id, response);
      onReplied(review.id, response);
      cancel();
    } catch {
      showToast(t('insights.reviews.replyError'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs font-bold"
            aria-hidden="true"
          >
            {review.userName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white mb-0.5 truncate">
              {review.userName}
            </div>
            <div
              className="flex gap-0.5"
              role="img"
              aria-label={t('insights.reviews.rating', { rating: review.rating })}
            >
              {Array.from({ length: 5 }, (_, star) => (
                <Star
                  key={star}
                  size={8}
                  aria-hidden="true"
                  className={cn(
                    star < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-[9px] text-white/60 font-bold tracking-wide shrink-0">
          {formatReviewDate(review.createdAt, i18n.language)}
        </div>
      </div>
      <p className="text-xs text-white/60 leading-relaxed italic">"{review.comment}"</p>

      {replying ? (
        <div className="space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={t('insights.reviews.replyPlaceholder')}
            aria-label={t('insights.reviews.replyLabel', { name: review.userName })}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white h-24 resize-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={send}
              disabled={sending || !replyText.trim()}
              className="flex-1 min-h-[44px] bg-amber-500 text-black py-2.5 rounded-xl text-[9px] font-semibold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <Send size={12} aria-hidden="true" /> {t('insights.reviews.send')}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 text-[9px] font-semibold tracking-wide text-white/60 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('insights.reviews.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setReplying(true)}
          className="text-[9px] font-bold tracking-wide text-amber-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <MessageSquare size={12} aria-hidden="true" /> {t('insights.reviews.reply')}
        </button>
      )}
    </div>
  );
}

=== src/domain/insights/components/reports/PendingReviewsPanel.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PartnerReview } from '../../types/report';
import { PendingReviewCard } from './PendingReviewCard';

const PENDING_PREVIEW_COUNT = 3;

interface PendingReviewsPanelProps {
  reviews: PartnerReview[];
  onReplied: (reviewId: string, response: string) => void;
}

export function PendingReviewsPanel({ reviews, onReplied }: PendingReviewsPanelProps) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const pending = reviews.filter((review) => !review.partnerResponse);
  const visible = showAll ? pending : pending.slice(0, PENDING_PREVIEW_COUNT);

  return (
    <div className="glassmorphism rounded-[2rem] p-8 border border-white/5">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wide">
            {t('insights.reviews.title')}
          </h4>
          <p className="text-[10px] text-white/60 font-medium tracking-wide">
            {t('insights.reviews.waiting', { count: pending.length })}
          </p>
        </div>
        {pending.length > PENDING_PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            aria-expanded={showAll}
            className="px-4 py-2 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-[9px] font-semibold tracking-wide text-white/60 hover:text-white hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {showAll ? t('insights.reviews.showLess') : t('insights.reviews.showAll')}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {visible.length > 0 ? (
          visible.map((review) => (
            <PendingReviewCard key={review.id} review={review} onReplied={onReplied} />
          ))
        ) : (
          <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-[11px] text-white/60 font-medium tracking-wide">
              {t('insights.reviews.none')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

=== src/domain/insights/components/reports/ReportsEntityPicker.tsx — ARQUIVO NOVO, conteúdo completo ===
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { VerifiedBadge } from '../../../../ui/components/VerifiedBadge';
import type { ReportEntity } from '../../types/report';

interface ReportsEntityPickerProps {
  entities: ReportEntity[];
  onSelect: (entity: ReportEntity) => void;
}

export function ReportsEntityPicker({ entities, onSelect }: ReportsEntityPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-white/50 tracking-wide px-4">
        {t('insights.reports.pickTitle')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((entity) => (
          <button
            type="button"
            key={entity.id}
            onClick={() => onSelect(entity)}
            className="glassmorphism rounded-3xl p-5 flex items-center gap-4 text-left hover:bg-white/5 hover:border-amber-500/30 transition-all border border-white/5 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-white/5 relative">
              {entity.image && (
                <img
                  src={entity.image}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
              <span
                className={cn(
                  'absolute top-1 right-1 px-1.5 py-0.5 rounded text-[7px] font-bold tracking-widest text-black',
                  entity.type === 'items' ? 'bg-teal-500' : 'bg-[#00D4FF]'
                )}
              >
                {entity.type === 'items'
                  ? t('insights.reports.typeItem')
                  : t('insights.reports.typeEvent')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{entity.name}</h4>
                {entity.type === 'items' &&
                  entity.isVerified &&
                  !entity.isVerificationSuspended && (
                    <VerifiedBadge size="sm" className="text-[14px] flex-shrink-0" />
                  )}
              </div>
              <p className="text-[10px] text-white/50 font-semibold tracking-wide">
                {entity.location}
              </p>
            </div>
            <ChevronRight size={16} className="text-white/50" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

=== src/domain/insights/components/reports/ReportsStatsGrid.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { ItemStats } from '../../types/interaction';
import { ReportsStatsGrid } from './ReportsStatsGrid';

const STATS: ItemStats = {
  views: 8,
  viewsSignedIn: 2,
  viewsAnonymous: 6,
  whatsapp_click: 1,
  share: 0,
  favorite: 3,
  history: [],
};

describe('ReportsStatsGrid', () => {
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra o total e a divisão entre com conta e visitantes', async () => {
    await i18n.changeLanguage('pt-BR');
    render(<ReportsStatsGrid stats={STATS} />);
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('Com conta no Use Guide')).toBeTruthy();
    expect(screen.getByText('25%')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();
  });

  it('avisa quando ainda não há visualização', async () => {
    await i18n.changeLanguage('fr');
    render(
      <ReportsStatsGrid stats={{ ...STATS, views: 0, viewsSignedIn: 0, viewsAnonymous: 0 }} />
    );
    expect(screen.getByText('Pas encore de vues.')).toBeTruthy();
  });
});

=== src/domain/insights/components/reports/ReportsStatsGrid.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import type { ItemStats } from '../../types/interaction';
import { audienceShare } from '../../utils/audienceShare';

interface ReportsStatsGridProps {
  stats: ItemStats;
}

export function ReportsStatsGrid({ stats }: ReportsStatsGridProps) {
  const { t, i18n } = useTranslation();
  const numberFormat = new Intl.NumberFormat(i18n.language);
  const percentFormat = new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    maximumFractionDigits: 0,
  });
  const share = audienceShare(stats);

  const cards = [
    {
      key: 'whatsapp',
      label: t('insights.stats.whatsapp'),
      value: stats.whatsapp_click,
      icon: MessageCircle,
      tone: 'text-emerald-400 bg-emerald-400/10',
    },
    {
      key: 'favorites',
      label: t('insights.stats.favorites'),
      value: stats.favorite,
      icon: Heart,
      tone: 'text-rose-400 bg-rose-400/10',
    },
    {
      key: 'shares',
      label: t('insights.stats.shares'),
      value: stats.share,
      icon: Share2,
      tone: 'text-cyan-400 bg-cyan-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="col-span-2 lg:col-span-1 glassmorphism rounded-3xl p-6 border border-white/5">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 text-blue-400 bg-blue-400/10">
          <Eye size={20} aria-hidden="true" />
        </div>
        <div className="text-2xl font-display font-black text-white leading-none">
          {numberFormat.format(stats.views)}
        </div>
        <div className="text-[10px] font-semibold tracking-wide text-white/60 mt-2">
          {t('insights.stats.views')}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] font-semibold tracking-wide text-white/60 mb-2">
            {t('insights.audience.title')}
          </p>
          {share ? (
            <>
              <div className="flex h-2 rounded-full overflow-hidden bg-white/5" aria-hidden="true">
                <div className="bg-teal-400" style={{ width: `${share.signedIn * 100}%` }} />
                <div className="bg-cyan-400/60" style={{ width: `${share.anonymous * 100}%` }} />
              </div>
              <dl className="mt-3 space-y-1 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">{t('insights.audience.signedIn')}</dt>
                  <dd className="font-bold text-teal-300">
                    {percentFormat.format(share.signedIn)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-white/60">{t('insights.audience.anonymous')}</dt>
                  <dd className="font-bold text-cyan-300">
                    {percentFormat.format(share.anonymous)}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-[11px] text-white/60">{t('insights.audience.noViews')}</p>
          )}
        </div>
      </div>

      {cards.map((card) => (
        <div key={card.key} className="glassmorphism rounded-3xl p-6 border border-white/5">
          <div
            className={cn('w-10 h-10 rounded-2xl flex items-center justify-center mb-4', card.tone)}
          >
            <card.icon size={20} aria-hidden="true" />
          </div>
          <div className="text-2xl font-display font-black text-white leading-none">
            {numberFormat.format(card.value)}
          </div>
          <div className="text-[10px] font-semibold tracking-wide text-white/60 mt-2">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}

=== src/domain/insights/components/reports/ReportsViewsChart.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { InteractionHistoryItem } from '../../types/interaction';

interface ReportsViewsChartProps {
  history: InteractionHistoryItem[];
}

export function ReportsViewsChart({ history }: ReportsViewsChartProps) {
  const { t } = useTranslation();
  const lastIndex = history.length - 1;

  return (
    <div className="glassmorphism rounded-[2rem] p-8 border border-white/5 overflow-hidden">
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white tracking-wide">
          {t('insights.chart.title')}
        </h4>
        <p className="text-[10px] text-white/60 font-medium tracking-wide">
          {t('insights.chart.subtitle')}
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              }}
              itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontWeight: 500 }}
            />
            <Bar dataKey="views" name={t('insights.chart.series')} radius={[6, 6, 0, 0]}>
              {history.map((entry, index) => (
                <Cell
                  key={entry.date}
                  fill={index === lastIndex ? '#F59E0B' : 'rgba(245, 158, 11, 0.3)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

=== src/domain/insights/hooks/useEntityReport.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { getReviewsUseCase } from '../../reviews';
import { getItemStatsUseCase } from '../application/usecases/getItemStatsUseCase';
import type { ItemStats } from '../types/interaction';
import type { PartnerReview, ReportCollection } from '../types/report';

const REVIEWS_PAGE_SIZE = 50;

interface ReportTarget {
  id: string;
  type: ReportCollection;
}

/** Métricas e avaliações do item selecionado no relatório do parceiro. */
export function useEntityReport(target: ReportTarget | null) {
  const [stats, setStats] = useState<ItemStats | null>(null);
  const [reviews, setReviews] = useState<PartnerReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const targetId = target?.id;
  const targetType = target?.type;

  const load = useCallback(async () => {
    if (!targetId || !targetType) return;
    setLoading(true);
    setError(false);
    try {
      const [itemStats, reviewsPage] = await Promise.all([
        getItemStatsUseCase(targetId, targetType),
        getReviewsUseCase(targetId, REVIEWS_PAGE_SIZE, 'recent', null, targetType),
      ]);
      setStats(itemStats);
      setReviews(reviewsPage.items);
    } catch (err) {
      console.error('[useEntityReport Error]:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    void load();
  }, [load]);

  const markReplied = useCallback((reviewId: string, partnerResponse: string) => {
    setReviews((prev) =>
      prev.map((review) => (review.id === reviewId ? { ...review, partnerResponse } : review))
    );
  }, []);

  return { stats, reviews, loading, error, reload: load, markReplied };
}

=== src/domain/insights/ports/insightsPort.ts — diff ===
@@ -9,5 +9,5 @@ export interface InsightsPort {
     userId?: string | null
   ): Promise<void>;
 
-  getItemStats(itemId: string, itemCollection?: 'items' | 'events'): Promise<ItemStats | null>;
+  getItemStats(itemId: string, itemCollection?: 'items' | 'events'): Promise<ItemStats>;
 }

=== src/domain/insights/types/interaction.ts — diff ===
@@ -6,7 +6,10 @@ export interface InteractionHistoryItem {
 }
 
 export interface ItemStats {
+  /** Todas as visualizações; a divisão abaixo separa quem estava logado dos visitantes. */
   views: number;
+  viewsSignedIn: number;
+  viewsAnonymous: number;
   whatsapp_click: number;
   share: number;
   favorite: number;

=== src/domain/insights/types/report.ts — ARQUIVO NOVO, conteúdo completo ===
import type { FirestoreReview } from '../../reviews';

export type ReportCollection = 'items' | 'events';

export interface ReportEntity {
  id: string;
  type: ReportCollection;
  name: string;
  image?: string;
  location?: string;
  isVerified?: boolean;
  isVerificationSuspended?: boolean;
}

export type PartnerReview = FirestoreReview;

=== src/domain/insights/utils/audienceShare.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { audienceShare } from './audienceShare';

describe('audienceShare', () => {
  it('devolve null sem visualizações', () => {
    expect(audienceShare({ viewsSignedIn: 0, viewsAnonymous: 0 })).toBeNull();
  });

  it('divide as visualizações entre com conta e visitantes', () => {
    expect(audienceShare({ viewsSignedIn: 3, viewsAnonymous: 1 })).toEqual({
      signedIn: 0.75,
      anonymous: 0.25,
    });
  });

  it('soma 100% mesmo quando só há visitantes', () => {
    expect(audienceShare({ viewsSignedIn: 0, viewsAnonymous: 5 })).toEqual({
      signedIn: 0,
      anonymous: 1,
    });
  });
});

=== src/domain/insights/utils/audienceShare.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ItemStats } from '../types/interaction';

export interface AudienceShare {
  signedIn: number;
  anonymous: number;
}

/** Fração (0–1) de visualizações com e sem conta; `null` quando ainda não há visualização. */
export function audienceShare(
  stats: Pick<ItemStats, 'viewsSignedIn' | 'viewsAnonymous'>
): AudienceShare | null {
  const total = stats.viewsSignedIn + stats.viewsAnonymous;
  if (total <= 0) return null;
  const signedIn = stats.viewsSignedIn / total;
  return { signedIn, anonymous: 1 - signedIn };
}

=== src/domain/insights/utils/reviewDate.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ReviewDateValue } from '../../reviews';

type ReviewDateInput = ReviewDateValue | { toDate?: () => Date };

/** Data de avaliação no fuso do negócio; aceita o Timestamp do Firestore, que expõe `toDate()`. */
export function formatReviewDate(value: ReviewDateInput, locale: string): string {
  let date: Date | null = null;
  if (value instanceof Date) date = value;
  else if (typeof value === 'string' || typeof value === 'number') date = new Date(value);
  else if (value && typeof value.toDate === 'function') date = value.toDate();
  if (!date || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { timeZone: 'America/Fortaleza' }).format(date);
}

=== src/shared/i18n/insightsResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos do domínio insights (pt-BR é a fonte; en e fr têm as mesmas chaves, garantidas pelo tipo). */
export interface InsightsTranslation {
  reports: {
    empty: string;
    pickTitle: string;
    typeItem: string;
    typeEvent: string;
    typeBusiness: string;
    seeAll: string;
    seeAllLabel: string;
    title: string;
    loading: string;
    loadError: string;
  };
  stats: {
    views: string;
    whatsapp: string;
    favorites: string;
    shares: string;
  };
  audience: {
    title: string;
    signedIn: string;
    anonymous: string;
    noViews: string;
  };
  chart: {
    title: string;
    subtitle: string;
    series: string;
  };
  reviews: {
    title: string;
    waiting_one: string;
    waiting_other: string;
    showAll: string;
    showLess: string;
    rating: string;
    replyPlaceholder: string;
    replyLabel: string;
    send: string;
    cancel: string;
    reply: string;
    none: string;
    replyError: string;
  };
}

export const insightsPtBR: InsightsTranslation = {
  reports: {
    empty: 'Nenhum registro encontrado para relatório',
    pickTitle: 'Selecione um item ou evento para ver o relatório',
    typeItem: 'Item',
    typeEvent: 'Evento',
    typeBusiness: 'Estabelecimento',
    seeAll: 'Ver todos',
    seeAllLabel: 'Ver todos os itens e eventos',
    title: 'Relatório de insights',
    loading: 'Carregando o relatório...',
    loadError: 'Não foi possível carregar o relatório deste item.',
  },
  stats: {
    views: 'Visualizações',
    whatsapp: 'Cliques no WhatsApp',
    favorites: 'Favoritados',
    shares: 'Compartilhados',
  },
  audience: {
    title: 'Quem visualizou',
    signedIn: 'Com conta no Use Guide',
    anonymous: 'Visitantes',
    noViews: 'Ainda sem visualizações.',
  },
  chart: {
    title: 'Fluxo de visitas',
    subtitle: 'Últimos 7 dias',
    series: 'Visualizações',
  },
  reviews: {
    title: 'Avaliações pendentes',
    waiting_one: '{{count}} aguardando resposta',
    waiting_other: '{{count}} aguardando resposta',
    showAll: 'Ver todas',
    showLess: 'Mostrar menos',
    rating: '{{rating}} de 5 estrelas',
    replyPlaceholder: 'Escreva sua resposta...',
    replyLabel: 'Resposta à avaliação de {{name}}',
    send: 'Enviar resposta',
    cancel: 'Cancelar',
    reply: 'Responder avaliação',
    none: 'Nenhuma avaliação pendente',
    replyError: 'Erro ao enviar resposta.',
  },
};

export const insightsEn: InsightsTranslation = {
  reports: {
    empty: 'No records found for reports',
    pickTitle: 'Select an item or event to see its report',
    typeItem: 'Item',
    typeEvent: 'Event',
    typeBusiness: 'Business',
    seeAll: 'See all',
    seeAllLabel: 'See all items and events',
    title: 'Insights report',
    loading: 'Loading the report...',
    loadError: 'We could not load the report for this item.',
  },
  stats: {
    views: 'Views',
    whatsapp: 'WhatsApp clicks',
    favorites: 'Favorited',
    shares: 'Shared',
  },
  audience: {
    title: 'Who viewed',
    signedIn: 'With a Use Guide account',
    anonymous: 'Visitors',
    noViews: 'No views yet.',
  },
  chart: {
    title: 'Visit flow',
    subtitle: 'Last 7 days',
    series: 'Views',
  },
  reviews: {
    title: 'Pending reviews',
    waiting_one: '{{count}} awaiting reply',
    waiting_other: '{{count}} awaiting reply',
    showAll: 'See all',
    showLess: 'Show less',
    rating: '{{rating}} out of 5 stars',
    replyPlaceholder: 'Write your reply...',
    replyLabel: 'Reply to the review by {{name}}',
    send: 'Send reply',
    cancel: 'Cancel',
    reply: 'Reply to review',
    none: 'No pending reviews',
    replyError: 'Could not send the reply.',
  },
};

export const insightsFr: InsightsTranslation = {
  reports: {
    empty: 'Aucun enregistrement trouvé pour les rapports',
    pickTitle: 'Sélectionnez un élément ou un événement pour voir son rapport',
    typeItem: 'Élément',
    typeEvent: 'Événement',
    typeBusiness: 'Établissement',
    seeAll: 'Tout voir',
    seeAllLabel: 'Voir tous les éléments et événements',
    title: 'Rapport de statistiques',
    loading: 'Chargement du rapport...',
    loadError: 'Impossible de charger le rapport de cet élément.',
  },
  stats: {
    views: 'Vues',
    whatsapp: 'Clics WhatsApp',
    favorites: 'Mis en favori',
    shares: 'Partagés',
  },
  audience: {
    title: 'Qui a consulté',
    signedIn: 'Avec un compte Use Guide',
    anonymous: 'Visiteurs',
    noViews: 'Pas encore de vues.',
  },
  chart: {
    title: 'Flux de visites',
    subtitle: '7 derniers jours',
    series: 'Vues',
  },
  reviews: {
    title: 'Avis en attente',
    waiting_one: '{{count}} en attente de réponse',
    waiting_other: '{{count}} en attente de réponse',
    showAll: 'Tout voir',
    showLess: 'Voir moins',
    rating: '{{rating}} sur 5 étoiles',
    replyPlaceholder: 'Écrivez votre réponse...',
    replyLabel: "Réponse à l'avis de {{name}}",
    send: 'Envoyer la réponse',
    cancel: 'Annuler',
    reply: "Répondre à l'avis",
    none: 'Aucun avis en attente',
    replyError: "Impossible d'envoyer la réponse.",
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -1,7 +1,19 @@
-import { type BookingsTranslation, bookingsEn, bookingsFr, bookingsPtBR } from './bookingsResources';
+import {
+  type BookingsTranslation,
+  bookingsEn,
+  bookingsFr,
+  bookingsPtBR,
+} from './bookingsResources';
+import {
+  type InsightsTranslation,
+  insightsEn,
+  insightsFr,
+  insightsPtBR,
+} from './insightsResources';
 
 export interface TranslationResource {
   bookings: BookingsTranslation;
+  insights: InsightsTranslation;
   common: {
     language: string;
     locales: {
@@ -188,6 +200,7 @@ export interface TranslationResource {
 }
 const ptBR: TranslationResource = {
   bookings: bookingsPtBR,
+  insights: insightsPtBR,
   common: {
     language: 'Idioma',
     locales: {
@@ -254,7 +267,8 @@ const ptBR: TranslationResource = {
       IMAGE_TOO_LARGE: 'A imagem passa de 6 MB. Escolha uma imagem menor.',
       INVALID_IMAGE: 'Formato não suportado. Envie uma imagem JPEG, PNG ou WebP.',
       UPLOAD_FAILED: 'Não foi possível enviar a imagem. Tente novamente.',
-      STORAGE_UNAVAILABLE: 'O armazenamento está indisponível no momento. Tente novamente em instantes.',
+      STORAGE_UNAVAILABLE:
+        'O armazenamento está indisponível no momento. Tente novamente em instantes.',
     },
     payment: {
       SUBSCRIPTION_ALREADY_ACTIVE: 'Você já tem uma assinatura ativa.',
@@ -287,7 +301,8 @@ const ptBR: TranslationResource = {
       continue: 'Continuar',
       subscribeButton: 'Assinar por {{amount}} {{period}}',
       payButton: 'Pagar {{amount}}',
-      trialNotice: 'Seu período atual já está pago. Salve o cartão agora; a primeira cobrança acontece quando esse período terminar.',
+      trialNotice:
+        'Seu período atual já está pago. Salve o cartão agora; a primeira cobrança acontece quando esse período terminar.',
       activatingTitle: 'Confirmando sua assinatura',
       activatingDescription: 'O Stripe está confirmando o pagamento. Isso leva alguns segundos.',
       activationDelayed:
@@ -331,41 +346,48 @@ const ptBR: TranslationResource = {
     routes: {
       explore: {
         title: 'Use Guide | Guia de Jericoacoara, Preá e Barrinha',
-        description: 'Descubra as melhores experiências, pousadas, restaurantes, passeios e condições de vento em tempo real em Jericoacoara, Preá e Barrinha.',
+        description:
+          'Descubra as melhores experiências, pousadas, restaurantes, passeios e condições de vento em tempo real em Jericoacoara, Preá e Barrinha.',
       },
       events: {
         title: 'Eventos & Experiências | Use Guide',
-        description: 'Fique por dentro das festas, sunsets, campeonatos de kitesurf e eventos culturais em Jericoacoara e região.',
+        description:
+          'Fique por dentro das festas, sunsets, campeonatos de kitesurf e eventos culturais em Jericoacoara e região.',
       },
       tours: {
         title: 'Aventura & Passeios | Use Guide',
-        description: 'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
+        description:
+          'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
       },
       transfers: {
-        title: "Translados em Jericoacoara | Use Guide",
+        title: 'Translados em Jericoacoara | Use Guide',
         description:
-          "Transfers entre Fortaleza, Jijoca, Jericoacoara, Preá e Barrinha: veículos, capacidade e reserva.",
+          'Transfers entre Fortaleza, Jijoca, Jericoacoara, Preá e Barrinha: veículos, capacidade e reserva.',
       },
       rentals: {
-        title: "Aluguéis em Jericoacoara | Use Guide",
+        title: 'Aluguéis em Jericoacoara | Use Guide',
         description:
-          "Aluguel de quadriciclos, buggies, bicicletas e equipamentos em Jericoacoara e região.",
+          'Aluguel de quadriciclos, buggies, bicicletas e equipamentos em Jericoacoara e região.',
       },
       stays: {
         title: 'Melhores Hospedagens & Pousadas | Use Guide',
-        description: 'Seleção curada das melhores pousadas, hotéis boutique e resorts à beira-mar em Jeri, Preá e Barrinha.',
+        description:
+          'Seleção curada das melhores pousadas, hotéis boutique e resorts à beira-mar em Jeri, Preá e Barrinha.',
       },
       restaurants: {
         title: 'Sabores Locais & Gastronomia | Use Guide',
-        description: 'Descubra os melhores restaurantes, bares de praia, frutos do mar frescos e alta gastronomia de Jeri e Preá.',
+        description:
+          'Descubra os melhores restaurantes, bares de praia, frutos do mar frescos e alta gastronomia de Jeri e Preá.',
       },
       attractions: {
         title: 'Atrações & Pontos Turísticos | Use Guide',
-        description: 'Pedra Furada, Duna do Pôr do Sol, Lagoas e os cartões-postais mais famosos do Parque Nacional de Jericoacoara.',
+        description:
+          'Pedra Furada, Duna do Pôr do Sol, Lagoas e os cartões-postais mais famosos do Parque Nacional de Jericoacoara.',
       },
       guide: {
         title: 'Guia Prático & Dicas Úteis | Use Guide',
-        description: 'Tudo o que você precisa saber: taxa de turismo, como chegar, melhor época, traslados e dicas essenciais.',
+        description:
+          'Tudo o que você precisa saber: taxa de turismo, como chegar, melhor época, traslados e dicas essenciais.',
       },
     },
   },
@@ -384,7 +406,8 @@ const ptBR: TranslationResource = {
     partnerProfileNotFound: 'Não encontramos o seu cadastro de parceiro.',
     partnerProfileLoadError: 'Não foi possível carregar o seu cadastro de parceiro.',
     partnerSuspendedTitle: 'Conta de parceiro suspensa',
-    partnerSuspended: 'Seu acesso ao painel foi suspenso pela equipe do Use Guide. Fale com o suporte para saber como reativar.',
+    partnerSuspended:
+      'Seu acesso ao painel foi suspenso pela equipe do Use Guide. Fale com o suporte para saber como reativar.',
   },
   settings: {
     title: 'Configurações',
@@ -413,6 +436,7 @@ const ptBR: TranslationResource = {
 };
 const en: TranslationResource = {
   bookings: bookingsEn,
+  insights: insightsEn,
   common: {
     language: 'Language',
     locales: {
@@ -511,7 +535,8 @@ const en: TranslationResource = {
       continue: 'Continue',
       subscribeButton: 'Subscribe for {{amount}} {{period}}',
       payButton: 'Pay {{amount}}',
-      trialNotice: 'Your current period is already paid. Save your card now; the first charge happens when that period ends.',
+      trialNotice:
+        'Your current period is already paid. Save your card now; the first charge happens when that period ends.',
       activatingTitle: 'Confirming your subscription',
       activatingDescription: 'Stripe is confirming the payment. This takes a few seconds.',
       activationDelayed:
@@ -554,41 +579,47 @@ const en: TranslationResource = {
     routes: {
       explore: {
         title: 'Use Guide | Jericoacoara, Preá & Barrinha Travel Guide',
-        description: 'Discover the best experiences, inns, restaurants, tours and real-time wind conditions in Jericoacoara, Preá and Barrinha.',
+        description:
+          'Discover the best experiences, inns, restaurants, tours and real-time wind conditions in Jericoacoara, Preá and Barrinha.',
       },
       events: {
         title: 'Events & Experiences | Use Guide',
-        description: 'Parties, sunsets, kitesurf competitions and cultural events in Jericoacoara and the region.',
+        description:
+          'Parties, sunsets, kitesurf competitions and cultural events in Jericoacoara and the region.',
       },
       tours: {
         title: 'Adventure & Tours | Use Guide',
-        description: 'Buggy and quad bike tours, crystal-clear lagoons and must-do routes around Jericoacoara.',
+        description:
+          'Buggy and quad bike tours, crystal-clear lagoons and must-do routes around Jericoacoara.',
       },
       transfers: {
-        title: "Transfers to Jericoacoara | Use Guide",
+        title: 'Transfers to Jericoacoara | Use Guide',
         description:
-          "Transfers between Fortaleza, Jijoca, Jericoacoara, Preá and Barrinha: vehicles, capacity and booking.",
+          'Transfers between Fortaleza, Jijoca, Jericoacoara, Preá and Barrinha: vehicles, capacity and booking.',
       },
       rentals: {
-        title: "Rentals in Jericoacoara | Use Guide",
-        description:
-          "Rent ATVs, buggies, bikes and gear in Jericoacoara and the region.",
+        title: 'Rentals in Jericoacoara | Use Guide',
+        description: 'Rent ATVs, buggies, bikes and gear in Jericoacoara and the region.',
       },
       stays: {
         title: 'Best Stays & Inns | Use Guide',
-        description: 'A curated selection of the best inns, boutique hotels and beachfront resorts in Jeri, Preá and Barrinha.',
+        description:
+          'A curated selection of the best inns, boutique hotels and beachfront resorts in Jeri, Preá and Barrinha.',
       },
       restaurants: {
         title: 'Local Flavors & Dining | Use Guide',
-        description: 'The best restaurants, beach bars, fresh seafood and fine dining in Jeri and Preá.',
+        description:
+          'The best restaurants, beach bars, fresh seafood and fine dining in Jeri and Preá.',
       },
       attractions: {
         title: 'Attractions & Landmarks | Use Guide',
-        description: 'Pedra Furada, Sunset Dune, the lagoons and the most famous postcards of Jericoacoara National Park.',
+        description:
+          'Pedra Furada, Sunset Dune, the lagoons and the most famous postcards of Jericoacoara National Park.',
       },
       guide: {
         title: 'Practical Guide & Tips | Use Guide',
-        description: 'Everything you need to know: tourism fee, how to get there, best season, transfers and essential tips.',
+        description:
+          'Everything you need to know: tourism fee, how to get there, best season, transfers and essential tips.',
       },
     },
   },
@@ -607,7 +638,8 @@ const en: TranslationResource = {
     partnerProfileNotFound: 'We couldn’t find your partner registration.',
     partnerProfileLoadError: 'We couldn’t load your partner registration.',
     partnerSuspendedTitle: 'Partner account suspended',
-    partnerSuspended: 'Your dashboard access was suspended by the Use Guide team. Contact support to find out how to reactivate it.',
+    partnerSuspended:
+      'Your dashboard access was suspended by the Use Guide team. Contact support to find out how to reactivate it.',
   },
   settings: {
     title: 'Settings',
@@ -636,6 +668,7 @@ const en: TranslationResource = {
 };
 const fr: TranslationResource = {
   bookings: bookingsFr,
+  insights: insightsFr,
   common: {
     language: 'Langue',
     locales: {
@@ -702,7 +735,8 @@ const fr: TranslationResource = {
       IMAGE_TOO_LARGE: "L'image dépasse 6 Mo. Choisissez une image plus légère.",
       INVALID_IMAGE: 'Format non pris en charge. Envoyez une image JPEG, PNG ou WebP.',
       UPLOAD_FAILED: "Impossible d'envoyer l'image. Veuillez réessayer.",
-      STORAGE_UNAVAILABLE: 'Le stockage est indisponible pour le moment. Réessayez dans un instant.',
+      STORAGE_UNAVAILABLE:
+        'Le stockage est indisponible pour le moment. Réessayez dans un instant.',
     },
     payment: {
       SUBSCRIPTION_ALREADY_ACTIVE: 'Vous avez déjà un abonnement actif.',
@@ -782,41 +816,48 @@ const fr: TranslationResource = {
     routes: {
       explore: {
         title: 'Use Guide | Guide de Jericoacoara, Preá et Barrinha',
-        description: 'Découvrez les meilleures expériences, pousadas, restaurants, excursions et le vent en temps réel à Jericoacoara, Preá et Barrinha.',
+        description:
+          'Découvrez les meilleures expériences, pousadas, restaurants, excursions et le vent en temps réel à Jericoacoara, Preá et Barrinha.',
       },
       events: {
         title: 'Événements & Expériences | Use Guide',
-        description: 'Fêtes, couchers de soleil, compétitions de kitesurf et événements culturels à Jericoacoara et dans la région.',
+        description:
+          'Fêtes, couchers de soleil, compétitions de kitesurf et événements culturels à Jericoacoara et dans la région.',
       },
       tours: {
         title: 'Aventure & Excursions | Use Guide',
-        description: 'Excursions en buggy et en quad, lagunes cristallines et itinéraires incontournables autour de Jericoacoara.',
+        description:
+          'Excursions en buggy et en quad, lagunes cristallines et itinéraires incontournables autour de Jericoacoara.',
       },
       transfers: {
-        title: "Transferts à Jericoacoara | Use Guide",
+        title: 'Transferts à Jericoacoara | Use Guide',
         description:
-          "Transferts entre Fortaleza, Jijoca, Jericoacoara, Preá et Barrinha : véhicules, capacité et réservation.",
+          'Transferts entre Fortaleza, Jijoca, Jericoacoara, Preá et Barrinha : véhicules, capacité et réservation.',
       },
       rentals: {
-        title: "Locations à Jericoacoara | Use Guide",
+        title: 'Locations à Jericoacoara | Use Guide',
         description:
-          "Location de quads, buggys, vélos et équipements à Jericoacoara et dans la région.",
+          'Location de quads, buggys, vélos et équipements à Jericoacoara et dans la région.',
       },
       stays: {
         title: 'Meilleurs Hébergements | Use Guide',
-        description: 'Une sélection des meilleures pousadas, hôtels boutique et resorts en bord de mer à Jeri, Preá et Barrinha.',
+        description:
+          'Une sélection des meilleures pousadas, hôtels boutique et resorts en bord de mer à Jeri, Preá et Barrinha.',
       },
       restaurants: {
         title: 'Saveurs Locales & Gastronomie | Use Guide',
-        description: 'Les meilleurs restaurants, bars de plage, fruits de mer frais et la haute gastronomie de Jeri et Preá.',
+        description:
+          'Les meilleurs restaurants, bars de plage, fruits de mer frais et la haute gastronomie de Jeri et Preá.',
       },
       attractions: {
         title: 'Attractions & Sites Touristiques | Use Guide',
-        description: 'Pedra Furada, la Dune du Coucher de Soleil, les lagunes et les cartes postales du Parc National de Jericoacoara.',
+        description:
+          'Pedra Furada, la Dune du Coucher de Soleil, les lagunes et les cartes postales du Parc National de Jericoacoara.',
       },
       guide: {
         title: 'Guide Pratique & Conseils | Use Guide',
-        description: 'Tout ce qu\'il faut savoir : taxe touristique, comment venir, meilleure saison, transferts et conseils essentiels.',
+        description:
+          "Tout ce qu'il faut savoir : taxe touristique, comment venir, meilleure saison, transferts et conseils essentiels.",
       },
     },
   },
@@ -826,16 +867,19 @@ const fr: TranslationResource = {
     backHome: 'Retour à l’accueil',
     checkoutResultMissing: 'Nous n’avons pas trouvé la commande de ce paiement.',
     planPaymentTitle: 'Paiement du forfait en cours',
-    planPaymentDescription: 'Dès que Stripe confirme, le badge apparaît dans votre espace partenaire.',
+    planPaymentDescription:
+      'Dès que Stripe confirme, le badge apparaît dans votre espace partenaire.',
     openPartnerArea: 'Ouvrir l’espace partenaire',
     partnerAreaTitle: 'Espace partenaire',
-    partnerLoginRequired: 'Connectez-vous à votre compte partenaire pour ouvrir le tableau de bord.',
+    partnerLoginRequired:
+      'Connectez-vous à votre compte partenaire pour ouvrir le tableau de bord.',
     signIn: 'Se connecter',
     partnerOnly: 'Ce tableau de bord est réservé aux partenaires inscrits.',
     partnerProfileNotFound: 'Nous n’avons pas trouvé votre inscription de partenaire.',
     partnerProfileLoadError: 'Impossible de charger votre inscription de partenaire.',
     partnerSuspendedTitle: 'Compte partenaire suspendu',
-    partnerSuspended: 'Votre accès au tableau de bord a été suspendu par l’équipe Use Guide. Contactez le support pour savoir comment le réactiver.',
+    partnerSuspended:
+      'Votre accès au tableau de bord a été suspendu par l’équipe Use Guide. Contactez le support pour savoir comment le réactiver.',
   },
   settings: {
     title: 'Paramètres',

=== src/shared/infrastructure/firebase/firebaseApiFetch.ts — diff ===
@@ -3,6 +3,8 @@ import { getFirebaseAppCheckToken } from './firebaseAppCheck';
 
 export interface FirebaseApiFetchOptions {
   requireAuth?: boolean;
+  /** Anexa o token só quando há usuário logado; a rota aceita visitantes. */
+  optionalAuth?: boolean;
   requireAppCheck?: boolean;
 }
 
@@ -11,20 +13,21 @@ export async function firebaseApiFetch(
   init: RequestInit = {},
   options: FirebaseApiFetchOptions = {}
 ): Promise<Response> {
-  const { requireAuth = false, requireAppCheck = true } = options;
+  const { requireAuth = false, optionalAuth = false, requireAppCheck = true } = options;
 
   const headers = new Headers(init.headers);
 
-  if (requireAuth) {
+  if (requireAuth || optionalAuth) {
     const currentUser = auth.currentUser;
 
-    if (!currentUser) {
+    if (!currentUser && requireAuth) {
       throw new Error('Usuário não autenticado');
     }
 
-    const idToken = await currentUser.getIdToken();
-
-    headers.set('Authorization', `Bearer ${idToken}`);
+    if (currentUser) {
+      const idToken = await currentUser.getIdToken();
+      headers.set('Authorization', `Bearer ${idToken}`);
+    }
   }
 
   if (requireAppCheck) {

=== src/shared/lib/insights.ts — APAGUE este arquivo ===

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 150 arquivos, 824 testes, `npm run build`;
- `npm run test:rules` → 4 arquivos, 60 testes.

NO PAINEL SECRETS DO AI STUDIO (não grave em arquivo):
- INSIGHTS_VIEWER_KEY: 32 caracteres aleatórios ou mais;
- TRUST_PROXY_HOPS: opcional no AI Studio; o padrão em desenvolvimento é 1.

Responda no formato do AGENTS.md §16.3.
~~~~
