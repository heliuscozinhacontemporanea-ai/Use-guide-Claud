# Prompt 15 — Um UseCase por arquivo (fim dos agregadores)

> Lote 7, gerado do commit de referência `f565f7b` da branch `claude/agents-md-v2`. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 15 — Um UseCase por arquivo (fim dos agregadores)

Reorganização sem mudança de comportamento (AGENTS.md §13). Os 9 arquivos agregadores viram um arquivo por UseCase: `eventUseCases.ts`, `ticketingUseCases.ts`, `paymentUseCases.ts`, `marketplaceConnectUseCases.ts`, `ticketingPaymentOrchestrationUseCases.ts` e `eventLifecycleOrchestrationUseCases.ts`, no backend, na camada application e no frontend. Os imports, as fachadas `index.ts` e os `vi.mock` dos testes são atualizados. Os testes continuam os mesmos.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

É uma mudança MECÂNICA. Regra: cada função exportada de um arquivo agregador vai para um arquivo com o MESMO nome da função, na MESMA pasta, com o MESMO corpo e só os imports que ela usa. Quem importava do agregador passa a importar do arquivo novo. O agregador é apagado. Nenhuma lógica muda.

Detalhes:
- server/application/usecases: a interface OrchestrationActor vai para orchestrationActor.ts.
- Os testes que tinham nome de agregador mudam de nome: eventLifecycleOrchestrationUseCases.test.ts → eventLifecycleOrchestration.test.ts; ticketingPaymentOrchestrationUseCases.test.ts → ticketingPaymentOrchestration.test.ts.
- `vi.mock('.../xUseCases', () => ({ a: vi.fn(), b: vi.fn() }))` vira um vi.mock por arquivo novo. O mock de `updateTransactionStatusUseCase` em paymentController.test.ts sai, porque essa função não existe.
- docs/arquitetura/debitos.md registra o débito resolvido; docs/arquitetura/solicitacoes-agents.md ganha a solicitação S9 (texto do §13). NÃO altere o AGENTS.md: a S9 aguarda a decisão do responsável.

Aplique o diff abaixo exatamente. Se o tamanho atrapalhar, siga a regra acima arquivo por arquivo: o resultado precisa ser idêntico.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- docs/arquitetura/solicitacoes-agents.md (alterar)
- server/application/usecases/cancelEventListingAndRefundApplicationUseCase.ts (criar)
- server/application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase.ts (criar)
- server/application/usecases/confirmTicketOrderPaymentClientReturnApplicationUseCase.ts (criar)
- server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts (criar)
- server/application/usecases/deleteEventListingSafelyApplicationUseCase.ts (criar)
- server/application/usecases/deleteEventOccurrenceSafelyApplicationUseCase.ts (criar)
- server/application/usecases/deletePartnerEventApplicationUseCase.test.ts (alterar)
- server/application/usecases/deletePartnerEventApplicationUseCase.ts (alterar)
- server/application/usecases/eventLifecycleOrchestration.test.ts (criar)
- server/application/usecases/eventLifecycleOrchestrationUseCases.test.ts (apagar)
- server/application/usecases/eventLifecycleOrchestrationUseCases.ts (apagar)
- server/application/usecases/getCommittedTicketsCountForOccurrenceApplicationUseCase.ts (criar)
- server/application/usecases/hasEventCommercialHistoryApplicationUseCase.ts (criar)
- server/application/usecases/orchestrationActor.ts (criar)
- server/application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase.ts (criar)
- server/application/usecases/processTicketRefundApplicationUseCase.ts (criar)
- server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts (criar)
- server/application/usecases/ticketingPaymentOrchestration.test.ts (criar)
- server/application/usecases/ticketingPaymentOrchestrationUseCases.test.ts (apagar)
- server/application/usecases/ticketingPaymentOrchestrationUseCases.ts (apagar)
- server/application/usecases/updateEventListingSafelyApplicationUseCase.ts (criar)
- server/application/usecases/updateEventOccurrenceSafelyApplicationUseCase.ts (criar)
- server/application/usecases/updatePartnerEventApplicationUseCase.test.ts (alterar)
- server/application/usecases/updatePartnerEventApplicationUseCase.ts (alterar)
- server/domain/events/controllers/eventsController.ts (alterar)
- server/domain/events/index.ts (alterar)
- server/domain/events/usecases/archiveEventListingUseCase.ts (criar)
- server/domain/events/usecases/cancelEventOccurrenceUseCase.ts (criar)
- server/domain/events/usecases/completeEventOccurrenceUseCase.ts (criar)
- server/domain/events/usecases/createEventAuditLogUseCase.ts (criar)
- server/domain/events/usecases/createEventListingUseCase.ts (criar)
- server/domain/events/usecases/createEventOccurrenceUseCase.ts (criar)
- server/domain/events/usecases/deleteEventOccurrenceUseCase.ts (criar)
- server/domain/events/usecases/deleteEventsByOwnerUseCase.ts (criar)
- server/domain/events/usecases/deleteOrArchiveEventListingUseCase.ts (criar)
- server/domain/events/usecases/duplicateEventListingUseCase.ts (criar)
- server/domain/events/usecases/eventUseCases.ts (apagar)
- server/domain/events/usecases/getEventListingByIdUseCase.ts (criar)
- server/domain/events/usecases/getEventOccurrenceByIdUseCase.ts (criar)
- server/domain/events/usecases/listAllEventListingsUseCase.ts (criar)
- server/domain/events/usecases/listEventOccurrencesUseCase.ts (criar)
- server/domain/events/usecases/listPublicEventListingsUseCase.ts (criar)
- server/domain/events/usecases/pauseEventListingUseCase.ts (criar)
- server/domain/events/usecases/postponeEventOccurrenceUseCase.ts (criar)
- server/domain/events/usecases/publishEventListingUseCase.ts (criar)
- server/domain/events/usecases/recordEventAuditLogUseCase.ts (criar)
- server/domain/events/usecases/updateEventListingPricingSummaryUseCase.ts (criar)
- server/domain/events/usecases/updateEventListingUseCase.ts (criar)
- server/domain/events/usecases/updateEventOccurrenceUseCase.ts (criar)
- server/domain/events/usecases/updateEventRatingSummaryUseCase.ts (criar)
- server/domain/events/usecases/updateEventsOwnerVerificationUseCase.ts (criar)
- server/domain/partners/controllers/partnerContentController.ts (alterar)
- server/domain/payment/controllers/paymentController.test.ts (alterar)
- server/domain/payment/controllers/paymentController.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/usecases/assertPartnerReadyForPaidEventUseCase.ts (criar)
- server/domain/payment/usecases/claimStripeWebhookEventUseCase.ts (criar)
- server/domain/payment/usecases/completeStripeWebhookEventUseCase.ts (criar)
- server/domain/payment/usecases/constructStripeWebhookEventUseCase.ts (criar)
- server/domain/payment/usecases/createPartnerConnectAccountSessionUseCase.ts (criar)
- server/domain/payment/usecases/createPaymentForTicketOrderUseCase.ts (criar)
- server/domain/payment/usecases/createPlanPaymentIntentUseCase.ts (criar)
- server/domain/payment/usecases/ensurePartnerConnectedAccountUseCase.ts (criar)
- server/domain/payment/usecases/getPartnerConnectAccountStatusUseCase.ts (criar)
- server/domain/payment/usecases/marketplaceConnectUseCases.ts (apagar)
- server/domain/payment/usecases/paymentUseCases.ts (apagar)
- server/domain/payment/usecases/processProviderRefundUseCase.ts (criar)
- server/domain/payment/usecases/releaseStripeWebhookEventUseCase.ts (criar)
- server/domain/payment/usecases/retrievePaymentIntentUseCase.ts (criar)
- server/domain/payment/usecases/syncConnectedAccountFromWebhookUseCase.ts (criar)
- server/domain/payment/usecases/updatePaymentTransactionStatusUseCase.ts (criar)
- server/domain/ticketing/controllers/ticketingController.ts (alterar)
- server/domain/ticketing/index.ts (alterar)
- server/domain/ticketing/usecases/archiveTicketTypeUseCase.ts (criar)
- server/domain/ticketing/usecases/checkInTicketUseCase.ts (criar)
- server/domain/ticketing/usecases/confirmTicketOrderPaymentUseCase.ts (criar)
- server/domain/ticketing/usecases/createEventPromoCodeUseCase.ts (criar)
- server/domain/ticketing/usecases/createOfflineCheckInSessionUseCase.ts (criar)
- server/domain/ticketing/usecases/createTicketOrderUseCase.ts (criar)
- server/domain/ticketing/usecases/createTicketTypeUseCase.ts (criar)
- server/domain/ticketing/usecases/expireAllOverdueOrdersUseCase.ts (criar)
- server/domain/ticketing/usecases/expireTicketOrderUseCase.ts (criar)
- server/domain/ticketing/usecases/finalizeTicketRefundStatusUseCase.ts (criar)
- server/domain/ticketing/usecases/getEventSalesAnalyticsUseCase.ts (criar)
- server/domain/ticketing/usecases/getTicketOrderUseCase.ts (criar)
- server/domain/ticketing/usecases/getTicketQrTokenUseCase.ts (criar)
- server/domain/ticketing/usecases/getVerifiedAttendanceForReviewUseCase.ts (criar)
- server/domain/ticketing/usecases/joinEventWaitlistUseCase.ts (criar)
- server/domain/ticketing/usecases/listEventCheckInsForPartnerOrAdminUseCase.ts (criar)
- server/domain/ticketing/usecases/listEventOrdersForPartnerOrAdminUseCase.ts (criar)
- server/domain/ticketing/usecases/listEventRefundsForPartnerOrAdminUseCase.ts (criar)
- server/domain/ticketing/usecases/listPublicTicketTypesByOccurrenceUseCase.ts (criar)
- server/domain/ticketing/usecases/listTicketTypesForManagementUseCase.ts (criar)
- server/domain/ticketing/usecases/listUserTicketOrdersUseCase.ts (criar)
- server/domain/ticketing/usecases/listUserTicketsUseCase.ts (criar)
- server/domain/ticketing/usecases/markTicketOrderDisputedUseCase.ts (criar)
- server/domain/ticketing/usecases/markTicketOrderPaymentFailedUseCase.ts (criar)
- server/domain/ticketing/usecases/moveOrderToOccurrenceUseCase.ts (criar)
- server/domain/ticketing/usecases/reissueTicketQrTokenUseCase.ts (criar)
- server/domain/ticketing/usecases/requestTicketRefundUseCase.ts (criar)
- server/domain/ticketing/usecases/syncOfflineCheckInsUseCase.ts (criar)
- server/domain/ticketing/usecases/ticketingUseCases.ts (apagar)
- server/domain/ticketing/usecases/transferTicketUseCase.ts (criar)
- server/domain/ticketing/usecases/updateTicketTypeUseCase.ts (criar)
- src/domain/events/application/usecases/archiveAdminEventListingUseCase.ts (criar)
- src/domain/events/application/usecases/cancelAdminEventListingUseCase.ts (criar)
- src/domain/events/application/usecases/createAdminEventListingUseCase.ts (criar)
- src/domain/events/application/usecases/createAdminEventOccurrenceUseCase.ts (criar)
- src/domain/events/application/usecases/createPartnerEventListingUseCase.ts (criar)
- src/domain/events/application/usecases/createPartnerEventOccurrenceUseCase.ts (criar)
- src/domain/events/application/usecases/deleteAdminEventListingUseCase.ts (criar)
- src/domain/events/application/usecases/deleteAdminEventOccurrenceUseCase.ts (criar)
- src/domain/events/application/usecases/deletePartnerEventListingUseCase.ts (criar)
- src/domain/events/application/usecases/deletePartnerEventOccurrenceUseCase.ts (criar)
- src/domain/events/application/usecases/eventUseCases.ts (apagar)
- src/domain/events/application/usecases/getEventListingByIdUseCase.ts (criar)
- src/domain/events/application/usecases/listEventOccurrencesUseCase.ts (criar)
- src/domain/events/application/usecases/updateAdminEventListingUseCase.ts (criar)
- src/domain/events/application/usecases/updateAdminEventOccurrenceUseCase.ts (criar)
- src/domain/events/application/usecases/updatePartnerEventListingUseCase.ts (criar)
- src/domain/events/application/usecases/updatePartnerEventOccurrenceUseCase.ts (criar)
- src/domain/events/hooks/useEventOccurrences.ts (alterar)
- src/domain/events/index.ts (alterar)
- src/domain/payment/application/usecases/confirmPlanPaymentReturnUseCase.ts (criar)
- src/domain/payment/application/usecases/createPartnerConnectAccountSessionUseCase.ts (criar)
- src/domain/payment/application/usecases/createPartnerConnectAccountUseCase.ts (criar)
- src/domain/payment/application/usecases/createPlanPaymentIntentUseCase.ts (criar)
- src/domain/payment/application/usecases/getPartnerConnectStatusUseCase.ts (criar)
- src/domain/payment/application/usecases/paymentUseCases.ts (apagar)
- src/domain/payment/components/PartnerStripeConnectPortal.tsx (alterar)
- src/domain/payment/hooks/usePayment.ts (alterar)
- src/domain/payment/index.ts (alterar)
- src/domain/ticketing/application/usecases/checkInTicketUseCase.ts (criar)
- src/domain/ticketing/application/usecases/confirmTicketOrderPaymentReturnUseCase.ts (criar)
- src/domain/ticketing/application/usecases/createOfflineCheckInSessionUseCase.ts (criar)
- src/domain/ticketing/application/usecases/createPartnerConnectAccountSessionUseCase.ts (criar)
- src/domain/ticketing/application/usecases/createPartnerConnectAccountUseCase.ts (criar)
- src/domain/ticketing/application/usecases/createTicketOrderPaymentIntentUseCase.ts (criar)
- src/domain/ticketing/application/usecases/createTicketOrderUseCase.ts (criar)
- src/domain/ticketing/application/usecases/createTicketTypeUseCase.ts (criar)
- src/domain/ticketing/application/usecases/deleteOrArchiveTicketTypeUseCase.ts (criar)
- src/domain/ticketing/application/usecases/expireTicketOrderUseCase.ts (criar)
- src/domain/ticketing/application/usecases/getEventSalesAnalyticsUseCase.ts (criar)
- src/domain/ticketing/application/usecases/getPartnerMerchantStatusUseCase.ts (criar)
- src/domain/ticketing/application/usecases/getTicketOrderUseCase.ts (criar)
- src/domain/ticketing/application/usecases/getTicketQrTokenUseCase.ts (criar)
- src/domain/ticketing/application/usecases/listEventCheckInsUseCase.ts (criar)
- src/domain/ticketing/application/usecases/listEventOrdersUseCase.ts (criar)
- src/domain/ticketing/application/usecases/listEventRefundsUseCase.ts (criar)
- src/domain/ticketing/application/usecases/listManagementTicketTypesUseCase.ts (criar)
- src/domain/ticketing/application/usecases/listPublicTicketTypesUseCase.ts (criar)
- src/domain/ticketing/application/usecases/listUserOrdersUseCase.ts (criar)
- src/domain/ticketing/application/usecases/listUserTicketsUseCase.ts (criar)
- src/domain/ticketing/application/usecases/reissueTicketQrTokenUseCase.ts (criar)
- src/domain/ticketing/application/usecases/requestTicketRefundUseCase.ts (criar)
- src/domain/ticketing/application/usecases/syncOfflineCheckInsUseCase.ts (criar)
- src/domain/ticketing/application/usecases/ticketingUseCases.ts (apagar)
- src/domain/ticketing/application/usecases/transferTicketUseCase.ts (criar)
- src/domain/ticketing/application/usecases/updateTicketTypeUseCase.ts (criar)
- src/domain/ticketing/components/CheckoutResultView.tsx (alterar)
- src/domain/ticketing/components/EventTicketingPurchasePanel.tsx (alterar)
- src/domain/ticketing/components/PartnerEventTicketingManager.tsx (alterar)
- src/domain/ticketing/components/UserTicketsHistoryView.tsx (alterar)
- src/domain/ticketing/hooks/usePartnerEventSales.ts (alterar)
- src/domain/ticketing/hooks/useTicketTypes.ts (alterar)
- src/domain/ticketing/hooks/useUserTickets.ts (alterar)
- src/domain/ticketing/index.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -22,3 +22,4 @@
 | — | SEO do servidor não rodava em produção (o Hosting entregava o `index.html` estático) e inseria valores sem escape: resolvido no prompt 8 (D7) |
 | — | Planos sem renovação automática (pagamento avulso por PaymentIntent): resolvido no prompt 9 (D2) com Stripe Billing no cartão; o pagamento único continua como alternativa |
 | B9 | Metadados das rotas duplicados entre app e servidor: resolvido no prompt 10 (D6) com os textos em `seo.routes` do i18n e teste de paridade com `seo/utils/routeSeo.ts` |
+| — | Arquivos agregadores de UseCases (`eventUseCases.ts`, `ticketingUseCases.ts`, `paymentUseCases.ts`, `marketplaceConnectUseCases.ts`, `ticketingPaymentOrchestrationUseCases.ts`, `eventLifecycleOrchestrationUseCases.ts`, no backend e no frontend): resolvido no prompt 15, um UseCase por arquivo (AGENTS.md §13) |

=== docs/arquitetura/solicitacoes-agents.md — diff ===
@@ -13,6 +13,7 @@
 | S6 | §12.6 | Decisão D5 está em aberto; o texto atual não diz isso | ❌ Não aprovada (2026-10-10) — texto atual mantido |
 | S7 | §12.7 | Decisões D6 (URLs por idioma) e D7 (SEO no Cloud Run) | ✅ Aprovada em 2026-10-10 (prompt A1) |
 | S8 | §15 | Referenciar o registro de decisões aprovadas | ✅ Aprovada em 2026-10-10 (prompt A1) |
+| S9 | §13 | O texto cita agregadores de UseCases que o prompt 15 eliminou | ⏳ Aguardando sua decisão |
 
 ---
 
@@ -81,3 +82,13 @@
 
 **Texto proposto** (novo item no §15):
 > * Decisões já aprovadas estão em `docs/arquitetura/decisoes.md` e DEVEM ser seguidas sem nova consulta. Decisão marcada como **em aberto** NÃO pode ser implementada.
+
+## S9 — §13: agregadores de UseCases já eliminados
+
+**Por quê:** o prompt 15 dividiu todos os arquivos agregadores em um UseCase por arquivo. O §13 ainda diz que `eventUseCases.ts`, `ticketingUseCases.ts` e `paymentUseCases.ts` existem e são débito. Um agente que leia isso pode procurar esses arquivos ou recriá-los.
+
+**Texto atual:**
+> * **Um UseCase por arquivo** (`createBookingUseCase.ts`). Arquivos agregadores existentes (`eventUseCases.ts`, `ticketingUseCases.ts`, `paymentUseCases.ts`) são débito: novos UseCases não entram neles.
+
+**Texto proposto:**
+> * **Um UseCase por arquivo** (`createBookingUseCase.ts`), com o nome do arquivo igual ao da função exportada. É proibido criar arquivo agregador de UseCases; tipos compartilhados entre UseCases ficam em arquivo próprio (ex: `orchestrationActor.ts`).

=== server/application/usecases/cancelEventListingAndRefundApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  archiveEventListingUseCase,
  listEventOccurrencesUseCase,
  type EventListing,
  type EventOccurrence,
} from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { cancelEventOccurrenceAndRefundApplicationUseCase } from './cancelEventOccurrenceAndRefundApplicationUseCase';

export async function cancelEventListingAndRefundApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  reason = 'Evento cancelado pela organização.'
): Promise<{
  listing: EventListing;
  canceledOccurrences: EventOccurrence[];
  refundsCount: number;
}> {
  const occurrences = await listEventOccurrencesUseCase(eventListingId);
  const canceledOccurrences: EventOccurrence[] = [];
  let refundsCount = 0;

  for (const occ of occurrences) {
    if (occ.status === 'scheduled' || occ.status === 'postponed') {
      const res = await cancelEventOccurrenceAndRefundApplicationUseCase(actor, occ.id, reason);
      canceledOccurrences.push(res.occurrence);
      refundsCount += res.refundsInitiated.length;
    }
  }

  const listing = await archiveEventListingUseCase(actor, eventListingId);
  return { listing, canceledOccurrences, refundsCount };
}

=== server/application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { cancelEventOccurrenceUseCase, type EventOccurrence } from '../../domain/events';
import { createNotificationUseCase } from '../../domain/notifications';
import {
  listEventOrdersForPartnerOrAdminUseCase,
  type Refund,
  type TicketingActorContext,
} from '../../domain/ticketing';
import { processTicketRefundApplicationUseCase } from './processTicketRefundApplicationUseCase';

export async function cancelEventOccurrenceAndRefundApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  reason = 'Sessão cancelada pela organização.'
): Promise<{
  occurrence: EventOccurrence;
  refundsInitiated: Refund[];
}> {
  const occurrence = await cancelEventOccurrenceUseCase(actor, occurrenceId, reason);
  const allOrders = await listEventOrdersForPartnerOrAdminUseCase(actor, occurrence.eventListingId);
  const eligibleOrders = allOrders.filter(
    (order) =>
      order.occurrenceId === occurrenceId &&
      (order.status === 'paid' || order.status === 'partially_refunded')
  );

  const refundsInitiated: Refund[] = [];
  for (const order of eligibleOrders) {
    try {
      const { refund } = await processTicketRefundApplicationUseCase(actor, {
        orderId: order.id,
        reason,
        idempotencyKey: `cancel_occ_${occurrenceId}_ord_${order.id}`,
        isEventCanceledByOrganizer: true,
      });
      refundsInitiated.push(refund);

      await createNotificationUseCase({
        recipientPartnerId: order.buyerId,
        type: 'admin_message',
        title: 'Sessão de evento cancelada',
        message: `A sessão do evento "${order.eventSnapshot?.title || 'Evento'}" foi cancelada. Seu reembolso foi iniciado.`,
        relatedItemId: occurrence.eventListingId,
        relatedItemCollection: 'events',
      }).catch(() => {});
    } catch {
      // Continua processando demais pedidos elegíveis
    }
  }

  return { occurrence, refundsInitiated };
}

=== server/application/usecases/confirmTicketOrderPaymentClientReturnApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  PaymentDomainError,
  retrievePaymentIntentUseCase,
  updatePaymentTransactionStatusUseCase,
} from '../../domain/payment';
import {
  confirmTicketOrderPaymentUseCase,
  getTicketOrderUseCase,
  markTicketOrderPaymentFailedUseCase,
  TicketingDomainError,
  type Ticket,
  type TicketOrder,
} from '../../domain/ticketing';
import { OrchestrationActor } from './orchestrationActor';

export async function confirmTicketOrderPaymentClientReturnApplicationUseCase(
  actor: OrchestrationActor,
  params: {
    orderId: string;
    paymentIntentId: string;
  }
): Promise<{
  order: TicketOrder;
  tickets: Ticket[];
}> {
  const { order } = await getTicketOrderUseCase(actor, params.orderId);
  if (order.buyerId !== actor.uid && actor.admin !== true) {
    throw new TicketingDomainError('FORBIDDEN', 'Acesso negado a este pedido.');
  }

  if (order.status === 'paid') {
    const fresh = await getTicketOrderUseCase(actor, order.id);
    return {
      order: fresh.order,
      tickets: fresh.tickets,
    };
  }

  const pi = await retrievePaymentIntentUseCase(params.paymentIntentId);
  if (pi.metadata?.orderId && pi.metadata.orderId !== order.id) {
    throw new PaymentDomainError('FORBIDDEN', 'PaymentIntent não pertence ao pedido informado.');
  }

  if (pi.status === 'succeeded') {
    await updatePaymentTransactionStatusUseCase(pi.id, 'succeeded');
    const confirmed = await confirmTicketOrderPaymentUseCase({
      orderId: order.id,
      paymentId: pi.id,
      paymentIntentId: pi.id,
    });
    return {
      order: confirmed.order,
      tickets: confirmed.tickets,
    };
  }

  if (pi.status === 'Canceled' || pi.status === 'canceled') {
    await updatePaymentTransactionStatusUseCase(pi.id, 'canceled');
    await markTicketOrderPaymentFailedUseCase({
      orderId: order.id,
      paymentIntentId: pi.id,
    });
  }

  const current = await getTicketOrderUseCase(actor, order.id);
  return {
    order: current.order,
    tickets: current.tickets,
  };
}

=== server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getEventListingByIdUseCase } from '../../domain/events';
import { createPaymentForTicketOrderUseCase } from '../../domain/payment';
import {
  confirmTicketOrderPaymentUseCase,
  getTicketOrderUseCase,
  TicketingDomainError,
  type TicketOrder,
} from '../../domain/ticketing';
import { OrchestrationActor } from './orchestrationActor';

export async function createTicketOrderPaymentIntentApplicationUseCase(
  actor: OrchestrationActor,
  input: {
    orderId: string;
    idempotencyKey: string;
  }
): Promise<{
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  orderStatus: TicketOrder['status'];
}> {
  const { order } = await getTicketOrderUseCase(actor, input.orderId);
  if (order.buyerId !== actor.uid && actor.admin !== true) {
    throw new TicketingDomainError('FORBIDDEN', 'Acesso negado a este pedido.');
  }

  if (order.status === 'paid') {
    return {
      orderId: order.id,
      paymentIntentId: order.paymentIntentId || order.paymentId || '',
      clientSecret: '',
      status: 'succeeded',
      orderStatus: 'paid',
    };
  }

  if (order.status === 'expired' || order.status === 'canceled') {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      `Este pedido não pode ser pago porque está com status "${order.status}".`
    );
  }

  if (order.expiresAt && new Date(order.expiresAt).getTime() <= Date.now()) {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      'O prazo de reserva deste pedido expirou.'
    );
  }

  if (order.totalMinor <= 0) {
    const confirmed = await confirmTicketOrderPaymentUseCase({
      orderId: order.id,
      paymentId: 'free_order',
    });
    return {
      orderId: confirmed.order.id,
      paymentIntentId: 'free_order',
      clientSecret: '',
      status: 'succeeded',
      orderStatus: confirmed.order.status,
    };
  }

  const listing = await getEventListingByIdUseCase(order.eventListingId);
  if (!listing) {
    throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
  }

  const partnerId = listing.partnerId || listing.ownerId;

  const paymentResult = await createPaymentForTicketOrderUseCase({
    orderId: order.id,
    buyerId: order.buyerId,
    sellerPartnerId: partnerId,
    eventListingId: order.eventListingId,
    occurrenceId: order.occurrenceId,
    eventTitle: order.eventSnapshot?.title || listing.title,
    totalMinor: order.totalMinor,
    platformFeeMinor: order.platformFeeMinor,
    idempotencyKey: input.idempotencyKey,
  });

  return {
    orderId: order.id,
    paymentIntentId: paymentResult.paymentIntentId,
    clientSecret: paymentResult.clientSecret,
    status: paymentResult.status,
    orderStatus: order.status,
  };
}

=== server/application/usecases/deleteEventListingSafelyApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { deleteOrArchiveEventListingUseCase } from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { hasEventCommercialHistoryApplicationUseCase } from './hasEventCommercialHistoryApplicationUseCase';
import { cancelEventListingAndRefundApplicationUseCase } from './cancelEventListingAndRefundApplicationUseCase';

export async function deleteEventListingSafelyApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<{ mode: 'deleted' | 'archived' }> {
  const hasCommercialHistory = await hasEventCommercialHistoryApplicationUseCase(
    actor,
    eventListingId
  );
  if (hasCommercialHistory) {
    await cancelEventListingAndRefundApplicationUseCase(
      actor,
      eventListingId,
      'Evento encerrado/arquivado com histórico comercial.'
    );
  }
  return deleteOrArchiveEventListingUseCase(actor, eventListingId, hasCommercialHistory);
}

=== server/application/usecases/deleteEventOccurrenceSafelyApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { deleteEventOccurrenceUseCase } from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { getCommittedTicketsCountForOccurrenceApplicationUseCase } from './getCommittedTicketsCountForOccurrenceApplicationUseCase';
import { cancelEventOccurrenceAndRefundApplicationUseCase } from './cancelEventOccurrenceAndRefundApplicationUseCase';

export async function deleteEventOccurrenceSafelyApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<{ mode: 'deleted' | 'canceled' }> {
  const committedCount = await getCommittedTicketsCountForOccurrenceApplicationUseCase(
    actor,
    occurrenceId
  );
  const hasCommercialHistory = committedCount > 0;
  if (hasCommercialHistory) {
    await cancelEventOccurrenceAndRefundApplicationUseCase(
      actor,
      occurrenceId,
      'Sessão cancelada por exclusão com histórico comercial.'
    );
    return { mode: 'canceled' };
  }
  return deleteEventOccurrenceUseCase(actor, occurrenceId, false);
}

=== server/application/usecases/deletePartnerEventApplicationUseCase.test.ts — diff ===
@@ -6,7 +6,7 @@ import {
   type EventListing,
 } from '../../domain/events';
 import { linkBusinessUseCase, unlinkBusinessUseCase } from '../../domain/partners';
-import { deleteEventListingSafelyApplicationUseCase } from './eventLifecycleOrchestrationUseCases';
+import { deleteEventListingSafelyApplicationUseCase } from './deleteEventListingSafelyApplicationUseCase';
 
 vi.mock('../../domain/events', () => ({
   getEventListingByIdUseCase: vi.fn(),
@@ -17,9 +17,7 @@ vi.mock('../../domain/partners', () => ({
   unlinkBusinessUseCase: vi.fn(),
 }));
 
-vi.mock('./eventLifecycleOrchestrationUseCases', () => ({
-  deleteEventListingSafelyApplicationUseCase: vi.fn(),
-}));
+vi.mock('./deleteEventListingSafelyApplicationUseCase', () => ({ deleteEventListingSafelyApplicationUseCase: vi.fn() }));
 
 describe('deletePartnerEventApplicationUseCase', () => {
   const regularUser: AuthenticatedUserContext = {

=== server/application/usecases/deletePartnerEventApplicationUseCase.ts — diff ===
@@ -1,7 +1,7 @@
 import type { AuthenticatedUserContext } from '../security/authenticatedUserContext';
 import { getEventListingByIdUseCase } from '../../domain/events';
 import { linkBusinessUseCase, unlinkBusinessUseCase } from '../../domain/partners';
-import { deleteEventListingSafelyApplicationUseCase } from './eventLifecycleOrchestrationUseCases';
+import { deleteEventListingSafelyApplicationUseCase } from './deleteEventListingSafelyApplicationUseCase';
 
 function isNotFoundError(error: unknown): boolean {
   if (!error) return false;

=== server/application/usecases/eventLifecycleOrchestration.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelEventOccurrenceAndRefundApplicationUseCase } from './cancelEventOccurrenceAndRefundApplicationUseCase';
import { postponeEventOccurrenceAndNotifyApplicationUseCase } from './postponeEventOccurrenceAndNotifyApplicationUseCase';
import {
  cancelEventOccurrenceUseCase,
  getEventListingByIdUseCase,
  postponeEventOccurrenceUseCase,
  type EventListing,
  type EventOccurrence,
} from '../../domain/events';
import { createNotificationUseCase } from '../../domain/notifications';
import {
  listEventOrdersForPartnerOrAdminUseCase,
  moveOrderToOccurrenceUseCase,
  type Refund,
  type TicketOrder,
} from '../../domain/ticketing';
import { processTicketRefundApplicationUseCase } from './processTicketRefundApplicationUseCase';

vi.mock('../../domain/events', () => ({
  cancelEventOccurrenceUseCase: vi.fn(),
  getEventListingByIdUseCase: vi.fn(),
  postponeEventOccurrenceUseCase: vi.fn(),
  listEventOccurrencesUseCase: vi.fn(),
  archiveEventListingUseCase: vi.fn(),
}));

vi.mock('../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../domain/ticketing', () => ({
  listEventOrdersForPartnerOrAdminUseCase: vi.fn(),
  listEventRefundsForPartnerOrAdminUseCase: vi.fn().mockResolvedValue([]),
  listEventCheckInsForPartnerOrAdminUseCase: vi.fn().mockResolvedValue([]),
  listTicketTypesForManagementUseCase: vi.fn().mockResolvedValue([]),
  moveOrderToOccurrenceUseCase: vi.fn(),
}));

vi.mock('./processTicketRefundApplicationUseCase', () => ({ processTicketRefundApplicationUseCase: vi.fn() }));

describe('eventLifecycleOrchestrationUseCases', () => {
  const actor = { uid: 'partner-1', admin: false, role: 'partner' };

  const sampleOccurrence: EventOccurrence = {
    id: 'occ-1',
    eventListingId: 'ev-1',
    startsAt: '2026-09-10T20:00:00.000Z',
    endsAt: '2026-09-10T23:59:00.000Z',
    status: 'canceled',
    capacity: 100,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
  };

  const samplePaidOrder: TicketOrder = {
    id: 'ord-1',
    buyerId: 'buyer-1',
    eventListingId: 'ev-1',
    occurrenceId: 'occ-1',
    status: 'paid',
    currency: 'BRL',
    subtotalMinor: 10000,
    discountMinor: 0,
    platformFeeMinor: 1000,
    paymentFeeMinor: 0,
    totalMinor: 10000,
    buyerSnapshot: { name: 'João', email: 'joao@example.com' },
    eventSnapshot: {
      title: 'Festival de Verão',
      startsAt: '2026-09-10T20:00:00.000Z',
      endsAt: '2026-09-10T23:59:00.000Z',
    },
    refundPolicySnapshot: {
      enabled: true,
      cancellationWindowHours: 24,
      allowBuyerCancellation: true,
      allowTicketTransfer: true,
    },
    idempotencyKey: 'idem-1',
    createdAt: '2026-06-02T10:00:00.000Z',
    paidAt: '2026-06-02T10:01:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancels an occurrence, initiates refunds for paid orders, and notifies buyers', async () => {
    vi.mocked(cancelEventOccurrenceUseCase).mockResolvedValue(sampleOccurrence);
    vi.mocked(listEventOrdersForPartnerOrAdminUseCase).mockResolvedValue([samplePaidOrder]);
    const sampleRefund: Refund = {
      id: 'ref-1',
      orderId: 'ord-1',
      amountMinor: 10000,
      requestedBy: 'partner',
      reason: 'Chuva intensa',
      status: 'pending_provider',
      provider: 'stripe',
      idempotencyKey: 'cancel_occ_occ-1_ord_ord-1',
      createdAt: '2026-06-03T10:00:00.000Z',
    };
    vi.mocked(processTicketRefundApplicationUseCase).mockResolvedValue({
      refund: sampleRefund,
      isReplay: false,
    });

    const result = await cancelEventOccurrenceAndRefundApplicationUseCase(
      actor,
      'occ-1',
      'Chuva intensa'
    );

    expect(result.occurrence.status).toBe('canceled');
    expect(result.refundsInitiated).toHaveLength(1);
    expect(processTicketRefundApplicationUseCase).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        orderId: 'ord-1',
        isEventCanceledByOrganizer: true,
      })
    );
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientPartnerId: 'buyer-1',
        title: 'Sessão de evento cancelada',
      })
    );
  });

  it('postpones an occurrence, moves orders when requested, and notifies buyers', async () => {
    const newOccurrence: EventOccurrence = {
      ...sampleOccurrence,
      id: 'occ-2',
      status: 'scheduled',
      startsAt: '2026-09-17T20:00:00.000Z',
      endsAt: '2026-09-17T23:59:00.000Z',
      rescheduledFromOccurrenceId: 'occ-1',
    };
    vi.mocked(postponeEventOccurrenceUseCase).mockResolvedValue({
      postponedOccurrence: {
        ...sampleOccurrence,
        status: 'postponed',
        rescheduledToOccurrenceId: 'occ-2',
      },
      newOccurrence,
    });
    vi.mocked(moveOrderToOccurrenceUseCase).mockResolvedValue({
      movedOrdersCount: 1,
      movedTicketsCount: 2,
    });
    vi.mocked(getEventListingByIdUseCase).mockResolvedValue({
      id: 'ev-1',
      title: 'Festival de Verão',
    } as EventListing);
    vi.mocked(listEventOrdersForPartnerOrAdminUseCase).mockResolvedValue([samplePaidOrder]);

    const res = await postponeEventOccurrenceAndNotifyApplicationUseCase(actor, 'occ-1', {
      startsAt: '2026-09-17T20:00:00.000Z',
      endsAt: '2026-09-17T23:59:00.000Z',
      reason: 'Mudança de palco',
      moveExistingOrders: true,
    });

    expect(res.postponedOccurrence.status).toBe('postponed');
    expect(res.newOccurrence.id).toBe('occ-2');
    expect(res.movedOrdersCount).toBe(1);
    expect(res.movedTicketsCount).toBe(2);
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientPartnerId: 'buyer-1',
        title: 'Evento reagendado',
      })
    );
  });
});

=== server/application/usecases/eventLifecycleOrchestrationUseCases.test.ts — APAGUE este arquivo ===

=== server/application/usecases/eventLifecycleOrchestrationUseCases.ts — APAGUE este arquivo ===

=== server/application/usecases/getCommittedTicketsCountForOccurrenceApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  listTicketTypesForManagementUseCase,
  type TicketingActorContext,
} from '../../domain/ticketing';

export async function getCommittedTicketsCountForOccurrenceApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<number> {
  try {
    const ticketTypes = await listTicketTypesForManagementUseCase(actor, occurrenceId);
    return ticketTypes.reduce((sum, tt) => sum + tt.soldCount + tt.reservedCount, 0);
  } catch {
    return 0;
  }
}

=== server/application/usecases/hasEventCommercialHistoryApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  listEventCheckInsForPartnerOrAdminUseCase,
  listEventOrdersForPartnerOrAdminUseCase,
  listEventRefundsForPartnerOrAdminUseCase,
  type TicketingActorContext,
} from '../../domain/ticketing';

export async function hasEventCommercialHistoryApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<boolean> {
  try {
    const [orders, refunds, checkIns] = await Promise.all([
      listEventOrdersForPartnerOrAdminUseCase(actor, eventListingId),
      listEventRefundsForPartnerOrAdminUseCase(actor, eventListingId),
      listEventCheckInsForPartnerOrAdminUseCase(actor, eventListingId),
    ]);
    return orders.length > 0 || refunds.length > 0 || checkIns.length > 0;
  } catch {
    return false;
  }
}

=== server/application/usecases/orchestrationActor.ts — ARQUIVO NOVO, conteúdo completo ===
export interface OrchestrationActor {
  uid: string;
  admin?: boolean;
  role?: string;
}

=== server/application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  getEventListingByIdUseCase,
  postponeEventOccurrenceUseCase,
  type EventOccurrence,
} from '../../domain/events';
import { createNotificationUseCase } from '../../domain/notifications';
import {
  listEventOrdersForPartnerOrAdminUseCase,
  moveOrderToOccurrenceUseCase,
  type TicketingActorContext,
} from '../../domain/ticketing';

export async function postponeEventOccurrenceAndNotifyApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  replacement: {
    startsAt: string;
    endsAt: string;
    salesStartsAt?: string;
    salesEndsAt?: string;
    reason: string;
    moveExistingOrders?: boolean;
  }
): Promise<{
  postponedOccurrence: EventOccurrence;
  newOccurrence: EventOccurrence;
  movedOrdersCount: number;
  movedTicketsCount: number;
}> {
  const { postponedOccurrence, newOccurrence } = await postponeEventOccurrenceUseCase(
    actor,
    occurrenceId,
    replacement
  );

  let movedOrdersCount = 0;
  let movedTicketsCount = 0;

  if (replacement.moveExistingOrders) {
    const moved = await moveOrderToOccurrenceUseCase(actor, {
      fromOccurrenceId: postponedOccurrence.id,
      toOccurrenceId: newOccurrence.id,
    });
    movedOrdersCount = moved.movedOrdersCount;
    movedTicketsCount = moved.movedTicketsCount;
  }

  const listing = await getEventListingByIdUseCase(postponedOccurrence.eventListingId);
  const allOrders = await listEventOrdersForPartnerOrAdminUseCase(
    actor,
    postponedOccurrence.eventListingId
  );
  const affectedOrders = allOrders.filter(
    (o) =>
      (o.occurrenceId === postponedOccurrence.id || o.occurrenceId === newOccurrence.id) &&
      o.status === 'paid'
  );

  for (const order of affectedOrders) {
    await createNotificationUseCase({
      recipientPartnerId: order.buyerId,
      type: 'admin_message',
      title: 'Evento reagendado',
      message: `A sessão do evento "${listing?.title || 'Evento'}" foi reagendada para ${new Date(newOccurrence.startsAt).toLocaleString('pt-BR')}. Motivo: ${replacement.reason}`,
      relatedItemId: postponedOccurrence.eventListingId,
      relatedItemCollection: 'events',
    }).catch(() => {});
  }

  return {
    postponedOccurrence,
    newOccurrence,
    movedOrdersCount,
    movedTicketsCount,
  };
}

=== server/application/usecases/processTicketRefundApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { processProviderRefundUseCase } from '../../domain/payment';
import {
  finalizeTicketRefundStatusUseCase,
  requestTicketRefundUseCase,
  type Refund,
} from '../../domain/ticketing';
import { OrchestrationActor } from './orchestrationActor';

export async function processTicketRefundApplicationUseCase(
  actor: OrchestrationActor,
  params: {
    orderId: string;
    ticketId?: string;
    reason: string;
    idempotencyKey: string;
    isEventCanceledByOrganizer?: boolean;
  }
): Promise<{
  refund: Refund;
  isReplay: boolean;
}> {
  const { refund, isReplay, order } = await requestTicketRefundUseCase(actor, params);

  if (isReplay && refund.status === 'approved') {
    return { refund, isReplay: true };
  }

  const paymentIntentId = order.paymentIntentId || order.paymentId;
  if (!paymentIntentId || paymentIntentId === 'free_order') {
    const updated = await finalizeTicketRefundStatusUseCase(
      refund.id,
      'approved',
      'free_order_refund'
    );
    return { refund: updated, isReplay };
  }

  try {
    const providerRes = await processProviderRefundUseCase({
      paymentIntentId,
      amountMinor: refund.amountMinor,
      reverseTransfer: true,
      refundApplicationFee: Boolean(params.isEventCanceledByOrganizer),
      idempotencyKey: `stripe_ref_${refund.id}_${params.idempotencyKey}`,
      metadata: { refundId: refund.id, orderId: params.orderId, referenceType: 'ticket_refund' },
    });

    const finalStatus: Refund['status'] =
      providerRes.status === 'failed'
        ? 'failed'
        : providerRes.status === 'pending'
          ? 'pending_provider'
          : 'approved';

    const finalized = await finalizeTicketRefundStatusUseCase(
      refund.id,
      finalStatus,
      providerRes.providerRefundId || undefined
    );

    return { refund: finalized, isReplay };
  } catch (error) {
    await finalizeTicketRefundStatusUseCase(refund.id, 'failed').catch(() => undefined);
    throw error;
  }
}

=== server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { createNotificationUseCase } from '../../domain/notifications';
import {
  syncConnectedAccountFromWebhookUseCase,
  updatePaymentTransactionStatusUseCase,
  type VerifiedWebhookEvent,
} from '../../domain/payment';
import {
  confirmTicketOrderPaymentUseCase,
  finalizeTicketRefundStatusUseCase,
  markTicketOrderDisputedUseCase,
  markTicketOrderPaymentFailedUseCase,
} from '../../domain/ticketing';
import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';
import { reconcileBookingWebhookApplicationUseCase } from './bookings/reconcileBookingWebhookApplicationUseCase';
import {
  PLAN_SUBSCRIPTION_WEBHOOK_EVENTS,
  reconcilePlanSubscriptionWebhookApplicationUseCase,
} from './reconcilePlanSubscriptionWebhookApplicationUseCase';

export async function reconcileStripeWebhookEventApplicationUseCase(
  event: VerifiedWebhookEvent
): Promise<{ processed: boolean; eventType: string }> {
  const obj = event.dataObject || {};

  if (await reconcileBookingWebhookApplicationUseCase(event)) {
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'account.updated') {
    const stripeAccountId = String(obj.id || event.account || '');
    if (stripeAccountId) {
      await syncConnectedAccountFromWebhookUseCase(stripeAccountId);
    }
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntentId = String(obj.id || '');
    const metadata = (obj.metadata as Record<string, string> | undefined) || {};
    await updatePaymentTransactionStatusUseCase(paymentIntentId, 'succeeded');

    if (
      (metadata.type === 'ticket_order' || metadata.referenceType === 'ticket_order') &&
      (metadata.orderId || metadata.referenceId)
    ) {
      const orderId = metadata.orderId || metadata.referenceId || '';
      const confirmed = await confirmTicketOrderPaymentUseCase({
        orderId,
        paymentId: paymentIntentId,
        paymentIntentId,
      });

      const targetPartnerId = metadata.partnerId || metadata.sellerPartnerId;
      if (!confirmed.alreadyPaid && targetPartnerId) {
        await createNotificationUseCase({
          recipientPartnerId: targetPartnerId,
          type: 'admin_message',
          title: 'Nova venda de ingresso confirmada!',
          message: `Pedido #${confirmed.order.id.slice(0, 8)} confirmado via Stripe (${confirmed.tickets.length} ingresso(s)).`,
        }).catch(() => undefined);
      }
    } else if (metadata.referenceType === 'plan_payment' && metadata.partnerId && metadata.planId) {
      await activatePaidPlanApplicationUseCase({
        partnerId: metadata.partnerId,
        planId: metadata.planId,
        paymentReference: paymentIntentId,
      });
    }

    return { processed: true, eventType: event.type };
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntentId = String(obj.id || '');
    const metadata = (obj.metadata as Record<string, string> | undefined) || {};
    await updatePaymentTransactionStatusUseCase(paymentIntentId, 'failed');

    const orderId = metadata.orderId || metadata.referenceId;
    if (
      (metadata.type === 'ticket_order' || metadata.referenceType === 'ticket_order') &&
      orderId
    ) {
      await markTicketOrderPaymentFailedUseCase({
        orderId,
        paymentId: paymentIntentId,
        paymentIntentId,
      });
    }
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'refund.updated' || event.type === 'refund.created') {
    const refundMetadata = (obj.metadata as Record<string, string> | undefined) || {};
    const providerStatus = String(obj.status || '');
    if (refundMetadata.refundId) {
      if (providerStatus === 'succeeded') {
        await finalizeTicketRefundStatusUseCase(
          refundMetadata.refundId,
          'approved',
          String(obj.id || '')
        );
      } else if (providerStatus === 'failed' || providerStatus === 'canceled') {
        await finalizeTicketRefundStatusUseCase(
          refundMetadata.refundId,
          'failed',
          String(obj.id || '')
        );
      }
      // 'pending' e 'requires_action' permanecem como pending_provider até o próximo refund.updated.
    }
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'charge.refunded') {
    const paymentIntentId = String(obj.payment_intent || '');
    if (paymentIntentId && obj.refunded === true) {
      await updatePaymentTransactionStatusUseCase(paymentIntentId, 'refunded');
    }
    return { processed: true, eventType: event.type };
  }

  if (event.type === 'charge.dispute.created') {
    const paymentIntentId = String(obj.payment_intent || '');
    const metadata = (obj.metadata as Record<string, string> | undefined) || {};
    if (paymentIntentId) {
      await updatePaymentTransactionStatusUseCase(paymentIntentId, 'disputed');
    }
    const orderId = metadata.orderId || metadata.referenceId;
    if (orderId) {
      await markTicketOrderDisputedUseCase({
        orderId,
        paymentId: paymentIntentId,
        paymentIntentId,
      });
    }
    return { processed: true, eventType: event.type };
  }

  if (PLAN_SUBSCRIPTION_WEBHOOK_EVENTS.has(event.type)) {
    await reconcilePlanSubscriptionWebhookApplicationUseCase(event);
    return { processed: true, eventType: event.type };
  }

  return { processed: true, eventType: event.type };
}

=== server/application/usecases/ticketingPaymentOrchestration.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/events', () => ({ getEventListingByIdUseCase: vi.fn() }));
vi.mock('../../domain/notifications', () => ({ createNotificationUseCase: vi.fn() }));
vi.mock('./activatePaidPlanApplicationUseCase', () => ({
  activatePaidPlanApplicationUseCase: vi.fn(),
}));
vi.mock('../../domain/payment', () => ({
  createPaymentForTicketOrderUseCase: vi.fn(),
  PaymentDomainError: class extends Error {},
  processProviderRefundUseCase: vi.fn(),
  retrievePaymentIntentUseCase: vi.fn(),
  syncConnectedAccountFromWebhookUseCase: vi.fn(),
  updatePaymentTransactionStatusUseCase: vi.fn(),
}));
vi.mock('../../domain/ticketing', () => ({
  confirmTicketOrderPaymentUseCase: vi.fn(),
  finalizeTicketRefundStatusUseCase: vi.fn(),
  getTicketOrderUseCase: vi.fn(),
  markTicketOrderDisputedUseCase: vi.fn(),
  markTicketOrderPaymentFailedUseCase: vi.fn(),
  requestTicketRefundUseCase: vi.fn(),
  TicketingDomainError: class extends Error {},
}));

import {
  processProviderRefundUseCase,
  updatePaymentTransactionStatusUseCase,
} from '../../domain/payment';
import {
  finalizeTicketRefundStatusUseCase,
  requestTicketRefundUseCase,
  type Refund,
  type TicketOrder,
} from '../../domain/ticketing';
import { processTicketRefundApplicationUseCase } from './processTicketRefundApplicationUseCase';
import { reconcileStripeWebhookEventApplicationUseCase } from './reconcileStripeWebhookEventApplicationUseCase';

describe('ticketingPaymentOrchestrationUseCases — refunds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('repassa metadata.refundId e orderId ao provedor ao criar reembolso', async () => {
    vi.mocked(requestTicketRefundUseCase).mockResolvedValue({
      refund: { id: 'ref_1', orderId: 'ord_1', amountMinor: 5000, status: 'pending_provider' } as Refund,
      isReplay: false,
      order: { id: 'ord_1', paymentIntentId: 'pi_1' } as TicketOrder,
    });
    vi.mocked(processProviderRefundUseCase).mockResolvedValue({
      providerRefundId: 're_stripe_1',
      status: 'pending',
    });
    vi.mocked(finalizeTicketRefundStatusUseCase).mockResolvedValue({ id: 'ref_1', status: 'pending_provider' } as Refund);

    await processTicketRefundApplicationUseCase(
      { uid: 'u1' },
      { orderId: 'ord_1', reason: 'desistencia', idempotencyKey: 'idem_1' }
    );

    expect(processProviderRefundUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntentId: 'pi_1',
        amountMinor: 5000,
        metadata: { refundId: 'ref_1', orderId: 'ord_1', referenceType: 'ticket_refund' },
      })
    );
  });

  it('refund.updated com status pending não chama finalizeTicketRefundStatusUseCase', async () => {
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_1',
      type: 'refund.updated',
      created: 1,
      dataObject: { id: 're_1', status: 'pending', metadata: { refundId: 'ref_1' } },
    });
    expect(finalizeTicketRefundStatusUseCase).not.toHaveBeenCalled();
  });

  it('refund.updated com status succeeded aprova o reembolso', async () => {
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_2',
      type: 'refund.updated',
      created: 1,
      dataObject: { id: 're_1', status: 'succeeded', metadata: { refundId: 'ref_1' } },
    });
    expect(finalizeTicketRefundStatusUseCase).toHaveBeenCalledWith('ref_1', 'approved', 're_1');
  });

  it('refund.updated com status failed marca como failed', async () => {
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_3',
      type: 'refund.updated',
      created: 1,
      dataObject: { id: 're_1', status: 'failed', metadata: { refundId: 'ref_1' } },
    });
    expect(finalizeTicketRefundStatusUseCase).toHaveBeenCalledWith('ref_1', 'failed', 're_1');
  });

  it('charge.refunded com refunded=true atualiza transação para refunded', async () => {
    await reconcileStripeWebhookEventApplicationUseCase({
      id: 'evt_4',
      type: 'charge.refunded',
      created: 1,
      dataObject: {
        id: 'ch_1',
        payment_intent: 'pi_1',
        refunded: true,
      },
    });
    expect(updatePaymentTransactionStatusUseCase).toHaveBeenCalledWith('pi_1', 'refunded');
  });
});

=== server/application/usecases/ticketingPaymentOrchestrationUseCases.test.ts — APAGUE este arquivo ===

=== server/application/usecases/ticketingPaymentOrchestrationUseCases.ts — APAGUE este arquivo ===

=== server/application/usecases/updateEventListingSafelyApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  updateEventListingUseCase,
  type EventListing,
  type UpdateEventListingInput,
} from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { hasEventCommercialHistoryApplicationUseCase } from './hasEventCommercialHistoryApplicationUseCase';

export async function updateEventListingSafelyApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  input: UpdateEventListingInput
): Promise<EventListing> {
  const hasCommercialHistory = await hasEventCommercialHistoryApplicationUseCase(
    actor,
    eventListingId
  );
  return updateEventListingUseCase(actor, eventListingId, input, { hasCommercialHistory });
}

=== server/application/usecases/updateEventOccurrenceSafelyApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  updateEventOccurrenceUseCase,
  type EventOccurrence,
  type UpdateEventOccurrenceInput,
} from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { getCommittedTicketsCountForOccurrenceApplicationUseCase } from './getCommittedTicketsCountForOccurrenceApplicationUseCase';

export async function updateEventOccurrenceSafelyApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  input: UpdateEventOccurrenceInput
): Promise<EventOccurrence> {
  const committedCount = await getCommittedTicketsCountForOccurrenceApplicationUseCase(
    actor,
    occurrenceId
  );
  return updateEventOccurrenceUseCase(actor, occurrenceId, input, committedCount);
}

=== server/application/usecases/updatePartnerEventApplicationUseCase.test.ts — diff ===
@@ -6,7 +6,7 @@ import {
   type EventListing,
 } from '../../domain/events';
 import { updateBusinessUseCase } from '../../domain/partners';
-import { updateEventListingSafelyApplicationUseCase } from './eventLifecycleOrchestrationUseCases';
+import { updateEventListingSafelyApplicationUseCase } from './updateEventListingSafelyApplicationUseCase';
 
 vi.mock('../../domain/events', () => ({
   getEventListingByIdUseCase: vi.fn(),
@@ -17,9 +17,7 @@ vi.mock('../../domain/partners', () => ({
   updateBusinessUseCase: vi.fn(),
 }));
 
-vi.mock('./eventLifecycleOrchestrationUseCases', () => ({
-  updateEventListingSafelyApplicationUseCase: vi.fn(),
-}));
+vi.mock('./updateEventListingSafelyApplicationUseCase', () => ({ updateEventListingSafelyApplicationUseCase: vi.fn() }));
 
 describe('updatePartnerEventApplicationUseCase', () => {
   const regularUser: AuthenticatedUserContext = {

=== server/application/usecases/updatePartnerEventApplicationUseCase.ts — diff ===
@@ -5,7 +5,7 @@ import {
   type UpdateEventListingInput,
 } from '../../domain/events';
 import { updateBusinessUseCase } from '../../domain/partners';
-import { updateEventListingSafelyApplicationUseCase } from './eventLifecycleOrchestrationUseCases';
+import { updateEventListingSafelyApplicationUseCase } from './updateEventListingSafelyApplicationUseCase';
 
 export async function updatePartnerEventApplicationUseCase(
   user: AuthenticatedUserContext,

=== server/domain/events/controllers/eventsController.ts — diff ===
@@ -1,12 +1,10 @@
-import {
-  cancelEventListingAndRefundApplicationUseCase,
-  cancelEventOccurrenceAndRefundApplicationUseCase,
-  deleteEventListingSafelyApplicationUseCase,
-  deleteEventOccurrenceSafelyApplicationUseCase,
-  postponeEventOccurrenceAndNotifyApplicationUseCase,
-  updateEventListingSafelyApplicationUseCase,
-  updateEventOccurrenceSafelyApplicationUseCase,
-} from '../../../application/usecases/eventLifecycleOrchestrationUseCases';
+import { cancelEventListingAndRefundApplicationUseCase } from '../../../application/usecases/cancelEventListingAndRefundApplicationUseCase';
+import { cancelEventOccurrenceAndRefundApplicationUseCase } from '../../../application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase';
+import { deleteEventListingSafelyApplicationUseCase } from '../../../application/usecases/deleteEventListingSafelyApplicationUseCase';
+import { deleteEventOccurrenceSafelyApplicationUseCase } from '../../../application/usecases/deleteEventOccurrenceSafelyApplicationUseCase';
+import { postponeEventOccurrenceAndNotifyApplicationUseCase } from '../../../application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase';
+import { updateEventListingSafelyApplicationUseCase } from '../../../application/usecases/updateEventListingSafelyApplicationUseCase';
+import { updateEventOccurrenceSafelyApplicationUseCase } from '../../../application/usecases/updateEventOccurrenceSafelyApplicationUseCase';
 import { Request, Response } from 'express';
 import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { EventDomainError } from '../errors/eventDomainError';
@@ -16,15 +14,13 @@ import {
   updateEventListingSchema,
   updateEventOccurrenceSchema,
 } from '../schemas/eventSchema';
-import {
-  archiveEventListingUseCase,
-  createEventListingUseCase,
-  createEventOccurrenceUseCase,
-  getEventListingByIdUseCase,
-  listEventOccurrencesUseCase,
-  pauseEventListingUseCase,
-  publishEventListingUseCase,
-} from '../usecases/eventUseCases';
+import { archiveEventListingUseCase } from '../usecases/archiveEventListingUseCase';
+import { createEventListingUseCase } from '../usecases/createEventListingUseCase';
+import { createEventOccurrenceUseCase } from '../usecases/createEventOccurrenceUseCase';
+import { getEventListingByIdUseCase } from '../usecases/getEventListingByIdUseCase';
+import { listEventOccurrencesUseCase } from '../usecases/listEventOccurrencesUseCase';
+import { pauseEventListingUseCase } from '../usecases/pauseEventListingUseCase';
+import { publishEventListingUseCase } from '../usecases/publishEventListingUseCase';
 
 function handleEventError(res: Response, error: unknown): Response {
   if (error instanceof EventDomainError) {

=== server/domain/events/index.ts — diff ===
@@ -1,29 +1,27 @@
-export {
-  archiveEventListingUseCase,
-  cancelEventOccurrenceUseCase,
-  completeEventOccurrenceUseCase,
-  createEventListingUseCase,
-  createEventOccurrenceUseCase,
-  deleteEventOccurrenceUseCase,
-  deleteOrArchiveEventListingUseCase,
-  duplicateEventListingUseCase,
-  getEventListingByIdUseCase,
-  getEventOccurrenceByIdUseCase,
-  listAllEventListingsUseCase,
-  listEventOccurrencesUseCase,
-  listPublicEventListingsUseCase,
-  pauseEventListingUseCase,
-  postponeEventOccurrenceUseCase,
-  publishEventListingUseCase,
-  recordEventAuditLogUseCase,
-  createEventAuditLogUseCase,
-  deleteEventsByOwnerUseCase,
-  updateEventListingPricingSummaryUseCase,
-  updateEventListingUseCase,
-  updateEventOccurrenceUseCase,
-  updateEventRatingSummaryUseCase,
-  updateEventsOwnerVerificationUseCase,
-} from './usecases/eventUseCases';
+export { archiveEventListingUseCase } from './usecases/archiveEventListingUseCase';
+export { cancelEventOccurrenceUseCase } from './usecases/cancelEventOccurrenceUseCase';
+export { completeEventOccurrenceUseCase } from './usecases/completeEventOccurrenceUseCase';
+export { createEventListingUseCase } from './usecases/createEventListingUseCase';
+export { createEventOccurrenceUseCase } from './usecases/createEventOccurrenceUseCase';
+export { deleteEventOccurrenceUseCase } from './usecases/deleteEventOccurrenceUseCase';
+export { deleteOrArchiveEventListingUseCase } from './usecases/deleteOrArchiveEventListingUseCase';
+export { duplicateEventListingUseCase } from './usecases/duplicateEventListingUseCase';
+export { getEventListingByIdUseCase } from './usecases/getEventListingByIdUseCase';
+export { getEventOccurrenceByIdUseCase } from './usecases/getEventOccurrenceByIdUseCase';
+export { listAllEventListingsUseCase } from './usecases/listAllEventListingsUseCase';
+export { listEventOccurrencesUseCase } from './usecases/listEventOccurrencesUseCase';
+export { listPublicEventListingsUseCase } from './usecases/listPublicEventListingsUseCase';
+export { pauseEventListingUseCase } from './usecases/pauseEventListingUseCase';
+export { postponeEventOccurrenceUseCase } from './usecases/postponeEventOccurrenceUseCase';
+export { publishEventListingUseCase } from './usecases/publishEventListingUseCase';
+export { recordEventAuditLogUseCase } from './usecases/recordEventAuditLogUseCase';
+export { createEventAuditLogUseCase } from './usecases/createEventAuditLogUseCase';
+export { deleteEventsByOwnerUseCase } from './usecases/deleteEventsByOwnerUseCase';
+export { updateEventListingPricingSummaryUseCase } from './usecases/updateEventListingPricingSummaryUseCase';
+export { updateEventListingUseCase } from './usecases/updateEventListingUseCase';
+export { updateEventOccurrenceUseCase } from './usecases/updateEventOccurrenceUseCase';
+export { updateEventRatingSummaryUseCase } from './usecases/updateEventRatingSummaryUseCase';
+export { updateEventsOwnerVerificationUseCase } from './usecases/updateEventsOwnerVerificationUseCase';
 
 export {
   EventDomainError,

=== server/domain/events/usecases/archiveEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventListing } from '../types/eventTypes';

export async function archiveEventListingUseCase(
  actor: EventActorContext,
  id: string
): Promise<EventListing> {
  return eventsService.archiveListing(actor, id);
}

=== server/domain/events/usecases/cancelEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventOccurrence } from '../types/eventTypes';

export async function cancelEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  reason?: string
): Promise<EventOccurrence> {
  return eventsService.cancelOccurrence(actor, occurrenceId, reason);
}

=== server/domain/events/usecases/completeEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventOccurrence } from '../types/eventTypes';

export async function completeEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string
): Promise<EventOccurrence> {
  return eventsService.completeOccurrence(actor, occurrenceId);
}

=== server/domain/events/usecases/createEventAuditLogUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { recordEventAuditLogUseCase } from './recordEventAuditLogUseCase';

export const createEventAuditLogUseCase = recordEventAuditLogUseCase;

=== server/domain/events/usecases/createEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type {
  CreateEventListingInput,
  CreateEventOccurrenceInput,
  EventListing,
  EventOccurrence,
} from '../types/eventTypes';

export async function createEventListingUseCase(
  actor: EventActorContext,
  input: Omit<CreateEventListingInput, 'ownerId'> & {
    occurrences?: Array<Omit<CreateEventOccurrenceInput, 'eventListingId'>>;
  }
): Promise<{ listing: EventListing; occurrences: EventOccurrence[] }> {
  return eventsService.createListing(actor, input);
}

=== server/domain/events/usecases/createEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { CreateEventOccurrenceInput, EventOccurrence } from '../types/eventTypes';

export async function createEventOccurrenceUseCase(
  actor: EventActorContext,
  input: CreateEventOccurrenceInput
): Promise<EventOccurrence> {
  return eventsService.createOccurrence(actor, input);
}

=== server/domain/events/usecases/deleteEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';

export async function deleteEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  hasCommercialHistory = false
): Promise<{ mode: 'deleted' | 'canceled' }> {
  return eventsService.deleteOccurrence(actor, occurrenceId, hasCommercialHistory);
}

=== server/domain/events/usecases/deleteEventsByOwnerUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';

export async function deleteEventsByOwnerUseCase(ownerId: string): Promise<void> {
  return eventsService.deleteListingsByOwner(ownerId);
}

=== server/domain/events/usecases/deleteOrArchiveEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';

export async function deleteOrArchiveEventListingUseCase(
  actor: EventActorContext,
  id: string,
  hasCommercialHistory = false
): Promise<{ mode: 'deleted' | 'archived' }> {
  return eventsService.deleteOrArchiveListing(actor, id, hasCommercialHistory);
}

=== server/domain/events/usecases/duplicateEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventListing } from '../types/eventTypes';

export async function duplicateEventListingUseCase(
  actor: EventActorContext,
  sourceEventId: string
): Promise<EventListing> {
  return eventsService.duplicateListing(actor, sourceEventId);
}

=== server/domain/events/usecases/eventUseCases.ts — APAGUE este arquivo ===

=== server/domain/events/usecases/getEventListingByIdUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventListing } from '../types/eventTypes';

export async function getEventListingByIdUseCase(id: string): Promise<EventListing | null> {
  return eventsService.getListingById(id);
}

=== server/domain/events/usecases/getEventOccurrenceByIdUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventOccurrence } from '../types/eventTypes';

export async function getEventOccurrenceByIdUseCase(
  occurrenceId: string
): Promise<EventOccurrence | null> {
  return eventsService.getOccurrenceById(occurrenceId);
}

=== server/domain/events/usecases/listAllEventListingsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventListing } from '../types/eventTypes';

export async function listAllEventListingsUseCase(): Promise<EventListing[]> {
  return eventsService.listAllListings();
}

=== server/domain/events/usecases/listEventOccurrencesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventOccurrence } from '../types/eventTypes';

export async function listEventOccurrencesUseCase(
  eventListingId: string,
  options?: { publicOnly?: boolean }
): Promise<EventOccurrence[]> {
  return eventsService.listOccurrencesByListingId(eventListingId, options);
}

=== server/domain/events/usecases/listPublicEventListingsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventListing } from '../types/eventTypes';

export async function listPublicEventListingsUseCase(): Promise<EventListing[]> {
  return eventsService.listPublicListings();
}

=== server/domain/events/usecases/pauseEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventListing } from '../types/eventTypes';

export async function pauseEventListingUseCase(
  actor: EventActorContext,
  id: string
): Promise<EventListing> {
  return eventsService.pauseListing(actor, id);
}

=== server/domain/events/usecases/postponeEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventOccurrence } from '../types/eventTypes';

export async function postponeEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  replacement: {
    startsAt: string;
    endsAt: string;
    salesStartsAt?: string;
    salesEndsAt?: string;
    reason: string;
  }
): Promise<{ postponedOccurrence: EventOccurrence; newOccurrence: EventOccurrence }> {
  return eventsService.postponeOccurrence(actor, occurrenceId, replacement);
}

=== server/domain/events/usecases/publishEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventListing } from '../types/eventTypes';

export async function publishEventListingUseCase(
  actor: EventActorContext,
  id: string
): Promise<EventListing> {
  return eventsService.publishListing(actor, id);
}

=== server/domain/events/usecases/recordEventAuditLogUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';

export async function recordEventAuditLogUseCase(entry: {
  actorId: string;
  actorType: 'admin' | 'partner' | 'user' | 'system';
  resourceType: 'event' | 'occurrence' | 'ticketType' | 'order' | 'ticket' | 'refund';
  resourceId: string;
  action: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
}) {
  return eventsService.recordAuditLog(entry);
}

=== server/domain/events/usecases/updateEventListingPricingSummaryUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';

export async function updateEventListingPricingSummaryUseCase(
  eventListingId: string,
  summary: { pricingMode: 'free' | 'paid'; startingPriceMinor?: number }
): Promise<void> {
  return eventsService.updateListingPricingSummary(eventListingId, summary);
}

=== server/domain/events/usecases/updateEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventListing, UpdateEventListingInput } from '../types/eventTypes';

export async function updateEventListingUseCase(
  actor: EventActorContext,
  id: string,
  input: UpdateEventListingInput,
  options?: { hasCommercialHistory?: boolean }
): Promise<EventListing> {
  return eventsService.updateListing(actor, id, input, options);
}

=== server/domain/events/usecases/updateEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventOccurrence, UpdateEventOccurrenceInput } from '../types/eventTypes';

export async function updateEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  input: UpdateEventOccurrenceInput,
  committedTicketsCount = 0
): Promise<EventOccurrence> {
  return eventsService.updateOccurrence(actor, occurrenceId, input, committedTicketsCount);
}

=== server/domain/events/usecases/updateEventRatingSummaryUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';
import type { EventRatingSummary } from '../types/eventTypes';

export async function updateEventRatingSummaryUseCase(
  eventListingId: string,
  summary: EventRatingSummary
): Promise<void> {
  return eventsService.updateRatingSummary(eventListingId, summary);
}

=== server/domain/events/usecases/updateEventsOwnerVerificationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsService } from '../factory';

export async function updateEventsOwnerVerificationUseCase(
  ownerId: string,
  verification: {
    isVerified: boolean;
    verifiedUntil: string | null;
    verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
    isVerificationSuspended: boolean;
  }
): Promise<void> {
  return eventsService.updateOwnerVerification(ownerId, verification);
}

=== server/domain/partners/controllers/partnerContentController.ts — diff ===
@@ -7,12 +7,10 @@ import { deletePartnerEventApplicationUseCase } from '../../../application/useca
 import { deletePartnerItemApplicationUseCase } from '../../../application/usecases/deletePartnerItemApplicationUseCase';
 import { updatePartnerEventApplicationUseCase } from '../../../application/usecases/updatePartnerEventApplicationUseCase';
 import { updatePartnerItemApplicationUseCase } from '../../../application/usecases/updatePartnerItemApplicationUseCase';
-import {
-  cancelEventOccurrenceAndRefundApplicationUseCase,
-  deleteEventOccurrenceSafelyApplicationUseCase,
-  postponeEventOccurrenceAndNotifyApplicationUseCase,
-  updateEventOccurrenceSafelyApplicationUseCase,
-} from '../../../application/usecases/eventLifecycleOrchestrationUseCases';
+import { cancelEventOccurrenceAndRefundApplicationUseCase } from '../../../application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase';
+import { deleteEventOccurrenceSafelyApplicationUseCase } from '../../../application/usecases/deleteEventOccurrenceSafelyApplicationUseCase';
+import { postponeEventOccurrenceAndNotifyApplicationUseCase } from '../../../application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase';
+import { updateEventOccurrenceSafelyApplicationUseCase } from '../../../application/usecases/updateEventOccurrenceSafelyApplicationUseCase';
 import {
   createEventOccurrenceUseCase,
 } from '../../events';

=== server/domain/payment/controllers/paymentController.test.ts — diff ===
@@ -2,34 +2,27 @@ import { describe, it, expect, vi, beforeEach } from 'vitest';
 import type { Request } from 'express';
 import { PaymentController } from './paymentController';
 import { getPlanForPaymentApplicationUseCase } from '../../../application/usecases/getPlanForPaymentApplicationUseCase';
-import { reconcileStripeWebhookEventApplicationUseCase } from '../../../application/usecases/ticketingPaymentOrchestrationUseCases';
-import {
-  claimStripeWebhookEventUseCase,
-  completeStripeWebhookEventUseCase,
-  constructStripeWebhookEventUseCase,
-  createPlanPaymentIntentUseCase,
-  releaseStripeWebhookEventUseCase,
-  retrievePaymentIntentUseCase,
-} from '../usecases/paymentUseCases';
+import { reconcileStripeWebhookEventApplicationUseCase } from '../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase';
+import { claimStripeWebhookEventUseCase } from '../usecases/claimStripeWebhookEventUseCase';
+import { completeStripeWebhookEventUseCase } from '../usecases/completeStripeWebhookEventUseCase';
+import { constructStripeWebhookEventUseCase } from '../usecases/constructStripeWebhookEventUseCase';
+import { createPlanPaymentIntentUseCase } from '../usecases/createPlanPaymentIntentUseCase';
+import { releaseStripeWebhookEventUseCase } from '../usecases/releaseStripeWebhookEventUseCase';
+import { retrievePaymentIntentUseCase } from '../usecases/retrievePaymentIntentUseCase';
 import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 
 vi.mock('../../../application/usecases/getPlanForPaymentApplicationUseCase', () => ({
   getPlanForPaymentApplicationUseCase: vi.fn(),
 }));
 
-vi.mock('../../../application/usecases/ticketingPaymentOrchestrationUseCases', () => ({
-  reconcileStripeWebhookEventApplicationUseCase: vi.fn(),
-}));
+vi.mock('../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase', () => ({ reconcileStripeWebhookEventApplicationUseCase: vi.fn() }));
 
-vi.mock('../usecases/paymentUseCases', () => ({
-  createPlanPaymentIntentUseCase: vi.fn(),
-  constructStripeWebhookEventUseCase: vi.fn(),
-  claimStripeWebhookEventUseCase: vi.fn(),
-  completeStripeWebhookEventUseCase: vi.fn(),
-  releaseStripeWebhookEventUseCase: vi.fn(),
-  retrievePaymentIntentUseCase: vi.fn(),
-  updateTransactionStatusUseCase: vi.fn(),
-}));
+vi.mock('../usecases/createPlanPaymentIntentUseCase', () => ({ createPlanPaymentIntentUseCase: vi.fn() }));
+vi.mock('../usecases/constructStripeWebhookEventUseCase', () => ({ constructStripeWebhookEventUseCase: vi.fn() }));
+vi.mock('../usecases/claimStripeWebhookEventUseCase', () => ({ claimStripeWebhookEventUseCase: vi.fn() }));
+vi.mock('../usecases/completeStripeWebhookEventUseCase', () => ({ completeStripeWebhookEventUseCase: vi.fn() }));
+vi.mock('../usecases/releaseStripeWebhookEventUseCase', () => ({ releaseStripeWebhookEventUseCase: vi.fn() }));
+vi.mock('../usecases/retrievePaymentIntentUseCase', () => ({ retrievePaymentIntentUseCase: vi.fn() }));
 
 describe('PaymentController', () => {
   let req: Partial<AuthenticatedRequest>;

=== server/domain/payment/controllers/paymentController.ts — diff ===
@@ -1,23 +1,19 @@
 import { randomUUID } from 'crypto';
 import type { Request, Response } from 'express';
 import { getPlanForPaymentApplicationUseCase } from '../../../application/usecases/getPlanForPaymentApplicationUseCase';
-import { reconcileStripeWebhookEventApplicationUseCase } from '../../../application/usecases/ticketingPaymentOrchestrationUseCases';
+import { reconcileStripeWebhookEventApplicationUseCase } from '../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { ConfirmPlanPaymentSchema, CreatePlanPaymentIntentSchema } from '../schemas/paymentSchema';
 import { PaymentDomainError } from '../services/stripePaymentService';
-import {
-  createPartnerConnectAccountSessionUseCase,
-  ensurePartnerConnectedAccountUseCase,
-  getPartnerConnectAccountStatusUseCase,
-} from '../usecases/marketplaceConnectUseCases';
-import {
-  claimStripeWebhookEventUseCase,
-  completeStripeWebhookEventUseCase,
-  constructStripeWebhookEventUseCase,
-  createPlanPaymentIntentUseCase,
-  releaseStripeWebhookEventUseCase,
-  retrievePaymentIntentUseCase,
-} from '../usecases/paymentUseCases';
+import { createPartnerConnectAccountSessionUseCase } from '../usecases/createPartnerConnectAccountSessionUseCase';
+import { ensurePartnerConnectedAccountUseCase } from '../usecases/ensurePartnerConnectedAccountUseCase';
+import { getPartnerConnectAccountStatusUseCase } from '../usecases/getPartnerConnectAccountStatusUseCase';
+import { claimStripeWebhookEventUseCase } from '../usecases/claimStripeWebhookEventUseCase';
+import { completeStripeWebhookEventUseCase } from '../usecases/completeStripeWebhookEventUseCase';
+import { constructStripeWebhookEventUseCase } from '../usecases/constructStripeWebhookEventUseCase';
+import { createPlanPaymentIntentUseCase } from '../usecases/createPlanPaymentIntentUseCase';
+import { releaseStripeWebhookEventUseCase } from '../usecases/releaseStripeWebhookEventUseCase';
+import { retrievePaymentIntentUseCase } from '../usecases/retrievePaymentIntentUseCase';
 
 export class PaymentController {
   static async createPlanPaymentIntent(

=== server/domain/payment/index.ts — diff ===
@@ -1,22 +1,18 @@
-export {
-  claimStripeWebhookEventUseCase,
-  completeStripeWebhookEventUseCase,
-  constructStripeWebhookEventUseCase,
-  createPaymentForTicketOrderUseCase,
-  createPlanPaymentIntentUseCase,
-  processProviderRefundUseCase,
-  releaseStripeWebhookEventUseCase,
-  retrievePaymentIntentUseCase,
-  updatePaymentTransactionStatusUseCase,
-} from './usecases/paymentUseCases';
+export { claimStripeWebhookEventUseCase } from './usecases/claimStripeWebhookEventUseCase';
+export { completeStripeWebhookEventUseCase } from './usecases/completeStripeWebhookEventUseCase';
+export { constructStripeWebhookEventUseCase } from './usecases/constructStripeWebhookEventUseCase';
+export { createPaymentForTicketOrderUseCase } from './usecases/createPaymentForTicketOrderUseCase';
+export { createPlanPaymentIntentUseCase } from './usecases/createPlanPaymentIntentUseCase';
+export { processProviderRefundUseCase } from './usecases/processProviderRefundUseCase';
+export { releaseStripeWebhookEventUseCase } from './usecases/releaseStripeWebhookEventUseCase';
+export { retrievePaymentIntentUseCase } from './usecases/retrievePaymentIntentUseCase';
+export { updatePaymentTransactionStatusUseCase } from './usecases/updatePaymentTransactionStatusUseCase';
 
-export {
-  assertPartnerReadyForPaidEventUseCase,
-  createPartnerConnectAccountSessionUseCase,
-  ensurePartnerConnectedAccountUseCase,
-  getPartnerConnectAccountStatusUseCase,
-  syncConnectedAccountFromWebhookUseCase,
-} from './usecases/marketplaceConnectUseCases';
+export { assertPartnerReadyForPaidEventUseCase } from './usecases/assertPartnerReadyForPaidEventUseCase';
+export { createPartnerConnectAccountSessionUseCase } from './usecases/createPartnerConnectAccountSessionUseCase';
+export { ensurePartnerConnectedAccountUseCase } from './usecases/ensurePartnerConnectedAccountUseCase';
+export { getPartnerConnectAccountStatusUseCase } from './usecases/getPartnerConnectAccountStatusUseCase';
+export { syncConnectedAccountFromWebhookUseCase } from './usecases/syncConnectedAccountFromWebhookUseCase';
 
 export { createMarketplacePaymentIntentUseCase } from './usecases/createMarketplacePaymentIntentUseCase';
 export { getPaymentReferenceUseCase } from './usecases/getPaymentReferenceUseCase';

=== server/domain/payment/usecases/assertPartnerReadyForPaidEventUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';
import type { StripeConnectedAccountRecord } from '../ports/marketplaceAccountPort';

export async function assertPartnerReadyForPaidEventUseCase(
  partnerId: string
): Promise<StripeConnectedAccountRecord> {
  return stripePaymentService.assertPartnerReadyForPaidEvent(partnerId);
}

=== server/domain/payment/usecases/claimStripeWebhookEventUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';
import type { WebhookEventClaimResult } from '../ports/transactionRepositoryPort';

export async function claimStripeWebhookEventUseCase(params: {
  eventId: string;
  eventType: string;
}): Promise<WebhookEventClaimResult> {
  return stripePaymentService.claimWebhookEvent(params);
}

=== server/domain/payment/usecases/completeStripeWebhookEventUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';

export async function completeStripeWebhookEventUseCase(eventId: string): Promise<void> {
  return stripePaymentService.completeWebhookEvent(eventId);
}

=== server/domain/payment/usecases/constructStripeWebhookEventUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';
import type { VerifiedWebhookEvent } from '../ports/paymentGatewayPort';

export function constructStripeWebhookEventUseCase(
  payload: string | Buffer,
  signature: string
): VerifiedWebhookEvent {
  return stripePaymentService.constructWebhookEvent(payload, signature);
}

=== server/domain/payment/usecases/createPartnerConnectAccountSessionUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';

export async function createPartnerConnectAccountSessionUseCase(params: {
  partnerId: string;
  email: string;
}): Promise<{ clientSecret: string }> {
  return stripePaymentService.createAccountSession(params);
}

=== server/domain/payment/usecases/createPaymentForTicketOrderUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';
import type { CreatePaymentIntentResult } from '../ports/paymentGatewayPort';

export async function createPaymentForTicketOrderUseCase(params: {
  orderId: string;
  buyerId: string;
  sellerPartnerId: string;
  eventListingId: string;
  occurrenceId: string;
  eventTitle: string;
  totalMinor: number;
  platformFeeMinor: number;
  idempotencyKey: string;
}): Promise<CreatePaymentIntentResult & { transactionId: string }> {
  return stripePaymentService.createTicketOrderPaymentIntent(params);
}

=== server/domain/payment/usecases/createPlanPaymentIntentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';
import type { CreatePaymentIntentResult } from '../ports/paymentGatewayPort';

export async function createPlanPaymentIntentUseCase(params: {
  buyerId: string;
  planId: string;
  planName: string;
  amountMinor: number;
  idempotencyKey: string;
}): Promise<CreatePaymentIntentResult & { transactionId: string }> {
  return stripePaymentService.createPlanPaymentIntent(params);
}

=== server/domain/payment/usecases/ensurePartnerConnectedAccountUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';
import type { StripeConnectedAccountRecord } from '../ports/marketplaceAccountPort';

export async function ensurePartnerConnectedAccountUseCase(params: {
  partnerId: string;
  email: string;
}): Promise<StripeConnectedAccountRecord> {
  return stripePaymentService.ensureConnectedAccount(params);
}

=== server/domain/payment/usecases/getPartnerConnectAccountStatusUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';
import type { ConnectedAccountStatus } from '../ports/marketplaceAccountPort';

export async function getPartnerConnectAccountStatusUseCase(partnerId: string): Promise<{
  connected: boolean;
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  status: ConnectedAccountStatus['status'];
}> {
  return stripePaymentService.getPartnerAccountStatus(partnerId);
}

=== server/domain/payment/usecases/marketplaceConnectUseCases.ts — APAGUE este arquivo ===

=== server/domain/payment/usecases/paymentUseCases.ts — APAGUE este arquivo ===

=== server/domain/payment/usecases/processProviderRefundUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';
import type { RefundPaymentResult } from '../ports/paymentGatewayPort';

export async function processProviderRefundUseCase(params: {
  paymentIntentId: string;
  amountMinor?: number;
  reverseTransfer?: boolean;
  refundApplicationFee?: boolean;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}): Promise<RefundPaymentResult> {
  return stripePaymentService.refundPayment(params);
}

=== server/domain/payment/usecases/releaseStripeWebhookEventUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';

export async function releaseStripeWebhookEventUseCase(
  eventId: string,
  errorMessage: string
): Promise<void> {
  return stripePaymentService.releaseWebhookEvent(eventId, errorMessage);
}

=== server/domain/payment/usecases/retrievePaymentIntentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';

export async function retrievePaymentIntentUseCase(paymentIntentId: string) {
  return stripePaymentService.retrievePaymentIntent(paymentIntentId);
}

=== server/domain/payment/usecases/syncConnectedAccountFromWebhookUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';

export async function syncConnectedAccountFromWebhookUseCase(
  stripeAccountId: string
): Promise<void> {
  return stripePaymentService.syncConnectedAccountFromWebhook(stripeAccountId);
}

=== server/domain/payment/usecases/updatePaymentTransactionStatusUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';

export async function updatePaymentTransactionStatusUseCase(
  paymentIntentId: string,
  status: string,
  statusDetail?: string
): Promise<boolean> {
  return stripePaymentService.updateTransactionStatus(paymentIntentId, status, statusDetail);
}

=== server/domain/ticketing/controllers/ticketingController.ts — diff ===
@@ -1,10 +1,8 @@
 import { randomUUID } from 'crypto';
 import { Request, Response } from 'express';
-import {
-  confirmTicketOrderPaymentClientReturnApplicationUseCase,
-  createTicketOrderPaymentIntentApplicationUseCase,
-  processTicketRefundApplicationUseCase,
-} from '../../../application/usecases/ticketingPaymentOrchestrationUseCases';
+import { confirmTicketOrderPaymentClientReturnApplicationUseCase } from '../../../application/usecases/confirmTicketOrderPaymentClientReturnApplicationUseCase';
+import { createTicketOrderPaymentIntentApplicationUseCase } from '../../../application/usecases/createTicketOrderPaymentIntentApplicationUseCase';
+import { processTicketRefundApplicationUseCase } from '../../../application/usecases/processTicketRefundApplicationUseCase';
 import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { hashTicketIdForOfflineManifest } from '../adapters/rsaPssTicketQrTokenAdapter';
 import { TicketingDomainError } from '../errors/ticketingDomainError';
@@ -21,31 +19,29 @@ import {
   transferTicketSchema,
   updateTicketTypeSchema,
 } from '../schemas/ticketingSchema';
-import {
-  archiveTicketTypeUseCase,
-  checkInTicketUseCase,
-  createEventPromoCodeUseCase,
-  createOfflineCheckInSessionUseCase,
-  createTicketOrderUseCase,
-  createTicketTypeUseCase,
-  expireAllOverdueOrdersUseCase,
-  expireTicketOrderUseCase,
-  getEventSalesAnalyticsUseCase,
-  getTicketOrderUseCase,
-  getTicketQrTokenUseCase,
-  joinEventWaitlistUseCase,
-  listEventCheckInsForPartnerOrAdminUseCase,
-  listEventOrdersForPartnerOrAdminUseCase,
-  listEventRefundsForPartnerOrAdminUseCase,
-  listPublicTicketTypesByOccurrenceUseCase,
-  listTicketTypesForManagementUseCase,
-  listUserTicketOrdersUseCase,
-  listUserTicketsUseCase,
-  reissueTicketQrTokenUseCase,
-  syncOfflineCheckInsUseCase,
-  transferTicketUseCase,
-  updateTicketTypeUseCase,
-} from '../usecases/ticketingUseCases';
+import { archiveTicketTypeUseCase } from '../usecases/archiveTicketTypeUseCase';
+import { checkInTicketUseCase } from '../usecases/checkInTicketUseCase';
+import { createEventPromoCodeUseCase } from '../usecases/createEventPromoCodeUseCase';
+import { createOfflineCheckInSessionUseCase } from '../usecases/createOfflineCheckInSessionUseCase';
+import { createTicketOrderUseCase } from '../usecases/createTicketOrderUseCase';
+import { createTicketTypeUseCase } from '../usecases/createTicketTypeUseCase';
+import { expireAllOverdueOrdersUseCase } from '../usecases/expireAllOverdueOrdersUseCase';
+import { expireTicketOrderUseCase } from '../usecases/expireTicketOrderUseCase';
+import { getEventSalesAnalyticsUseCase } from '../usecases/getEventSalesAnalyticsUseCase';
+import { getTicketOrderUseCase } from '../usecases/getTicketOrderUseCase';
+import { getTicketQrTokenUseCase } from '../usecases/getTicketQrTokenUseCase';
+import { joinEventWaitlistUseCase } from '../usecases/joinEventWaitlistUseCase';
+import { listEventCheckInsForPartnerOrAdminUseCase } from '../usecases/listEventCheckInsForPartnerOrAdminUseCase';
+import { listEventOrdersForPartnerOrAdminUseCase } from '../usecases/listEventOrdersForPartnerOrAdminUseCase';
+import { listEventRefundsForPartnerOrAdminUseCase } from '../usecases/listEventRefundsForPartnerOrAdminUseCase';
+import { listPublicTicketTypesByOccurrenceUseCase } from '../usecases/listPublicTicketTypesByOccurrenceUseCase';
+import { listTicketTypesForManagementUseCase } from '../usecases/listTicketTypesForManagementUseCase';
+import { listUserTicketOrdersUseCase } from '../usecases/listUserTicketOrdersUseCase';
+import { listUserTicketsUseCase } from '../usecases/listUserTicketsUseCase';
+import { reissueTicketQrTokenUseCase } from '../usecases/reissueTicketQrTokenUseCase';
+import { syncOfflineCheckInsUseCase } from '../usecases/syncOfflineCheckInsUseCase';
+import { transferTicketUseCase } from '../usecases/transferTicketUseCase';
+import { updateTicketTypeUseCase } from '../usecases/updateTicketTypeUseCase';
 
 function getActor(req: AuthenticatedRequest) {
   return {

=== server/domain/ticketing/index.ts — diff ===
@@ -1,35 +1,33 @@
-export {
-  archiveTicketTypeUseCase,
-  checkInTicketUseCase,
-  confirmTicketOrderPaymentUseCase,
-  createEventPromoCodeUseCase,
-  createOfflineCheckInSessionUseCase,
-  createTicketOrderUseCase,
-  createTicketTypeUseCase,
-  expireAllOverdueOrdersUseCase,
-  expireTicketOrderUseCase,
-  finalizeTicketRefundStatusUseCase,
-  getEventSalesAnalyticsUseCase,
-  getTicketOrderUseCase,
-  getTicketQrTokenUseCase,
-  getVerifiedAttendanceForReviewUseCase,
-  joinEventWaitlistUseCase,
-  listEventCheckInsForPartnerOrAdminUseCase,
-  listEventOrdersForPartnerOrAdminUseCase,
-  listEventRefundsForPartnerOrAdminUseCase,
-  listPublicTicketTypesByOccurrenceUseCase,
-  listTicketTypesForManagementUseCase,
-  listUserTicketOrdersUseCase,
-  listUserTicketsUseCase,
-  markTicketOrderDisputedUseCase,
-  markTicketOrderPaymentFailedUseCase,
-  moveOrderToOccurrenceUseCase,
-  reissueTicketQrTokenUseCase,
-  requestTicketRefundUseCase,
-  syncOfflineCheckInsUseCase,
-  transferTicketUseCase,
-  updateTicketTypeUseCase,
-} from './usecases/ticketingUseCases';
+export { archiveTicketTypeUseCase } from './usecases/archiveTicketTypeUseCase';
+export { checkInTicketUseCase } from './usecases/checkInTicketUseCase';
+export { confirmTicketOrderPaymentUseCase } from './usecases/confirmTicketOrderPaymentUseCase';
+export { createEventPromoCodeUseCase } from './usecases/createEventPromoCodeUseCase';
+export { createOfflineCheckInSessionUseCase } from './usecases/createOfflineCheckInSessionUseCase';
+export { createTicketOrderUseCase } from './usecases/createTicketOrderUseCase';
+export { createTicketTypeUseCase } from './usecases/createTicketTypeUseCase';
+export { expireAllOverdueOrdersUseCase } from './usecases/expireAllOverdueOrdersUseCase';
+export { expireTicketOrderUseCase } from './usecases/expireTicketOrderUseCase';
+export { finalizeTicketRefundStatusUseCase } from './usecases/finalizeTicketRefundStatusUseCase';
+export { getEventSalesAnalyticsUseCase } from './usecases/getEventSalesAnalyticsUseCase';
+export { getTicketOrderUseCase } from './usecases/getTicketOrderUseCase';
+export { getTicketQrTokenUseCase } from './usecases/getTicketQrTokenUseCase';
+export { getVerifiedAttendanceForReviewUseCase } from './usecases/getVerifiedAttendanceForReviewUseCase';
+export { joinEventWaitlistUseCase } from './usecases/joinEventWaitlistUseCase';
+export { listEventCheckInsForPartnerOrAdminUseCase } from './usecases/listEventCheckInsForPartnerOrAdminUseCase';
+export { listEventOrdersForPartnerOrAdminUseCase } from './usecases/listEventOrdersForPartnerOrAdminUseCase';
+export { listEventRefundsForPartnerOrAdminUseCase } from './usecases/listEventRefundsForPartnerOrAdminUseCase';
+export { listPublicTicketTypesByOccurrenceUseCase } from './usecases/listPublicTicketTypesByOccurrenceUseCase';
+export { listTicketTypesForManagementUseCase } from './usecases/listTicketTypesForManagementUseCase';
+export { listUserTicketOrdersUseCase } from './usecases/listUserTicketOrdersUseCase';
+export { listUserTicketsUseCase } from './usecases/listUserTicketsUseCase';
+export { markTicketOrderDisputedUseCase } from './usecases/markTicketOrderDisputedUseCase';
+export { markTicketOrderPaymentFailedUseCase } from './usecases/markTicketOrderPaymentFailedUseCase';
+export { moveOrderToOccurrenceUseCase } from './usecases/moveOrderToOccurrenceUseCase';
+export { reissueTicketQrTokenUseCase } from './usecases/reissueTicketQrTokenUseCase';
+export { requestTicketRefundUseCase } from './usecases/requestTicketRefundUseCase';
+export { syncOfflineCheckInsUseCase } from './usecases/syncOfflineCheckInsUseCase';
+export { transferTicketUseCase } from './usecases/transferTicketUseCase';
+export { updateTicketTypeUseCase } from './usecases/updateTicketTypeUseCase';
 
 export {
   InventoryConflictError,

=== server/domain/ticketing/usecases/archiveTicketTypeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function archiveTicketTypeUseCase(
  actor: TicketingActorContext,
  ticketTypeId: string
): Promise<{ mode: 'deleted' | 'archived' }> {
  return ticketingService.archiveOrDeleteTicketType(actor, ticketTypeId);
}

=== server/domain/ticketing/usecases/checkInTicketUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { EventCheckIn, Ticket } from '../types/ticketingTypes';

export async function checkInTicketUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketingService.checkInTicket>[1]
): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
  return ticketingService.checkInTicket(actor, params);
}

=== server/domain/ticketing/usecases/confirmTicketOrderPaymentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { Ticket, TicketOrder } from '../types/ticketingTypes';

export async function confirmTicketOrderPaymentUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<{ order: TicketOrder; tickets: Ticket[]; alreadyPaid: boolean }> {
  return ticketingService.confirmTicketOrderPayment(params);
}

=== server/domain/ticketing/usecases/createEventPromoCodeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { EventPromoCode } from '../types/ticketingTypes';

export async function createEventPromoCodeUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.createPromoCode>[1]
): Promise<EventPromoCode> {
  return ticketingService.createPromoCode(actor, input);
}

=== server/domain/ticketing/usecases/createOfflineCheckInSessionUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { OfflineCheckInManifest, OfflineCheckInSession } from '../types/ticketingTypes';

export async function createOfflineCheckInSessionUseCase(
  actor: TicketingActorContext,
  params: { occurrenceId: string; stationId?: string }
): Promise<{
  session: OfflineCheckInSession;
  manifest: OfflineCheckInManifest;
}> {
  return ticketingService.prepareOfflineCheckInSession(actor, params);
}

=== server/domain/ticketing/usecases/createTicketOrderUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { Ticket, TicketOrder, TicketOrderItem } from '../types/ticketingTypes';

export async function createTicketOrderUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.createTicketOrder>[1]
): Promise<{
  order: TicketOrder;
  items: TicketOrderItem[];
  issuedTickets: Array<{ ticket: Ticket; rawQrToken?: string }>;
  isIdempotentReplay: boolean;
  serverNow: string;
}> {
  return ticketingService.createTicketOrder(actor, input);
}

=== server/domain/ticketing/usecases/createTicketTypeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { TicketType } from '../types/ticketingTypes';

export async function createTicketTypeUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.createTicketType>[1]
): Promise<TicketType> {
  return ticketingService.createTicketType(actor, input);
}

=== server/domain/ticketing/usecases/expireAllOverdueOrdersUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';

export async function expireAllOverdueOrdersUseCase(
  nowIso?: string
): Promise<{ expiredCount: number }> {
  const expiredCount = await ticketingService.expireAllOverdueOrders(nowIso);
  return { expiredCount };
}

=== server/domain/ticketing/usecases/expireTicketOrderUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function expireTicketOrderUseCase(orderId: string, actor?: TicketingActorContext) {
  return ticketingService.expireTicketOrder(orderId, actor);
}

=== server/domain/ticketing/usecases/finalizeTicketRefundStatusUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { Refund } from '../types/ticketingTypes';

export async function finalizeTicketRefundStatusUseCase(
  refundId: string,
  status: Refund['status'],
  providerRefundId?: string | null
): Promise<Refund> {
  return ticketingService.finalizeRefundStatus(refundId, status, providerRefundId);
}

=== server/domain/ticketing/usecases/getEventSalesAnalyticsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { EventSalesAnalytics } from '../types/ticketingTypes';

export async function getEventSalesAnalyticsUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  occurrenceId?: string
): Promise<EventSalesAnalytics> {
  return ticketingService.getEventSalesAnalytics(actor, eventListingId, occurrenceId);
}

=== server/domain/ticketing/usecases/getTicketOrderUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function getTicketOrderUseCase(actor: TicketingActorContext, orderId: string) {
  return ticketingService.getOrderForUser(actor, orderId);
}

=== server/domain/ticketing/usecases/getTicketQrTokenUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function getTicketQrTokenUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{
  ticketId: string;
  token: string;
  expiresAt: string;
}> {
  return ticketingService.generateTicketPresentationQr(actor, ticketId);
}

=== server/domain/ticketing/usecases/getVerifiedAttendanceForReviewUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { VerifiedAttendanceForReview } from '../types/ticketingTypes';

export async function getVerifiedAttendanceForReviewUseCase(params: {
  userId: string;
  occurrenceId: string;
  ticketId: string;
}): Promise<VerifiedAttendanceForReview> {
  return ticketingService.getVerifiedAttendanceForReview(params);
}

=== server/domain/ticketing/usecases/joinEventWaitlistUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { EventWaitlistEntry } from '../types/ticketingTypes';

export async function joinEventWaitlistUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.joinWaitlist>[1]
): Promise<EventWaitlistEntry> {
  return ticketingService.joinWaitlist(actor, input);
}

=== server/domain/ticketing/usecases/listEventCheckInsForPartnerOrAdminUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { EventCheckIn } from '../types/ticketingTypes';

export async function listEventCheckInsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<EventCheckIn[]> {
  return ticketingService.listEventCheckInsForPartnerOrAdmin(actor, eventListingId);
}

=== server/domain/ticketing/usecases/listEventOrdersForPartnerOrAdminUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { TicketOrder } from '../types/ticketingTypes';

export async function listEventOrdersForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<TicketOrder[]> {
  return ticketingService.listEventOrdersForPartnerOrAdmin(actor, eventListingId);
}

=== server/domain/ticketing/usecases/listEventRefundsForPartnerOrAdminUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { Refund } from '../types/ticketingTypes';

export async function listEventRefundsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<Refund[]> {
  return ticketingService.listEventRefundsForPartnerOrAdmin(actor, eventListingId);
}

=== server/domain/ticketing/usecases/listPublicTicketTypesByOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { PublicTicketTypeProjection } from '../types/ticketingTypes';

export async function listPublicTicketTypesByOccurrenceUseCase(
  occurrenceId: string
): Promise<PublicTicketTypeProjection[]> {
  return ticketingService.listPublicTicketTypesByOccurrence(occurrenceId);
}

=== server/domain/ticketing/usecases/listTicketTypesForManagementUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { TicketType } from '../types/ticketingTypes';

export async function listTicketTypesForManagementUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<TicketType[]> {
  return ticketingService.listTicketTypesForManagement(actor, occurrenceId);
}

=== server/domain/ticketing/usecases/listUserTicketOrdersUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { TicketOrder } from '../types/ticketingTypes';

export async function listUserTicketOrdersUseCase(
  actor: TicketingActorContext
): Promise<TicketOrder[]> {
  return ticketingService.listUserOrders(actor);
}

=== server/domain/ticketing/usecases/listUserTicketsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { Ticket } from '../types/ticketingTypes';

export async function listUserTicketsUseCase(actor: TicketingActorContext): Promise<Ticket[]> {
  return ticketingService.listUserTickets(actor);
}

=== server/domain/ticketing/usecases/markTicketOrderDisputedUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketOrder } from '../types/ticketingTypes';

export async function markTicketOrderDisputedUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<TicketOrder> {
  return ticketingService.updateOrderPaymentState({
    orderId: params.orderId,
    status: 'chargeback',
    paymentId: params.paymentId,
    paymentIntentId: params.paymentIntentId,
  });
}

=== server/domain/ticketing/usecases/markTicketOrderPaymentFailedUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketOrder } from '../types/ticketingTypes';

export async function markTicketOrderPaymentFailedUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<TicketOrder> {
  return ticketingService.updateOrderPaymentState({
    orderId: params.orderId,
    status: 'payment_failed',
    paymentId: params.paymentId,
    paymentIntentId: params.paymentIntentId,
  });
}

=== server/domain/ticketing/usecases/moveOrderToOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function moveOrderToOccurrenceUseCase(
  actor: TicketingActorContext,
  params: {
    fromOccurrenceId: string;
    toOccurrenceId: string;
  }
) {
  return ticketingService.moveOrdersAndTicketsToOccurrence(actor, params);
}

=== server/domain/ticketing/usecases/reissueTicketQrTokenUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function reissueTicketQrTokenUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{
  ticketId: string;
  token: string;
  expiresAt: string;
}> {
  return ticketingService.generateTicketPresentationQr(actor, ticketId);
}

=== server/domain/ticketing/usecases/requestTicketRefundUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { Refund, TicketOrder } from '../types/ticketingTypes';

export async function requestTicketRefundUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketingService.requestTicketRefund>[1]
): Promise<{ refund: Refund; isReplay: boolean; order: TicketOrder }> {
  return ticketingService.requestTicketRefund(actor, params);
}

=== server/domain/ticketing/usecases/syncOfflineCheckInsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { OfflineCheckInEvent, OfflineCheckInSyncResultItem } from '../types/ticketingTypes';

export async function syncOfflineCheckInsUseCase(
  actor: TicketingActorContext,
  params: {
    sessionId: string;
    events: OfflineCheckInEvent[];
  }
): Promise<{
  sessionId: string;
  results: OfflineCheckInSyncResultItem[];
}> {
  return ticketingService.syncOfflineCheckInEvents(actor, params);
}

=== server/domain/ticketing/usecases/ticketingUseCases.ts — APAGUE este arquivo ===

=== server/domain/ticketing/usecases/transferTicketUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { Ticket, TicketTransfer } from '../types/ticketingTypes';

export async function transferTicketUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketingService.transferTicket>[1]
): Promise<{
  oldTicket: Ticket;
  newTicket: Ticket;
  transfer: TicketTransfer;
  newRawQrToken: string;
}> {
  return ticketingService.transferTicket(actor, params);
}

=== server/domain/ticketing/usecases/updateTicketTypeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { TicketType } from '../types/ticketingTypes';

export async function updateTicketTypeUseCase(
  actor: TicketingActorContext,
  ticketTypeId: string,
  patch: Parameters<typeof ticketingService.updateTicketType>[2]
): Promise<TicketType> {
  return ticketingService.updateTicketType(actor, ticketTypeId, patch);
}

=== src/domain/events/application/usecases/archiveAdminEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';

export async function archiveAdminEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.archiveAdminEventListing(id);
}

=== src/domain/events/application/usecases/cancelAdminEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';

export async function cancelAdminEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.cancelAdminEventListing(id);
}

=== src/domain/events/application/usecases/createAdminEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';
import type { CreateEventListingInput, EventListing, EventOccurrence } from '../../types/event';

export async function createAdminEventListingUseCase(
  input: CreateEventListingInput
): Promise<{ id: string; listing?: EventListing; occurrences?: EventOccurrence[] }> {
  return eventsAdapter.createAdminEventListing(input);
}

=== src/domain/events/application/usecases/createAdminEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';
import type { CreateEventOccurrenceInput, EventOccurrence } from '../../types/event';

export async function createAdminEventOccurrenceUseCase(
  eventListingId: string,
  input: CreateEventOccurrenceInput
): Promise<EventOccurrence> {
  return eventsAdapter.createAdminEventOccurrence(eventListingId, input);
}

=== src/domain/events/application/usecases/createPartnerEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';
import type { CreateEventListingInput, EventListing, EventOccurrence } from '../../types/event';

export async function createPartnerEventListingUseCase(
  input: CreateEventListingInput
): Promise<{ id: string; listing?: EventListing; occurrences?: EventOccurrence[] }> {
  return eventsAdapter.createPartnerEventListing(input);
}

=== src/domain/events/application/usecases/createPartnerEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';
import type { CreateEventOccurrenceInput, EventOccurrence } from '../../types/event';

export async function createPartnerEventOccurrenceUseCase(
  eventListingId: string,
  input: CreateEventOccurrenceInput
): Promise<EventOccurrence> {
  return eventsAdapter.createPartnerEventOccurrence(eventListingId, input);
}

=== src/domain/events/application/usecases/deleteAdminEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';

export async function deleteAdminEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.deleteAdminEventListing(id);
}

=== src/domain/events/application/usecases/deleteAdminEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';

export async function deleteAdminEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string
): Promise<void> {
  return eventsAdapter.deleteAdminEventOccurrence(eventListingId, occurrenceId);
}

=== src/domain/events/application/usecases/deletePartnerEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';

export async function deletePartnerEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.deletePartnerEventListing(id);
}

=== src/domain/events/application/usecases/deletePartnerEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';

export async function deletePartnerEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string
): Promise<void> {
  return eventsAdapter.deletePartnerEventOccurrence(eventListingId, occurrenceId);
}

=== src/domain/events/application/usecases/eventUseCases.ts — APAGUE este arquivo ===

=== src/domain/events/application/usecases/getEventListingByIdUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';
import type { EventListing } from '../../types/event';

export async function getEventListingByIdUseCase(id: string): Promise<EventListing | null> {
  return eventsAdapter.getEventListingById(id);
}

=== src/domain/events/application/usecases/listEventOccurrencesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';
import type { EventOccurrence } from '../../types/event';

export async function listEventOccurrencesUseCase(
  eventListingId: string
): Promise<EventOccurrence[]> {
  return eventsAdapter.listEventOccurrences(eventListingId);
}

=== src/domain/events/application/usecases/updateAdminEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';
import type { UpdateEventListingInput } from '../../types/event';

export async function updateAdminEventListingUseCase(
  id: string,
  input: UpdateEventListingInput
): Promise<void> {
  return eventsAdapter.updateAdminEventListing(id, input);
}

=== src/domain/events/application/usecases/updateAdminEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';
import type { CreateEventOccurrenceInput, EventOccurrence } from '../../types/event';

export async function updateAdminEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string,
  input: Partial<CreateEventOccurrenceInput>
): Promise<EventOccurrence> {
  return eventsAdapter.updateAdminEventOccurrence(eventListingId, occurrenceId, input);
}

=== src/domain/events/application/usecases/updatePartnerEventListingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';
import type { UpdateEventListingInput } from '../../types/event';

export async function updatePartnerEventListingUseCase(
  id: string,
  input: UpdateEventListingInput
): Promise<void> {
  return eventsAdapter.updatePartnerEventListing(id, input);
}

=== src/domain/events/application/usecases/updatePartnerEventOccurrenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { eventsAdapter } from '../../factory';
import type { CreateEventOccurrenceInput, EventOccurrence } from '../../types/event';

export async function updatePartnerEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string,
  input: Partial<CreateEventOccurrenceInput>
): Promise<EventOccurrence> {
  return eventsAdapter.updatePartnerEventOccurrence(eventListingId, occurrenceId, input);
}

=== src/domain/events/hooks/useEventOccurrences.ts — diff ===
@@ -1,5 +1,5 @@
 import { useCallback, useEffect, useState } from 'react';
-import { listEventOccurrencesUseCase } from '../application/usecases/eventUseCases';
+import { listEventOccurrencesUseCase } from '../application/usecases/listEventOccurrencesUseCase';
 import type { EventOccurrence } from '../types/event';
 
 export function useEventOccurrences(eventListingId: string | undefined | null) {

=== src/domain/events/index.ts — diff ===
@@ -1,21 +1,19 @@
-export {
-  archiveAdminEventListingUseCase,
-  cancelAdminEventListingUseCase,
-  createAdminEventListingUseCase,
-  createAdminEventOccurrenceUseCase,
-  createPartnerEventListingUseCase,
-  createPartnerEventOccurrenceUseCase,
-  deleteAdminEventListingUseCase,
-  deleteAdminEventOccurrenceUseCase,
-  deletePartnerEventListingUseCase,
-  deletePartnerEventOccurrenceUseCase,
-  getEventListingByIdUseCase,
-  listEventOccurrencesUseCase,
-  updateAdminEventListingUseCase,
-  updateAdminEventOccurrenceUseCase,
-  updatePartnerEventListingUseCase,
-  updatePartnerEventOccurrenceUseCase,
-} from './application/usecases/eventUseCases';
+export { archiveAdminEventListingUseCase } from './application/usecases/archiveAdminEventListingUseCase';
+export { cancelAdminEventListingUseCase } from './application/usecases/cancelAdminEventListingUseCase';
+export { createAdminEventListingUseCase } from './application/usecases/createAdminEventListingUseCase';
+export { createAdminEventOccurrenceUseCase } from './application/usecases/createAdminEventOccurrenceUseCase';
+export { createPartnerEventListingUseCase } from './application/usecases/createPartnerEventListingUseCase';
+export { createPartnerEventOccurrenceUseCase } from './application/usecases/createPartnerEventOccurrenceUseCase';
+export { deleteAdminEventListingUseCase } from './application/usecases/deleteAdminEventListingUseCase';
+export { deleteAdminEventOccurrenceUseCase } from './application/usecases/deleteAdminEventOccurrenceUseCase';
+export { deletePartnerEventListingUseCase } from './application/usecases/deletePartnerEventListingUseCase';
+export { deletePartnerEventOccurrenceUseCase } from './application/usecases/deletePartnerEventOccurrenceUseCase';
+export { getEventListingByIdUseCase } from './application/usecases/getEventListingByIdUseCase';
+export { listEventOccurrencesUseCase } from './application/usecases/listEventOccurrencesUseCase';
+export { updateAdminEventListingUseCase } from './application/usecases/updateAdminEventListingUseCase';
+export { updateAdminEventOccurrenceUseCase } from './application/usecases/updateAdminEventOccurrenceUseCase';
+export { updatePartnerEventListingUseCase } from './application/usecases/updatePartnerEventListingUseCase';
+export { updatePartnerEventOccurrenceUseCase } from './application/usecases/updatePartnerEventOccurrenceUseCase';
 
 export { useEventOccurrences } from './hooks/useEventOccurrences';

=== src/domain/payment/application/usecases/confirmPlanPaymentReturnUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentApiAdapter } from '../../factory';

export async function confirmPlanPaymentReturnUseCase(params: {
  paymentIntentId: string;
}): Promise<{ status: string }> {
  return paymentApiAdapter.confirmPlanPaymentReturn(params);
}

=== src/domain/payment/application/usecases/createPartnerConnectAccountSessionUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentApiAdapter } from '../../factory';

export async function createPartnerConnectAccountSessionUseCase(): Promise<{
  clientSecret: string;
}> {
  return paymentApiAdapter.createPartnerConnectAccountSession();
}

=== src/domain/payment/application/usecases/createPartnerConnectAccountUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentApiAdapter } from '../../factory';
import type { PartnerConnectStatusResponse } from '../../types/payment';

export async function createPartnerConnectAccountUseCase(): Promise<PartnerConnectStatusResponse> {
  return paymentApiAdapter.createPartnerConnectAccount();
}

=== src/domain/payment/application/usecases/createPlanPaymentIntentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentApiAdapter } from '../../factory';
import type {
  CreatePaymentIntentResponse,
  CreatePlanPaymentIntentPayload,
} from '../../types/payment';

export async function createPlanPaymentIntentUseCase(
  payload: CreatePlanPaymentIntentPayload
): Promise<CreatePaymentIntentResponse> {
  return paymentApiAdapter.createPlanPaymentIntent(payload);
}

=== src/domain/payment/application/usecases/getPartnerConnectStatusUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentApiAdapter } from '../../factory';
import type { PartnerConnectStatusResponse } from '../../types/payment';

export async function getPartnerConnectStatusUseCase(): Promise<PartnerConnectStatusResponse> {
  return paymentApiAdapter.getPartnerConnectStatus();
}

=== src/domain/payment/application/usecases/paymentUseCases.ts — APAGUE este arquivo ===

=== src/domain/payment/components/PartnerStripeConnectPortal.tsx — diff ===
@@ -18,11 +18,9 @@ import {
 } from 'lucide-react';
 import { GlassCard } from '../../../ui/components/GlassCard';
 import { createStripeConnectInstance } from '../adapters/stripeConnectAdapter';
-import {
-  createPartnerConnectAccountSessionUseCase,
-  createPartnerConnectAccountUseCase,
-  getPartnerConnectStatusUseCase,
-} from '../application/usecases/paymentUseCases';
+import { createPartnerConnectAccountSessionUseCase } from '../application/usecases/createPartnerConnectAccountSessionUseCase';
+import { createPartnerConnectAccountUseCase } from '../application/usecases/createPartnerConnectAccountUseCase';
+import { getPartnerConnectStatusUseCase } from '../application/usecases/getPartnerConnectStatusUseCase';
 import type { PartnerConnectStatusResponse } from '../types/payment';
 import { StripeConnectProvider } from './StripeConnectProvider';

=== src/domain/payment/hooks/usePayment.ts — diff ===
@@ -1,8 +1,6 @@
 import { useCallback, useRef, useState } from 'react';
-import {
-  confirmPlanPaymentReturnUseCase,
-  createPlanPaymentIntentUseCase,
-} from '../application/usecases/paymentUseCases';
+import { confirmPlanPaymentReturnUseCase } from '../application/usecases/confirmPlanPaymentReturnUseCase';
+import { createPlanPaymentIntentUseCase } from '../application/usecases/createPlanPaymentIntentUseCase';
 import type { PaidPlanId } from '../types/payment';
 
 interface UsePaymentProps {

=== src/domain/payment/index.ts — diff ===
@@ -3,13 +3,11 @@ export { PlanSubscriptionCard } from './components/PlanSubscriptionCard';
 export { StripePaymentElement } from './adapters/ui/StripePaymentElement';
 export { StripeConnectProvider } from './components/StripeConnectProvider';
 export { PartnerStripeConnectPortal } from './components/PartnerStripeConnectPortal';
-export {
-  confirmPlanPaymentReturnUseCase,
-  createPartnerConnectAccountSessionUseCase,
-  createPartnerConnectAccountUseCase,
-  createPlanPaymentIntentUseCase,
-  getPartnerConnectStatusUseCase,
-} from './application/usecases/paymentUseCases';
+export { confirmPlanPaymentReturnUseCase } from './application/usecases/confirmPlanPaymentReturnUseCase';
+export { createPartnerConnectAccountSessionUseCase } from './application/usecases/createPartnerConnectAccountSessionUseCase';
+export { createPartnerConnectAccountUseCase } from './application/usecases/createPartnerConnectAccountUseCase';
+export { createPlanPaymentIntentUseCase } from './application/usecases/createPlanPaymentIntentUseCase';
+export { getPartnerConnectStatusUseCase } from './application/usecases/getPartnerConnectStatusUseCase';
 export { isPaidPlanId } from './utils/planIds';
 export type {
   CreatePaymentIntentResponse,

=== src/domain/ticketing/application/usecases/checkInTicketUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function checkInTicketUseCase(input: Parameters<TicketingPort['checkInTicket']>[0]) {
  return ticketingAdapter.checkInTicket(input);
}

=== src/domain/ticketing/application/usecases/confirmTicketOrderPaymentReturnUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function confirmTicketOrderPaymentReturnUseCase(
  orderId: string,
  input: Parameters<TicketingPort['confirmOrderPaymentReturn']>[1]
) {
  return ticketingAdapter.confirmOrderPaymentReturn(orderId, input);
}

=== src/domain/ticketing/application/usecases/createOfflineCheckInSessionUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function createOfflineCheckInSessionUseCase(
  input: Parameters<TicketingPort['createOfflineCheckInSession']>[0]
) {
  return ticketingAdapter.createOfflineCheckInSession(input);
}

=== src/domain/ticketing/application/usecases/createPartnerConnectAccountSessionUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function createPartnerConnectAccountSessionUseCase() {
  return ticketingAdapter.createPartnerConnectAccountSession();
}

=== src/domain/ticketing/application/usecases/createPartnerConnectAccountUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function createPartnerConnectAccountUseCase() {
  return ticketingAdapter.createPartnerConnectAccount();
}

=== src/domain/ticketing/application/usecases/createTicketOrderPaymentIntentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function createTicketOrderPaymentIntentUseCase(
  orderId: string,
  input: Parameters<TicketingPort['createOrderPaymentIntent']>[1]
) {
  return ticketingAdapter.createOrderPaymentIntent(orderId, input);
}

=== src/domain/ticketing/application/usecases/createTicketOrderUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function createTicketOrderUseCase(input: Parameters<TicketingPort['createOrder']>[0]) {
  return ticketingAdapter.createOrder(input);
}

=== src/domain/ticketing/application/usecases/createTicketTypeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function createTicketTypeUseCase(input: Parameters<TicketingPort['createTicketType']>[0]) {
  return ticketingAdapter.createTicketType(input);
}

=== src/domain/ticketing/application/usecases/deleteOrArchiveTicketTypeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function deleteOrArchiveTicketTypeUseCase(ticketTypeId: string) {
  return ticketingAdapter.deleteOrArchiveTicketType(ticketTypeId);
}

=== src/domain/ticketing/application/usecases/expireTicketOrderUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function expireTicketOrderUseCase(orderId: string) {
  return ticketingAdapter.expireOrder(orderId);
}

=== src/domain/ticketing/application/usecases/getEventSalesAnalyticsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function getEventSalesAnalyticsUseCase(
  eventListingId: string,
  occurrenceId?: string,
  asAdmin = false
) {
  return ticketingAdapter.getEventSalesAnalytics(eventListingId, occurrenceId, asAdmin);
}

=== src/domain/ticketing/application/usecases/getPartnerMerchantStatusUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function getPartnerMerchantStatusUseCase() {
  return ticketingAdapter.getPartnerMerchantStatus();
}

=== src/domain/ticketing/application/usecases/getTicketOrderUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function getTicketOrderUseCase(orderId: string) {
  return ticketingAdapter.getOrder(orderId);
}

=== src/domain/ticketing/application/usecases/getTicketQrTokenUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function getTicketQrTokenUseCase(ticketId: string) {
  return ticketingAdapter.getTicketQrToken(ticketId);
}

=== src/domain/ticketing/application/usecases/listEventCheckInsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function listEventCheckInsUseCase(eventListingId: string, asAdmin = false) {
  return ticketingAdapter.listEventCheckIns(eventListingId, asAdmin);
}

=== src/domain/ticketing/application/usecases/listEventOrdersUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function listEventOrdersUseCase(eventListingId: string, asAdmin = false) {
  return ticketingAdapter.listEventOrders(eventListingId, asAdmin);
}

=== src/domain/ticketing/application/usecases/listEventRefundsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function listEventRefundsUseCase(eventListingId: string, asAdmin = false) {
  return ticketingAdapter.listEventRefunds(eventListingId, asAdmin);
}

=== src/domain/ticketing/application/usecases/listManagementTicketTypesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function listManagementTicketTypesUseCase(occurrenceId: string) {
  return ticketingAdapter.listManagementTicketTypes(occurrenceId);
}

=== src/domain/ticketing/application/usecases/listPublicTicketTypesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function listPublicTicketTypesUseCase(occurrenceId: string) {
  return ticketingAdapter.listPublicTicketTypes(occurrenceId);
}

=== src/domain/ticketing/application/usecases/listUserOrdersUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function listUserOrdersUseCase() {
  return ticketingAdapter.listUserOrders();
}

=== src/domain/ticketing/application/usecases/listUserTicketsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function listUserTicketsUseCase() {
  return ticketingAdapter.listUserTickets();
}

=== src/domain/ticketing/application/usecases/reissueTicketQrTokenUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function reissueTicketQrTokenUseCase(ticketId: string) {
  return ticketingAdapter.reissueTicketQrToken(ticketId);
}

=== src/domain/ticketing/application/usecases/requestTicketRefundUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function requestTicketRefundUseCase(
  orderId: string,
  input: Parameters<TicketingPort['requestRefund']>[1]
) {
  return ticketingAdapter.requestRefund(orderId, input);
}

=== src/domain/ticketing/application/usecases/syncOfflineCheckInsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function syncOfflineCheckInsUseCase(
  input: Parameters<TicketingPort['syncOfflineCheckIns']>[0]
) {
  return ticketingAdapter.syncOfflineCheckIns(input);
}

=== src/domain/ticketing/application/usecases/ticketingUseCases.ts — APAGUE este arquivo ===

=== src/domain/ticketing/application/usecases/transferTicketUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function transferTicketUseCase(
  ticketId: string,
  input: Parameters<TicketingPort['transferTicket']>[1]
) {
  return ticketingAdapter.transferTicket(ticketId, input);
}

=== src/domain/ticketing/application/usecases/updateTicketTypeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function updateTicketTypeUseCase(
  ticketTypeId: string,
  patch: Parameters<TicketingPort['updateTicketType']>[1]
) {
  return ticketingAdapter.updateTicketType(ticketTypeId, patch);
}

=== src/domain/ticketing/components/CheckoutResultView.tsx — diff ===
@@ -8,10 +8,8 @@ import {
   Ticket as TicketIcon,
 } from 'lucide-react';
 import { GlassCard } from '../../../ui/components/GlassCard';
-import {
-  confirmTicketOrderPaymentReturnUseCase,
-  getTicketOrderUseCase,
-} from '../application/usecases/ticketingUseCases';
+import { confirmTicketOrderPaymentReturnUseCase } from '../application/usecases/confirmTicketOrderPaymentReturnUseCase';
+import { getTicketOrderUseCase } from '../application/usecases/getTicketOrderUseCase';
 import { formatMoneyMinorBrl, type TicketOrder } from '../types/ticketing';
 
 interface CheckoutResultViewProps {

=== src/domain/ticketing/components/EventTicketingPurchasePanel.tsx — diff ===
@@ -18,13 +18,11 @@ import { useAuthContext } from '../../auth/context/AuthContext';
 import { useEventOccurrences, type EventOccurrence } from '../../events';
 import { StripePaymentElement } from '../../payment';
 import { GlassCard } from '../../../ui/components/GlassCard';
-import {
-  confirmTicketOrderPaymentReturnUseCase,
-  createTicketOrderPaymentIntentUseCase,
-  createTicketOrderUseCase,
-  expireTicketOrderUseCase,
-  getTicketOrderUseCase,
-} from '../application/usecases/ticketingUseCases';
+import { confirmTicketOrderPaymentReturnUseCase } from '../application/usecases/confirmTicketOrderPaymentReturnUseCase';
+import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
+import { createTicketOrderUseCase } from '../application/usecases/createTicketOrderUseCase';
+import { expireTicketOrderUseCase } from '../application/usecases/expireTicketOrderUseCase';
+import { getTicketOrderUseCase } from '../application/usecases/getTicketOrderUseCase';
 import { useCheckoutCountdown } from '../hooks/useCheckoutCountdown';
 import { usePublicTicketTypes } from '../hooks/useTicketTypes';
 import {

=== src/domain/ticketing/components/PartnerEventTicketingManager.tsx — diff ===
@@ -20,13 +20,11 @@ import {
 import { useEventOccurrences, type EventOccurrence } from '../../events';
 import { PartnerStripeConnectPortal } from '../../payment';
 import { GlassCard } from '../../../ui/components/GlassCard';
-import {
-  createOfflineCheckInSessionUseCase,
-  createTicketTypeUseCase,
-  deleteOrArchiveTicketTypeUseCase,
-  syncOfflineCheckInsUseCase,
-  updateTicketTypeUseCase,
-} from '../application/usecases/ticketingUseCases';
+import { createOfflineCheckInSessionUseCase } from '../application/usecases/createOfflineCheckInSessionUseCase';
+import { createTicketTypeUseCase } from '../application/usecases/createTicketTypeUseCase';
+import { deleteOrArchiveTicketTypeUseCase } from '../application/usecases/deleteOrArchiveTicketTypeUseCase';
+import { syncOfflineCheckInsUseCase } from '../application/usecases/syncOfflineCheckInsUseCase';
+import { updateTicketTypeUseCase } from '../application/usecases/updateTicketTypeUseCase';
 import { usePartnerEventSales, usePartnerMerchantAccount } from '../hooks/usePartnerEventSales';
 import { useManagementTicketTypes } from '../hooks/useTicketTypes';
 import { formatMoneyMinorBrl } from '../types/ticketing';

=== src/domain/ticketing/components/UserTicketsHistoryView.tsx — diff ===
@@ -14,10 +14,8 @@ import {
 import QRCode from 'qrcode';
 import { StripePaymentElement } from '../../payment';
 import { GlassCard } from '../../../ui/components/GlassCard';
-import {
-  confirmTicketOrderPaymentReturnUseCase,
-  createTicketOrderPaymentIntentUseCase,
-} from '../application/usecases/ticketingUseCases';
+import { confirmTicketOrderPaymentReturnUseCase } from '../application/usecases/confirmTicketOrderPaymentReturnUseCase';
+import { createTicketOrderPaymentIntentUseCase } from '../application/usecases/createTicketOrderPaymentIntentUseCase';
 import { useUserTicketsAndOrders } from '../hooks/useUserTickets';
 import { formatMoneyMinorBrl, type Ticket, type TicketOrder } from '../types/ticketing';

=== src/domain/ticketing/hooks/usePartnerEventSales.ts — diff ===
@@ -1,13 +1,11 @@
 import { useCallback, useEffect, useState } from 'react';
-import {
-  checkInTicketUseCase,
-  createPartnerConnectAccountUseCase,
-  getEventSalesAnalyticsUseCase,
-  getPartnerMerchantStatusUseCase,
-  listEventCheckInsUseCase,
-  listEventOrdersUseCase,
-  listEventRefundsUseCase,
-} from '../application/usecases/ticketingUseCases';
+import { checkInTicketUseCase } from '../application/usecases/checkInTicketUseCase';
+import { createPartnerConnectAccountUseCase } from '../application/usecases/createPartnerConnectAccountUseCase';
+import { getEventSalesAnalyticsUseCase } from '../application/usecases/getEventSalesAnalyticsUseCase';
+import { getPartnerMerchantStatusUseCase } from '../application/usecases/getPartnerMerchantStatusUseCase';
+import { listEventCheckInsUseCase } from '../application/usecases/listEventCheckInsUseCase';
+import { listEventOrdersUseCase } from '../application/usecases/listEventOrdersUseCase';
+import { listEventRefundsUseCase } from '../application/usecases/listEventRefundsUseCase';
 import type {
   EventCheckIn,
   EventSalesAnalytics,

=== src/domain/ticketing/hooks/useTicketTypes.ts — diff ===
@@ -1,8 +1,6 @@
 import { useCallback, useEffect, useState } from 'react';
-import {
-  listManagementTicketTypesUseCase,
-  listPublicTicketTypesUseCase,
-} from '../application/usecases/ticketingUseCases';
+import { listManagementTicketTypesUseCase } from '../application/usecases/listManagementTicketTypesUseCase';
+import { listPublicTicketTypesUseCase } from '../application/usecases/listPublicTicketTypesUseCase';
 import type { PublicTicketTypeProjection, TicketType } from '../types/ticketing';
 
 export function usePublicTicketTypes(occurrenceId?: string) {

=== src/domain/ticketing/hooks/useUserTickets.ts — diff ===
@@ -1,12 +1,10 @@
 import { useCallback, useEffect, useState } from 'react';
-import {
-  getTicketQrTokenUseCase,
-  listUserOrdersUseCase,
-  listUserTicketsUseCase,
-  reissueTicketQrTokenUseCase,
-  requestTicketRefundUseCase,
-  transferTicketUseCase,
-} from '../application/usecases/ticketingUseCases';
+import { getTicketQrTokenUseCase } from '../application/usecases/getTicketQrTokenUseCase';
+import { listUserOrdersUseCase } from '../application/usecases/listUserOrdersUseCase';
+import { listUserTicketsUseCase } from '../application/usecases/listUserTicketsUseCase';
+import { reissueTicketQrTokenUseCase } from '../application/usecases/reissueTicketQrTokenUseCase';
+import { requestTicketRefundUseCase } from '../application/usecases/requestTicketRefundUseCase';
+import { transferTicketUseCase } from '../application/usecases/transferTicketUseCase';
 import type { Ticket, TicketOrder } from '../types/ticketing';
 
 export function useUserTicketsAndOrders(enabled = true) {

=== src/domain/ticketing/index.ts — diff ===
@@ -1,31 +1,29 @@
-export {
-  checkInTicketUseCase,
-  confirmTicketOrderPaymentReturnUseCase,
-  createOfflineCheckInSessionUseCase,
-  createPartnerConnectAccountSessionUseCase,
-  createPartnerConnectAccountUseCase,
-  createTicketOrderPaymentIntentUseCase,
-  createTicketOrderUseCase,
-  createTicketTypeUseCase,
-  deleteOrArchiveTicketTypeUseCase,
-  expireTicketOrderUseCase,
-  getEventSalesAnalyticsUseCase,
-  getPartnerMerchantStatusUseCase,
-  getTicketOrderUseCase,
-  getTicketQrTokenUseCase,
-  listEventCheckInsUseCase,
-  listEventOrdersUseCase,
-  listEventRefundsUseCase,
-  listManagementTicketTypesUseCase,
-  listPublicTicketTypesUseCase,
-  listUserOrdersUseCase,
-  listUserTicketsUseCase,
-  reissueTicketQrTokenUseCase,
-  requestTicketRefundUseCase,
-  syncOfflineCheckInsUseCase,
-  transferTicketUseCase,
-  updateTicketTypeUseCase,
-} from './application/usecases/ticketingUseCases';
+export { checkInTicketUseCase } from './application/usecases/checkInTicketUseCase';
+export { confirmTicketOrderPaymentReturnUseCase } from './application/usecases/confirmTicketOrderPaymentReturnUseCase';
+export { createOfflineCheckInSessionUseCase } from './application/usecases/createOfflineCheckInSessionUseCase';
+export { createPartnerConnectAccountSessionUseCase } from './application/usecases/createPartnerConnectAccountSessionUseCase';
+export { createPartnerConnectAccountUseCase } from './application/usecases/createPartnerConnectAccountUseCase';
+export { createTicketOrderPaymentIntentUseCase } from './application/usecases/createTicketOrderPaymentIntentUseCase';
+export { createTicketOrderUseCase } from './application/usecases/createTicketOrderUseCase';
+export { createTicketTypeUseCase } from './application/usecases/createTicketTypeUseCase';
+export { deleteOrArchiveTicketTypeUseCase } from './application/usecases/deleteOrArchiveTicketTypeUseCase';
+export { expireTicketOrderUseCase } from './application/usecases/expireTicketOrderUseCase';
+export { getEventSalesAnalyticsUseCase } from './application/usecases/getEventSalesAnalyticsUseCase';
+export { getPartnerMerchantStatusUseCase } from './application/usecases/getPartnerMerchantStatusUseCase';
+export { getTicketOrderUseCase } from './application/usecases/getTicketOrderUseCase';
+export { getTicketQrTokenUseCase } from './application/usecases/getTicketQrTokenUseCase';
+export { listEventCheckInsUseCase } from './application/usecases/listEventCheckInsUseCase';
+export { listEventOrdersUseCase } from './application/usecases/listEventOrdersUseCase';
+export { listEventRefundsUseCase } from './application/usecases/listEventRefundsUseCase';
+export { listManagementTicketTypesUseCase } from './application/usecases/listManagementTicketTypesUseCase';
+export { listPublicTicketTypesUseCase } from './application/usecases/listPublicTicketTypesUseCase';
+export { listUserOrdersUseCase } from './application/usecases/listUserOrdersUseCase';
+export { listUserTicketsUseCase } from './application/usecases/listUserTicketsUseCase';
+export { reissueTicketQrTokenUseCase } from './application/usecases/reissueTicketQrTokenUseCase';
+export { requestTicketRefundUseCase } from './application/usecases/requestTicketRefundUseCase';
+export { syncOfflineCheckInsUseCase } from './application/usecases/syncOfflineCheckInsUseCase';
+export { transferTicketUseCase } from './application/usecases/transferTicketUseCase';
+export { updateTicketTypeUseCase } from './application/usecases/updateTicketTypeUseCase';
 
 export {
   useManagementTicketTypes,

VERIFICAÇÃO (obrigatória):
- `find src server -name "*UseCases.ts" -not -name "*.test.ts"` não encontra nada.
- `npm run typecheck` sem erros; `npx biome lint .` com 0 erros.
- `npm test` → 120 arquivos, 730 testes, sem mudar nenhuma asserção.
- `npm run build` sem erros.
Responda no formato do AGENTS.md §16.3.
~~~~
