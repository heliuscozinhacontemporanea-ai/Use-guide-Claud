# Prompt 12 — bookings: pagamento, webhook, reembolso, rotas e jobs

> Lote 6 — gerado do commit de referência `0424bb9` da branch `claude/agents-md-v2`. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 12 — bookings: pagamento, webhook, reembolso, rotas e jobs

Liga as reservas ao Stripe (destination charge, decisão D1), ao webhook (fonte da verdade), aos reembolsos pela política de cancelamento e cria as rotas HTTP e os jobs de expiração e conclusão.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade, migração ou transição (§2.2 item 8). A decisão D5 (tradução automática) está em aberto: não implemente tradução automática.

O QUE MUDA:
1) payment continua sem conhecer "reserva": referenceType passa a ser texto livre; createMarketplacePaymentIntent (genérico) e o pagamento de ingresso usam o mesmo helper privado createDestinationChargeIntent (metadata só com IDs); getPaymentReferenceUseCase lê a referência gravada (para disputas).
2) server/application/usecases/bookings: createBookingApplicationUseCase (e-mail verificado; taxa de USE_GUIDE_PLATFORM_FEE_PERCENT; se o pagamento falha, devolve a vaga), cancelBookingByBuyerApplicationUseCase (reembolso pela política; a taxa só volta no 100%), cancelSlotByPartnerApplicationUseCase (reembolso integral com taxa e repasse; repetível), reconcileBookingWebhookApplicationUseCase (succeeded confirma; pagamento tardio sem vaga é reembolsado; refund pending não marca reembolsado; disputa pela transação). O webhook atual chama esse UseCase antes dos ramos de ingresso.
3) server/interfaces/http/bookings: rotas /api/bookings (horários públicos, criar, minhas reservas, detalhe, cancelar, não comparecimento) e /api/partners/offers (ofertas, status, horários, cancelar horário, reservas). Saída por allowlist, erros no formato §10.2, Idempotency-Key aceito no header, token revogado recusado nas operações com dinheiro.
4) Jobs internos: server/infrastructure/auth/internalJobAuth.ts (X-Internal-Job-Key + timingSafeEqual) usado por /internal/ticketing/expire-orders, /internal/bookings/expire e /internal/bookings/complete. A chave passa a ser INTERNAL_JOB_KEY (sem aceitar o nome antigo). A rota duplicada /api/ticketing/internal/expire-orders sai: rota interna não passa pelo rewrite do Hosting (AGENTS.md §7.9).
5) functions: callInternalJob.ts (com timeout), expireBookings (a cada 5 min) e completeBookings (diário às 03:00), ambos no fuso America/Fortaleza.
6) .env.example: INTERNAL_JOB_KEY, BOOKINGS_EXPIRATION_JOB_URL, BOOKINGS_COMPLETION_JOB_URL. docs: débito B13 (notifications só avisa parceiros).

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- docs/arquitetura/debitos.md (alterar)
- functions/src/callInternalJob.ts (criar)
- functions/src/completeBookings.ts (criar)
- functions/src/expireBookings.ts (criar)
- functions/src/expireTicketingOrders.ts (alterar)
- functions/src/index.ts (alterar)
- server.ts (alterar)
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (criar)
- server/application/usecases/bookings/cancelBookingByBuyerApplicationUseCase.ts (criar)
- server/application/usecases/bookings/cancelSlotByPartnerApplicationUseCase.ts (criar)
- server/application/usecases/bookings/createBookingApplicationUseCase.ts (criar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts (criar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts (criar)
- server/application/usecases/ticketingPaymentOrchestrationUseCases.ts (alterar)
- server/domain/bookings/errors/bookingDomainError.ts (alterar)
- server/domain/bookings/index.ts (alterar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/domain/bookings/services/offerService.ts (alterar)
- server/domain/bookings/usecases/cancelPendingBookingUseCase.ts (criar)
- server/domain/bookings/usecases/listOfferSlotsForPartnerUseCase.ts (criar)
- server/domain/payment/adapters/firebaseAdminTransactionAdapter.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/paymentGatewayPort.ts (alterar)
- server/domain/payment/ports/transactionRepositoryPort.ts (alterar)
- server/domain/payment/services/stripePaymentService.marketplace.test.ts (criar)
- server/domain/payment/services/stripePaymentService.ts (alterar)
- server/domain/payment/usecases/createMarketplacePaymentIntentUseCase.ts (criar)
- server/domain/payment/usecases/getPaymentReferenceUseCase.ts (criar)
- server/domain/ticketing/controllers/ticketingController.ts (alterar)
- server/domain/ticketing/routes/ticketingRoutes.ts (alterar)
- server/infrastructure/auth/internalJobAuth.test.ts (criar)
- server/infrastructure/auth/internalJobAuth.ts (criar)
- server/interfaces/http/bookings/bookingHttpErrors.ts (criar)
- server/interfaces/http/bookings/bookingResponses.ts (criar)
- server/interfaces/http/bookings/bookingsController.test.ts (criar)
- server/interfaces/http/bookings/bookingsController.ts (criar)
- server/interfaces/http/bookings/bookingsRoutes.ts (criar)
- server/interfaces/http/bookings/internalBookingsController.ts (criar)
- server/interfaces/http/bookings/partnerOffersController.ts (criar)
- server/interfaces/http/bookings/schemas/bookingSchemas.test.ts (criar)
- server/interfaces/http/bookings/schemas/bookingSchemas.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -30,8 +30,11 @@ OFFLINE_CHECKIN_PRIVATE_KEY_PEM=
 OFFLINE_CHECKIN_KEY_ID=
 TICKET_QR_PRIVATE_KEY_PEM=
 TICKET_QR_PUBLIC_KEY_PEM=
-TICKETING_EXPIRATION_JOB_KEY=
+# Jobs internos (Cloud Functions → Cloud Run /internal/*). Use a URL *.run.app, nunca a do Hosting.
+INTERNAL_JOB_KEY=
 TICKETING_EXPIRATION_JOB_URL=
+BOOKINGS_EXPIRATION_JOB_URL=
+BOOKINGS_COMPLETION_JOB_URL=
 
 # Firebase Client SDK Credentials & App Check Config
 VITE_FIREBASE_API_KEY=

=== docs/arquitetura/debitos.md — diff ===
@@ -8,8 +8,9 @@
 | B4 | `notifications/services/notificationService.ts` → `partners` | §5.4 (notifications folha) | médio — cria cadeia reviews→notifications→partners→ticketing | receber `recipientPartnerId` já resolvido por parâmetro/Application UseCase |
 | B5 | `reviews/adapters/firestoreReviewAdapter.ts` → guide/events/users | §3.1 (adapter de persistência com lógica cross-domain) | médio | separar `ReviewTargetPort` + adapter ACL dedicado |
 | B10 | `guide/usecases/listPublicGuideItemsUseCase.ts` e `events` `listPublicListings` | §6.4 (leitura da coleção inteira) | baixo enquanto o catálogo for pequeno; o sitemap fica em cache na CDN por 1 h | consulta com `where('isActive', '==', true)` e paginação quando o catálogo passar de alguns milhares de itens |
-| B11 | `partners/components/PartnerPanel.tsx` (591 linhas), `guide/components/ExploreView.tsx` (506), `search/components/SearchOverlay.tsx` (455), `app/AppRouter.tsx` (410) | §13 (acima de 400 linhas, dividir ao tocar) | médio — arquivos difíceis de revisar | prompts 9 e 10 só trocaram trechos pontuais (o AppRouter perdeu as rotas, que foram para `app/routes/AppRoutes.tsx`); dividir cada um num prompt próprio |
+| B11 | `partners/components/PartnerPanel.tsx` (591 linhas), `guide/components/ExploreView.tsx` (506), `search/components/SearchOverlay.tsx` (455), `app/AppRouter.tsx` (410), `payment/services/stripePaymentService.ts` (≈430) | §13 (acima de 400 linhas, dividir ao tocar) | médio — arquivos difíceis de revisar | prompts 9 e 10 só trocaram trechos pontuais (o AppRouter perdeu as rotas, que foram para `app/routes/AppRoutes.tsx`); dividir cada um num prompt próprio |
 | B12 | `application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts` (notificação de falha de cobrança) | §12.5 (texto do backend em pt-BR) | baixo | `notifications` passar a aceitar chave de tradução e gerar no idioma do parceiro |
+| B13 | `application/usecases/bookings/*` (horário cancelado, reembolso que falhou) | §8.7 (avisar o comprador) e §7.10 A09 (alerta ao admin) | médio — o comprador só descobre o cancelamento em "Minhas reservas" e a falha de reembolso fica só no log | `notifications` aceitar destinatário usuário e admin (hoje só `recipientPartnerId`) |
 
 ## Resolvidos

=== functions/src/callInternalJob.ts — ARQUIVO NOVO, conteúdo completo ===
/** Chama uma rota /internal do Cloud Run com a chave de job (header X-Internal-Job-Key). */
export async function callInternalJob(url: string | undefined, jobName: string): Promise<void> {
  const key = process.env.INTERNAL_JOB_KEY;
  if (!url || !key) {
    throw new Error(`Job ${jobName} não configurado.`);
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Internal-Job-Key': key },
    signal: AbortSignal.timeout(50_000),
  });
  if (!response.ok) {
    throw new Error(`Falha no job ${jobName}: ${response.status}`);
  }
}

=== functions/src/completeBookings.ts — ARQUIVO NOVO, conteúdo completo ===
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob } from './callInternalJob';

// Marca como concluídas as reservas cujo horário já terminou.
export const completeBookings = onSchedule(
  {
    schedule: '0 3 * * *',
    timeZone: 'America/Fortaleza',
  },
  async () => {
    await callInternalJob(process.env.BOOKINGS_COMPLETION_JOB_URL, 'completeBookings');
  }
);

=== functions/src/expireBookings.ts — ARQUIVO NOVO, conteúdo completo ===
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob } from './callInternalJob';

// Devolve as vagas das reservas não pagas em 15 minutos.
export const expireBookings = onSchedule(
  {
    schedule: '*/5 * * * *',
    timeZone: 'America/Fortaleza',
  },
  async () => {
    await callInternalJob(process.env.BOOKINGS_EXPIRATION_JOB_URL, 'expireBookings');
  }
);

=== functions/src/expireTicketingOrders.ts — diff ===
@@ -1,4 +1,5 @@
 import { onSchedule } from 'firebase-functions/v2/scheduler';
+import { callInternalJob } from './callInternalJob';
 
 export const expireTicketingOrders = onSchedule(
   {
@@ -6,20 +7,6 @@ export const expireTicketingOrders = onSchedule(
     timeZone: 'America/Fortaleza',
   },
   async () => {
-    const url = process.env.TICKETING_EXPIRATION_JOB_URL;
-    const key = process.env.TICKETING_EXPIRATION_JOB_KEY;
-    if (!url || !key) {
-      throw new Error('Job de expiração não configurado.');
-    }
-    const response = await fetch(url, {
-      method: 'POST',
-      headers: {
-        'Content-Type': 'application/json',
-        'X-Internal-Job-Key': key,
-      },
-    });
-    if (!response.ok) {
-      throw new Error(`Falha no job de expiração: ${response.status}`);
-    }
+    await callInternalJob(process.env.TICKETING_EXPIRATION_JOB_URL, 'expireTicketingOrders');
   }
 );

=== functions/src/index.ts — diff ===
@@ -1,2 +1,4 @@
 export { checkExpiringPlans } from './checkExpiringPlans';
+export { completeBookings } from './completeBookings';
+export { expireBookings } from './expireBookings';
 export { expireTicketingOrders } from './expireTicketingOrders';

=== server.ts — diff ===
@@ -20,6 +20,9 @@ import adminRouter from './server/domain/admin/routes/adminRoutes';
 import favoriteRouter from './server/domain/favorites/routes/favoriteRoutes';
 import mediaRouter from './server/domain/media/routes/mediaRoutes';
 import billingRouter from './server/interfaces/http/billing/billingRoutes';
+import { bookingsRouter, partnerOffersRouter } from './server/interfaces/http/bookings/bookingsRoutes';
+import { InternalBookingsController } from './server/interfaces/http/bookings/internalBookingsController';
+import { verifyInternalJobKey } from './server/infrastructure/auth/internalJobAuth';
 import { renderSeoPageApplicationUseCase } from './server/application/usecases/renderSeoPageApplicationUseCase';
 import { renderSitemapApplicationUseCase } from './server/application/usecases/renderSitemapApplicationUseCase';
 import { verifyAppCheck } from './server/infrastructure/auth/appCheckMiddleware';
@@ -124,19 +127,21 @@ async function startServer() {
       environment: process.env.NODE_ENV || 'development',
     });
   });
+  // Rotas /internal nunca passam pelo rewrite do Hosting (AGENTS.md §7.9).
   app.post(
     '/internal/ticketing/expire-orders',
-    express.json({ limit: '64kb' }),
+    verifyInternalJobKey,
     TicketingController.expireOrdersInternalJob
   );
+  app.post('/internal/bookings/expire', verifyInternalJobKey, InternalBookingsController.expire);
+  app.post('/internal/bookings/complete', verifyInternalJobKey, InternalBookingsController.complete);
 
   // 3. App Check para rotas /api/*
   app.use('/api', (req, res, next) => {
     if (
       req.path === '/health' ||
       req.path === '/version' ||
-      req.path.startsWith('/payment/webhook') ||
-      req.path === '/ticketing/internal/expire-orders'
+      req.path.startsWith('/payment/webhook')
     ) {
       return next();
     }
@@ -168,11 +173,13 @@ async function startServer() {
   });
 
   // 5. Normal routes
+  app.use('/api/bookings', bookingsRouter);
   app.use('/api/payment/plans', billingRouter);
   app.use('/api/payment', paymentRouter);
   app.use('/api/weather', climaWindRouter);
   app.use('/api/notifications', notificationRouter);
   app.use('/api/users', userRouter);
+  app.use('/api/partners/offers', partnerOffersRouter);
   app.use('/api/partners', partnerRouter);
   app.use('/api/items', itemRouter);
   app.use('/api/events', publicEventsRouter);

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return {
    BookingDomainError,
    createPendingBookingUseCase: vi.fn(),
    cancelPendingBookingUseCase: vi.fn().mockResolvedValue({}),
    requestCancellationByBuyerUseCase: vi.fn(),
    cancelSlotByPartnerUseCase: vi.fn(),
    cancelBookingForCanceledSlotUseCase: vi.fn(),
  };
});
vi.mock('../../../domain/payment', () => ({
  createMarketplacePaymentIntentUseCase: vi.fn(),
  processProviderRefundUseCase: vi.fn().mockResolvedValue({}),
}));

import {
  cancelBookingForCanceledSlotUseCase,
  cancelPendingBookingUseCase,
  cancelSlotByPartnerUseCase,
  createPendingBookingUseCase,
  requestCancellationByBuyerUseCase,
} from '../../../domain/bookings';
import {
  createMarketplacePaymentIntentUseCase,
  processProviderRefundUseCase,
} from '../../../domain/payment';
import { cancelBookingByBuyerApplicationUseCase } from './cancelBookingByBuyerApplicationUseCase';
import { cancelSlotByPartnerApplicationUseCase } from './cancelSlotByPartnerApplicationUseCase';
import { createBookingApplicationUseCase } from './createBookingApplicationUseCase';

const BOOKING = {
  id: 'bk_1',
  status: 'pending_payment',
  sellerPartnerId: 'p1',
  totalMinor: 20000,
  platformFeeMinor: 2000,
  expiresAt: '2026-11-01T12:15:00.000Z',
  paymentIntentId: 'pi_1',
  offerSnapshot: { title: 'Passeio' },
};
const INPUT = {
  offerId: 'offer-1',
  slotId: 'slot-1',
  lines: [{ priceOptionId: 'adult', quantity: 2 }],
  participants: [],
  idempotencyKey: 'key-12345',
  locale: 'pt-BR' as const,
};
const BUYER = { uid: 'buyer-1', admin: false, emailVerified: true };

describe('createBookingApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('e-mail não verificado → EMAIL_NOT_VERIFIED, sem reservar vaga', async () => {
    await expect(
      createBookingApplicationUseCase({ ...BUYER, emailVerified: false }, INPUT)
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED', statusCode: 403 });
    expect(createPendingBookingUseCase).not.toHaveBeenCalled();
  });

  it('cria o pagamento com chave idempotente derivada da reserva', async () => {
    vi.mocked(createPendingBookingUseCase).mockResolvedValue(BOOKING as never);
    vi.mocked(createMarketplacePaymentIntentUseCase).mockResolvedValue({
      clientSecret: 'secret',
    } as never);
    const result = await createBookingApplicationUseCase(BUYER, INPUT);
    expect(createMarketplacePaymentIntentUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        referenceType: 'booking',
        referenceId: 'bk_1',
        sellerPartnerId: 'p1',
        totalMinor: 20000,
        platformFeeMinor: 2000,
        idempotencyKey: 'pi_booking_bk_1',
      })
    );
    expect(result).toEqual({
      bookingId: 'bk_1',
      status: 'pending_payment',
      clientSecret: 'secret',
      totalMinor: 20000,
      expiresAt: '2026-11-01T12:15:00.000Z',
    });
  });

  it('falha ao criar o pagamento libera a vaga e repassa o erro', async () => {
    vi.mocked(createPendingBookingUseCase).mockResolvedValue(BOOKING as never);
    vi.mocked(createMarketplacePaymentIntentUseCase).mockRejectedValue(new Error('stripe down'));
    await expect(createBookingApplicationUseCase(BUYER, INPUT)).rejects.toThrow('stripe down');
    expect(cancelPendingBookingUseCase).toHaveBeenCalledWith('bk_1', 'payment_init_failed');
  });
});

describe('cancelBookingByBuyerApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('100% devolve também a taxa da plataforma', async () => {
    vi.mocked(requestCancellationByBuyerUseCase).mockResolvedValue({
      booking: { ...BOOKING, status: 'canceled' },
      refundPercent: 100,
      refundAmountMinor: 20000,
    } as never);
    await cancelBookingByBuyerApplicationUseCase({ uid: 'buyer-1', admin: false }, 'bk_1', '');
    expect(processProviderRefundUseCase).toHaveBeenCalledWith({
      paymentIntentId: 'pi_1',
      amountMinor: 20000,
      reverseTransfer: true,
      refundApplicationFee: true,
      idempotencyKey: 'refund_booking_bk_1',
      metadata: { referenceType: 'booking_refund', bookingId: 'bk_1' },
    });
  });

  it('50% não devolve a taxa', async () => {
    vi.mocked(requestCancellationByBuyerUseCase).mockResolvedValue({
      booking: { ...BOOKING, status: 'canceled' },
      refundPercent: 50,
      refundAmountMinor: 10000,
    } as never);
    await cancelBookingByBuyerApplicationUseCase({ uid: 'buyer-1', admin: false }, 'bk_1', '');
    expect(processProviderRefundUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ amountMinor: 10000, refundApplicationFee: false })
    );
  });

  it('0% não chama o Stripe', async () => {
    vi.mocked(requestCancellationByBuyerUseCase).mockResolvedValue({
      booking: { ...BOOKING, status: 'canceled' },
      refundPercent: 0,
      refundAmountMinor: 0,
    } as never);
    await expect(
      cancelBookingByBuyerApplicationUseCase({ uid: 'buyer-1', admin: false }, 'bk_1', '')
    ).resolves.toEqual({ status: 'canceled', refundPercent: 0, refundAmountMinor: 0 });
    expect(processProviderRefundUseCase).not.toHaveBeenCalled();
  });
});

describe('cancelSlotByPartnerApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reembolsa por inteiro as reservas pagas e conta as falhas', async () => {
    vi.mocked(cancelSlotByPartnerUseCase).mockResolvedValue([
      { id: 'bk_1' },
      { id: 'bk_2' },
      { id: 'bk_3' },
    ] as never);
    vi.mocked(cancelBookingForCanceledSlotUseCase)
      .mockResolvedValueOnce({
        id: 'bk_1',
        paymentIntentId: 'pi_1',
        cancellation: { refundAmountMinor: 20000 },
      } as never)
      .mockResolvedValueOnce({ id: 'bk_2', cancellation: { refundAmountMinor: 0 } } as never)
      .mockResolvedValueOnce({
        id: 'bk_3',
        paymentIntentId: 'pi_3',
        cancellation: { refundAmountMinor: 5000 },
      } as never);
    vi.mocked(processProviderRefundUseCase)
      .mockResolvedValueOnce({} as never)
      .mockRejectedValueOnce(new Error('stripe down'));
    const result = await cancelSlotByPartnerApplicationUseCase(
      { uid: 'p1', admin: false },
      'offer-1',
      'slot-1'
    );
    expect(result).toEqual({ canceledBookings: 3, refundsRequested: 1, failedRefunds: 1 });
    expect(processProviderRefundUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntentId: 'pi_1',
        refundApplicationFee: true,
        reverseTransfer: true,
        idempotencyKey: 'refund_slot_bk_1',
      })
    );
  });
});

=== server/application/usecases/bookings/cancelBookingByBuyerApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { type BookingActor, requestCancellationByBuyerUseCase } from '../../../domain/bookings';
import { processProviderRefundUseCase } from '../../../domain/payment';

/**
 * Cancela pela política exibida antes da compra. O reembolso usa chave idempotente, então repetir a
 * chamada depois de uma falha no Stripe não devolve duas vezes. A reserva vira `refunded` no webhook.
 */
export async function cancelBookingByBuyerApplicationUseCase(
  actor: BookingActor,
  bookingId: string,
  reason: string
): Promise<{ status: string; refundPercent: number; refundAmountMinor: number }> {
  const result = await requestCancellationByBuyerUseCase(actor, bookingId, reason);
  if (result.refundAmountMinor > 0 && result.booking.paymentIntentId) {
    await processProviderRefundUseCase({
      paymentIntentId: result.booking.paymentIntentId,
      amountMinor: result.refundAmountMinor,
      reverseTransfer: true,
      // Taxa da plataforma só volta no reembolso integral (cancelamento dentro do prazo gratuito).
      refundApplicationFee: result.refundPercent === 100,
      idempotencyKey: `refund_booking_${bookingId}`,
      metadata: { referenceType: 'booking_refund', bookingId },
    });
  }
  return {
    status: result.booking.status,
    refundPercent: result.refundPercent,
    refundAmountMinor: result.refundAmountMinor,
  };
}

=== server/application/usecases/bookings/cancelSlotByPartnerApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type BookingActor,
  cancelBookingForCanceledSlotUseCase,
  cancelSlotByPartnerUseCase,
} from '../../../domain/bookings';
import { processProviderRefundUseCase } from '../../../domain/payment';

/**
 * Horário cancelado pelo parceiro: toda reserva paga é reembolsada por inteiro, com a taxa e o repasse
 * devolvidos (AGENTS.md §8.7). Repetir a chamada só refaz o que falhou (chaves idempotentes).
 */
export async function cancelSlotByPartnerApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string
): Promise<{ canceledBookings: number; refundsRequested: number; failedRefunds: number }> {
  const affected = await cancelSlotByPartnerUseCase(actor, offerId, slotId);
  let refundsRequested = 0;
  let failedRefunds = 0;
  for (const booking of affected) {
    const canceled = await cancelBookingForCanceledSlotUseCase(booking.id, actor.uid);
    const refundAmountMinor = canceled.cancellation?.refundAmountMinor ?? 0;
    if (refundAmountMinor <= 0 || !canceled.paymentIntentId) continue;
    try {
      await processProviderRefundUseCase({
        paymentIntentId: canceled.paymentIntentId,
        amountMinor: refundAmountMinor,
        reverseTransfer: true,
        refundApplicationFee: true,
        idempotencyKey: `refund_slot_${canceled.id}`,
        metadata: { referenceType: 'booking_refund', bookingId: canceled.id },
      });
      refundsRequested += 1;
    } catch (error) {
      failedRefunds += 1;
      console.error('[cancelSlotByPartnerApplicationUseCase] refund failed', {
        bookingId: canceled.id,
        message: error instanceof Error ? error.message : 'unknown',
      });
    }
  }
  // TODO: avisar os compradores quando notifications aceitar destinatário usuário (débito B13).
  return { canceledBookings: affected.length, refundsRequested, failedRefunds };
}

=== server/application/usecases/bookings/createBookingApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  BookingDomainError,
  type CreatePendingBookingInput,
  cancelPendingBookingUseCase,
  createPendingBookingUseCase,
} from '../../../domain/bookings';
import { createMarketplacePaymentIntentUseCase } from '../../../domain/payment';

export interface BookingBuyer {
  uid: string;
  admin: boolean;
  emailVerified: boolean;
}

export interface CreateBookingResult {
  bookingId: string;
  status: string;
  clientSecret: string;
  totalMinor: number;
  expiresAt: string | null;
}

/** Reserva as vagas e cria o pagamento (destination charge). Quem confirma é o webhook. */
export async function createBookingApplicationUseCase(
  buyer: BookingBuyer,
  input: CreatePendingBookingInput
): Promise<CreateBookingResult> {
  // AGENTS.md §7.10 A07: e-mail verificado antes de comprar.
  if (!buyer.emailVerified) {
    throw new BookingDomainError('EMAIL_NOT_VERIFIED', 'Confirme seu e-mail antes de reservar.');
  }
  const platformFeePercent = Number(process.env.USE_GUIDE_PLATFORM_FEE_PERCENT ?? 10);
  const booking = await createPendingBookingUseCase(
    { uid: buyer.uid, admin: buyer.admin },
    input,
    platformFeePercent
  );

  try {
    const payment = await createMarketplacePaymentIntentUseCase({
      referenceType: 'booking',
      referenceId: booking.id,
      buyerId: buyer.uid,
      sellerPartnerId: booking.sellerPartnerId,
      description: `Use Guide — ${booking.offerSnapshot.title}`,
      totalMinor: booking.totalMinor,
      platformFeeMinor: booking.platformFeeMinor,
      idempotencyKey: `pi_booking_${booking.id}`,
    });
    return {
      bookingId: booking.id,
      status: booking.status,
      clientSecret: payment.clientSecret,
      totalMinor: booking.totalMinor,
      expiresAt: booking.expiresAt,
    };
  } catch (error) {
    // Sem pagamento criado, a vaga não pode ficar presa por 15 minutos.
    if (booking.status === 'pending_payment') {
      await cancelPendingBookingUseCase(booking.id, 'payment_init_failed').catch(() => undefined);
    }
    throw error;
  }
}

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return {
    BookingDomainError,
    confirmBookingPaymentUseCase: vi.fn(),
    getBookingUseCase: vi.fn(),
    markBookingDisputedUseCase: vi.fn().mockResolvedValue({}),
    markBookingPaymentFailedUseCase: vi.fn().mockResolvedValue(undefined),
    markBookingRefundedUseCase: vi.fn().mockResolvedValue({}),
  };
});
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../../domain/payment', () => ({
  getPaymentReferenceUseCase: vi.fn(),
  processProviderRefundUseCase: vi.fn().mockResolvedValue({}),
  updatePaymentTransactionStatusUseCase: vi.fn().mockResolvedValue(undefined),
}));

import {
  BookingDomainError,
  confirmBookingPaymentUseCase,
  getBookingUseCase,
  markBookingDisputedUseCase,
  markBookingRefundedUseCase,
} from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import { getPaymentReferenceUseCase, processProviderRefundUseCase } from '../../../domain/payment';
import { reconcileBookingWebhookApplicationUseCase } from './reconcileBookingWebhookApplicationUseCase';

function event(type: string, dataObject: Record<string, unknown>) {
  return { id: 'evt_1', type, created: 0, dataObject };
}

const SUCCEEDED = event('payment_intent.succeeded', {
  id: 'pi_1',
  metadata: { referenceType: 'booking', referenceId: 'bk_1', partnerId: 'p1' },
});

describe('reconcileBookingWebhookApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pagamento aprovado confirma a reserva e avisa o parceiro', async () => {
    vi.mocked(confirmBookingPaymentUseCase).mockResolvedValue({
      sellerPartnerId: 'p1',
      participantsCount: 2,
      offerSnapshot: { title: 'Passeio' },
    } as never);
    await expect(reconcileBookingWebhookApplicationUseCase(SUCCEEDED)).resolves.toBe(true);
    expect(confirmBookingPaymentUseCase).toHaveBeenCalledWith('bk_1', 'pi_1');
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientPartnerId: 'p1' })
    );
  });

  it('pagamento tardio sem vaga é reembolsado por inteiro', async () => {
    vi.mocked(confirmBookingPaymentUseCase).mockRejectedValue(
      new BookingDomainError('LATE_PAYMENT_REJECTED', 'x')
    );
    await reconcileBookingWebhookApplicationUseCase(SUCCEEDED);
    expect(processProviderRefundUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntentId: 'pi_1',
        refundApplicationFee: true,
        reverseTransfer: true,
        idempotencyKey: 'refund_late_bk_1',
      })
    );
  });

  it('erro inesperado sobe para o webhook responder 5xx', async () => {
    vi.mocked(confirmBookingPaymentUseCase).mockRejectedValue(new Error('firestore down'));
    await expect(reconcileBookingWebhookApplicationUseCase(SUCCEEDED)).rejects.toThrow(
      'firestore down'
    );
  });

  it('reembolso pendente não marca a reserva como reembolsada', async () => {
    const pending = event('refund.updated', {
      status: 'pending',
      metadata: { referenceType: 'booking_refund', bookingId: 'bk_1' },
    });
    await expect(reconcileBookingWebhookApplicationUseCase(pending)).resolves.toBe(true);
    expect(markBookingRefundedUseCase).not.toHaveBeenCalled();
  });

  it('reembolso aprovado marca só reserva cancelada', async () => {
    const succeeded = event('refund.updated', {
      status: 'succeeded',
      metadata: { referenceType: 'booking_refund', bookingId: 'bk_1' },
    });
    vi.mocked(getBookingUseCase).mockResolvedValueOnce({ status: 'canceled' } as never);
    await reconcileBookingWebhookApplicationUseCase(succeeded);
    expect(markBookingRefundedUseCase).toHaveBeenCalledWith('bk_1');
    vi.mocked(getBookingUseCase).mockResolvedValueOnce({ status: 'expired' } as never);
    await reconcileBookingWebhookApplicationUseCase(succeeded);
    expect(markBookingRefundedUseCase).toHaveBeenCalledTimes(1);
  });

  it('disputa usa a referência gravada na transação', async () => {
    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
      referenceType: 'booking',
      referenceId: 'bk_1',
    });
    await expect(
      reconcileBookingWebhookApplicationUseCase(
        event('charge.dispute.created', { payment_intent: 'pi_1' })
      )
    ).resolves.toBe(true);
    expect(markBookingDisputedUseCase).toHaveBeenCalledWith('bk_1');
  });

  it('eventos que não são de reserva seguem para o fluxo de ingressos', async () => {
    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
      referenceType: 'ticket_order',
      referenceId: 'o1',
    });
    await expect(
      reconcileBookingWebhookApplicationUseCase(
        event('payment_intent.succeeded', {
          id: 'pi_2',
          metadata: { referenceType: 'ticket_order' },
        })
      )
    ).resolves.toBe(false);
    await expect(
      reconcileBookingWebhookApplicationUseCase(
        event('charge.dispute.created', { payment_intent: 'pi_2' })
      )
    ).resolves.toBe(false);
    await expect(
      reconcileBookingWebhookApplicationUseCase(
        event('refund.updated', { metadata: { refundId: 'r1' } })
      )
    ).resolves.toBe(false);
  });
});

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  BookingDomainError,
  confirmBookingPaymentUseCase,
  getBookingUseCase,
  markBookingDisputedUseCase,
  markBookingPaymentFailedUseCase,
  markBookingRefundedUseCase,
} from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  getPaymentReferenceUseCase,
  processProviderRefundUseCase,
  updatePaymentTransactionStatusUseCase,
  type VerifiedWebhookEvent,
} from '../../../domain/payment';

function readMetadata(obj: Record<string, unknown>): Record<string, string> {
  return (obj.metadata as Record<string, string> | undefined) ?? {};
}

async function handlePaymentSucceeded(paymentIntentId: string, bookingId: string): Promise<void> {
  await updatePaymentTransactionStatusUseCase(paymentIntentId, 'succeeded');
  try {
    const booking = await confirmBookingPaymentUseCase(bookingId, paymentIntentId);
    await createNotificationUseCase({
      recipientPartnerId: booking.sellerPartnerId,
      type: 'admin_message',
      title: 'Nova reserva confirmada',
      message: `${booking.offerSnapshot.title} — ${booking.participantsCount} participante(s).`,
    }).catch(() => undefined);
  } catch (error) {
    if (!(error instanceof BookingDomainError) || error.code !== 'LATE_PAYMENT_REJECTED') {
      throw error;
    }
    // Pagamento chegou para uma reserva expirada sem vaga ou já cancelada: devolve tudo.
    await processProviderRefundUseCase({
      paymentIntentId,
      reverseTransfer: true,
      refundApplicationFee: true,
      idempotencyKey: `refund_late_${bookingId}`,
      metadata: { referenceType: 'booking_refund', bookingId },
    });
  }
}

async function handleRefundUpdate(bookingId: string, providerStatus: string): Promise<void> {
  if (providerStatus === 'succeeded') {
    const booking = await getBookingUseCase(bookingId);
    // Só a reserva cancelada vira "reembolsada"; o reembolso de pagamento tardio não muda o status.
    if (booking?.status === 'canceled') {
      await markBookingRefundedUseCase(bookingId);
    }
    return;
  }
  if (providerStatus === 'failed' || providerStatus === 'canceled') {
    // TODO: notificar admin quando notifications tiver destinatário admin (débito B13).
    console.error('[reconcileBookingWebhook] refund failed', { bookingId, providerStatus });
  }
  // 'pending' e 'requires_action' não são reembolso aprovado (AGENTS.md §8.6 item 6).
}

/** Trata os eventos do Stripe de reservas. Devolve false quando o evento não é de reserva. */
export async function reconcileBookingWebhookApplicationUseCase(
  event: VerifiedWebhookEvent
): Promise<boolean> {
  const obj = event.dataObject || {};
  const metadata = readMetadata(obj);

  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
    if (metadata.referenceType !== 'booking' || !metadata.referenceId) return false;
    const paymentIntentId = String(obj.id || '');
    if (event.type === 'payment_intent.succeeded') {
      await handlePaymentSucceeded(paymentIntentId, metadata.referenceId);
    } else {
      await updatePaymentTransactionStatusUseCase(paymentIntentId, 'failed');
      await markBookingPaymentFailedUseCase(metadata.referenceId);
    }
    return true;
  }

  if (event.type === 'refund.updated' || event.type === 'refund.created') {
    if (metadata.referenceType !== 'booking_refund' || !metadata.bookingId) return false;
    await handleRefundUpdate(metadata.bookingId, String(obj.status || ''));
    return true;
  }

  if (event.type === 'charge.dispute.created') {
    const paymentIntentId = String(obj.payment_intent || '');
    // O objeto Dispute não traz a metadata do pagamento; a referência vem da transação gravada.
    const reference = paymentIntentId ? await getPaymentReferenceUseCase(paymentIntentId) : null;
    if (reference?.referenceType !== 'booking') return false;
    await updatePaymentTransactionStatusUseCase(paymentIntentId, 'disputed');
    await markBookingDisputedUseCase(reference.referenceId).catch((error: unknown) => {
      if (!(error instanceof BookingDomainError)) throw error;
    });
    return true;
  }

  return false;
}

=== server/application/usecases/ticketingPaymentOrchestrationUseCases.ts — diff ===
@@ -22,6 +22,7 @@ import {
   type TicketOrder,
 } from '../../domain/ticketing';
 import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';
+import { reconcileBookingWebhookApplicationUseCase } from './bookings/reconcileBookingWebhookApplicationUseCase';
 import {
   PLAN_SUBSCRIPTION_WEBHOOK_EVENTS,
   reconcilePlanSubscriptionWebhookApplicationUseCase,
@@ -181,6 +182,10 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
 ): Promise<{ processed: boolean; eventType: string }> {
   const obj = event.dataObject || {};
 
+  if (await reconcileBookingWebhookApplicationUseCase(event)) {
+    return { processed: true, eventType: event.type };
+  }
+
   if (event.type === 'account.updated') {
     const stripeAccountId = String(obj.id || event.account || '');
     if (stripeAccountId) {

=== server/domain/bookings/errors/bookingDomainError.ts — diff ===
@@ -1,6 +1,7 @@
 export type BookingErrorCode =
   | 'VALIDATION_ERROR'
   | 'FORBIDDEN'
+  | 'EMAIL_NOT_VERIFIED'
   | 'NOT_FOUND'
   | 'SLOT_UNAVAILABLE'
   | 'INSUFFICIENT_CAPACITY'
@@ -12,6 +13,7 @@ export type BookingErrorCode =
 const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   VALIDATION_ERROR: 400,
   FORBIDDEN: 403,
+  EMAIL_NOT_VERIFIED: 403,
   NOT_FOUND: 404,
   SLOT_UNAVAILABLE: 409,
   INSUFFICIENT_CAPACITY: 409,

=== server/domain/bookings/index.ts — diff ===
@@ -1,4 +1,5 @@
 export { cancelBookingForCanceledSlotUseCase } from './usecases/cancelBookingForCanceledSlotUseCase';
+export { cancelPendingBookingUseCase } from './usecases/cancelPendingBookingUseCase';
 export { cancelSlotByPartnerUseCase } from './usecases/cancelSlotByPartnerUseCase';
 export { completeFinishedBookingsUseCase } from './usecases/completeFinishedBookingsUseCase';
 export { confirmBookingPaymentUseCase } from './usecases/confirmBookingPaymentUseCase';
@@ -11,6 +12,7 @@ export { getBookingUseCase } from './usecases/getBookingUseCase';
 export { listAvailableSlotsUseCase } from './usecases/listAvailableSlotsUseCase';
 export { listMyBookingsUseCase } from './usecases/listMyBookingsUseCase';
 export { listOfferBookingsForPartnerUseCase } from './usecases/listOfferBookingsForPartnerUseCase';
+export { listOfferSlotsForPartnerUseCase } from './usecases/listOfferSlotsForPartnerUseCase';
 export { listPartnerOffersUseCase } from './usecases/listPartnerOffersUseCase';
 export { markBookingDisputedUseCase } from './usecases/markBookingDisputedUseCase';
 export { markBookingNoShowUseCase } from './usecases/markBookingNoShowUseCase';

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -197,12 +197,25 @@ export class BookingService {
     return { booking: updated, ...refund };
   }
 
+  /** Desfaz a reserva pendente quando o pagamento nem chegou a ser criado. */
+  async cancelPendingBooking(bookingId: string, reason: string): Promise<Booking> {
+    return this.port.releaseCapacityAndSetStatus({
+      bookingId,
+      to: 'canceled',
+      actorUid: SYSTEM_ACTOR,
+      reason,
+    });
+  }
+
   /** Cancela uma reserva do horário cancelado pelo parceiro: reembolso sempre integral. */
   async cancelBookingForCanceledSlot(bookingId: string, actorUid: string): Promise<Booking> {
     const booking = await this.port.getBooking(bookingId);
     if (!booking) {
       throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
     }
+    if (booking.status === 'canceled') {
+      return booking;
+    }
     return this.port.releaseCapacityAndSetStatus({
       bookingId,
       to: 'canceled',

=== server/domain/bookings/services/offerService.ts — diff ===
@@ -235,11 +235,26 @@ export class OfferService {
       await this.port.setSlotStatus(slotId, 'canceled');
     }
     const bookings = await this.port.listBookingsBySlot(slotId);
+    // As já canceladas pelo parceiro voltam na lista para que um reembolso que falhou possa ser repetido.
     return bookings.filter(
-      (booking) => booking.status === 'confirmed' || booking.status === 'pending_payment'
+      (booking) =>
+        booking.status === 'confirmed' ||
+        booking.status === 'pending_payment' ||
+        (booking.status === 'canceled' && booking.cancellation?.by === 'partner')
     );
   }
 
+  /** Visão do parceiro: inclui vagas reservadas e vendidas e horários fechados ou cancelados. */
+  async listOfferSlotsForOwner(
+    actor: BookingActor,
+    offerId: string,
+    fromIso: string,
+    toIso: string
+  ): Promise<AvailabilitySlot[]> {
+    await this.getOwnedOffer(actor, offerId);
+    return this.port.listSlots(offerId, fromIso, toIso);
+  }
+
   async getOwnedOffer(actor: BookingActor, offerId: string): Promise<BookableOffer> {
     const offer = await this.port.getOffer(offerId);
     // Oferta de outro parceiro responde como inexistente: não revela que o ID existe.

=== server/domain/bookings/usecases/cancelPendingBookingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

export async function cancelPendingBookingUseCase(
  bookingId: string,
  reason: string
): Promise<Booking> {
  return getBookingService().cancelPendingBooking(bookingId, reason);
}

=== server/domain/bookings/usecases/listOfferSlotsForPartnerUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOfferService } from '../factory';
import type { AvailabilitySlot, BookingActor } from '../types/bookingTypes';

export async function listOfferSlotsForPartnerUseCase(
  actor: BookingActor,
  offerId: string,
  fromIso: string,
  toIso: string
): Promise<AvailabilitySlot[]> {
  return getOfferService().listOfferSlotsForOwner(actor, offerId, fromIso, toIso);
}

=== server/domain/payment/adapters/firebaseAdminTransactionAdapter.ts — diff ===
@@ -15,9 +15,7 @@ function mapDocToTransactionRecord(
     id,
     userId: typeof data.userId === 'string' ? data.userId : null,
     referenceType:
-      data.referenceType === 'ticket_order' || data.referenceType === 'plan_payment'
-        ? data.referenceType
-        : undefined,
+      typeof data.referenceType === 'string' && data.referenceType ? data.referenceType : undefined,
     referenceId: typeof data.referenceId === 'string' ? data.referenceId : null,
     providerPaymentId:
       typeof data.providerPaymentId === 'string' ? data.providerPaymentId : null,
@@ -151,7 +149,7 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
     transactionId: string;
     idempotencyKey: string;
     userId: string;
-    referenceType: 'ticket_order' | 'plan_payment';
+    referenceType: string;
     referenceId: string;
     providerPaymentId: string;
     connectedAccountId?: string;

=== server/domain/payment/index.ts — diff ===
@@ -18,6 +18,8 @@ export {
   syncConnectedAccountFromWebhookUseCase,
 } from './usecases/marketplaceConnectUseCases';
 
+export { createMarketplacePaymentIntentUseCase } from './usecases/createMarketplacePaymentIntentUseCase';
+export { getPaymentReferenceUseCase } from './usecases/getPaymentReferenceUseCase';
 export { createBillingPortalSessionUseCase } from './usecases/billing/createBillingPortalSessionUseCase';
 export { getPartnerPlanSubscriptionUseCase } from './usecases/billing/getPartnerPlanSubscriptionUseCase';
 export { setPlanSubscriptionCancelAtPeriodEndUseCase } from './usecases/billing/setPlanSubscriptionCancelAtPeriodEndUseCase';

=== server/domain/payment/ports/paymentGatewayPort.ts — diff ===
@@ -21,7 +21,8 @@ export type PaymentReference =
 
 export interface PaymentTransaction {
   id: string;
-  referenceType: 'ticket_order' | 'plan_payment';
+  /** Quem vendeu o quê (ex: 'ticket_order', 'booking'); o payment não interpreta o valor. */
+  referenceType: string;
   referenceId: string;
   provider: 'stripe';
   providerPaymentId: string;

=== server/domain/payment/ports/transactionRepositoryPort.ts — diff ===
@@ -4,7 +4,7 @@ import type { PaymentStatus, PaymentTransaction } from './paymentGatewayPort';
 export interface TransactionRecord {
   id: string;
   userId: string | null;
-  referenceType?: 'ticket_order' | 'plan_payment';
+  referenceType?: string;
   referenceId?: string | null;
   providerPaymentId?: string | null;
   connectedAccountId?: string | null;
@@ -34,7 +34,7 @@ export interface TransactionRepositoryPort {
     transactionId: string;
     idempotencyKey: string;
     userId: string;
-    referenceType: 'ticket_order' | 'plan_payment';
+    referenceType: string;
     referenceId: string;
     providerPaymentId: string;
     connectedAccountId?: string;

=== server/domain/payment/services/stripePaymentService.marketplace.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it, vi } from 'vitest';
import type { MarketplaceAccountPort } from '../ports/marketplaceAccountPort';
import type { PaymentGatewayPort } from '../ports/paymentGatewayPort';
import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';
import { StripePaymentService } from './stripePaymentService';

function setup(existingTx: unknown = null) {
  const gateway = {
    createPaymentIntent: vi.fn().mockResolvedValue({
      paymentIntentId: 'pi_1',
      clientSecret: 'secret_1',
      status: 'pending',
    }),
  } as unknown as PaymentGatewayPort;
  const account = {
    getAccountStatus: vi.fn().mockResolvedValue({
      accountId: 'acct_1',
      status: 'enabled',
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
      requirementsCurrentlyDue: [],
      requirementsPastDue: [],
    }),
  } as unknown as MarketplaceAccountPort;
  const repo = {
    getTransactionByIdempotencyKey: vi.fn().mockResolvedValue(existingTx),
    getConnectedAccountRecord: vi
      .fn()
      .mockResolvedValue({ partnerId: 'p1', stripeAccountId: 'acct_1', createdAt: '' }),
    saveConnectedAccountRecord: vi.fn().mockResolvedValue(undefined),
    saveTransactionRecord: vi.fn().mockResolvedValue({ id: 'pi_1' }),
    getTransaction: vi
      .fn()
      .mockResolvedValue({ id: 'pi_1', referenceType: 'booking', referenceId: 'bk_1' }),
  } as unknown as TransactionRepositoryPort;
  return { service: new StripePaymentService(gateway, account, repo), gateway, repo };
}

const PARAMS = {
  referenceType: 'booking',
  referenceId: 'bk_1',
  buyerId: 'buyer-1',
  sellerPartnerId: 'p1',
  description: 'Use Guide — Passeio',
  totalMinor: 20000,
  platformFeeMinor: 2000,
  idempotencyKey: 'pi_booking_bk_1',
};

describe('StripePaymentService — vendas de marketplace', () => {
  it('cria destination charge com taxa e metadata só com IDs', async () => {
    const { service, gateway, repo } = setup();
    const result = await service.createMarketplacePaymentIntent(PARAMS);
    expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinor: 20000,
        applicationFeeMinor: 2000,
        connectedAccountId: 'acct_1',
        idempotencyKey: 'pi_booking_bk_1',
        metadata: { referenceType: 'booking', referenceId: 'bk_1', partnerId: 'p1' },
      })
    );
    expect(repo.saveTransactionRecord).toHaveBeenCalledWith(
      expect.objectContaining({ referenceType: 'booking', referenceId: 'bk_1' })
    );
    expect(result).toMatchObject({ paymentIntentId: 'pi_1', clientSecret: 'secret_1' });
  });

  it('mesma chave de idempotência devolve o pagamento já criado sem chamar o Stripe', async () => {
    const { service, gateway } = setup({
      id: 'pi_1',
      providerPaymentId: 'pi_1',
      status: 'pending',
      paymentDetail: { clientSecret: 'secret_1' },
    });
    await expect(service.createMarketplacePaymentIntent(PARAMS)).resolves.toMatchObject({
      clientSecret: 'secret_1',
    });
    expect(gateway.createPaymentIntent).not.toHaveBeenCalled();
  });

  it('pedido de ingresso mantém a metadata do ingresso', async () => {
    const { service, gateway } = setup();
    await service.createTicketOrderPaymentIntent({
      orderId: 'order-1',
      buyerId: 'buyer-1',
      sellerPartnerId: 'p1',
      eventListingId: 'event-1',
      occurrenceId: 'occ-1',
      eventTitle: 'Show',
      totalMinor: 5000,
      platformFeeMinor: 500,
      idempotencyKey: 'pi_order_order-1',
    });
    expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Use Guide — Show',
        metadata: {
          referenceType: 'ticket_order',
          referenceId: 'order-1',
          orderId: 'order-1',
          ticketOrderId: 'order-1',
          eventListingId: 'event-1',
          occurrenceId: 'occ-1',
          partnerId: 'p1',
        },
      })
    );
  });

  it('referência do pagamento vem da transação gravada', async () => {
    const { service } = setup();
    await expect(service.getPaymentReference('pi_1')).resolves.toEqual({
      referenceType: 'booking',
      referenceId: 'bk_1',
    });
  });
});

=== server/domain/payment/services/stripePaymentService.ts — diff ===
@@ -199,13 +199,63 @@ export class StripePaymentService {
     platformFeeMinor: number;
     idempotencyKey: string;
   }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
-    const existingTx =
-      await this.transactionRepo.getTransactionByIdempotencyKey(
-        params.idempotencyKey
-      );
+    return this.createDestinationChargeIntent({
+      referenceType: 'ticket_order',
+      referenceId: params.orderId,
+      buyerId: params.buyerId,
+      sellerPartnerId: params.sellerPartnerId,
+      description: `Use Guide — ${params.eventTitle}`,
+      totalMinor: params.totalMinor,
+      platformFeeMinor: params.platformFeeMinor,
+      idempotencyKey: params.idempotencyKey,
+      extraMetadata: {
+        orderId: params.orderId,
+        ticketOrderId: params.orderId,
+        eventListingId: params.eventListingId,
+        occurrenceId: params.occurrenceId,
+      },
+    });
+  }
+
+  /** Venda de marketplace genérica (destination charge, decisão D1); o chamador define a referência. */
+  async createMarketplacePaymentIntent(params: {
+    referenceType: string;
+    referenceId: string;
+    buyerId: string;
+    sellerPartnerId: string;
+    description: string;
+    totalMinor: number;
+    platformFeeMinor: number;
+    idempotencyKey: string;
+  }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
+    return this.createDestinationChargeIntent({ ...params, extraMetadata: {} });
+  }
+
+  /** Referência gravada na criação do pagamento (o objeto Dispute do Stripe não traz a metadata). */
+  async getPaymentReference(
+    paymentIntentId: string
+  ): Promise<{ referenceType: string; referenceId: string } | null> {
+    const record = await this.transactionRepo.getTransaction(paymentIntentId);
+    if (!record?.referenceType || !record.referenceId) return null;
+    return { referenceType: record.referenceType, referenceId: record.referenceId };
+  }
+
+  private async createDestinationChargeIntent(params: {
+    referenceType: string;
+    referenceId: string;
+    buyerId: string;
+    sellerPartnerId: string;
+    description: string;
+    totalMinor: number;
+    platformFeeMinor: number;
+    idempotencyKey: string;
+    extraMetadata: Record<string, string>;
+  }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
+    const existingTx = await this.transactionRepo.getTransactionByIdempotencyKey(
+      params.idempotencyKey
+    );
     if (
-      existingTx &&
-      existingTx.providerPaymentId &&
+      existingTx?.providerPaymentId &&
       existingTx.paymentDetail &&
       typeof existingTx.paymentDetail.clientSecret === 'string'
     ) {
@@ -217,24 +267,20 @@ export class StripePaymentService {
       };
     }
 
-    const sellerAccount = await this.assertPartnerReadyForPaidEvent(
-      params.sellerPartnerId
-    );
+    const sellerAccount = await this.assertPartnerReadyForPaidEvent(params.sellerPartnerId);
 
     const result = await this.paymentGateway.createPaymentIntent({
-      orderId: params.orderId,
+      orderId: params.referenceId,
       amountMinor: params.totalMinor,
       currency: 'BRL',
-      description: `Use Guide — ${params.eventTitle}`,
+      description: params.description,
       connectedAccountId: sellerAccount.stripeAccountId,
       applicationFeeMinor: params.platformFeeMinor,
       paymentMethodTypes: ['card', 'pix'],
       metadata: {
-        referenceType: 'ticket_order',
-        orderId: params.orderId,
-        ticketOrderId: params.orderId,
-        eventListingId: params.eventListingId,
-        occurrenceId: params.occurrenceId,
+        referenceType: params.referenceType,
+        referenceId: params.referenceId,
+        ...params.extraMetadata,
         partnerId: params.sellerPartnerId,
       },
       idempotencyKey: params.idempotencyKey,
@@ -244,8 +290,8 @@ export class StripePaymentService {
       transactionId: result.paymentIntentId,
       idempotencyKey: params.idempotencyKey,
       userId: params.buyerId,
-      referenceType: 'ticket_order',
-      referenceId: params.orderId,
+      referenceType: params.referenceType,
+      referenceId: params.referenceId,
       providerPaymentId: result.paymentIntentId,
       connectedAccountId: sellerAccount.stripeAccountId,
       amountMinor: params.totalMinor,
@@ -255,7 +301,7 @@ export class StripePaymentService {
       paymentResult: {
         paymentIntentId: result.paymentIntentId,
         clientSecret: result.clientSecret,
-        orderId: params.orderId,
+        referenceId: params.referenceId,
         partnerId: params.sellerPartnerId,
       },
     });

=== server/domain/payment/usecases/createMarketplacePaymentIntentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';
import type { CreatePaymentIntentResult } from '../ports/paymentGatewayPort';

/** Destination charge para qualquer venda de parceiro; `referenceType`/`referenceId` vão na metadata. */
export async function createMarketplacePaymentIntentUseCase(params: {
  referenceType: string;
  referenceId: string;
  buyerId: string;
  sellerPartnerId: string;
  description: string;
  totalMinor: number;
  platformFeeMinor: number;
  idempotencyKey: string;
}): Promise<CreatePaymentIntentResult & { transactionId: string }> {
  return stripePaymentService.createMarketplacePaymentIntent(params);
}

=== server/domain/payment/usecases/getPaymentReferenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { stripePaymentService } from '../factory';

export async function getPaymentReferenceUseCase(
  paymentIntentId: string
): Promise<{ referenceType: string; referenceId: string } | null> {
  return stripePaymentService.getPaymentReference(paymentIntentId);
}

=== server/domain/ticketing/controllers/ticketingController.ts — diff ===
@@ -1,4 +1,4 @@
-import { randomUUID, timingSafeEqual } from 'crypto';
+import { randomUUID } from 'crypto';
 import { Request, Response } from 'express';
 import {
   confirmTicketOrderPaymentClientReturnApplicationUseCase,
@@ -219,21 +219,9 @@ export class TicketingController {
     }
   }
 
-  static async expireOrdersInternalJob(req: Request, res: Response) {
+  // A chave do job é verificada antes, pelo middleware verifyInternalJobKey.
+  static async expireOrdersInternalJob(_req: Request, res: Response) {
     try {
-      const configuredKey = process.env.TICKETING_EXPIRATION_JOB_KEY;
-      if (!configuredKey) {
-        return res.status(503).json({ error: 'TICKETING_EXPIRATION_JOB_KEY não configurada.' });
-      }
-      const providedKey = String(req.headers['x-internal-job-key'] || '');
-      const configuredBuf = Buffer.from(configuredKey, 'utf8');
-      const providedBuf = Buffer.from(providedKey, 'utf8');
-      if (
-        configuredBuf.length !== providedBuf.length ||
-        !timingSafeEqual(configuredBuf, providedBuf)
-      ) {
-        return res.status(401).json({ error: 'Chave de job interno inválida.' });
-      }
       const result = await expireAllOverdueOrdersUseCase();
       return res.status(200).json({ status: 'success', ...result });
     } catch (error) {

=== server/domain/ticketing/routes/ticketingRoutes.ts — diff ===
@@ -52,7 +52,6 @@ router.post(
 router.post('/orders/:id/expire', verifyAuthToken, TicketingController.expireOrder);
 router.post('/orders/:id/refund', verifyAuthToken, TicketingController.requestRefund);
 
-router.post('/internal/expire-orders', TicketingController.expireOrdersInternalJob);
 
 router.get('/tickets', verifyAuthToken, TicketingController.listUserTickets);
 router.get('/tickets/:id/qr', verifyAuthToken, TicketingController.getTicketQrToken);

=== server/infrastructure/auth/internalJobAuth.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyInternalJobKey } from './internalJobAuth';

function run(headerValue?: string) {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const next = vi.fn() as NextFunction;
  const req = { headers: headerValue ? { 'x-internal-job-key': headerValue } : {} } as Request;
  verifyInternalJobKey(req, { status } as unknown as Response, next);
  return { status, next };
}

describe('verifyInternalJobKey', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('503 sem chave configurada', () => {
    vi.stubEnv('INTERNAL_JOB_KEY', '');
    expect(run('qualquer').status).toHaveBeenCalledWith(503);
  });

  it('401 com chave errada ou de tamanho diferente', () => {
    vi.stubEnv('INTERNAL_JOB_KEY', 'a'.repeat(32));
    expect(run('b'.repeat(32)).status).toHaveBeenCalledWith(401);
    expect(run('a').status).toHaveBeenCalledWith(401);
    expect(run().status).toHaveBeenCalledWith(401);
  });

  it('segue com a chave correta', () => {
    vi.stubEnv('INTERNAL_JOB_KEY', 'a'.repeat(32));
    const { next, status } = run('a'.repeat(32));
    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });
});

=== server/infrastructure/auth/internalJobAuth.ts — ARQUIVO NOVO, conteúdo completo ===
import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Autentica jobs internos (Cloud Scheduler/Functions) pelo header X-Internal-Job-Key.
 * Legado até a migração para token OIDC (AGENTS.md §7.9); a chave fica no Secret Manager.
 */
export function verifyInternalJobKey(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.INTERNAL_JOB_KEY;
  if (!configuredKey) {
    return res
      .status(503)
      .json({
        error: { code: 'INTERNAL_JOB_NOT_CONFIGURED', message: 'Job interno não configurado.' },
      });
  }
  const configured = Buffer.from(configuredKey, 'utf8');
  const provided = Buffer.from(String(req.headers['x-internal-job-key'] || ''), 'utf8');
  if (configured.length !== provided.length || !timingSafeEqual(configured, provided)) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHENTICATED', message: 'Chave de job interno inválida.' } });
  }
  return next();
}

=== server/interfaces/http/bookings/bookingHttpErrors.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { BookingDomainError } from '../../../domain/bookings';
import { PaymentDomainError } from '../../../domain/payment';

export function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

/** Erros tipados mantêm status e código; o resto vira 500 sem detalhe interno (AGENTS.md §10.2). */
export function handleBookingError(res: Response, operation: string, error: unknown): Response {
  if (error instanceof BookingDomainError || error instanceof PaymentDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[bookings.${operation}]`, {
    message: error instanceof Error ? error.message : 'Erro desconhecido',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível concluir a operação.');
}

=== server/interfaces/http/bookings/bookingResponses.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  AvailabilitySlot,
  BookableOffer,
  Booking,
  BookingDetails,
  BookingStatus,
} from '../../../domain/bookings';

/** Saída por allowlist (AGENTS.md §7.9 regra 4): nunca o documento inteiro. */
export function toBuyerBooking(booking: Booking) {
  return {
    id: booking.id,
    offerId: booking.offerId,
    slotId: booking.slotId,
    guideItemId: booking.guideItemId,
    kind: booking.kind,
    status: booking.status as BookingStatus,
    lines: booking.lines,
    participantsCount: booking.participantsCount,
    totalMinor: booking.totalMinor,
    expiresAt: booking.expiresAt,
    offer: {
      title: booking.offerSnapshot.title,
      startsAt: booking.offerSnapshot.startsAt,
      durationMinutes: booking.offerSnapshot.durationMinutes ?? null,
      meetingPoint: booking.offerSnapshot.meetingPoint ?? null,
      cancellationPolicy: booking.offerSnapshot.cancellationPolicy,
    },
    cancellation: booking.cancellation
      ? {
          by: booking.cancellation.by,
          refundPercent: booking.cancellation.refundPercent,
          refundAmountMinor: booking.cancellation.refundAmountMinor,
          at: booking.cancellation.at,
        }
      : null,
    createdAt: booking.createdAt,
  };
}

/** O parceiro vê também a taxa (para conferir o repasse), mas não o comprador além do ID. */
export function toSellerBooking(booking: Booking) {
  return {
    ...toBuyerBooking(booking),
    buyerId: booking.buyerId,
    platformFeeMinor: booking.platformFeeMinor,
  };
}

export function toBookingDetails(
  details: BookingDetails,
  viewerUid: string,
  viewerIsAdmin: boolean
) {
  const isSeller = details.booking.sellerPartnerId === viewerUid;
  return {
    ...(isSeller || viewerIsAdmin
      ? toSellerBooking(details.booking)
      : toBuyerBooking(details.booking)),
    participants: details.participants.map((participant) => ({
      name: participant.name,
      isLeadContact: participant.isLeadContact,
    })),
  };
}

export function toPartnerOffer(offer: BookableOffer) {
  const { ownerId: _owner, partnerId: _partner, ...rest } = offer;
  return rest;
}

export function toPartnerSlot(slot: AvailabilitySlot) {
  return {
    id: slot.id,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt ?? null,
    capacityTotal: slot.capacityTotal,
    capacityReserved: slot.capacityReserved,
    capacitySold: slot.capacitySold,
    status: slot.status,
  };
}

=== server/interfaces/http/bookings/bookingsController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../application/usecases/bookings/createBookingApplicationUseCase', () => ({
  createBookingApplicationUseCase: vi.fn(),
}));
vi.mock('../../../application/usecases/bookings/cancelBookingByBuyerApplicationUseCase', () => ({
  cancelBookingByBuyerApplicationUseCase: vi.fn(),
}));
vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return {
    BookingDomainError,
    getBookingForActorUseCase: vi.fn(),
    listAvailableSlotsUseCase: vi.fn(),
    listMyBookingsUseCase: vi.fn(),
    markBookingNoShowUseCase: vi.fn(),
  };
});

import { createBookingApplicationUseCase } from '../../../application/usecases/bookings/createBookingApplicationUseCase';
import {
  BookingDomainError,
  getBookingForActorUseCase,
  listMyBookingsUseCase,
} from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { BookingsController } from './bookingsController';

function response() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { res: { status } as unknown as Response, status, json };
}

function request(parts: Partial<AuthenticatedRequest>, uid: string | null = 'buyer-1') {
  return {
    params: {},
    query: {},
    headers: {},
    body: {},
    user: uid ? { uid, admin: false, emailVerified: true, authTime: 0 } : undefined,
    ...parts,
  } as unknown as AuthenticatedRequest;
}

const BOOKING = {
  id: 'bk_1',
  offerId: 'offer-1',
  slotId: 'slot-1',
  guideItemId: 'item-1',
  buyerId: 'buyer-1',
  sellerPartnerId: 'p1',
  kind: 'tour',
  status: 'confirmed',
  lines: [],
  participantsCount: 2,
  subtotalMinor: 20000,
  platformFeeMinor: 2000,
  totalMinor: 20000,
  expiresAt: null,
  paymentIntentId: 'pi_secret_ref',
  idempotencyKey: 'key-12345',
  offerSnapshot: {
    title: 'Passeio',
    startsAt: '2026-11-10T11:00:00.000Z',
    cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 },
  },
  locale: 'pt-BR',
  createdAt: '',
  updatedAt: '',
};

const VALID_BODY = {
  offerId: 'offer-1',
  slotId: 'slot-1',
  lines: [{ priceOptionId: 'adult', quantity: 2 }],
  locale: 'pt-BR',
};

describe('BookingsController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('401 sem autenticação', async () => {
    const { res, status } = response();
    await BookingsController.create(request({ body: VALID_BODY }, null), res);
    expect(status).toHaveBeenCalledWith(401);
  });

  it('400 com preço ou campo extra vindo do cliente', async () => {
    const { res, status } = response();
    await BookingsController.create(
      request({ body: { ...VALID_BODY, idempotencyKey: 'key-12345', totalMinor: 1 } }),
      res
    );
    expect(status).toHaveBeenCalledWith(400);
    expect(createBookingApplicationUseCase).not.toHaveBeenCalled();
  });

  it('400 sem chave de idempotência no corpo nem no header', async () => {
    const { res, status } = response();
    await BookingsController.create(request({ body: VALID_BODY }), res);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('aceita Idempotency-Key no header e repassa e-mail verificado', async () => {
    vi.mocked(createBookingApplicationUseCase).mockResolvedValue({
      bookingId: 'bk_1',
      status: 'pending_payment',
      clientSecret: 's',
      totalMinor: 20000,
      expiresAt: null,
    });
    const { res, status } = response();
    await BookingsController.create(
      request({ body: VALID_BODY, headers: { 'idempotency-key': 'header-key-123' } }),
      res
    );
    expect(createBookingApplicationUseCase).toHaveBeenCalledWith(
      { uid: 'buyer-1', admin: false, emailVerified: true },
      expect.objectContaining({ idempotencyKey: 'header-key-123', participants: [] })
    );
    expect(status).toHaveBeenCalledWith(201);
  });

  it('IDOR: reserva de outro usuário responde 404 no formato padrão', async () => {
    vi.mocked(getBookingForActorUseCase).mockRejectedValue(
      new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.')
    );
    const { res, status, json } = response();
    await BookingsController.get(request({ params: { bookingId: 'bk_1' } }, 'intruso'), res);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Reserva não encontrada.' },
    });
  });

  it('comprador não recebe paymentIntentId, taxa nem ID do comprador', async () => {
    vi.mocked(getBookingForActorUseCase).mockResolvedValue({
      booking: BOOKING as never,
      participants: [{ name: 'Ana', isLeadContact: true }],
    });
    const { res, json } = response();
    await BookingsController.get(request({ params: { bookingId: 'bk_1' } }), res);
    const body = JSON.stringify(json.mock.calls[0]?.[0]);
    expect(body).not.toContain('pi_secret_ref');
    expect(body).not.toContain('platformFeeMinor');
    expect(body).not.toContain('idempotencyKey');
    expect(body).toContain('Ana');
  });

  it('lista "minhas reservas" com paginação por cursor', async () => {
    vi.mocked(listMyBookingsUseCase).mockResolvedValue({
      data: [BOOKING as never],
      nextCursor: 'bk_1',
    });
    const { res, json } = response();
    await BookingsController.listMine(request({ query: { limit: '10' } }), res);
    expect(listMyBookingsUseCase).toHaveBeenCalledWith(
      { uid: 'buyer-1', admin: false },
      { limit: 10 }
    );
    expect(json.mock.calls[0]?.[0]).toMatchObject({ nextCursor: 'bk_1' });
  });

  it('janela de horários acima de 62 dias é recusada', async () => {
    const { res, status } = response();
    await BookingsController.listSlots(
      request({
        params: { offerId: 'offer-1' },
        query: { from: '2026-11-01T00:00:00.000Z', to: '2027-02-01T00:00:00.000Z' },
      }),
      res
    );
    expect(status).toHaveBeenCalledWith(400);
  });

  it('erro inesperado vira 500 sem detalhe interno', async () => {
    vi.mocked(getBookingForActorUseCase).mockRejectedValue(new Error('firestore quota exceeded'));
    const { res, status, json } = response();
    await BookingsController.get(request({ params: { bookingId: 'bk_1' } }), res);
    expect(status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain('quota');
  });
});

=== server/interfaces/http/bookings/bookingsController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { cancelBookingByBuyerApplicationUseCase } from '../../../application/usecases/bookings/cancelBookingByBuyerApplicationUseCase';
import { createBookingApplicationUseCase } from '../../../application/usecases/bookings/createBookingApplicationUseCase';
import {
  getBookingForActorUseCase,
  listAvailableSlotsUseCase,
  listMyBookingsUseCase,
  markBookingNoShowUseCase,
} from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { handleBookingError, sendError } from './bookingHttpErrors';
import { toBookingDetails, toBuyerBooking, toSellerBooking } from './bookingResponses';
import {
  CancelBookingSchema,
  CreateBookingSchema,
  DocumentIdSchema,
  IdempotencyKeyHeaderSchema,
  PageQuerySchema,
  SlotWindowQuerySchema,
} from './schemas/bookingSchemas';

function actorOf(req: AuthenticatedRequest) {
  return req.user ? { uid: req.user.uid, admin: req.user.admin === true } : null;
}

export class BookingsController {
  static async listSlots(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const window = SlotWindowQuerySchema.safeParse(req.query);
    if (!offerId.success || !window.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Parâmetros inválidos.');
    }
    try {
      const slots = await listAvailableSlotsUseCase(offerId.data, window.data.from, window.data.to);
      return res.status(200).json({ data: slots });
    } catch (error) {
      return handleBookingError(res, 'listSlots', error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const parsed = CreateBookingSchema.safeParse(req.body);
    // Idempotency-Key no header (AGENTS.md §10.1) vale quando o corpo não traz a chave.
    const headerKey = IdempotencyKeyHeaderSchema.safeParse(req.headers['idempotency-key']);
    const idempotencyKey = parsed.success
      ? (parsed.data.idempotencyKey ?? (headerKey.success ? headerKey.data : undefined))
      : undefined;
    if (!parsed.success || !idempotencyKey) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da reserva inválidos.');
    }
    try {
      const result = await createBookingApplicationUseCase(
        {
          uid: req.user.uid,
          admin: req.user.admin === true,
          emailVerified: req.user.emailVerified,
        },
        { ...parsed.data, idempotencyKey }
      );
      return res.status(201).json(result);
    } catch (error) {
      return handleBookingError(res, 'create', error);
    }
  }

  static async listMine(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const page = PageQuerySchema.safeParse(req.query);
    if (!page.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Parâmetros inválidos.');
    try {
      const result = await listMyBookingsUseCase(actor, page.data);
      return res
        .status(200)
        .json({ data: result.data.map(toBuyerBooking), nextCursor: result.nextCursor });
    } catch (error) {
      return handleBookingError(res, 'listMine', error);
    }
  }

  static async get(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
    if (!bookingId.success) return sendError(res, 404, 'NOT_FOUND', 'Reserva não encontrada.');
    try {
      const details = await getBookingForActorUseCase(actor, bookingId.data);
      return res.status(200).json(toBookingDetails(details, actor.uid, actor.admin));
    } catch (error) {
      return handleBookingError(res, 'get', error);
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
    const body = CancelBookingSchema.safeParse(req.body ?? {});
    if (!bookingId.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    }
    try {
      const result = await cancelBookingByBuyerApplicationUseCase(
        actor,
        bookingId.data,
        body.data.reason ?? ''
      );
      return res.status(200).json(result);
    } catch (error) {
      return handleBookingError(res, 'cancel', error);
    }
  }

  static async markNoShow(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
    if (!bookingId.success) return sendError(res, 404, 'NOT_FOUND', 'Reserva não encontrada.');
    try {
      const booking = await markBookingNoShowUseCase(actor, bookingId.data);
      return res.status(200).json(toSellerBooking(booking));
    } catch (error) {
      return handleBookingError(res, 'markNoShow', error);
    }
  }
}

=== server/interfaces/http/bookings/bookingsRoutes.ts — ARQUIVO NOVO, conteúdo completo ===
import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { BookingsController } from './bookingsController';
import { PartnerOffersController } from './partnerOffersController';

// Operações com dinheiro recusam token revogado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

export const bookingsRouter = Router();
bookingsRouter.get('/offers/:offerId/slots', BookingsController.listSlots);
bookingsRouter.post('/', verifyAuthTokenStrict, BookingsController.create);
bookingsRouter.get('/me', verifyAuthToken, BookingsController.listMine);
bookingsRouter.get('/:bookingId', verifyAuthToken, BookingsController.get);
bookingsRouter.post('/:bookingId/cancel', verifyAuthTokenStrict, BookingsController.cancel);
bookingsRouter.post('/:bookingId/no-show', verifyAuthToken, BookingsController.markNoShow);

export const partnerOffersRouter = Router();
partnerOffersRouter.use(verifyAuthToken);
partnerOffersRouter.get('/', PartnerOffersController.list);
partnerOffersRouter.post('/', PartnerOffersController.create);
partnerOffersRouter.patch('/:offerId', PartnerOffersController.update);
partnerOffersRouter.post('/:offerId/status', PartnerOffersController.setStatus);
partnerOffersRouter.get('/:offerId/slots', PartnerOffersController.listSlots);
partnerOffersRouter.post('/:offerId/slots', PartnerOffersController.createSlots);
partnerOffersRouter.post(
  '/:offerId/slots/:slotId/cancel',
  verifyAuthTokenStrict,
  PartnerOffersController.cancelSlot
);
partnerOffersRouter.get('/:offerId/bookings', PartnerOffersController.listBookings);

=== server/interfaces/http/bookings/internalBookingsController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Request, Response } from 'express';
import {
  completeFinishedBookingsUseCase,
  expireOverdueBookingsUseCase,
} from '../../../domain/bookings';
import { handleBookingError } from './bookingHttpErrors';

// Chamados pelos jobs agendados; a chave já foi conferida pelo middleware verifyInternalJobKey.
export class InternalBookingsController {
  static async expire(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ expired: await expireOverdueBookingsUseCase(200) });
    } catch (error) {
      return handleBookingError(res, 'expireJob', error);
    }
  }

  static async complete(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ completed: await completeFinishedBookingsUseCase(200) });
    } catch (error) {
      return handleBookingError(res, 'completeJob', error);
    }
  }
}

=== server/interfaces/http/bookings/partnerOffersController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { cancelSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/cancelSlotByPartnerApplicationUseCase';
import {
  createAvailabilitySlotsUseCase,
  createBookableOfferUseCase,
  listOfferBookingsForPartnerUseCase,
  listOfferSlotsForPartnerUseCase,
  listPartnerOffersUseCase,
  setBookableOfferStatusUseCase,
  updateBookableOfferUseCase,
} from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { handleBookingError, sendError } from './bookingHttpErrors';
import { toPartnerOffer, toPartnerSlot, toSellerBooking } from './bookingResponses';
import {
  CreateOfferSchema,
  CreateSlotsSchema,
  DocumentIdSchema,
  OfferStatusSchema,
  PageQuerySchema,
  SlotWindowQuerySchema,
  UpdateOfferSchema,
} from './schemas/bookingSchemas';

function actorOf(req: AuthenticatedRequest) {
  return req.user ? { uid: req.user.uid, admin: req.user.admin === true } : null;
}

export class PartnerOffersController {
  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      const offers = await listPartnerOffersUseCase(actor);
      return res.status(200).json({ data: offers.map(toPartnerOffer) });
    } catch (error) {
      return handleBookingError(res, 'listOffers', error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const parsed = CreateOfferSchema.safeParse(req.body);
    if (!parsed.success)
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da oferta inválidos.');
    try {
      const offer = await createBookableOfferUseCase(actor, parsed.data);
      return res.status(201).json(toPartnerOffer(offer));
    } catch (error) {
      return handleBookingError(res, 'createOffer', error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const parsed = UpdateOfferSchema.safeParse(req.body);
    if (!offerId.success || !parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da oferta inválidos.');
    }
    try {
      const offer = await updateBookableOfferUseCase(actor, offerId.data, parsed.data);
      return res.status(200).json(toPartnerOffer(offer));
    } catch (error) {
      return handleBookingError(res, 'updateOffer', error);
    }
  }

  static async setStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const parsed = OfferStatusSchema.safeParse(req.body);
    if (!offerId.success || !parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Status inválido.');
    }
    try {
      const offer = await setBookableOfferStatusUseCase(actor, offerId.data, parsed.data.status);
      return res.status(200).json(toPartnerOffer(offer));
    } catch (error) {
      return handleBookingError(res, 'setOfferStatus', error);
    }
  }

  static async createSlots(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const parsed = CreateSlotsSchema.safeParse(req.body);
    if (!offerId.success || !parsed.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Horários inválidos.');
    }
    try {
      const created = await createAvailabilitySlotsUseCase(actor, offerId.data, parsed.data);
      return res.status(201).json({ data: created.map(toPartnerSlot) });
    } catch (error) {
      return handleBookingError(res, 'createSlots', error);
    }
  }

  static async listSlots(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const window = SlotWindowQuerySchema.safeParse(req.query);
    if (!offerId.success || !window.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Parâmetros inválidos.');
    }
    try {
      const slots = await listOfferSlotsForPartnerUseCase(
        actor,
        offerId.data,
        window.data.from,
        window.data.to
      );
      return res.status(200).json({ data: slots.map(toPartnerSlot) });
    } catch (error) {
      return handleBookingError(res, 'listPartnerSlots', error);
    }
  }

  static async cancelSlot(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const slotId = DocumentIdSchema.safeParse(req.params.slotId);
    if (!offerId.success || !slotId.success) {
      return sendError(res, 404, 'NOT_FOUND', 'Horário não encontrado.');
    }
    try {
      const result = await cancelSlotByPartnerApplicationUseCase(actor, offerId.data, slotId.data);
      return res.status(200).json(result);
    } catch (error) {
      return handleBookingError(res, 'cancelSlot', error);
    }
  }

  static async listBookings(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const actor = actorOf(req);
    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
    const page = PageQuerySchema.safeParse(req.query);
    if (!offerId.success || !page.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Parâmetros inválidos.');
    }
    try {
      const result = await listOfferBookingsForPartnerUseCase(actor, offerId.data, page.data);
      return res
        .status(200)
        .json({ data: result.data.map(toSellerBooking), nextCursor: result.nextCursor });
    } catch (error) {
      return handleBookingError(res, 'listOfferBookings', error);
    }
  }
}

=== server/interfaces/http/bookings/schemas/bookingSchemas.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { CreateOfferSchema, CreateSlotsSchema, UpdateOfferSchema } from './bookingSchemas';

const OFFER = {
  guideItemId: 'item-1',
  kind: 'tour',
  title: { 'pt-BR': 'Passeio' },
  pricing: {
    currency: 'BRL',
    priceOptions: [{ id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 15090 }],
  },
  cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 },
  maxParticipantsPerBooking: 8,
  requiresParticipantNames: false,
};

describe('bookingSchemas', () => {
  it('aceita oferta válida', () => {
    expect(CreateOfferSchema.safeParse(OFFER).success).toBe(true);
  });

  it('recusa dono, parceiro ou status vindos do cliente', () => {
    expect(CreateOfferSchema.safeParse({ ...OFFER, ownerId: 'outro' }).success).toBe(false);
    expect(CreateOfferSchema.safeParse({ ...OFFER, status: 'published' }).success).toBe(false);
    expect(UpdateOfferSchema.safeParse({ partnerId: 'x' }).success).toBe(false);
  });

  it('preço em reais com casas decimais é recusado (só centavos inteiros)', () => {
    const pricing = {
      currency: 'BRL',
      priceOptions: [{ id: 'a', label: { 'pt-BR': 'A' }, unitAmountMinor: 150.9 }],
    };
    expect(CreateOfferSchema.safeParse({ ...OFFER, pricing }).success).toBe(false);
  });

  it('percentual de reembolso só 0, 50 ou 100', () => {
    expect(
      CreateOfferSchema.safeParse({
        ...OFFER,
        cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 30 },
      }).success
    ).toBe(false);
  });

  it('horários: lista ou recorrência, com horário HH:MM válido', () => {
    expect(
      CreateSlotsSchema.safeParse({
        mode: 'list',
        capacity: 5,
        slots: [{ startsAt: '2026-11-02T11:00:00.000Z' }],
      }).success
    ).toBe(true);
    expect(
      CreateSlotsSchema.safeParse({
        mode: 'recurrence',
        capacity: 5,
        startDate: '2026-11-02',
        endDate: '2026-11-30',
        weekdays: [1, 3],
        times: ['08:00', '25:00'],
      }).success
    ).toBe(false);
  });
});

=== server/interfaces/http/bookings/schemas/bookingSchemas.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

const isoDateTime = z.string().datetime({ offset: true });
const documentId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
const idempotencyKey = z.string().min(8).max(150);
const locale = z.enum(['pt-BR', 'en', 'fr']);

const localizedText = (max: number) =>
  z
    .object({
      'pt-BR': z.string().trim().min(1).max(max),
      en: z.string().trim().max(max).optional(),
      fr: z.string().trim().max(max).optional(),
    })
    .strict();

const priceOption = z
  .object({
    id: z.string().regex(/^[a-z0-9_-]{1,40}$/),
    label: localizedText(60),
    unitAmountMinor: z.number().int().positive().max(10_000_000),
    minQuantity: z.number().int().min(1).max(50).optional(),
    maxQuantity: z.number().int().min(1).max(50).optional(),
  })
  .strict();

const offerFields = {
  title: localizedText(120),
  description: localizedText(5000).optional(),
  pricing: z
    .object({ currency: z.literal('BRL'), priceOptions: z.array(priceOption).min(1).max(10) })
    .strict(),
  durationMinutes: z
    .number()
    .int()
    .min(15)
    .max(24 * 60)
    .optional(),
  meetingPoint: z
    .object({
      address: z.string().trim().min(3).max(300),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
      instructions: localizedText(500).optional(),
    })
    .strict()
    .optional(),
  cancellationPolicy: z
    .object({
      freeCancellationHoursBefore: z
        .number()
        .int()
        .min(0)
        .max(24 * 30),
      refundPercentAfterDeadline: z.union([z.literal(0), z.literal(50), z.literal(100)]),
    })
    .strict(),
  maxParticipantsPerBooking: z.number().int().min(1).max(50),
  requiresParticipantNames: z.boolean(),
};

export const CreateOfferSchema = z
  .object({
    guideItemId: documentId,
    kind: z.enum(['tour', 'private_entry', 'rental', 'transfer']),
    ...offerFields,
  })
  .strict();

export const UpdateOfferSchema = z.object(offerFields).partial().strict();

export const OfferStatusSchema = z
  .object({ status: z.enum(['published', 'paused', 'archived']) })
  .strict();

export const CreateSlotsSchema = z.discriminatedUnion('mode', [
  z
    .object({
      mode: z.literal('list'),
      capacity: z.number().int().min(1).max(500),
      slots: z
        .array(z.object({ startsAt: isoDateTime, endsAt: isoDateTime.optional() }).strict())
        .min(1)
        .max(200),
    })
    .strict(),
  z
    .object({
      mode: z.literal('recurrence'),
      capacity: z.number().int().min(1).max(500),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
      times: z
        .array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/))
        .min(1)
        .max(12),
    })
    .strict(),
]);

export const CreateBookingSchema = z
  .object({
    offerId: documentId,
    slotId: documentId,
    lines: z
      .array(
        z
          .object({
            priceOptionId: z.string().min(1).max(40),
            quantity: z.number().int().min(1).max(50),
          })
          .strict()
      )
      .min(1)
      .max(10),
    participants: z
      .array(z.object({ name: z.string().max(80) }).strict())
      .max(50)
      .default([]),
    idempotencyKey: idempotencyKey.optional(),
    locale,
  })
  .strict();

export const CancelBookingSchema = z.object({ reason: z.string().max(300).optional() }).strict();

export const SlotWindowQuerySchema = z
  .object({ from: isoDateTime, to: isoDateTime })
  .strict()
  .refine((value) => new Date(value.to).getTime() > new Date(value.from).getTime(), {
    message: 'to deve ser depois de from',
  })
  .refine(
    (value) => new Date(value.to).getTime() - new Date(value.from).getTime() <= 62 * 86_400_000,
    { message: 'janela máxima de 62 dias' }
  );

export const PageQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: documentId.optional(),
  })
  .strict();

export const IdempotencyKeyHeaderSchema = idempotencyKey;
export const DocumentIdSchema = documentId;

VERIFICAÇÃO (obrigatória):
- `npm run typecheck` e `npx tsc -p functions/tsconfig.json --noEmit` sem erros; `npx biome lint .` com 0 erros.
- `npm test` → 115 arquivos, 706 testes.
- `npm run build` sem erros.

No resumo, lembre-me das ações manuais (não execute):
1. Secret Manager: criar INTERNAL_JOB_KEY (≥ 32 bytes aleatórios) e removê-la com o nome antigo TICKETING_EXPIRATION_JOB_KEY do Cloud Run e das Functions.
2. Definir TICKETING_EXPIRATION_JOB_URL, BOOKINGS_EXPIRATION_JOB_URL e BOOKINGS_COMPLETION_JOB_URL com a URL *.run.app do Cloud Run (ex: https://use-guide-xxxx.run.app/internal/bookings/expire), nunca a do Hosting.
3. `firebase deploy --only functions`.
4. No webhook do Stripe, confirmar que refund.created e refund.updated estão assinados.
Responda no formato do AGENTS.md §16.3.
~~~~
