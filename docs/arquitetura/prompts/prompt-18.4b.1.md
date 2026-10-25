# Prompt 18.4b.1 — Taxas por produto, políticas de cancelamento e arrependimento (D14) · Parte 1 de 2 — backend

> Lote 16, gerado do commit de referência `9e420df` da branch `claude/agents-md-v2`. Aplique depois do 18.4b.0.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4b.1 — Taxas por produto, políticas de cancelamento e arrependimento (D14) · Parte 1 de 2 — backend

Segunda etapa do 18.4 (docs/arquitetura/06-repasse-design.md).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8); os campos antigos saem direto e os dados de teste podem ser recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D14 (docs/arquitetura/decisoes.md). Este prompt ainda NÃO muda o tipo de cobrança (continua destination charge); a cobrança na plataforma com transferência depois do serviço vem no 18.4c. Até lá, um reembolso parcial devolve à plataforma parte da taxa de serviço (débito B27, registrado neste prompt).

Esta é a PARTE 1 de 2: backend, regras e testes, mais o espelho puro src/shared/utils/cancellationPolicy.ts usado pelo frontend. Envie a parte 2 (frontend) logo em seguida: até lá as telas ainda leem refundPolicy, que sai nesta parte.

O QUE MUDA:
1) server/shared/kernel/platformFees.ts substitui platformFee.ts: taxas em pontos-base vindas de BOOKINGS_PLATFORM_FEE_BPS, TICKETS_PLATFORM_FEE_BPS, TICKETS_ABSORBED_FEE_BPS e TICKET_SERVICE_FEE_MINOR, sem valor padrão no código; faltando ou inválida, a venda responde 503 SERVICE_UNAVAILABLE (§2.2.5). Arredondamento para baixo, a favor do proprietário. A taxa de serviço vale por ingresso pago (ingresso gratuito não tem taxa).
2) server/shared/kernel/cancellationPolicy.ts: políticas da plataforma (evento: flexible 24 h, moderate 7 dias, strict 30 dias, none; reserva: flexible, moderate 100% até 5 dias e 50% até 24 h, strict 50% até 7 dias, none; translado: 100% ou 95% até 24 h, Código Civil art. 740), a regra de troca (depois de publicar, só para igual ou mais flexível) e o cálculo do reembolso do comprador com o arrependimento (7 dias da compra e até 48 h antes do início: tudo, inclusive a taxa de serviço; fora disso, a política gravada, sem a taxa de serviço; depois do início, nada).
3) events: refundPolicy sai e entra salesPolicy { cancellationPolicy, serviceFeeMode ('pass_to_buyer' | 'absorb'), allowTicketTransfer, ticketTransferCutoffHours }; padrão flexible, pass_to_buyer, true, 4. Publicado, a troca para política mais rígida responde 422.
4) ticketing: o pedido grava salesPolicySnapshot e serviceFeeMinor (itens com allocatedServiceFeeMinor); total = ingressos + taxa de serviço; o reembolso pedido pelo comprador usa o cálculo do item 2; cancelamento pelo organizador ou admin devolve tudo. O PaymentIntent leva platformFeeMinor + serviceFeeMinor como application fee.
5) bookings: a oferta guarda só o identificador da política (enum), validado pelo tipo da oferta; a taxa vem de BOOKINGS_PLATFORM_FEE_BPS; o cancelamento pelo comprador usa o mesmo cálculo; saem cancellationRefund.ts e o teste de paridade antigo.
6) .env.example e README: USE_GUIDE_PLATFORM_FEE_PERCENT sai e entram as 4 variáveis acima; docs/arquitetura/debitos.md ganha B27.

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- README.md (alterar)
- docs/arquitetura/04-bookings-design.md (alterar)
- docs/arquitetura/debitos.md (alterar)
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/createBookingApplicationUseCase.ts (alterar)
- server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts (alterar)
- server/application/usecases/deletePartnerEventApplicationUseCase.test.ts (alterar)
- server/application/usecases/eventLifecycleOrchestration.test.ts (alterar)
- server/application/usecases/ticketingPaymentOrchestration.test.ts (alterar)
- server/application/usecases/updatePartnerEventApplicationUseCase.test.ts (alterar)
- server/domain/bookings/errors/bookingDomainError.ts (alterar)
- server/domain/bookings/index.ts (alterar)
- server/domain/bookings/services/bookingService.test.ts (alterar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/domain/bookings/services/offerService.test.ts (alterar)
- server/domain/bookings/services/offerService.ts (alterar)
- server/domain/bookings/types/bookingTypes.ts (alterar)
- server/domain/bookings/usecases/createPendingBookingUseCase.ts (alterar)
- server/domain/bookings/utils/bookingPricing.ts (alterar)
- server/domain/bookings/utils/bookingUtils.test.ts (alterar)
- server/domain/bookings/utils/cancellationRefund.ts (apagar)
- server/domain/bookings/utils/refundParity.test.ts (apagar)
- server/domain/events/dtos/eventPersistenceMappers.ts (alterar)
- server/domain/events/schemas/eventSchema.ts (alterar)
- server/domain/events/services/eventsService.test.ts (alterar)
- server/domain/events/services/eventsService.ts (alterar)
- server/domain/events/types/eventTypes.ts (alterar)
- server/domain/partners/schemas/partnerContentSchema.ts (alterar)
- server/domain/ticketing/adapters/firestoreOrderReservationStore.ts (alterar)
- server/domain/ticketing/dtos/ticketingPersistenceMappers.ts (alterar)
- server/domain/ticketing/ports/ticketingPort.ts (alterar)
- server/domain/ticketing/services/orders/prepareOrderItems.ts (alterar)
- server/domain/ticketing/services/ticketHolderService.ts (alterar)
- server/domain/ticketing/services/ticketOrderService.ts (alterar)
- server/domain/ticketing/services/ticketRefundService.ts (alterar)
- server/domain/ticketing/services/ticketingServices.test.ts (alterar)
- server/domain/ticketing/types/ticketingTypes.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.test.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.ts (alterar)
- server/shared/kernel/cancellationPolicy.test.ts (criar)
- server/shared/kernel/cancellationPolicy.ts (criar)
- server/shared/kernel/platformFee.test.ts (apagar)
- server/shared/kernel/platformFee.ts (apagar)
- server/shared/kernel/platformFees.test.ts (criar)
- server/shared/kernel/platformFees.ts (criar)
- src/shared/utils/cancellationPolicy.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -20,7 +20,11 @@ VITE_STRIPE_PUBLISHABLE_KEY=
 # WhatsApp do suporte, em E.164 (ex: +5588999999999). Público; sem valor, o botão de WhatsApp do suporte não aparece.
 VITE_SUPPORT_WHATSAPP=
 STRIPE_WEBHOOK_SECRET=
-USE_GUIDE_PLATFORM_FEE_PERCENT=10
+# Taxas da plataforma (D14), obrigatórias para vender: percentuais em pontos-base (1500 = 15%) e taxa de serviço em centavos.
+BOOKINGS_PLATFORM_FEE_BPS=1500
+TICKETS_PLATFORM_FEE_BPS=1000
+TICKETS_ABSORBED_FEE_BPS=1250
+TICKET_SERVICE_FEE_MINOR=300
 # Vagas de "Destaque" por lista no rodízio diário (D11); inteiro de 0 a 12, padrão 3.
 FEATURED_SLOTS_PER_LIST=3

=== README.md — diff ===
@@ -78,7 +78,10 @@ APP_URL="http://localhost:3000"
 STRIPE_SECRET_KEY="sua_chave_secreta_stripe"
 STRIPE_WEBHOOK_SECRET="seu_webhook_secret_stripe"
 VITE_STRIPE_PUBLISHABLE_KEY="sua_chave_publicavel_stripe"
-USE_GUIDE_PLATFORM_FEE_PERCENT="10"
+BOOKINGS_PLATFORM_FEE_BPS="1500"
+TICKETS_PLATFORM_FEE_BPS="1000"
+TICKETS_ABSORBED_FEE_BPS="1250"
+TICKET_SERVICE_FEE_MINOR="300"
 
 ```

=== docs/arquitetura/04-bookings-design.md — diff ===
@@ -156,7 +156,7 @@ O backend ignora qualquer preço vindo do cliente; recalcula com `pricing` da of
 ## 5. Pagamento
 
 * Novo UseCase genérico em `payment`: `createMarketplacePaymentIntentUseCase({ referenceType: 'booking', referenceId, buyerId, sellerPartnerId, description, totalMinor, platformFeeMinor, idempotencyKey })` — destination charge (D1), `metadata: { referenceType: 'booking', referenceId, partnerId }`.
-* Taxa: `platformFeeMinor = Math.round(subtotalMinor * USE_GUIDE_PLATFORM_FEE_PERCENT / 100)`.
+* Taxa: `bookingPlatformFeeMinor` de `server/shared/kernel/platformFees.ts` (`BOOKINGS_PLATFORM_FEE_BPS`, arredondamento para baixo; D14).
 * Antes de criar: `assertPartnerReadyForPaidEventUseCase(sellerPartnerId)` (conta conectada habilitada).
 * Webhook: novo ramo em `reconcileStripeWebhookEventApplicationUseCase` para `metadata.referenceType === 'booking'` (`succeeded` → `confirmBookingPaymentUseCase`; `payment_failed` → `markBookingPaymentFailedUseCase`; disputa → `markBookingDisputedUseCase`; refund com `metadata.bookingId`).

=== docs/arquitetura/debitos.md — diff ===
@@ -12,13 +12,14 @@
 | B12 | `application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts` (notificação de falha de cobrança) | §12.5 (texto do backend em pt-BR) | baixo | `notifications` passar a aceitar chave de tradução e gerar no idioma do parceiro |
 | B13 | `application/usecases/bookings/*` (horário cancelado, reembolso que falhou) | §8.7 (avisar o comprador) e §7.10 A09 (alerta ao admin) | médio — o comprador só descobre o cancelamento em "Minhas reservas" e a falha de reembolso fica só no log | `notifications` aceitar destinatário usuário e admin (hoje só `recipientPartnerId`) |
 | B14 | UX — itens da auditoria de 2026-10-12 que pedem decisão de produto | §11 (UX) e §15 item 4 | baixo a médio | (a) preferências de notificação do parceiro estão em "Sobre o app" (`content/components/AboutView.tsx`), deveriam ir para Configurações; (b) "Ver todos" da Explore abre a listagem sem a busca e os filtros aplicados (`GridView` não tem filtros); (c) modais de hospedagem e restaurante não têm botão de mapa (`mapLink`); (d) "Programa de Parceiros" aberto pelo menu não volta ao menu ao fechar |
-| B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/UserTicketsHistoryView.tsx` e `CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro |
+| B16 | textos fixos em pt-BR ainda em `user/components/AccountView.tsx`, `ticketing/components/CheckoutResultView.tsx`, `partners/components/PartnersModal.tsx`, `guide/components/ExploreView.tsx` | §12.3 | médio para en/fr | traduzir tela a tela; o Prompt 16 traduziu menu, configurações, favoritos e portal do parceiro; o 18.4b traduziu a compra de ingressos e a carteira |
 | B17 | Painel do parceiro — itens da auditoria de 2026-10-12 ainda abertos | §11.8, §11.10, §12.4, §11.7, §13 | médio | seção de reservas aparece para hospedagem/restaurante; ingressos ocultos em evento novo sem aviso; relatórios bloqueados só na UI; quem já assina vê a compra de novo; erros de catálogo/notificações aparecem como lista vazia; excluir lote e "não compareceu" sem confirmação; `PartnerItemForms.tsx` sem uso; `Step2ContactInfo.tsx` (516 linhas) e `Step5Media.tsx` (756) acima de 400 linhas |
 | B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
 | B21 | `package-lock.json`: `npm audit --omit=dev` aponta 10 vulnerabilidades (1 crítica, 7 altas) em `firebase`, `@firebase/firestore`, `@grpc/grpc-js`, `gaxios`, `proxy-addr`, `uuid` e outras | §7.4 e §7.10 A06 (sem high/critical para merge) | alto — já existiam antes do Prompt 18.3.0a; a dependência nova (`@google-cloud/kms` 6.2.1) não acrescentou nenhuma | prompt próprio de atualização de dependências, testando cada salto de versão |
 | B25 | `src/index.css`: o tema claro ainda depende de sobrescritas globais com `!important` (`:root.light .text-white`, `.bg-white/5`, `.border-white/10`…) para as telas que usam cores fixas; `biome-ignore-all lint/complexity/noImportantStyles` no topo do arquivo | §11.1 (tokens, nunca `text-white` fixo em superfície que muda) e §13 (sem avisos) | médio — cor nova sem token pode sair ilegível no claro; as sobrescritas valem para o app todo | cada tela tocada passa a usar os tokens `--ug-*` (`text-ink`, `bg-surface`, `border-line`, `text-warn`…); quando nenhuma usar mais as classes fixas, as sobrescritas e o `biome-ignore-all` saem |
 | B26 | Avisos de conta financeira no painel de ingressos (`usePartnerMerchantAccount`) e de reservas (`PartnerBookingsComposition`): consideram pronto quando **algum** CNPJ da conta está pronto para receber, não o CNPJ do evento ou da oferta | D14 (conta por documento) | baixo — só o aviso na tela; a venda e a publicação conferem a conta do CNPJ certo no backend (`assertListingCanSellUseCase` + `assertPaymentAccountReadyUseCase`) | Prompt 18.4e: aviso por estabelecimento; `PartnerEventTicketingManager` (1111 linhas) dividido ao tocar |
+| B27 | `createTicketOrderPaymentIntentApplicationUseCase` e `processProviderRefundUseCase` (cobrança com destino até o 18.4c) | D14 (taxa de serviço não volta fora do arrependimento) | baixo — num reembolso parcial o Stripe devolve à plataforma parte proporcional do `application_fee`, que inclui a taxa de serviço; a plataforma deixa de reter essa parte | 18.4c: cobrança na plataforma com transferência separada; o repasse é calculado pelo valor que o proprietário fica |
 
 ## Resolvidos

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — diff ===
@@ -55,6 +55,13 @@ const INPUT = {
 };
 const BUYER = { uid: 'buyer-1', admin: false, emailVerified: true };
 
+beforeEach(() => {
+  vi.stubEnv('BOOKINGS_PLATFORM_FEE_BPS', '1500');
+  vi.stubEnv('TICKETS_PLATFORM_FEE_BPS', '1000');
+  vi.stubEnv('TICKETS_ABSORBED_FEE_BPS', '1250');
+  vi.stubEnv('TICKET_SERVICE_FEE_MINOR', '300');
+});
+
 describe('createBookingApplicationUseCase', () => {
   beforeEach(() => {
     vi.clearAllMocks();

=== server/application/usecases/bookings/createBookingApplicationUseCase.ts — diff ===
@@ -6,7 +6,10 @@ import {
 } from '../../../domain/bookings';
 import { assertListingCanSellUseCase } from '../../../domain/partners';
 import { createMarketplacePaymentIntentUseCase } from '../../../domain/payment';
-import { resolvePlatformFeePercent } from '../../../shared/kernel/platformFee';
+import {
+  PlatformFeeConfigError,
+  resolvePlatformFeeConfig,
+} from '../../../shared/kernel/platformFees';
 import { isPartnerSuspended } from '../isPartnerSuspended';
 
 export interface BookingBuyer {
@@ -23,6 +26,19 @@ export interface CreateBookingResult {
   expiresAt: string | null;
 }
 
+function loadFeeConfig() {
+  try {
+    return resolvePlatformFeeConfig();
+  } catch (error) {
+    if (error instanceof PlatformFeeConfigError) {
+      // Sem taxa configurada a venda para (AGENTS.md §2.2.5); o nome da variável fica só no log.
+      console.error('[bookings] taxas da plataforma não configuradas', { message: error.message });
+      throw new BookingDomainError('SERVICE_UNAVAILABLE', 'Reservas indisponíveis no momento.');
+    }
+    throw error;
+  }
+}
+
 /** Reserva as vagas e cria o pagamento (destination charge). Quem confirma é o webhook. */
 export async function createBookingApplicationUseCase(
   buyer: BookingBuyer,
@@ -32,11 +48,10 @@ export async function createBookingApplicationUseCase(
   if (!buyer.emailVerified) {
     throw new BookingDomainError('EMAIL_NOT_VERIFIED', 'Confirme seu e-mail antes de reservar.');
   }
-  const platformFeePercent = resolvePlatformFeePercent();
   const booking = await createPendingBookingUseCase(
     { uid: buyer.uid, admin: buyer.admin },
     input,
-    platformFeePercent
+    loadFeeConfig()
   );
 
   try {

=== server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts — diff ===
@@ -105,7 +105,8 @@ export async function createTicketOrderPaymentIntentApplicationUseCase(
     occurrenceId: order.occurrenceId,
     eventTitle: order.eventSnapshot?.title || listing.title,
     totalMinor: order.totalMinor,
-    platformFeeMinor: order.platformFeeMinor,
+    // A taxa de serviço do comprador também fica com a plataforma (D14).
+    platformFeeMinor: order.platformFeeMinor + order.serviceFeeMinor,
     idempotencyKey: input.idempotencyKey,
   });

=== server/application/usecases/deletePartnerEventApplicationUseCase.test.ts — diff ===
@@ -1,10 +1,7 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
 import { deletePartnerEventApplicationUseCase } from './deletePartnerEventApplicationUseCase';
-import {
-  getEventListingByIdUseCase,
-  type EventListing,
-} from '../../domain/events';
+import { getEventListingByIdUseCase, type EventListing } from '../../domain/events';
 import { linkBusinessUseCase, unlinkBusinessUseCase } from '../../domain/partners';
 import { deleteEventListingSafelyApplicationUseCase } from './deleteEventListingSafelyApplicationUseCase';
 
@@ -17,7 +14,9 @@ vi.mock('../../domain/partners', () => ({
   unlinkBusinessUseCase: vi.fn(),
 }));
 
-vi.mock('./deleteEventListingSafelyApplicationUseCase', () => ({ deleteEventListingSafelyApplicationUseCase: vi.fn() }));
+vi.mock('./deleteEventListingSafelyApplicationUseCase', () => ({
+  deleteEventListingSafelyApplicationUseCase: vi.fn(),
+}));
 
 describe('deletePartnerEventApplicationUseCase', () => {
   const regularUser: AuthenticatedUserContext = {
@@ -43,7 +42,12 @@ describe('deletePartnerEventApplicationUseCase', () => {
     isActive: true,
     organizerId: 'partner-C',
     location: { name: 'Jeri' },
-    refundPolicy: { enabled: true },
+    salesPolicy: {
+      cancellationPolicy: 'flexible',
+      serviceFeeMode: 'pass_to_buyer',
+      allowTicketTransfer: true,
+      ticketTransferCutoffHours: 4,
+    },
     date: '2026-12-31T20:00:00Z',
     endDate: '2027-01-01T04:00:00Z',
     createdAt: '2026-06-01T12:00:00.000Z',
@@ -57,12 +61,17 @@ describe('deletePartnerEventApplicationUseCase', () => {
   it('unlink sucesso + delete sucesso', async () => {
     vi.mocked(getEventListingByIdUseCase).mockResolvedValueOnce(mockEvent);
     vi.mocked(unlinkBusinessUseCase).mockResolvedValueOnce(undefined);
-    vi.mocked(deleteEventListingSafelyApplicationUseCase).mockResolvedValueOnce({ mode: 'deleted' });
+    vi.mocked(deleteEventListingSafelyApplicationUseCase).mockResolvedValueOnce({
+      mode: 'deleted',
+    });
 
     await deletePartnerEventApplicationUseCase(regularUser, 'event-200');
 
     expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-C', 'event-200');
-    expect(deleteEventListingSafelyApplicationUseCase).toHaveBeenCalledWith(regularUser, 'event-200');
+    expect(deleteEventListingSafelyApplicationUseCase).toHaveBeenCalledWith(
+      regularUser,
+      'event-200'
+    );
     expect(linkBusinessUseCase).not.toHaveBeenCalled();
   });
 
@@ -92,7 +101,10 @@ describe('deletePartnerEventApplicationUseCase', () => {
     );
 
     expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-C', 'event-200');
-    expect(deleteEventListingSafelyApplicationUseCase).toHaveBeenCalledWith(regularUser, 'event-200');
+    expect(deleteEventListingSafelyApplicationUseCase).toHaveBeenCalledWith(
+      regularUser,
+      'event-200'
+    );
     expect(linkBusinessUseCase).toHaveBeenCalledWith('partner-C', {
       businessId: 'event-200',
       businessName: 'Luau Jeri',
@@ -153,7 +165,10 @@ describe('deletePartnerEventApplicationUseCase', () => {
     );
 
     expect(unlinkBusinessUseCase).toHaveBeenCalledWith('partner-C', 'event-200');
-    expect(deleteEventListingSafelyApplicationUseCase).toHaveBeenCalledWith(regularUser, 'event-200');
+    expect(deleteEventListingSafelyApplicationUseCase).toHaveBeenCalledWith(
+      regularUser,
+      'event-200'
+    );
     expect(linkBusinessUseCase).not.toHaveBeenCalled();
   });
 });

=== server/application/usecases/eventLifecycleOrchestration.test.ts — diff ===
@@ -37,7 +37,9 @@ vi.mock('../../domain/ticketing', () => ({
   moveOrderToOccurrenceUseCase: vi.fn(),
 }));
 
-vi.mock('./processTicketRefundApplicationUseCase', () => ({ processTicketRefundApplicationUseCase: vi.fn() }));
+vi.mock('./processTicketRefundApplicationUseCase', () => ({
+  processTicketRefundApplicationUseCase: vi.fn(),
+}));
 
 describe('eventLifecycleOrchestrationUseCases', () => {
   const actor = { uid: 'partner-1', admin: false, role: 'partner' };
@@ -64,6 +66,7 @@ describe('eventLifecycleOrchestrationUseCases', () => {
     discountMinor: 0,
     platformFeeMinor: 1000,
     paymentFeeMinor: 0,
+    serviceFeeMinor: 0,
     totalMinor: 10000,
     buyerSnapshot: { name: 'João', email: 'joao@example.com' },
     eventSnapshot: {
@@ -71,11 +74,11 @@ describe('eventLifecycleOrchestrationUseCases', () => {
       startsAt: '2026-09-10T20:00:00.000Z',
       endsAt: '2026-09-10T23:59:00.000Z',
     },
-    refundPolicySnapshot: {
-      enabled: true,
-      cancellationWindowHours: 24,
-      allowBuyerCancellation: true,
+    salesPolicySnapshot: {
+      cancellationPolicy: 'flexible',
+      serviceFeeMode: 'pass_to_buyer',
       allowTicketTransfer: true,
+      ticketTransferCutoffHours: 4,
     },
     idempotencyKey: 'idem-1',
     createdAt: '2026-06-02T10:00:00.000Z',

=== server/application/usecases/ticketingPaymentOrchestration.test.ts — diff ===
@@ -43,7 +43,12 @@ describe('ticketingPaymentOrchestrationUseCases — refunds', () => {
 
   it('repassa metadata.refundId e orderId ao provedor ao criar reembolso', async () => {
     vi.mocked(requestTicketRefundUseCase).mockResolvedValue({
-      refund: { id: 'ref_1', orderId: 'ord_1', amountMinor: 5000, status: 'pending_provider' } as Refund,
+      refund: {
+        id: 'ref_1',
+        orderId: 'ord_1',
+        amountMinor: 5000,
+        status: 'pending_provider',
+      } as Refund,
       isReplay: false,
       order: { id: 'ord_1', paymentIntentId: 'pi_1' } as TicketOrder,
     });
@@ -51,7 +56,10 @@ describe('ticketingPaymentOrchestrationUseCases — refunds', () => {
       providerRefundId: 're_stripe_1',
       status: 'pending',
     });
-    vi.mocked(finalizeTicketRefundStatusUseCase).mockResolvedValue({ id: 'ref_1', status: 'pending_provider' } as Refund);
+    vi.mocked(finalizeTicketRefundStatusUseCase).mockResolvedValue({
+      id: 'ref_1',
+      status: 'pending_provider',
+    } as Refund);
 
     await processTicketRefundApplicationUseCase(
       { uid: 'u1' },

=== server/application/usecases/updatePartnerEventApplicationUseCase.test.ts — diff ===
@@ -1,10 +1,7 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
 import { updatePartnerEventApplicationUseCase } from './updatePartnerEventApplicationUseCase';
-import {
-  getEventListingByIdUseCase,
-  type EventListing,
-} from '../../domain/events';
+import { getEventListingByIdUseCase, type EventListing } from '../../domain/events';
 import { updateBusinessUseCase } from '../../domain/partners';
 import { updateEventListingSafelyApplicationUseCase } from './updateEventListingSafelyApplicationUseCase';
 
@@ -17,7 +14,9 @@ vi.mock('../../domain/partners', () => ({
   updateBusinessUseCase: vi.fn(),
 }));
 
-vi.mock('./updateEventListingSafelyApplicationUseCase', () => ({ updateEventListingSafelyApplicationUseCase: vi.fn() }));
+vi.mock('./updateEventListingSafelyApplicationUseCase', () => ({
+  updateEventListingSafelyApplicationUseCase: vi.fn(),
+}));
 
 describe('updatePartnerEventApplicationUseCase', () => {
   const regularUser: AuthenticatedUserContext = {
@@ -51,7 +50,12 @@ describe('updatePartnerEventApplicationUseCase', () => {
     isActive: true,
     organizerId: 'partner-B',
     location: { name: 'Centro Cultural' },
-    refundPolicy: { enabled: true },
+    salesPolicy: {
+      cancellationPolicy: 'flexible',
+      serviceFeeMode: 'pass_to_buyer',
+      allowTicketTransfer: true,
+      ticketTransferCutoffHours: 4,
+    },
     createdAt: '2026-06-01T12:00:00.000Z',
     updatedAt: '2026-06-01T12:00:00.000Z',
   };

=== server/domain/bookings/errors/bookingDomainError.ts — diff ===
@@ -9,7 +9,9 @@ export type BookingErrorCode =
   | 'LATE_PAYMENT_REJECTED'
   | 'KIND_NOT_AVAILABLE'
   | 'CANCELLATION_NOT_ALLOWED'
-  | 'PARTNER_SUSPENDED';
+  | 'PARTNER_SUSPENDED'
+  | 'POLICY_CHANGE_NOT_ALLOWED'
+  | 'SERVICE_UNAVAILABLE';
 
 const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   VALIDATION_ERROR: 400,
@@ -23,6 +25,8 @@ const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   KIND_NOT_AVAILABLE: 422,
   CANCELLATION_NOT_ALLOWED: 422,
   PARTNER_SUSPENDED: 403,
+  POLICY_CHANGE_NOT_ALLOWED: 422,
+  SERVICE_UNAVAILABLE: 503,
 };
 
 export class BookingDomainError extends Error {

=== server/domain/bookings/index.ts — diff ===
@@ -46,4 +46,3 @@ export {
   type PublicSlot,
 } from './types/bookingTypes';
 export { priceBookingLines } from './utils/bookingPricing';
-export { calculateCancellationRefund } from './utils/cancellationRefund';

=== server/domain/bookings/services/bookingService.test.ts — diff ===
@@ -4,6 +4,13 @@ import type { BookableOffer } from '../types/bookingTypes';
 import { BookingService, type CreatePendingBookingInput } from './bookingService';
 
 const BUYER = { uid: 'buyer-1', admin: false };
+const FEES = {
+  bookingsBps: 1000,
+  ticketsBps: 1000,
+  ticketsAbsorbedBps: 1250,
+  ticketServiceFeeMinor: 300,
+};
+
 const STARTS_AT = '2026-11-10T11:00:00.000Z';
 
 function buildOffer(overrides: Partial<BookableOffer> = {}): BookableOffer {
@@ -20,7 +27,7 @@ function buildOffer(overrides: Partial<BookableOffer> = {}): BookableOffer {
       priceOptions: [{ id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 10000 }],
     },
     durationMinutes: 120,
-    cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 },
+    cancellationPolicy: 'moderate',
     maxParticipantsPerBooking: 6,
     requiresParticipantNames: false,
     createdAt: '2026-10-01T00:00:00.000Z',
@@ -65,7 +72,7 @@ const INPUT: CreatePendingBookingInput = {
 describe('BookingService', () => {
   it('cria reserva pendente com preço do backend, vagas reservadas e prazo de 15 min', async () => {
     const { service, port } = setup();
-    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     expect(booking).toMatchObject({
       status: 'pending_payment',
       totalMinor: 20000,
@@ -78,8 +85,8 @@ describe('BookingService', () => {
 
   it('mesma chave de idempotência devolve a mesma reserva sem reservar de novo', async () => {
     const { service, port } = setup();
-    const first = await service.createPendingBooking(BUYER, INPUT, 10);
-    const second = await service.createPendingBooking(BUYER, INPUT, 10);
+    const first = await service.createPendingBooking(BUYER, INPUT, FEES);
+    const second = await service.createPendingBooking(BUYER, INPUT, FEES);
     expect(second.id).toBe(first.id);
     expect(port.slots.get('slot-1')?.capacityReserved).toBe(2);
   });
@@ -87,9 +94,9 @@ describe('BookingService', () => {
   it('horário de outra oferta → VALIDATION_ERROR; vagas insuficientes → 409', async () => {
     const { service } = setup({ capacity: 1 });
     await expect(
-      service.createPendingBooking(BUYER, { ...INPUT, slotId: 'slot-other' }, 10)
+      service.createPendingBooking(BUYER, { ...INPUT, slotId: 'slot-other' }, FEES)
     ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
-    await expect(service.createPendingBooking(BUYER, INPUT, 10)).rejects.toMatchObject({
+    await expect(service.createPendingBooking(BUYER, INPUT, FEES)).rejects.toMatchObject({
       code: 'INSUFFICIENT_CAPACITY',
       statusCode: 409,
     });
@@ -98,19 +105,19 @@ describe('BookingService', () => {
   it('exige um nome por participante quando a oferta pede', async () => {
     const { service } = setup({ offer: { requiresParticipantNames: true } });
     await expect(
-      service.createPendingBooking(BUYER, { ...INPUT, participants: [{ name: 'Ana' }] }, 10)
+      service.createPendingBooking(BUYER, { ...INPUT, participants: [{ name: 'Ana' }] }, FEES)
     ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
     const booking = await service.createPendingBooking(
       BUYER,
       { ...INPUT, participants: [{ name: 'Ana' }, { name: 'Bia' }] },
-      10
+      FEES
     );
     expect(booking.status).toBe('pending_payment');
   });
 
   it('terceiro não vê a reserva (404); comprador e parceiro vendedor veem', async () => {
     const { service } = setup();
-    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     await expect(
       service.getBookingForActor({ uid: 'intruso', admin: false }, booking.id)
     ).rejects.toMatchObject({ code: 'NOT_FOUND' });
@@ -122,7 +129,7 @@ describe('BookingService', () => {
 
   it('confirmação move vagas de reservadas para vendidas e é idempotente', async () => {
     const { service, port } = setup();
-    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     await service.confirmBookingPayment(booking.id, 'pi_1');
     await service.confirmBookingPayment(booking.id, 'pi_1');
     expect(port.slots.get('slot-1')).toMatchObject({ capacityReserved: 0, capacitySold: 2 });
@@ -131,20 +138,20 @@ describe('BookingService', () => {
 
   it('expiração devolve as vagas; pagamento tardio sem vaga é recusado', async () => {
     const { service, port, setNow } = setup({ capacity: 2 });
-    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     setNow('2026-11-01T12:16:00.000Z');
     await expect(service.expireOverdueBookings()).resolves.toBe(1);
     expect(port.slots.get('slot-1')?.capacityReserved).toBe(0);
-    const other = await service.createPendingBooking({ uid: 'buyer-2', admin: false }, INPUT, 10);
+    const other = await service.createPendingBooking({ uid: 'buyer-2', admin: false }, INPUT, FEES);
     await service.confirmBookingPayment(other.id, 'pi_2');
     await expect(service.confirmBookingPayment(booking.id, 'pi_1')).rejects.toMatchObject({
       code: 'LATE_PAYMENT_REJECTED',
     });
   });
 
-  it('cancelamento pelo comprador: 100% antes do prazo, repetível, devolve a vaga', async () => {
+  it('arrependimento (7 dias da compra, 48 h antes): 100%, repetível, devolve a vaga', async () => {
     const { service, port } = setup();
-    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     await service.confirmBookingPayment(booking.id, 'pi_1');
     const first = await service.requestCancellationByBuyer(BUYER, booking.id, 'mudança de planos');
     expect(first).toMatchObject({ refundPercent: 100, refundAmountMinor: 20000 });
@@ -153,14 +160,14 @@ describe('BookingService', () => {
     expect(again.refundAmountMinor).toBe(20000);
   });
 
-  it('cancelamento depois do prazo devolve 50%; outra pessoa não cancela', async () => {
+  it('fora do arrependimento vale a política (moderada: 50% até 24 h); outra pessoa não cancela', async () => {
     const { service, setNow } = setup();
-    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     await service.confirmBookingPayment(booking.id, 'pi_1');
     await expect(
       service.requestCancellationByBuyer({ uid: 'intruso', admin: false }, booking.id, '')
     ).rejects.toMatchObject({ code: 'NOT_FOUND' });
-    setNow('2026-11-10T00:00:00.000Z');
+    setNow('2026-11-09T00:00:00.000Z');
     await expect(service.requestCancellationByBuyer(BUYER, booking.id, '')).resolves.toMatchObject({
       refundPercent: 50,
       refundAmountMinor: 10000,
@@ -169,7 +176,7 @@ describe('BookingService', () => {
 
   it('reserva pendente não pode ser cancelada pelo comprador', async () => {
     const { service } = setup();
-    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     await expect(service.requestCancellationByBuyer(BUYER, booking.id, '')).rejects.toMatchObject({
       code: 'CANCELLATION_NOT_ALLOWED',
     });
@@ -177,7 +184,7 @@ describe('BookingService', () => {
 
   it('não comparecimento só pelo parceiro e só depois do início; conclusão após a duração', async () => {
     const { service, port, setNow } = setup();
-    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     await service.confirmBookingPayment(booking.id, 'pi_1');
     const partner = { uid: 'partner-1', admin: false };
     await expect(service.markBookingNoShow(partner, booking.id)).rejects.toMatchObject({

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -1,16 +1,18 @@
 import type { Locale } from '../../../shared/kernel/locale';
 import { BookingDomainError } from '../errors/bookingDomainError';
 import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
-import type {
-  Booking,
-  BookingActor,
-  BookingCancellation,
-  BookingParticipant,
-  Page,
+import {
+  type Booking,
+  type BookingActor,
+  type BookingCancellation,
+  type BookingParticipant,
+  cancellationFamilyOf,
+  type Page,
 } from '../types/bookingTypes';
 import { buildBookingId } from '../utils/buildBookingId';
 import { priceBookingLines } from '../utils/bookingPricing';
-import { calculateCancellationRefund } from '../utils/cancellationRefund';
+import { calculateBuyerRefund } from '../../../shared/kernel/cancellationPolicy';
+import type { PlatformFeeConfig } from '../../../shared/kernel/platformFees';
 
 // Tempo para pagar antes de a vaga voltar para a venda (inclui o Pix, que é assíncrono).
 const PAYMENT_WINDOW_MS = 15 * 60 * 1000;
@@ -27,7 +29,7 @@ export interface CreatePendingBookingInput {
 
 export interface BuyerCancellationResult {
   booking: Booking;
-  refundPercent: 0 | 50 | 100;
+  refundPercent: number;
   refundAmountMinor: number;
 }
 
@@ -45,7 +47,7 @@ export class BookingService {
   async createPendingBooking(
     actor: BookingActor,
     input: CreatePendingBookingInput,
-    platformFeePercent: number
+    feeConfig: PlatformFeeConfig
   ): Promise<Booking> {
     const offer = await this.port.getOffer(input.offerId);
     if (offer?.status !== 'published') {
@@ -55,7 +57,7 @@ export class BookingService {
     if (slot?.offerId !== offer.id) {
       throw new BookingDomainError('VALIDATION_ERROR', 'Horário não pertence a esta oferta.');
     }
-    const priced = priceBookingLines(offer, input.lines, platformFeePercent);
+    const priced = priceBookingLines(offer, input.lines, feeConfig);
 
     const names = input.participants.map((participant) => participant.name.trim());
     if (offer.requiresParticipantNames) {
@@ -175,12 +177,20 @@ export class BookingService {
       );
     }
     const nowDate = this.now();
-    const refund = calculateCancellationRefund({
+    // D14: arrependimento de 7 dias até 48 h antes do início, senão a política gravada na compra.
+    const calculated = calculateBuyerRefund({
+      family: cancellationFamilyOf(booking.kind),
       policy: booking.offerSnapshot.cancellationPolicy,
+      purchasedAt: booking.createdAt,
       startsAt: booking.offerSnapshot.startsAt,
-      totalMinor: booking.totalMinor,
       now: nowDate,
+      paidMinor: booking.totalMinor,
+      serviceFeeMinor: 0,
     });
+    const refund = {
+      refundPercent: calculated.percent,
+      refundAmountMinor: calculated.refundMinor,
+    };
     const cancellation: BookingCancellation = {
       by: 'buyer',
       ...refund,

=== server/domain/bookings/services/offerService.test.ts — diff ===
@@ -13,7 +13,7 @@ const INPUT: OfferInput = {
     priceOptions: [{ id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 15000 }],
   },
   durationMinutes: 240,
-  cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 },
+  cancellationPolicy: 'flexible',
   maxParticipantsPerBooking: 8,
   requiresParticipantNames: false,
 };

=== server/domain/bookings/services/offerService.ts — diff ===
@@ -1,3 +1,7 @@
+import {
+  canChangeCancellationPolicy,
+  isCancellationPolicyAllowed,
+} from '../../../shared/kernel/cancellationPolicy';
 import { BookingDomainError } from '../errors/bookingDomainError';
 import type { BookableItemLookupPort } from '../ports/bookableItemLookupPort';
 import type { BookingsPort } from '../ports/bookingsPort';
@@ -10,6 +14,7 @@ import {
   type Booking,
   type BookingActor,
   type PublicBookableOffer,
+  cancellationFamilyOf,
   type PublicSlot,
 } from '../types/bookingTypes';
 import { buildSlotId } from '../utils/buildBookingId';
@@ -46,6 +51,15 @@ export type CreateSlotsInput =
   | { mode: 'list'; slots: Array<{ startsAt: string; endsAt?: string }>; capacity: number }
   | ({ mode: 'recurrence'; capacity: number } & SlotRecurrence);
 
+function assertPolicyForKind(kind: BookableOfferKind, policy: string): void {
+  if (!isCancellationPolicyAllowed(cancellationFamilyOf(kind), policy)) {
+    throw new BookingDomainError(
+      'VALIDATION_ERROR',
+      'Política de cancelamento não disponível para este tipo de oferta.'
+    );
+  }
+}
+
 function assertValidPricing(pricing: BookableOffer['pricing']): void {
   if (pricing.priceOptions.length === 0) {
     throw new BookingDomainError('VALIDATION_ERROR', 'Informe ao menos uma opção de preço.');
@@ -94,6 +108,7 @@ export class OfferService {
       throw new BookingDomainError('VALIDATION_ERROR', 'Tipo de oferta incompatível com o item.');
     }
     assertValidPricing(input.pricing);
+    assertPolicyForKind(input.kind, input.cancellationPolicy);
 
     const timestamp = this.now().toISOString();
     const offer: BookableOffer = {
@@ -119,6 +134,20 @@ export class OfferService {
       throw new BookingDomainError('INVALID_TRANSITION', 'Oferta arquivada não pode ser editada.');
     }
     if (input.pricing) assertValidPricing(input.pricing);
+    if (input.cancellationPolicy) {
+      assertPolicyForKind(offer.kind, input.cancellationPolicy);
+      // D14: depois de publicar, a política só fica igual ou mais flexível (protege quem já reservou).
+      const family = cancellationFamilyOf(offer.kind);
+      if (
+        offer.status !== 'draft' &&
+        !canChangeCancellationPolicy(family, offer.cancellationPolicy, input.cancellationPolicy)
+      ) {
+        throw new BookingDomainError(
+          'POLICY_CHANGE_NOT_ALLOWED',
+          'Depois de publicar, a política de cancelamento só pode ficar mais flexível.'
+        );
+      }
+    }
     const updated: BookableOffer = { ...offer, ...input, updatedAt: this.now().toISOString() };
     await this.port.saveOffer(updated);
     if (updated.status === 'published') {

=== server/domain/bookings/types/bookingTypes.ts — diff ===
@@ -1,3 +1,4 @@
+import type { BookingCancellationPolicy } from '../../../shared/kernel/cancellationPolicy';
 import type { Locale } from '../../../shared/kernel/locale';
 
 /** Texto cadastrado pelo parceiro; pt-BR é obrigatório (AGENTS.md §12.6). */
@@ -17,9 +18,9 @@ export interface PriceOption {
   maxQuantity?: number;
 }
 
-export interface CancellationPolicy {
-  freeCancellationHoursBefore: number;
-  refundPercentAfterDeadline: 0 | 50 | 100;
+/** Translado tem opções próprias (Código Civil art. 740); os outros tipos usam as de reserva (D14). */
+export function cancellationFamilyOf(kind: BookableOfferKind): 'booking' | 'transfer' {
+  return kind === 'transfer' ? 'transfer' : 'booking';
 }
 
 export interface MeetingPoint {
@@ -41,7 +42,7 @@ export interface BookableOffer {
   pricing: { currency: 'BRL'; priceOptions: PriceOption[] };
   durationMinutes?: number;
   meetingPoint?: MeetingPoint;
-  cancellationPolicy: CancellationPolicy;
+  cancellationPolicy: BookingCancellationPolicy;
   maxParticipantsPerBooking: number;
   requiresParticipantNames: boolean;
   createdAt: string;
@@ -91,7 +92,7 @@ export interface BookingLine {
 
 export interface BookingCancellation {
   by: 'buyer' | 'partner' | 'system';
-  refundPercent: 0 | 50 | 100;
+  refundPercent: number;
   refundAmountMinor: number;
   reason: string;
   at: string;
@@ -118,7 +119,7 @@ export interface Booking {
     startsAt: string;
     durationMinutes?: number;
     meetingPoint?: string;
-    cancellationPolicy: CancellationPolicy;
+    cancellationPolicy: BookingCancellationPolicy;
   };
   /** Gravado ao cancelar: torna o cancelamento repetível sem recalcular o reembolso. */
   cancellation?: BookingCancellation;

=== server/domain/bookings/usecases/createPendingBookingUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type { PlatformFeeConfig } from '../../../shared/kernel/platformFees';
import { getBookingService } from '../factory';
import type { CreatePendingBookingInput } from '../services/bookingService';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Reserva as vagas por 15 min. A mesma chave de idempotência devolve a mesma reserva. */
export async function createPendingBookingUseCase(
  actor: BookingActor,
  input: CreatePendingBookingInput,
  feeConfig: PlatformFeeConfig
): Promise<Booking> {
  return getBookingService().createPendingBooking(actor, input, feeConfig);
}

=== server/domain/bookings/utils/bookingPricing.ts — diff ===
@@ -1,3 +1,7 @@
+import {
+  bookingPlatformFeeMinor,
+  type PlatformFeeConfig,
+} from '../../../shared/kernel/platformFees';
 import { BookingDomainError } from '../errors/bookingDomainError';
 import type { BookableOffer, BookingLine } from '../types/bookingTypes';
 
@@ -11,12 +15,12 @@ export interface PricedBooking {
 
 /**
  * Preço sempre recalculado no backend a partir da oferta (AGENTS.md §8.5). O turista paga o subtotal;
- * a taxa da plataforma sai do repasse ao parceiro (application_fee_amount).
+ * a taxa da plataforma (D14) sai do repasse ao parceiro.
  */
 export function priceBookingLines(
   offer: Pick<BookableOffer, 'pricing' | 'maxParticipantsPerBooking'>,
   requested: Array<{ priceOptionId: string; quantity: number }>,
-  platformFeePercent: number
+  feeConfig: PlatformFeeConfig
 ): PricedBooking {
   if (requested.length === 0) {
     throw new BookingDomainError('VALIDATION_ERROR', 'Selecione ao menos um item.');
@@ -49,6 +53,6 @@ export function priceBookingLines(
     throw new BookingDomainError('VALIDATION_ERROR', 'Número de participantes acima do limite.');
   }
   const subtotalMinor = lines.reduce((sum, line) => sum + line.quantity * line.unitAmountMinor, 0);
-  const platformFeeMinor = Math.round((subtotalMinor * platformFeePercent) / 100);
+  const platformFeeMinor = bookingPlatformFeeMinor(subtotalMinor, feeConfig);
   return { lines, participantsCount, subtotalMinor, platformFeeMinor, totalMinor: subtotalMinor };
 }

=== server/domain/bookings/utils/bookingUtils.test.ts — diff ===
@@ -2,9 +2,15 @@ import { describe, expect, it } from 'vitest';
 import { canTransitionBooking } from '../types/bookingTypes';
 import { buildBookingId, buildSlotId } from './buildBookingId';
 import { priceBookingLines } from './bookingPricing';
-import { calculateCancellationRefund } from './cancellationRefund';
 import { expandSlotRecurrence, fortalezaLocalToUtcIso } from './slotRecurrence';
 
+const FEES = {
+  bookingsBps: 1000,
+  ticketsBps: 1000,
+  ticketsAbsorbedBps: 1250,
+  ticketServiceFeeMinor: 300,
+};
+
 const OFFER = {
   maxParticipantsPerBooking: 6,
   pricing: {
@@ -17,23 +23,24 @@ const OFFER = {
 };
 
 describe('priceBookingLines', () => {
-  it('soma em centavos e arredonda a taxa', () => {
+  it('soma em centavos e calcula a taxa pela configuração', () => {
     const priced = priceBookingLines(
       OFFER,
       [
         { priceOptionId: 'adult', quantity: 2 },
         { priceOptionId: 'child', quantity: 1 },
       ],
-      10
+      FEES
     );
     expect(priced.subtotalMinor).toBe(37725);
     expect(priced.totalMinor).toBe(37725);
-    expect(priced.platformFeeMinor).toBe(3773);
+    // Arredonda a favor do proprietário (D14).
+    expect(priced.platformFeeMinor).toBe(3772);
     expect(priced.participantsCount).toBe(3);
   });
 
   it('recusa opção inexistente, repetida, quantidade fora do limite e excesso de participantes', () => {
-    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'vip', quantity: 1 }], 10)).toThrow(
+    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'vip', quantity: 1 }], FEES)).toThrow(
       'Opção'
     );
     expect(() =>
@@ -43,60 +50,22 @@ describe('priceBookingLines', () => {
           { priceOptionId: 'adult', quantity: 1 },
           { priceOptionId: 'adult', quantity: 1 },
         ],
-        10
+        FEES
       )
     ).toThrow('repetida');
-    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'child', quantity: 3 }], 10)).toThrow(
+    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'child', quantity: 3 }], FEES)).toThrow(
       'acima'
     );
-    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 0 }], 10)).toThrow(
-      'inválida'
-    );
-    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 1.5 }], 10)).toThrow(
+    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 0 }], FEES)).toThrow(
       'inválida'
     );
-    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 7 }], 10)).toThrow(
+    expect(() =>
+      priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 1.5 }], FEES)
+    ).toThrow('inválida');
+    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 7 }], FEES)).toThrow(
       'limite'
     );
-    expect(() => priceBookingLines(OFFER, [], 10)).toThrow('ao menos');
-  });
-});
-
-describe('calculateCancellationRefund', () => {
-  const policy = { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 as const };
-  const startsAt = '2026-11-10T11:00:00.000Z';
-
-  it('100% até o prazo gratuito', () => {
-    expect(
-      calculateCancellationRefund({
-        policy,
-        startsAt,
-        totalMinor: 10001,
-        now: new Date('2026-11-09T10:00:00.000Z'),
-      })
-    ).toEqual({ refundPercent: 100, refundAmountMinor: 10001 });
-  });
-
-  it('percentual da política depois do prazo, arredondado para baixo', () => {
-    expect(
-      calculateCancellationRefund({
-        policy,
-        startsAt,
-        totalMinor: 10001,
-        now: new Date('2026-11-10T00:00:00.000Z'),
-      })
-    ).toEqual({ refundPercent: 50, refundAmountMinor: 5000 });
-  });
-
-  it('nada depois do início', () => {
-    expect(
-      calculateCancellationRefund({
-        policy,
-        startsAt,
-        totalMinor: 10001,
-        now: new Date('2026-11-10T11:00:00.000Z'),
-      })
-    ).toEqual({ refundPercent: 0, refundAmountMinor: 0 });
+    expect(() => priceBookingLines(OFFER, [], FEES)).toThrow('ao menos');
   });
 });

=== server/domain/bookings/utils/cancellationRefund.ts — APAGUE este arquivo ===

=== server/domain/bookings/utils/refundParity.test.ts — APAGUE este arquivo ===

=== server/domain/events/dtos/eventPersistenceMappers.ts — diff ===
@@ -1,13 +1,38 @@
-import type {
-  CreateEventListingInput,
-  CreateEventOccurrenceInput,
-  EventListing,
-  EventLocation,
-  EventOccurrence,
-  EventRatingSummary,
-  UpdateEventListingInput,
+import { isCancellationPolicyAllowed } from '../../../shared/kernel/cancellationPolicy';
+import {
+  type CreateEventListingInput,
+  type CreateEventOccurrenceInput,
+  DEFAULT_EVENT_SALES_POLICY,
+  type EventListing,
+  type EventLocation,
+  type EventOccurrence,
+  type EventRatingSummary,
+  type EventSalesPolicy,
+  type UpdateEventListingInput,
 } from '../types/eventTypes';
 
+/** Campo ausente ou fora das opções vira o padrão da plataforma, nunca uma regra que ninguém escolheu. */
+function toSalesPolicy(raw: unknown): EventSalesPolicy {
+  const policy = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
+  const cancellationPolicy =
+    typeof policy.cancellationPolicy === 'string' &&
+    isCancellationPolicyAllowed('event', policy.cancellationPolicy)
+      ? (policy.cancellationPolicy as EventSalesPolicy['cancellationPolicy'])
+      : DEFAULT_EVENT_SALES_POLICY.cancellationPolicy;
+  return {
+    cancellationPolicy,
+    serviceFeeMode: policy.serviceFeeMode === 'absorb' ? 'absorb' : 'pass_to_buyer',
+    allowTicketTransfer:
+      typeof policy.allowTicketTransfer === 'boolean'
+        ? policy.allowTicketTransfer
+        : DEFAULT_EVENT_SALES_POLICY.allowTicketTransfer,
+    ticketTransferCutoffHours:
+      typeof policy.ticketTransferCutoffHours === 'number'
+        ? policy.ticketTransferCutoffHours
+        : DEFAULT_EVENT_SALES_POLICY.ticketTransferCutoffHours,
+  };
+}
+
 function toIsoString(val: unknown, fallback: string): string {
   if (typeof val === 'string' && val.trim().length > 0) return val;
   if (
@@ -123,43 +148,7 @@ export class EventListingPersistenceMapper {
       websiteLink: typeof raw.websiteLink === 'string' ? raw.websiteLink : undefined,
       instagramLink: typeof raw.instagramLink === 'string' ? raw.instagramLink : undefined,
       bookingLink: typeof raw.bookingLink === 'string' ? raw.bookingLink : undefined,
-      refundPolicy: {
-        enabled:
-          typeof (raw.refundPolicy as Record<string, unknown> | undefined)?.enabled === 'boolean'
-            ? Boolean((raw.refundPolicy as Record<string, unknown>).enabled)
-            : true,
-        cancellationWindowHours:
-          typeof (raw.refundPolicy as Record<string, unknown> | undefined)
-            ?.cancellationWindowHours === 'number'
-            ? Number((raw.refundPolicy as Record<string, unknown>).cancellationWindowHours)
-            : 24,
-        allowBuyerCancellation:
-          typeof (raw.refundPolicy as Record<string, unknown> | undefined)
-            ?.allowBuyerCancellation === 'boolean'
-            ? Boolean((raw.refundPolicy as Record<string, unknown>).allowBuyerCancellation)
-            : typeof (raw.refundPolicy as Record<string, unknown> | undefined)?.enabled ===
-                'boolean'
-              ? Boolean((raw.refundPolicy as Record<string, unknown>).enabled)
-              : true,
-        buyerCancellationWindowHours:
-          typeof (raw.refundPolicy as Record<string, unknown> | undefined)
-            ?.buyerCancellationWindowHours === 'number'
-            ? Number((raw.refundPolicy as Record<string, unknown>).buyerCancellationWindowHours)
-            : typeof (raw.refundPolicy as Record<string, unknown> | undefined)
-                  ?.cancellationWindowHours === 'number'
-              ? Number((raw.refundPolicy as Record<string, unknown>).cancellationWindowHours)
-              : 24,
-        allowTicketTransfer:
-          typeof (raw.refundPolicy as Record<string, unknown> | undefined)?.allowTicketTransfer ===
-          'boolean'
-            ? Boolean((raw.refundPolicy as Record<string, unknown>).allowTicketTransfer)
-            : true,
-        ticketTransferCutoffHours:
-          typeof (raw.refundPolicy as Record<string, unknown> | undefined)
-            ?.ticketTransferCutoffHours === 'number'
-            ? Number((raw.refundPolicy as Record<string, unknown>).ticketTransferCutoffHours)
-            : 2,
-      },
+      salesPolicy: toSalesPolicy(raw.salesPolicy),
       maxTicketsPerUserPerOccurrence:
         typeof raw.maxTicketsPerUserPerOccurrence === 'number'
           ? raw.maxTicketsPerUserPerOccurrence
@@ -238,10 +227,7 @@ export class EventListingPersistenceMapper {
       ...(input.websiteLink ? { websiteLink: input.websiteLink } : {}),
       ...(input.instagramLink ? { instagramLink: input.instagramLink } : {}),
       ...(input.bookingLink ? { bookingLink: input.bookingLink } : {}),
-      refundPolicy: input.refundPolicy || {
-        enabled: true,
-        cancellationWindowHours: 24,
-      },
+      salesPolicy: input.salesPolicy ?? DEFAULT_EVENT_SALES_POLICY,
       ...(input.ageRestriction ? { ageRestriction: input.ageRestriction } : {}),
       entryType: input.entryType || 'gratuito',
       pricingMode: input.pricingMode || (input.entryType === 'pago' ? 'paid' : 'free'),
@@ -303,7 +289,7 @@ export class EventListingPersistenceMapper {
     if (input.websiteLink !== undefined) patch.websiteLink = input.websiteLink;
     if (input.instagramLink !== undefined) patch.instagramLink = input.instagramLink;
     if (input.bookingLink !== undefined) patch.bookingLink = input.bookingLink;
-    if (input.refundPolicy !== undefined) patch.refundPolicy = input.refundPolicy;
+    if (input.salesPolicy !== undefined) patch.salesPolicy = input.salesPolicy;
     if (input.ageRestriction !== undefined) patch.ageRestriction = input.ageRestriction;
     if (input.entryType !== undefined) {
       patch.entryType = input.entryType;

=== server/domain/events/schemas/eventSchema.ts — diff ===
@@ -1,4 +1,5 @@
 import { z } from 'zod';
+import { EVENT_CANCELLATION_POLICIES } from '../../../shared/kernel/cancellationPolicy';
 import { E164_MESSAGE, E164_PATTERN } from '../../../shared/kernel/phone';
 
 const optionalUrl = z.string().url().or(z.literal('')).optional();
@@ -13,14 +14,12 @@ export const eventLocationSchema = z
   })
   .strict();
 
-export const eventRefundPolicySchema = z
+export const eventSalesPolicySchema = z
   .object({
-    enabled: z.boolean(),
-    cancellationWindowHours: z.number().int().min(0).max(720).optional(),
-    allowBuyerCancellation: z.boolean().optional(),
-    buyerCancellationWindowHours: z.number().int().min(0).max(720).optional(),
-    allowTicketTransfer: z.boolean().optional(),
-    ticketTransferCutoffHours: z.number().int().min(0).max(720).optional(),
+    cancellationPolicy: z.enum(EVENT_CANCELLATION_POLICIES),
+    serviceFeeMode: z.enum(['pass_to_buyer', 'absorb']),
+    allowTicketTransfer: z.boolean(),
+    ticketTransferCutoffHours: z.number().int().min(0).max(720),
   })
   .strict();
 
@@ -103,7 +102,7 @@ export const createEventListingSchema = z
     websiteLink: optionalUrl,
     instagramLink: optionalUrl,
     bookingLink: optionalUrl,
-    refundPolicy: eventRefundPolicySchema.optional(),
+    salesPolicy: eventSalesPolicySchema.optional(),
     ageRestriction: z
       .object({
         minAge: z.number().int().min(0).max(100).optional(),
@@ -149,7 +148,7 @@ export const updateEventListingSchema = z
     websiteLink: optionalUrl,
     instagramLink: optionalUrl,
     bookingLink: optionalUrl,
-    refundPolicy: eventRefundPolicySchema.optional(),
+    salesPolicy: eventSalesPolicySchema.optional(),
     ageRestriction: z
       .object({
         minAge: z.number().int().min(0).max(100).optional(),

=== server/domain/events/services/eventsService.test.ts — diff ===
@@ -49,7 +49,12 @@ const sampleListing: EventListing = {
   isActive: true,
   organizerId: 'partner-1',
   location: { name: 'Jericoacoara' },
-  refundPolicy: { enabled: true, cancellationWindowHours: 24 },
+  salesPolicy: {
+    cancellationPolicy: 'flexible',
+    serviceFeeMode: 'pass_to_buyer',
+    allowTicketTransfer: true,
+    ticketTransferCutoffHours: 4,
+  },
   entryType: 'gratuito',
   pricingMode: 'free',
   date: '2026-08-10T18:00:00.000Z',
@@ -100,7 +105,12 @@ describe('EventsService', () => {
         isActive: true,
         organizerId: 'partner-1',
         location: { name: 'Jericoacoara' },
-        refundPolicy: { enabled: true },
+        salesPolicy: {
+          cancellationPolicy: 'flexible',
+          serviceFeeMode: 'pass_to_buyer',
+          allowTicketTransfer: true,
+          ticketTransferCutoffHours: 4,
+        },
         occurrences: [
           {
             startsAt: '2026-08-10T18:00:00.000Z',

=== server/domain/events/services/eventsService.ts — diff ===
@@ -1,3 +1,4 @@
+import { canChangeCancellationPolicy } from '../../../shared/kernel/cancellationPolicy';
 import {
   EventDomainError,
   EventNotFoundError,
@@ -121,6 +122,19 @@ export class EventsService {
     }
     assertCanManageListing(actor, existing);
 
+    // D14: publicado o evento, a política só muda para uma igual ou mais flexível (protege quem já comprou).
+    const nextPolicy = input.salesPolicy?.cancellationPolicy;
+    if (
+      nextPolicy &&
+      existing.status !== 'draft' &&
+      !canChangeCancellationPolicy('event', existing.salesPolicy.cancellationPolicy, nextPolicy)
+    ) {
+      throw new EventDomainError(
+        'UNPROCESSABLE_ENTITY',
+        'Depois de publicar, a política de cancelamento só pode ficar mais flexível.'
+      );
+    }
+
     const safeInput: UpdateEventListingInput = { ...input };
     delete (safeInput as Record<string, unknown>).ownerId;
     delete (safeInput as Record<string, unknown>).ratingSummary;
@@ -225,7 +239,7 @@ export class EventsService {
       websiteLink: existing.websiteLink,
       instagramLink: existing.instagramLink,
       bookingLink: existing.bookingLink,
-      refundPolicy: existing.refundPolicy,
+      salesPolicy: existing.salesPolicy,
       ageRestriction: existing.ageRestriction,
       entryType: existing.entryType,
       pricingMode: existing.pricingMode,

=== server/domain/events/types/eventTypes.ts — diff ===
@@ -1,3 +1,6 @@
+import type { EventCancellationPolicy } from '../../../shared/kernel/cancellationPolicy';
+import type { ServiceFeeMode } from '../../../shared/kernel/platformFees';
+
 export type EventListingStatus = 'draft' | 'published' | 'paused' | 'archived';
 
 export type EventVisibility = 'public' | 'unlisted' | 'private';
@@ -15,6 +18,21 @@ export interface EventLocation {
   longitude?: number;
 }
 
+/** Regras de venda do evento (D14): política da plataforma, taxa de serviço e transferência de ingresso. */
+export interface EventSalesPolicy {
+  cancellationPolicy: EventCancellationPolicy;
+  serviceFeeMode: ServiceFeeMode;
+  allowTicketTransfer: boolean;
+  ticketTransferCutoffHours: number;
+}
+
+export const DEFAULT_EVENT_SALES_POLICY: EventSalesPolicy = {
+  cancellationPolicy: 'flexible',
+  serviceFeeMode: 'pass_to_buyer',
+  allowTicketTransfer: true,
+  ticketTransferCutoffHours: 4,
+};
+
 export interface EventListing {
   id: string;
   ownerId: string;
@@ -40,14 +58,7 @@ export interface EventListing {
   websiteLink?: string;
   instagramLink?: string;
   bookingLink?: string;
-  refundPolicy: {
-    enabled: boolean;
-    cancellationWindowHours?: number;
-    allowBuyerCancellation?: boolean;
-    buyerCancellationWindowHours?: number;
-    allowTicketTransfer?: boolean;
-    ticketTransferCutoffHours?: number;
-  };
+  salesPolicy: EventSalesPolicy;
   maxTicketsPerUserPerOccurrence?: number;
   ageRestriction?: {
     minAge?: number;
@@ -123,14 +134,7 @@ export interface CreateEventListingInput {
   websiteLink?: string;
   instagramLink?: string;
   bookingLink?: string;
-  refundPolicy?: {
-    enabled: boolean;
-    cancellationWindowHours?: number;
-    allowBuyerCancellation?: boolean;
-    buyerCancellationWindowHours?: number;
-    allowTicketTransfer?: boolean;
-    ticketTransferCutoffHours?: number;
-  };
+  salesPolicy?: EventSalesPolicy;
   maxTicketsPerUserPerOccurrence?: number;
   ageRestriction?: {
     minAge?: number;
@@ -164,14 +168,7 @@ export interface UpdateEventListingInput {
   websiteLink?: string;
   instagramLink?: string;
   bookingLink?: string;
-  refundPolicy?: {
-    enabled: boolean;
-    cancellationWindowHours?: number;
-    allowBuyerCancellation?: boolean;
-    buyerCancellationWindowHours?: number;
-    allowTicketTransfer?: boolean;
-    ticketTransferCutoffHours?: number;
-  };
+  salesPolicy?: EventSalesPolicy;
   maxTicketsPerUserPerOccurrence?: number;
   ageRestriction?: {
     minAge?: number;

=== server/domain/partners/schemas/partnerContentSchema.ts — diff ===
@@ -1,5 +1,5 @@
 import { z } from 'zod';
-import { eventRefundPolicySchema } from '../../events/schemas/eventSchema';
+import { eventSalesPolicySchema } from '../../events/schemas/eventSchema';
 import { E164_MESSAGE, E164_PATTERN } from '../../../shared/kernel/phone';
 
 const optionalUrl = z.string().url().or(z.literal('')).optional();
@@ -135,7 +135,7 @@ const eventFields = {
   eventCategory: z.string().trim().min(1).max(100),
   customCategory: z.string().trim().max(200).optional(),
   entryType: eventEntryTypeSchema.optional(),
-  refundPolicy: eventRefundPolicySchema.optional(),
+  salesPolicy: eventSalesPolicySchema.optional(),
   maxTicketsPerUserPerOccurrence: z.number().int().min(1).max(100).optional(),
 };

=== server/domain/ticketing/adapters/firestoreOrderReservationStore.ts — diff ===
@@ -113,12 +113,13 @@ export class FirestoreOrderReservationStore {
         discountMinor: input.discountMinor,
         platformFeeMinor: input.platformFeeMinor,
         paymentFeeMinor: input.paymentFeeMinor,
+        serviceFeeMinor: input.serviceFeeMinor,
         totalMinor: input.totalMinor,
         ...(input.promoCodeId ? { promoCodeId: input.promoCodeId } : {}),
         ...(input.promoterCode ? { promoterCode: input.promoterCode } : {}),
         buyerSnapshot: input.buyerSnapshot,
         eventSnapshot: input.eventSnapshot,
-        refundPolicySnapshot: input.refundPolicySnapshot,
+        salesPolicySnapshot: input.salesPolicySnapshot,
         idempotencyKey: input.idempotencyKey,
         expiresAt: input.expiresAt,
         createdAt: nowIso,
@@ -171,6 +172,7 @@ export class FirestoreOrderReservationStore {
           discountMinor: item.discountMinor,
           allocatedPlatformFeeMinor: item.allocatedPlatformFeeMinor,
           allocatedPaymentFeeMinor: item.allocatedPaymentFeeMinor,
+          allocatedServiceFeeMinor: item.allocatedServiceFeeMinor,
           totalMinor: item.totalMinor,
           ticketTypeSnapshot: item.ticketTypeSnapshot,
           holders: item.holders.map((h) => ({

=== server/domain/ticketing/dtos/ticketingPersistenceMappers.ts — diff ===
@@ -1,3 +1,4 @@
+import { isCancellationPolicyAllowed } from '../../../shared/kernel/cancellationPolicy';
 import type {
   EventCheckIn,
   EventPromoCode,
@@ -8,7 +9,7 @@ import type {
   Ticket,
   TicketOrder,
   TicketOrderItem,
-  TicketOrderRefundPolicySnapshot,
+  TicketOrderSalesPolicySnapshot,
   TicketTransfer,
   TicketType,
 } from '../types/ticketingTypes';
@@ -26,35 +27,21 @@ function toIso(val: unknown, fallback: string): string {
   return fallback;
 }
 
-function normalizeRefundPolicySnapshot(
-  rawPolicy: Record<string, unknown>
-): TicketOrderRefundPolicySnapshot {
-  const allowBuyerCancellation =
-    typeof rawPolicy.allowBuyerCancellation === 'boolean'
-      ? rawPolicy.allowBuyerCancellation
-      : typeof rawPolicy.enabled === 'boolean'
-        ? rawPolicy.enabled
-        : true;
-  const buyerCancellationWindowHours =
-    typeof rawPolicy.buyerCancellationWindowHours === 'number'
-      ? rawPolicy.buyerCancellationWindowHours
-      : typeof rawPolicy.cancellationWindowHours === 'number'
-        ? rawPolicy.cancellationWindowHours
-        : 24;
-  const allowTicketTransfer =
-    typeof rawPolicy.allowTicketTransfer === 'boolean' ? rawPolicy.allowTicketTransfer : true;
-  const ticketTransferCutoffHours =
-    typeof rawPolicy.ticketTransferCutoffHours === 'number'
-      ? rawPolicy.ticketTransferCutoffHours
-      : 4;
-
+/** Pedido gravado antes de uma regra existir não tem compatibilidade (§2.2.8): campo inválido vira o padrão. */
+function normalizeSalesPolicySnapshot(
+  raw: Record<string, unknown>
+): TicketOrderSalesPolicySnapshot {
   return {
-    allowBuyerCancellation,
-    buyerCancellationWindowHours: allowBuyerCancellation ? buyerCancellationWindowHours : undefined,
-    allowTicketTransfer,
-    ticketTransferCutoffHours: allowTicketTransfer ? ticketTransferCutoffHours : undefined,
-    enabled: allowBuyerCancellation,
-    cancellationWindowHours: allowBuyerCancellation ? buyerCancellationWindowHours : undefined,
+    cancellationPolicy:
+      typeof raw.cancellationPolicy === 'string' &&
+      isCancellationPolicyAllowed('event', raw.cancellationPolicy)
+        ? (raw.cancellationPolicy as TicketOrderSalesPolicySnapshot['cancellationPolicy'])
+        : 'flexible',
+    serviceFeeMode: raw.serviceFeeMode === 'absorb' ? 'absorb' : 'pass_to_buyer',
+    allowTicketTransfer:
+      typeof raw.allowTicketTransfer === 'boolean' ? raw.allowTicketTransfer : true,
+    ticketTransferCutoffHours:
+      typeof raw.ticketTransferCutoffHours === 'number' ? raw.ticketTransferCutoffHours : 4,
   };
 }
 
@@ -105,7 +92,7 @@ export class TicketOrderPersistenceMapper {
   static toDomain(id: string, raw: Record<string, unknown>): TicketOrder {
     const now = new Date().toISOString();
     const rawBuyer = (raw.buyerSnapshot as Record<string, unknown> | undefined) || {};
-    const rawPolicy = (raw.refundPolicySnapshot as Record<string, unknown> | undefined) || {};
+    const rawPolicy = (raw.salesPolicySnapshot as Record<string, unknown> | undefined) || {};
     const rawEvent = raw.eventSnapshot as Record<string, unknown> | undefined;
 
     return {
@@ -131,6 +118,8 @@ export class TicketOrderPersistenceMapper {
         typeof raw.platformFeeMinor === 'number' ? Math.trunc(raw.platformFeeMinor) : 0,
       paymentFeeMinor:
         typeof raw.paymentFeeMinor === 'number' ? Math.trunc(raw.paymentFeeMinor) : 0,
+      serviceFeeMinor:
+        typeof raw.serviceFeeMinor === 'number' ? Math.trunc(raw.serviceFeeMinor) : 0,
       totalMinor: typeof raw.totalMinor === 'number' ? Math.trunc(raw.totalMinor) : 0,
       paymentId: typeof raw.paymentId === 'string' ? raw.paymentId : undefined,
       paymentIntentId: typeof raw.paymentIntentId === 'string' ? raw.paymentIntentId : undefined,
@@ -149,7 +138,7 @@ export class TicketOrderPersistenceMapper {
               typeof rawEvent.locationName === 'string' ? rawEvent.locationName : undefined,
           }
         : undefined,
-      refundPolicySnapshot: normalizeRefundPolicySnapshot(rawPolicy),
+      salesPolicySnapshot: normalizeSalesPolicySnapshot(rawPolicy),
       idempotencyKey: String(raw.idempotencyKey || ''),
       expiresAt: typeof raw.expiresAt === 'string' ? raw.expiresAt : undefined,
       createdAt: toIso(raw.createdAt, now),
@@ -179,6 +168,10 @@ export class TicketOrderItemPersistenceMapper {
         typeof raw.allocatedPaymentFeeMinor === 'number'
           ? Math.trunc(raw.allocatedPaymentFeeMinor)
           : 0,
+      allocatedServiceFeeMinor:
+        typeof raw.allocatedServiceFeeMinor === 'number'
+          ? Math.trunc(raw.allocatedServiceFeeMinor)
+          : 0,
       totalMinor: typeof raw.totalMinor === 'number' ? Math.trunc(raw.totalMinor) : 0,
       ticketTypeSnapshot: {
         name: String(snap.name || ''),

=== server/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -11,7 +11,7 @@ import type {
   Ticket,
   TicketOrder,
   TicketOrderItem,
-  TicketOrderRefundPolicySnapshot,
+  TicketOrderSalesPolicySnapshot,
   TicketOrderStatus,
   TicketStatus,
   TicketTransfer,
@@ -29,6 +29,7 @@ export interface ReserveOrderTransactionInput {
   discountMinor: number;
   platformFeeMinor: number;
   paymentFeeMinor: number;
+  serviceFeeMinor: number;
   totalMinor: number;
   promoCodeId?: string;
   promoterCode?: string;
@@ -42,7 +43,7 @@ export interface ReserveOrderTransactionInput {
     endsAt: string;
     locationName?: string;
   };
-  refundPolicySnapshot: TicketOrderRefundPolicySnapshot;
+  salesPolicySnapshot: TicketOrderSalesPolicySnapshot;
   expiresAt: string;
   items: Array<{
     ticketTypeId: string;
@@ -51,6 +52,7 @@ export interface ReserveOrderTransactionInput {
     discountMinor: number;
     allocatedPlatformFeeMinor: number;
     allocatedPaymentFeeMinor: number;
+    allocatedServiceFeeMinor: number;
     totalMinor: number;
     ticketTypeSnapshot: {
       name: string;

=== server/domain/ticketing/services/orders/prepareOrderItems.ts — diff ===
@@ -1,3 +1,8 @@
+import {
+  type PlatformFeeConfig,
+  type ServiceFeeMode,
+  ticketOrderFees,
+} from '../../../../shared/kernel/platformFees';
 import {
   InventoryConflictError,
   TicketTypeUnavailableError,
@@ -18,7 +23,7 @@ export interface OrderItemRequest {
 
 /**
  * Confere cada lote (quantidade, estoque, janela de venda), aplica o cupom, gera os QR opacos dos titulares
- * e reparte a taxa da plataforma entre os itens. Preço sempre do lote no servidor (AGENTS.md §8.5).
+ * e calcula as taxas do pedido (D14): a da plataforma, repartida entre os itens, e a de serviço por ingresso pago. Preço sempre do lote no servidor (AGENTS.md §8.5).
  */
 export function prepareOrderItems(params: {
   items: OrderItemRequest[];
@@ -28,7 +33,8 @@ export function prepareOrderItems(params: {
   nowMs: number;
   promo: EventPromoCode | null;
   buyer: { name: string; email: string };
-  feePercent: number;
+  feeConfig: PlatformFeeConfig;
+  serviceFeeMode: ServiceFeeMode;
 }) {
   let subtotalMinor = 0;
   let discountMinor = 0;
@@ -130,12 +136,17 @@ export function prepareOrderItems(params: {
   }
 
   const netSubtotalMinor = Math.max(0, subtotalMinor - discountMinor);
-  const platformFeeMinor =
-    netSubtotalMinor > 0 && params.feePercent > 0
-      ? Math.round((netSubtotalMinor * params.feePercent) / 100)
-      : 0;
+  const paidTicketCount = rawItemsPrepared
+    .filter((item) => item.lineNetAfterDiscount > 0)
+    .reduce((sum, item) => sum + item.quantity, 0);
+  const { platformFeeMinor, serviceFeeMinor } = ticketOrderFees(
+    { netSubtotalMinor, paidTicketCount, mode: params.serviceFeeMode },
+    params.feeConfig
+  );
+  const serviceFeePerTicketMinor = paidTicketCount > 0 ? serviceFeeMinor / paidTicketCount : 0;
   const paymentFeeMinor = 0;
-  const totalMinor = netSubtotalMinor;
+  // A taxa de serviço soma no que o comprador paga; o preço do ingresso não muda (D14).
+  const totalMinor = netSubtotalMinor + serviceFeeMinor;
 
   let remainingFeeToAllocate = platformFeeMinor;
   const preparedItems = rawItemsPrepared.map((item, idx) => {
@@ -155,6 +166,8 @@ export function prepareOrderItems(params: {
       discountMinor: item.lineDiscount,
       allocatedPlatformFeeMinor,
       allocatedPaymentFeeMinor: 0,
+      allocatedServiceFeeMinor:
+        item.lineNetAfterDiscount > 0 ? serviceFeePerTicketMinor * item.quantity : 0,
       totalMinor: item.lineNetAfterDiscount,
       ticketTypeSnapshot: {
         name: item.ticketType.name,
@@ -168,6 +181,7 @@ export function prepareOrderItems(params: {
     discountMinor,
     platformFeeMinor,
     paymentFeeMinor,
+    serviceFeeMinor,
     totalMinor,
     preparedItems,
   };

=== server/domain/ticketing/services/ticketHolderService.ts — diff ===
@@ -43,8 +43,8 @@ export class TicketHolderService {
     ]);
 
     const allowTransfer =
-      order?.refundPolicySnapshot?.allowTicketTransfer ??
-      listing?.refundPolicy?.allowTicketTransfer ??
+      order?.salesPolicySnapshot.allowTicketTransfer ??
+      listing?.salesPolicy.allowTicketTransfer ??
       true;
 
     if (!allowTransfer) {
@@ -65,8 +65,8 @@ export class TicketHolderService {
       const startsAtMs = new Date(occurrence.startsAt).getTime();
       const nowMs = Date.now();
       const cutoffHours =
-        order?.refundPolicySnapshot?.ticketTransferCutoffHours ??
-        listing?.refundPolicy?.ticketTransferCutoffHours ??
+        order?.salesPolicySnapshot.ticketTransferCutoffHours ??
+        listing?.salesPolicy.ticketTransferCutoffHours ??
         4;
       const hoursUntilStart = (startsAtMs - nowMs) / (1000 * 60 * 60);
       if (hoursUntilStart < cutoffHours) {

=== server/domain/ticketing/services/ticketOrderService.ts — diff ===
@@ -1,7 +1,10 @@
 import { createEventAuditLogUseCase, getEventListingByIdUseCase } from '../../events';
 import { OrderNotFoundError, TicketingDomainError } from '../errors/ticketingDomainError';
 import type { TicketingPort } from '../ports/ticketingPort';
-import { resolvePlatformFeePercent } from '../../../shared/kernel/platformFee';
+import {
+  PlatformFeeConfigError,
+  resolvePlatformFeeConfig,
+} from '../../../shared/kernel/platformFees';
 import {
   canTransitionOrderStatus,
   CHECKOUT_RESERVATION_MINUTES,
@@ -19,6 +22,19 @@ import {
 import { prepareOrderItems } from './orders/prepareOrderItems';
 import { isActorAdmin, type TicketingActorContext } from './ticketingAccess';
 
+function loadFeeConfig() {
+  try {
+    return resolvePlatformFeeConfig();
+  } catch (error) {
+    if (error instanceof PlatformFeeConfigError) {
+      // Sem taxa configurada a venda para (AGENTS.md §2.2.5); o nome da variável fica só no log.
+      console.error('[ticketing] taxas da plataforma não configuradas', { message: error.message });
+      throw new TicketingDomainError('SERVICE_UNAVAILABLE', 'Vendas indisponíveis no momento.');
+    }
+    throw error;
+  }
+}
+
 /** Pedidos de ingresso: criação com reserva de estoque, pagamento e expiração. */
 export class TicketOrderService {
   constructor(private readonly port: TicketingPort) {}
@@ -74,6 +90,7 @@ export class TicketOrderService {
       discountMinor,
       platformFeeMinor,
       paymentFeeMinor,
+      serviceFeeMinor,
       totalMinor,
       preparedItems,
     } = prepareOrderItems({
@@ -84,7 +101,8 @@ export class TicketOrderService {
       nowMs,
       promo,
       buyer: input.buyer,
-      feePercent: resolvePlatformFeePercent(),
+      feeConfig: loadFeeConfig(),
+      serviceFeeMode: listing.salesPolicy.serviceFeeMode,
     });
 
     const expiresAt = new Date(nowMs + CHECKOUT_RESERVATION_MINUTES * 60 * 1000).toISOString();
@@ -101,6 +119,7 @@ export class TicketOrderService {
       discountMinor,
       platformFeeMinor,
       paymentFeeMinor,
+      serviceFeeMinor,
       totalMinor,
       promoCodeId: promo?.id,
       promoterCode: input.promoterCode,
@@ -114,22 +133,7 @@ export class TicketOrderService {
         endsAt: occurrence.endsAt,
         locationName: occurrence.locationOverride?.name || listing.location.name,
       },
-      refundPolicySnapshot: {
-        enabled:
-          listing.refundPolicy.allowBuyerCancellation ?? listing.refundPolicy.enabled ?? true,
-        cancellationWindowHours:
-          listing.refundPolicy.buyerCancellationWindowHours ??
-          listing.refundPolicy.cancellationWindowHours ??
-          24,
-        allowBuyerCancellation:
-          listing.refundPolicy.allowBuyerCancellation ?? listing.refundPolicy.enabled ?? true,
-        buyerCancellationWindowHours:
-          listing.refundPolicy.buyerCancellationWindowHours ??
-          listing.refundPolicy.cancellationWindowHours ??
-          24,
-        allowTicketTransfer: listing.refundPolicy.allowTicketTransfer ?? true,
-        ticketTransferCutoffHours: listing.refundPolicy.ticketTransferCutoffHours ?? 4,
-      },
+      salesPolicySnapshot: { ...listing.salesPolicy },
       expiresAt,
       items: preparedItems,
       issueImmediately,

=== server/domain/ticketing/services/ticketRefundService.ts — diff ===
@@ -8,10 +8,37 @@ import {
   RefundNotAllowedError,
   TicketingDomainError,
 } from '../errors/ticketingDomainError';
+import { calculateBuyerRefund } from '../../../shared/kernel/cancellationPolicy';
 import type { TicketingPort } from '../ports/ticketingPort';
 import { type Refund, type TicketOrder } from '../types/ticketingTypes';
 import { getAuditActorType, isActorAdmin, type TicketingActorContext } from './ticketingAccess';
 
+/**
+ * Cancelamento pelo próprio comprador (D14): arrependimento de 7 dias até 48 h antes do início, ou a política
+ * gravada no pedido. A taxa de serviço só volta no arrependimento.
+ */
+function buyerSelfServiceRefundMinor(order: TicketOrder, startsAt: string | undefined): number {
+  if (!startsAt) {
+    throw new RefundNotAllowedError('Sessão do evento não encontrada para calcular o reembolso.');
+  }
+  const refund = calculateBuyerRefund({
+    family: 'event',
+    policy: order.salesPolicySnapshot.cancellationPolicy,
+    purchasedAt: order.paidAt ?? order.createdAt,
+    startsAt,
+    now: new Date(),
+    paidMinor: order.totalMinor - order.serviceFeeMinor,
+    serviceFeeMinor: order.serviceFeeMinor,
+  });
+  const amountMinor = refund.refundMinor + refund.serviceFeeRefundMinor;
+  if (amountMinor <= 0) {
+    throw new RefundNotAllowedError(
+      'Pela política deste evento, o cancelamento agora não tem reembolso.'
+    );
+  }
+  return amountMinor;
+}
+
 /** Reembolso pedido pelo comprador e conclusão pelo webhook. */
 export class TicketRefundService {
   constructor(private readonly port: TicketingPort) {}
@@ -60,54 +87,12 @@ export class TicketRefundService {
       occurrence?.status === 'postponed' ||
       params.isEventCanceledByOrganizer === true;
 
-    if (!isAdmin && !isPartnerOwner && !occurrenceCanceledOrPostponed) {
-      if (!order.refundPolicySnapshot.allowBuyerCancellation) {
-        throw new RefundNotAllowedError(
-          'A política deste evento não permite cancelamento voluntário.'
-        );
-      }
-
-      if (occurrence) {
-        const startsAtMs = new Date(occurrence.startsAt).getTime();
-        const nowMs = Date.now();
-        if (nowMs >= startsAtMs) {
-          throw new RefundNotAllowedError(
-            'Não é possível solicitar reembolso após o início do evento.'
-          );
-        }
-        const windowHours =
-          order.refundPolicySnapshot.buyerCancellationWindowHours ??
-          order.refundPolicySnapshot.cancellationWindowHours ??
-          24;
-        const hoursUntilStart = (startsAtMs - nowMs) / (1000 * 60 * 60);
-        if (hoursUntilStart < windowHours) {
-          throw new RefundNotAllowedError(
-            `O prazo para solicitação de reembolso encerrou (${windowHours}h antes do início do evento).`
-          );
-        }
-      }
-    }
-
-    let amountMinor = order.totalMinor;
-    if (params.ticketId) {
-      const ticket = await this.port.getTicketById(params.ticketId);
-      if (!ticket || ticket.orderId !== order.id) {
-        throw new TicketingDomainError('NOT_FOUND', 'Ingresso não pertence a este pedido.');
-      }
-      if (ticket.ticketTypeSnapshot?.effectivePaidMinor !== undefined) {
-        amountMinor = ticket.ticketTypeSnapshot.effectivePaidMinor;
-      } else {
-        const orderItems = await this.port.listOrderItemsByOrderId(order.id);
-        const matchingItem = orderItems.find((i) => i.ticketTypeId === ticket.ticketTypeId);
-        if (matchingItem && matchingItem.quantity > 0) {
-          amountMinor = Math.floor(matchingItem.totalMinor / matchingItem.quantity);
-        } else {
-          throw new RefundNotAllowedError(
-            'Não foi possível calcular a alocação financeira exata deste ingresso.'
-          );
-        }
-      }
-    }
+    const amountMinor = params.ticketId
+      ? await this.ticketRefundMinor(order, params.ticketId)
+      : !isAdmin && !isPartnerOwner && !occurrenceCanceledOrPostponed
+        ? buyerSelfServiceRefundMinor(order, occurrence?.startsAt)
+        : // Cancelamento pelo organizador (ou pelo admin): reembolso integral, com a taxa de serviço (D14).
+          order.totalMinor;
 
     const requestedBy: Refund['requestedBy'] = isAdmin
       ? 'admin'
@@ -143,6 +128,24 @@ export class TicketRefundService {
     return { refund, isReplay, order };
   }
 
+  /** Ingresso avulso (só organizador ou admin): o que foi pago por ele, com a parte da taxa de serviço. */
+  private async ticketRefundMinor(order: TicketOrder, ticketId: string): Promise<number> {
+    const ticket = await this.port.getTicketById(ticketId);
+    if (!ticket || ticket.orderId !== order.id) {
+      throw new TicketingDomainError('NOT_FOUND', 'Ingresso não pertence a este pedido.');
+    }
+    const orderItems = await this.port.listOrderItemsByOrderId(order.id);
+    const item = orderItems.find((candidate) => candidate.ticketTypeId === ticket.ticketTypeId);
+    if (!item || item.quantity <= 0) {
+      throw new RefundNotAllowedError(
+        'Não foi possível calcular a alocação financeira exata deste ingresso.'
+      );
+    }
+    const paidMinor =
+      ticket.ticketTypeSnapshot?.effectivePaidMinor ?? Math.floor(item.totalMinor / item.quantity);
+    return paidMinor + Math.floor(item.allocatedServiceFeeMinor / item.quantity);
+  }
+
   async finalizeRefundStatus(
     refundId: string,
     status: Refund['status'],

=== server/domain/ticketing/services/ticketingServices.test.ts — diff ===
@@ -59,7 +59,10 @@ describe('serviços de ticketing', () => {
 
   beforeEach(() => {
     vi.stubEnv('TICKET_QR_SECRET', 'test-ticket-qr-secret-with-32-chars!');
-    vi.stubEnv('USE_GUIDE_PLATFORM_FEE_PERCENT', '10');
+    vi.stubEnv('TICKETS_PLATFORM_FEE_BPS', '1000');
+    vi.stubEnv('TICKETS_ABSORBED_FEE_BPS', '1250');
+    vi.stubEnv('BOOKINGS_PLATFORM_FEE_BPS', '1500');
+    vi.stubEnv('TICKET_SERVICE_FEE_MINOR', '300');
     vi.clearAllMocks();
 
     vi.mocked(getEventOccurrenceByIdUseCase).mockResolvedValue({
@@ -91,7 +94,12 @@ describe('serviços de ticketing', () => {
       status: 'published',
       isActive: true,
       location: { name: 'Praia do Preá' },
-      refundPolicy: { enabled: true, cancellationWindowHours: 48 },
+      salesPolicy: {
+        cancellationPolicy: 'flexible',
+        serviceFeeMode: 'pass_to_buyer',
+        allowTicketTransfer: true,
+        ticketTransferCutoffHours: 4,
+      },
       entryType: 'pago',
       pricingMode: 'paid',
       ratingSummary: { average: 0, count: 0 },
@@ -121,9 +129,10 @@ describe('serviços de ticketing', () => {
           discountMinor: input.discountMinor,
           platformFeeMinor: input.platformFeeMinor,
           paymentFeeMinor: input.paymentFeeMinor,
+          serviceFeeMinor: input.serviceFeeMinor,
           totalMinor: input.totalMinor,
           buyerSnapshot: input.buyerSnapshot,
-          refundPolicySnapshot: input.refundPolicySnapshot,
+          salesPolicySnapshot: input.salesPolicySnapshot,
           idempotencyKey: input.idempotencyKey,
           createdAt: '2026-10-05T00:00:00.000Z',
           updatedAt: '2026-10-05T00:00:00.000Z',
@@ -210,7 +219,8 @@ describe('serviços de ticketing', () => {
 
     expect(res.order.subtotalMinor).toBe(10000);
     expect(res.order.platformFeeMinor).toBe(1000);
-    expect(res.order.totalMinor).toBe(10000);
+    expect(res.order.serviceFeeMinor).toBe(600);
+    expect(res.order.totalMinor).toBe(10600);
     expect(res.order.status).toBe('pending_payment');
   });
 
@@ -344,12 +354,14 @@ describe('serviços de ticketing', () => {
       discountMinor: 0,
       platformFeeMinor: 500,
       paymentFeeMinor: 0,
+      serviceFeeMinor: 0,
       totalMinor: 5000,
       buyerSnapshot: { name: 'User B', email: 'b@example.com' },
-      refundPolicySnapshot: {
-        enabled: true,
-        allowBuyerCancellation: true,
+      salesPolicySnapshot: {
+        cancellationPolicy: 'flexible',
+        serviceFeeMode: 'pass_to_buyer',
         allowTicketTransfer: true,
+        ticketTransferCutoffHours: 4,
       },
       idempotencyKey: 'idem_b',
       createdAt: '2026-10-01T10:00:00.000Z',

=== server/domain/ticketing/types/ticketingTypes.ts — diff ===
@@ -1,3 +1,5 @@
+import type { EventCancellationPolicy } from '../../../shared/kernel/cancellationPolicy';
+import type { ServiceFeeMode } from '../../../shared/kernel/platformFees';
 export type MoneyMinor = number;
 
 export const CHECKOUT_RESERVATION_MINUTES = 10;
@@ -80,13 +82,12 @@ export type TicketOrderStatus =
   | 'canceled'
   | 'chargeback';
 
-export interface TicketOrderRefundPolicySnapshot {
-  allowBuyerCancellation: boolean;
-  buyerCancellationWindowHours?: number;
+/** Regras de venda do evento gravadas na compra (D14): é o que vale para este pedido. */
+export interface TicketOrderSalesPolicySnapshot {
+  cancellationPolicy: EventCancellationPolicy;
+  serviceFeeMode: ServiceFeeMode;
   allowTicketTransfer: boolean;
-  ticketTransferCutoffHours?: number;
-  enabled?: boolean;
-  cancellationWindowHours?: number;
+  ticketTransferCutoffHours: number;
 }
 
 export interface TicketOrder {
@@ -100,6 +101,8 @@ export interface TicketOrder {
   discountMinor: MoneyMinor;
   platformFeeMinor: MoneyMinor;
   paymentFeeMinor: MoneyMinor;
+  /** Taxa de serviço paga pelo comprador (D14); soma no total e fica com a plataforma. */
+  serviceFeeMinor: MoneyMinor;
   totalMinor: MoneyMinor;
   paymentId?: string;
   paymentIntentId?: string;
@@ -115,7 +118,7 @@ export interface TicketOrder {
     endsAt: string;
     locationName?: string;
   };
-  refundPolicySnapshot: TicketOrderRefundPolicySnapshot;
+  salesPolicySnapshot: TicketOrderSalesPolicySnapshot;
   idempotencyKey: string;
   expiresAt?: string;
   createdAt: string;
@@ -134,6 +137,7 @@ export interface TicketOrderItem {
   discountMinor: MoneyMinor;
   allocatedPlatformFeeMinor: MoneyMinor;
   allocatedPaymentFeeMinor: MoneyMinor;
+  allocatedServiceFeeMinor: MoneyMinor;
   totalMinor: MoneyMinor;
   ticketTypeSnapshot: {
     name: string;

=== server/interfaces/http/bookings/schemas/bookingSchemas.test.ts — diff ===
@@ -9,7 +9,7 @@ const OFFER = {
     currency: 'BRL',
     priceOptions: [{ id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 15090 }],
   },
-  cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 },
+  cancellationPolicy: 'flexible',
   maxParticipantsPerBooking: 8,
   requiresParticipantNames: false,
 };
@@ -33,11 +33,11 @@ describe('bookingSchemas', () => {
     expect(CreateOfferSchema.safeParse({ ...OFFER, pricing }).success).toBe(false);
   });
 
-  it('percentual de reembolso só 0, 50 ou 100', () => {
+  it('política de cancelamento só entre as opções da plataforma', () => {
     expect(
       CreateOfferSchema.safeParse({
         ...OFFER,
-        cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 30 },
+        cancellationPolicy: 'custom_30',
       }).success
     ).toBe(false);
   });

=== server/interfaces/http/bookings/schemas/bookingSchemas.ts — diff ===
@@ -1,4 +1,8 @@
 import { z } from 'zod';
+import {
+  BOOKING_CANCELLATION_POLICIES,
+  TRANSFER_CANCELLATION_POLICIES,
+} from '../../../../shared/kernel/cancellationPolicy';
 
 const isoDateTime = z.string().datetime({ offset: true });
 const documentId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
@@ -45,16 +49,8 @@ const offerFields = {
     })
     .strict()
     .optional(),
-  cancellationPolicy: z
-    .object({
-      freeCancellationHoursBefore: z
-        .number()
-        .int()
-        .min(0)
-        .max(24 * 30),
-      refundPercentAfterDeadline: z.union([z.literal(0), z.literal(50), z.literal(100)]),
-    })
-    .strict(),
+  // Opções da plataforma (D14); o serviço confere se a opção vale para o tipo da oferta.
+  cancellationPolicy: z.enum([...BOOKING_CANCELLATION_POLICIES, ...TRANSFER_CANCELLATION_POLICIES]),
   maxParticipantsPerBooking: z.number().int().min(1).max(50),
   requiresParticipantNames: z.boolean(),
 };

=== server/shared/kernel/cancellationPolicy.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import {
  calculateBuyerRefund,
  canChangeCancellationPolicy,
  isCancellationPolicyAllowed,
} from './cancellationPolicy';

const STARTS = '2026-12-31T22:00:00.000Z';
const hoursBefore = (h: number) => new Date(new Date(STARTS).getTime() - h * 3600_000);
// Compra antiga: fora do arrependimento, para testar só a política.
const OLD_PURCHASE = '2026-10-01T12:00:00.000Z';

function refund(
  family: 'event' | 'booking' | 'transfer',
  policy: Parameters<typeof calculateBuyerRefund>[0]['policy'],
  hours: number,
  purchasedAt = OLD_PURCHASE
) {
  return calculateBuyerRefund({
    family,
    policy,
    purchasedAt,
    startsAt: STARTS,
    now: hoursBefore(hours),
    paidMinor: 10000,
    serviceFeeMinor: 300,
  });
}

describe('políticas de cancelamento (D14)', () => {
  it('arrependimento: 7 dias da compra e 48 h antes do início devolve tudo, com a taxa de serviço', () => {
    const purchased = hoursBefore(100).toISOString();
    expect(refund('event', 'none', 72, purchased)).toEqual({
      reason: 'withdrawal',
      percent: 100,
      refundMinor: 10000,
      serviceFeeRefundMinor: 300,
    });
    // Menos de 48 h antes do início: vale a política, e a taxa de serviço não volta.
    expect(refund('event', 'none', 40, purchased)).toMatchObject({
      reason: 'none',
      refundMinor: 0,
    });
    expect(refund('event', 'flexible', 40, purchased)).toMatchObject({
      reason: 'policy',
      refundMinor: 10000,
      serviceFeeRefundMinor: 0,
    });
  });

  it('eventos: flexível 24 h, moderada 7 dias, rígida 30 dias', () => {
    expect(refund('event', 'flexible', 25).refundMinor).toBe(10000);
    expect(refund('event', 'flexible', 23).refundMinor).toBe(0);
    expect(refund('event', 'moderate', 7 * 24).refundMinor).toBe(10000);
    expect(refund('event', 'moderate', 6 * 24).refundMinor).toBe(0);
    expect(refund('event', 'strict', 30 * 24).refundMinor).toBe(10000);
    expect(refund('event', 'strict', 29 * 24).refundMinor).toBe(0);
  });

  it('reservas: moderada devolve 100% até 5 dias e 50% até 24 h; rígida 50% até 7 dias', () => {
    expect(refund('booking', 'moderate', 5 * 24).refundMinor).toBe(10000);
    expect(refund('booking', 'moderate', 48).refundMinor).toBe(5000);
    expect(refund('booking', 'moderate', 12).refundMinor).toBe(0);
    expect(refund('booking', 'strict', 7 * 24).refundMinor).toBe(5000);
    expect(refund('booking', 'strict', 6 * 24).refundMinor).toBe(0);
  });

  it('translado retém no máximo 5% com aviso de 24 h (CC art. 740)', () => {
    expect(refund('transfer', 'transfer_standard', 30).refundMinor).toBe(9500);
    expect(refund('transfer', 'transfer_flexible', 30).refundMinor).toBe(10000);
    expect(refund('transfer', 'transfer_standard', 10).refundMinor).toBe(0);
  });

  it('depois do início (no-show) não há reembolso', () => {
    expect(refund('booking', 'flexible', 0).refundMinor).toBe(0);
    expect(refund('booking', 'flexible', -2).reason).toBe('none');
  });

  it('cada família aceita só as próprias opções', () => {
    expect(isCancellationPolicyAllowed('transfer', 'flexible')).toBe(false);
    expect(isCancellationPolicyAllowed('booking', 'transfer_standard')).toBe(false);
    expect(isCancellationPolicyAllowed('event', 'strict')).toBe(true);
  });

  it('depois de publicar, só muda para igual ou mais flexível', () => {
    expect(canChangeCancellationPolicy('event', 'strict', 'flexible')).toBe(true);
    expect(canChangeCancellationPolicy('event', 'moderate', 'moderate')).toBe(true);
    expect(canChangeCancellationPolicy('event', 'flexible', 'none')).toBe(false);
    expect(canChangeCancellationPolicy('transfer', 'transfer_standard', 'transfer_flexible')).toBe(
      true
    );
    expect(canChangeCancellationPolicy('booking', 'none', 'transfer_flexible')).toBe(false);
  });
});

=== server/shared/kernel/cancellationPolicy.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Políticas de cancelamento definidas pela plataforma (D14). O proprietário escolhe uma; a compra grava
 * a escolhida e o reembolso é calculado só no backend, em centavos (AGENTS.md §8.7).
 */
export const EVENT_CANCELLATION_POLICIES = ['flexible', 'moderate', 'strict', 'none'] as const;
export const BOOKING_CANCELLATION_POLICIES = ['flexible', 'moderate', 'strict', 'none'] as const;
export const TRANSFER_CANCELLATION_POLICIES = ['transfer_flexible', 'transfer_standard'] as const;

export type EventCancellationPolicy = (typeof EVENT_CANCELLATION_POLICIES)[number];
export type BookingCancellationPolicy =
  | (typeof BOOKING_CANCELLATION_POLICIES)[number]
  | (typeof TRANSFER_CANCELLATION_POLICIES)[number];
export type CancellationPolicyId = EventCancellationPolicy | BookingCancellationPolicy;

/** Eventos, reservas (passeio, aluguel, entrada) e translados têm listas próprias. */
export type CancellationPolicyFamily = 'event' | 'booking' | 'transfer';

interface RefundTier {
  /** A partir de quantas horas antes do início vale o percentual. */
  hoursBefore: number;
  percent: number;
}

// Da mais flexível para a mais rígida: a ordem define o que é "mais flexível" ao trocar de política.
const POLICY_TIERS: Record<CancellationPolicyFamily, Record<string, RefundTier[]>> = {
  event: {
    flexible: [{ hoursBefore: 24, percent: 100 }],
    moderate: [{ hoursBefore: 7 * 24, percent: 100 }],
    strict: [{ hoursBefore: 30 * 24, percent: 100 }],
    none: [],
  },
  booking: {
    flexible: [{ hoursBefore: 24, percent: 100 }],
    moderate: [
      { hoursBefore: 5 * 24, percent: 100 },
      { hoursBefore: 24, percent: 50 },
    ],
    strict: [{ hoursBefore: 7 * 24, percent: 50 }],
    none: [],
  },
  // Código Civil art. 740: o transportador retém no máximo 5% quando o passageiro avisa a tempo.
  transfer: {
    transfer_flexible: [{ hoursBefore: 24, percent: 100 }],
    transfer_standard: [{ hoursBefore: 24, percent: 95 }],
  },
};

/** Direito de arrependimento (CDC art. 49): 7 dias da compra, até 48 h antes do início (D14). */
export const WITHDRAWAL_DAYS = 7;
export const WITHDRAWAL_MIN_HOURS_BEFORE_START = 48;

const HOUR_MS = 60 * 60 * 1000;

export function policiesOf(family: CancellationPolicyFamily): string[] {
  return Object.keys(POLICY_TIERS[family]);
}

export function isCancellationPolicyAllowed(
  family: CancellationPolicyFamily,
  policy: string
): policy is CancellationPolicyId {
  return Object.hasOwn(POLICY_TIERS[family], policy);
}

/** Depois de publicar, a política só muda para uma igual ou mais flexível (D14). */
export function canChangeCancellationPolicy(
  family: CancellationPolicyFamily,
  from: string,
  to: string
): boolean {
  const order = policiesOf(family);
  const fromIndex = order.indexOf(from);
  const toIndex = order.indexOf(to);
  return toIndex !== -1 && (fromIndex === -1 || toIndex <= fromIndex);
}

export interface BuyerRefund {
  reason: 'withdrawal' | 'policy' | 'none';
  percent: number;
  refundMinor: number;
  serviceFeeRefundMinor: number;
}

/**
 * Quanto volta ao comprador que cancela. `paidMinor` é o valor do serviço (sem a taxa de serviço), que só
 * volta no arrependimento. Depois do início (ou no-show) não há reembolso.
 */
export function calculateBuyerRefund(params: {
  family: CancellationPolicyFamily;
  policy: CancellationPolicyId;
  purchasedAt: string;
  startsAt: string;
  now: Date;
  paidMinor: number;
  serviceFeeMinor: number;
}): BuyerRefund {
  const nowMs = params.now.getTime();
  const startsAtMs = new Date(params.startsAt).getTime();
  const hoursUntilStart = (startsAtMs - nowMs) / HOUR_MS;
  if (hoursUntilStart <= 0) {
    return { reason: 'none', percent: 0, refundMinor: 0, serviceFeeRefundMinor: 0 };
  }
  const daysSincePurchase = (nowMs - new Date(params.purchasedAt).getTime()) / (24 * HOUR_MS);
  if (
    daysSincePurchase <= WITHDRAWAL_DAYS &&
    hoursUntilStart >= WITHDRAWAL_MIN_HOURS_BEFORE_START
  ) {
    return {
      reason: 'withdrawal',
      percent: 100,
      refundMinor: params.paidMinor,
      serviceFeeRefundMinor: params.serviceFeeMinor,
    };
  }
  const tiers = POLICY_TIERS[params.family][params.policy] ?? [];
  const percent = tiers.find((tier) => hoursUntilStart >= tier.hoursBefore)?.percent ?? 0;
  return {
    reason: percent > 0 ? 'policy' : 'none',
    percent,
    // Arredonda para baixo: nunca devolve mais do que o percentual da política.
    refundMinor: Math.floor((params.paidMinor * percent) / 100),
    serviceFeeRefundMinor: 0,
  };
}

=== server/shared/kernel/platformFee.test.ts — APAGUE este arquivo ===

=== server/shared/kernel/platformFee.ts — APAGUE este arquivo ===

=== server/shared/kernel/platformFees.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import {
  bookingPlatformFeeMinor,
  PlatformFeeConfigError,
  resolvePlatformFeeConfig,
  ticketOrderFees,
} from './platformFees';

const ENV = {
  BOOKINGS_PLATFORM_FEE_BPS: '1500',
  TICKETS_PLATFORM_FEE_BPS: '1000',
  TICKETS_ABSORBED_FEE_BPS: '1250',
  TICKET_SERVICE_FEE_MINOR: '300',
};
const CONFIG = resolvePlatformFeeConfig(ENV);

describe('taxas da plataforma (D14)', () => {
  it('lê a configuração em pontos-base e centavos', () => {
    expect(CONFIG).toEqual({
      bookingsBps: 1500,
      ticketsBps: 1000,
      ticketsAbsorbedBps: 1250,
      ticketServiceFeeMinor: 300,
    });
  });

  it('sem configuração ou com valor inválido, falha em vez de cobrar uma taxa padrão', () => {
    for (const env of [
      {},
      { ...ENV, TICKETS_PLATFORM_FEE_BPS: '' },
      { ...ENV, BOOKINGS_PLATFORM_FEE_BPS: '15%' },
      { ...ENV, TICKETS_ABSORBED_FEE_BPS: '12.5' },
      { ...ENV, TICKETS_PLATFORM_FEE_BPS: '10001' },
      { ...ENV, TICKET_SERVICE_FEE_MINOR: '-1' },
    ]) {
      expect(() => resolvePlatformFeeConfig(env)).toThrow(PlatformFeeConfigError);
    }
  });

  it('reserva: 15% do subtotal, arredondado a favor do proprietário', () => {
    expect(bookingPlatformFeeMinor(20000, CONFIG)).toBe(3000);
    expect(bookingPlatformFeeMinor(999, CONFIG)).toBe(149);
  });

  it('ingresso com taxa repassada: 10% do organizador e R$ 3,00 por ingresso pago do comprador', () => {
    expect(
      ticketOrderFees(
        { netSubtotalMinor: 10000, paidTicketCount: 2, mode: 'pass_to_buyer' },
        CONFIG
      )
    ).toEqual({ platformFeeMinor: 1000, serviceFeeMinor: 600 });
  });

  it('ingresso com taxa absorvida: 12,5% e nada para o comprador', () => {
    expect(
      ticketOrderFees({ netSubtotalMinor: 10000, paidTicketCount: 2, mode: 'absorb' }, CONFIG)
    ).toEqual({ platformFeeMinor: 1250, serviceFeeMinor: 0 });
  });

  it('ingresso gratuito não tem taxa de serviço', () => {
    expect(
      ticketOrderFees({ netSubtotalMinor: 0, paidTicketCount: 0, mode: 'pass_to_buyer' }, CONFIG)
    ).toEqual({ platformFeeMinor: 0, serviceFeeMinor: 0 });
  });
});

=== server/shared/kernel/platformFees.ts — ARQUIVO NOVO, conteúdo completo ===
/** Quem paga a taxa de serviço do ingresso (D14): o comprador, ou o organizador, que absorve. */
export type ServiceFeeMode = 'pass_to_buyer' | 'absorb';

export interface PlatformFeeConfig {
  bookingsBps: number;
  ticketsBps: number;
  ticketsAbsorbedBps: number;
  ticketServiceFeeMinor: number;
}

const BPS_VARS = {
  bookingsBps: 'BOOKINGS_PLATFORM_FEE_BPS',
  ticketsBps: 'TICKETS_PLATFORM_FEE_BPS',
  ticketsAbsorbedBps: 'TICKETS_ABSORBED_FEE_BPS',
} as const;
const SERVICE_FEE_VAR = 'TICKET_SERVICE_FEE_MINOR';
const MAX_BPS = 10_000;
const MAX_SERVICE_FEE_MINOR = 100_000;

/** Falta ou erro na configuração de taxas: a venda para com 503 em vez de cobrar uma taxa inventada. */
export class PlatformFeeConfigError extends Error {
  readonly code = 'PLATFORM_FEE_NOT_CONFIGURED';
  constructor(variable: string) {
    super(`${variable} ausente ou inválida.`);
    this.name = 'PlatformFeeConfigError';
  }
}

function readInteger(env: Record<string, string | undefined>, name: string, max: number): number {
  const raw = env[name]?.trim() ?? '';
  const value = Number(raw);
  if (raw === '' || !Number.isInteger(value) || value < 0 || value > max) {
    throw new PlatformFeeConfigError(name);
  }
  return value;
}

/**
 * Taxas da plataforma por tipo de produto (D14, AGENTS.md §8.1), em pontos-base e centavos.
 * Sem valor padrão no código: a configuração vem só das variáveis de ambiente (§2.2.1).
 */
export function resolvePlatformFeeConfig(
  env: Record<string, string | undefined> = process.env
): PlatformFeeConfig {
  return {
    bookingsBps: readInteger(env, BPS_VARS.bookingsBps, MAX_BPS),
    ticketsBps: readInteger(env, BPS_VARS.ticketsBps, MAX_BPS),
    ticketsAbsorbedBps: readInteger(env, BPS_VARS.ticketsAbsorbedBps, MAX_BPS),
    ticketServiceFeeMinor: readInteger(env, SERVICE_FEE_VAR, MAX_SERVICE_FEE_MINOR),
  };
}

// Arredonda para baixo: a diferença de centavo fica com o proprietário, nunca com a plataforma.
function applyBps(amountMinor: number, bps: number): number {
  return Math.floor((amountMinor * bps) / MAX_BPS);
}

/** Passeio, aluguel, translado e entrada: taxa sobre o subtotal, descontada do proprietário. */
export function bookingPlatformFeeMinor(subtotalMinor: number, config: PlatformFeeConfig): number {
  return applyBps(subtotalMinor, config.bookingsBps);
}

/**
 * Ingressos: taxa da plataforma sobre o valor líquido e, se o organizador repassa, taxa de serviço por
 * ingresso pago, paga pelo comprador. Ingresso gratuito não tem taxa de serviço.
 */
export function ticketOrderFees(
  params: { netSubtotalMinor: number; paidTicketCount: number; mode: ServiceFeeMode },
  config: PlatformFeeConfig
): { platformFeeMinor: number; serviceFeeMinor: number } {
  if (params.mode === 'absorb') {
    return {
      platformFeeMinor: applyBps(params.netSubtotalMinor, config.ticketsAbsorbedBps),
      serviceFeeMinor: 0,
    };
  }
  return {
    platformFeeMinor: applyBps(params.netSubtotalMinor, config.ticketsBps),
    serviceFeeMinor: config.ticketServiceFeeMinor * params.paidTicketCount,
  };
}

=== src/shared/utils/cancellationPolicy.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Espelho de server/shared/kernel/cancellationPolicy.ts para exibir as políticas e prever o reembolso.
 * O valor que vale é o calculado no backend; o teste de paridade garante que as regras são iguais.
 */
export const EVENT_CANCELLATION_POLICIES = ['flexible', 'moderate', 'strict', 'none'] as const;
export const BOOKING_CANCELLATION_POLICIES = ['flexible', 'moderate', 'strict', 'none'] as const;
export const TRANSFER_CANCELLATION_POLICIES = ['transfer_flexible', 'transfer_standard'] as const;

export type EventCancellationPolicy = (typeof EVENT_CANCELLATION_POLICIES)[number];
export type BookingCancellationPolicy =
  | (typeof BOOKING_CANCELLATION_POLICIES)[number]
  | (typeof TRANSFER_CANCELLATION_POLICIES)[number];
export type CancellationPolicyId = EventCancellationPolicy | BookingCancellationPolicy;

/** Eventos, reservas (passeio, aluguel, entrada) e translados têm listas próprias. */
export type CancellationPolicyFamily = 'event' | 'booking' | 'transfer';

interface RefundTier {
  /** A partir de quantas horas antes do início vale o percentual. */
  hoursBefore: number;
  percent: number;
}

// Da mais flexível para a mais rígida: a ordem define o que é "mais flexível" ao trocar de política.
const POLICY_TIERS: Record<CancellationPolicyFamily, Record<string, RefundTier[]>> = {
  event: {
    flexible: [{ hoursBefore: 24, percent: 100 }],
    moderate: [{ hoursBefore: 7 * 24, percent: 100 }],
    strict: [{ hoursBefore: 30 * 24, percent: 100 }],
    none: [],
  },
  booking: {
    flexible: [{ hoursBefore: 24, percent: 100 }],
    moderate: [
      { hoursBefore: 5 * 24, percent: 100 },
      { hoursBefore: 24, percent: 50 },
    ],
    strict: [{ hoursBefore: 7 * 24, percent: 50 }],
    none: [],
  },
  // Código Civil art. 740: o transportador retém no máximo 5% quando o passageiro avisa a tempo.
  transfer: {
    transfer_flexible: [{ hoursBefore: 24, percent: 100 }],
    transfer_standard: [{ hoursBefore: 24, percent: 95 }],
  },
};

/** Direito de arrependimento (CDC art. 49): 7 dias da compra, até 48 h antes do início (D14). */
export const WITHDRAWAL_DAYS = 7;
export const WITHDRAWAL_MIN_HOURS_BEFORE_START = 48;

const HOUR_MS = 60 * 60 * 1000;

export function policiesOf(family: CancellationPolicyFamily): string[] {
  return Object.keys(POLICY_TIERS[family]);
}

export function isCancellationPolicyAllowed(
  family: CancellationPolicyFamily,
  policy: string
): policy is CancellationPolicyId {
  return Object.hasOwn(POLICY_TIERS[family], policy);
}

/** Depois de publicar, a política só muda para uma igual ou mais flexível (D14). */
export function canChangeCancellationPolicy(
  family: CancellationPolicyFamily,
  from: string,
  to: string
): boolean {
  const order = policiesOf(family);
  const fromIndex = order.indexOf(from);
  const toIndex = order.indexOf(to);
  return toIndex !== -1 && (fromIndex === -1 || toIndex <= fromIndex);
}

export interface BuyerRefund {
  reason: 'withdrawal' | 'policy' | 'none';
  percent: number;
  refundMinor: number;
  serviceFeeRefundMinor: number;
}

/**
 * Quanto volta ao comprador que cancela. `paidMinor` é o valor do serviço (sem a taxa de serviço), que só
 * volta no arrependimento. Depois do início (ou no-show) não há reembolso.
 */
export function calculateBuyerRefund(params: {
  family: CancellationPolicyFamily;
  policy: CancellationPolicyId;
  purchasedAt: string;
  startsAt: string;
  now: Date;
  paidMinor: number;
  serviceFeeMinor: number;
}): BuyerRefund {
  const nowMs = params.now.getTime();
  const startsAtMs = new Date(params.startsAt).getTime();
  const hoursUntilStart = (startsAtMs - nowMs) / HOUR_MS;
  if (hoursUntilStart <= 0) {
    return { reason: 'none', percent: 0, refundMinor: 0, serviceFeeRefundMinor: 0 };
  }
  const daysSincePurchase = (nowMs - new Date(params.purchasedAt).getTime()) / (24 * HOUR_MS);
  if (
    daysSincePurchase <= WITHDRAWAL_DAYS &&
    hoursUntilStart >= WITHDRAWAL_MIN_HOURS_BEFORE_START
  ) {
    return {
      reason: 'withdrawal',
      percent: 100,
      refundMinor: params.paidMinor,
      serviceFeeRefundMinor: params.serviceFeeMinor,
    };
  }
  const tiers = POLICY_TIERS[params.family][params.policy] ?? [];
  const percent = tiers.find((tier) => hoursUntilStart >= tier.hoursBefore)?.percent ?? 0;
  return {
    reason: percent > 0 ? 'policy' : 'none',
    percent,
    // Arredonda para baixo: nunca devolve mais do que o percentual da política.
    refundMinor: Math.floor((params.paidMinor * percent) / 100),
    serviceFeeRefundMinor: 0,
  };
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/bookings/bookingApplicationUseCases.test.ts server/application/usecases/bookings/createBookingApplicationUseCase.ts server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts server/application/usecases/deletePartnerEventApplicationUseCase.test.ts server/application/usecases/eventLifecycleOrchestration.test.ts server/application/usecases/ticketingPaymentOrchestration.test.ts server/application/usecases/updatePartnerEventApplicationUseCase.test.ts server/domain/bookings/errors/bookingDomainError.ts server/domain/bookings/index.ts server/domain/bookings/services/bookingService.test.ts server/domain/bookings/services/bookingService.ts server/domain/bookings/services/offerService.test.ts server/domain/bookings/services/offerService.ts server/domain/bookings/types/bookingTypes.ts server/domain/bookings/usecases/createPendingBookingUseCase.ts server/domain/bookings/utils/bookingPricing.ts server/domain/bookings/utils/bookingUtils.test.ts server/domain/events/dtos/eventPersistenceMappers.ts server/domain/events/schemas/eventSchema.ts server/domain/events/services/eventsService.test.ts server/domain/events/services/eventsService.ts server/domain/events/types/eventTypes.ts server/domain/partners/schemas/partnerContentSchema.ts server/domain/ticketing/adapters/firestoreOrderReservationStore.ts server/domain/ticketing/dtos/ticketingPersistenceMappers.ts server/domain/ticketing/ports/ticketingPort.ts server/domain/ticketing/services/orders/prepareOrderItems.ts server/domain/ticketing/services/ticketHolderService.ts server/domain/ticketing/services/ticketOrderService.ts server/domain/ticketing/services/ticketRefundService.ts server/domain/ticketing/services/ticketingServices.test.ts server/domain/ticketing/types/ticketingTypes.ts server/interfaces/http/bookings/schemas/bookingSchemas.test.ts server/interfaces/http/bookings/schemas/bookingSchemas.ts server/shared/kernel/cancellationPolicy.test.ts server/shared/kernel/cancellationPolicy.ts server/shared/kernel/platformFees.test.ts server/shared/kernel/platformFees.ts src/shared/utils/cancellationPolicy.ts` (todos verdes). Não precisa rodar a suíte inteira.
- o frontend tem tipos próprios e continua compilando nesta parte; as telas passam a usar as regras novas na parte 2.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
