# Prompt 18.4b.0.1 — ticketingService dividido por responsabilidade · Parte 1 de 2

> Lote 16, gerado do commit de referência `51f5188` da branch `claude/agents-md-v2`. Aplique depois do 18.4a.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4b.0.1 — ticketingService dividido por responsabilidade · Parte 1 de 2

Preparação do 18.4b: só reorganiza arquivos, sem mudar comportamento (AGENTS.md §13, arquivo acima de 400 linhas é dividido ao tocar).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8); os campos antigos saem direto e os dados de teste podem ser recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

ESTE PROMPT NÃO MUDA COMPORTAMENTO. O server/domain/ticketing/services/ticketingService.ts (1857 linhas) sai e vira um serviço por responsabilidade:
- services/ticketingAccess.ts (contexto do ator, admin, tipo de ator na auditoria, posse da sessão);
- ticketTypeService.ts, ticketOrderService.ts, ticketRefundService.ts, ticketHolderService.ts, checkInService.ts, offlineCheckInService.ts, ticketingReportService.ts;
- services/orders/orderSaleGuards.ts e services/orders/prepareOrderItems.ts (regras da criação do pedido).
A factory.ts exporta um serviço de cada tipo e os UseCases passam a chamar o serviço certo. O teste ticketingService.test.ts vira ticketingServices.test.ts. Só CheckInService e OfflineCheckInService recebem o qrTokenPort. O adapter Firestore NÃO é tocado nesta parte: a parte 2 o substitui inteiro.

Esta é a PARTE 1 de 2. A parte 2 (18.4b.0.2) divide o adapter Firestore; cada parte compila sozinha.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/domain/ticketing/adapters/firestoreTicketingAdapter.test.ts (alterar)
- server/domain/ticketing/adapters/rsaPssTicketQrTokenAdapter.ts (alterar)
- server/domain/ticketing/controllers/ticketingController.ts (alterar)
- server/domain/ticketing/dtos/ticketingPersistenceMappers.ts (alterar)
- server/domain/ticketing/factory.ts (alterar)
- server/domain/ticketing/index.ts (alterar)
- server/domain/ticketing/ports/ticketingPort.ts (alterar)
- server/domain/ticketing/routes/ticketingRoutes.ts (alterar)
- server/domain/ticketing/schemas/ticketingSchema.ts (alterar)
- server/domain/ticketing/services/checkInService.ts (criar)
- server/domain/ticketing/services/offlineCheckInService.ts (criar)
- server/domain/ticketing/services/orders/orderSaleGuards.ts (criar)
- server/domain/ticketing/services/orders/prepareOrderItems.ts (criar)
- server/domain/ticketing/services/ticketHolderService.ts (criar)
- server/domain/ticketing/services/ticketOrderService.ts (criar)
- server/domain/ticketing/services/ticketRefundService.ts (criar)
- server/domain/ticketing/services/ticketTypeService.ts (criar)
- server/domain/ticketing/services/ticketingAccess.ts (criar)
- server/domain/ticketing/services/ticketingReportService.ts (criar)
- server/domain/ticketing/services/ticketingService.test.ts (apagar)
- server/domain/ticketing/services/ticketingService.ts (apagar)
- server/domain/ticketing/services/ticketingServices.test.ts (criar)
- server/domain/ticketing/types/ticketingTypes.ts (alterar)
- server/domain/ticketing/usecases/archiveTicketTypeUseCase.ts (alterar)
- server/domain/ticketing/usecases/checkInTicketUseCase.ts (alterar)
- server/domain/ticketing/usecases/confirmTicketOrderPaymentUseCase.ts (alterar)
- server/domain/ticketing/usecases/createEventPromoCodeUseCase.ts (alterar)
- server/domain/ticketing/usecases/createOfflineCheckInSessionUseCase.ts (alterar)
- server/domain/ticketing/usecases/createTicketOrderUseCase.ts (alterar)
- server/domain/ticketing/usecases/createTicketTypeUseCase.ts (alterar)
- server/domain/ticketing/usecases/expireAllOverdueOrdersUseCase.ts (alterar)
- server/domain/ticketing/usecases/expireTicketOrderUseCase.ts (alterar)
- server/domain/ticketing/usecases/finalizeTicketRefundStatusUseCase.ts (alterar)
- server/domain/ticketing/usecases/getEventSalesAnalyticsUseCase.ts (alterar)
- server/domain/ticketing/usecases/getTicketOrderUseCase.ts (alterar)
- server/domain/ticketing/usecases/getTicketQrTokenUseCase.ts (alterar)
- server/domain/ticketing/usecases/getVerifiedAttendanceForReviewUseCase.ts (alterar)
- server/domain/ticketing/usecases/joinEventWaitlistUseCase.ts (alterar)
- server/domain/ticketing/usecases/listEventCheckInsForPartnerOrAdminUseCase.ts (alterar)
- server/domain/ticketing/usecases/listEventOrdersForPartnerOrAdminUseCase.ts (alterar)
- server/domain/ticketing/usecases/listEventRefundsForPartnerOrAdminUseCase.ts (alterar)
- server/domain/ticketing/usecases/listPublicTicketTypesByOccurrenceUseCase.ts (alterar)
- server/domain/ticketing/usecases/listTicketTypesForManagementUseCase.ts (alterar)
- server/domain/ticketing/usecases/listUserTicketOrdersUseCase.ts (alterar)
- server/domain/ticketing/usecases/listUserTicketsUseCase.ts (alterar)
- server/domain/ticketing/usecases/markTicketOrderDisputedUseCase.ts (alterar)
- server/domain/ticketing/usecases/markTicketOrderPaymentFailedUseCase.ts (alterar)
- server/domain/ticketing/usecases/moveOrderToOccurrenceUseCase.ts (alterar)
- server/domain/ticketing/usecases/reissueTicketQrTokenUseCase.ts (alterar)
- server/domain/ticketing/usecases/requestTicketRefundUseCase.ts (alterar)
- server/domain/ticketing/usecases/syncOfflineCheckInsUseCase.ts (alterar)
- server/domain/ticketing/usecases/transferTicketUseCase.ts (alterar)
- server/domain/ticketing/usecases/updateTicketTypeUseCase.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/domain/ticketing/adapters/firestoreTicketingAdapter.test.ts — diff ===
@@ -155,10 +155,7 @@ describe('FirestoreTicketingAdapter.updateRefundStatus', () => {
     const lastGetIndex = callOrder.lastIndexOf('get');
     expect(lastGetIndex).toBeLessThan(firstUpdateIndex);
 
-    expect(txUpdate).toHaveBeenCalledWith(
-      typeRef,
-      expect.objectContaining({ soldCount: 9 })
-    );
+    expect(txUpdate).toHaveBeenCalledWith(typeRef, expect.objectContaining({ soldCount: 9 }));
   });
 
   it('reverte ingressos de refund_pending para issued quando o reembolso falha', async () => {

=== server/domain/ticketing/adapters/rsaPssTicketQrTokenAdapter.ts — diff ===
@@ -1,8 +1,5 @@
 import crypto from 'crypto';
-import type {
-  TicketQrPayload,
-  TicketQrTokenPort,
-} from '../ports/ticketQrTokenPort';
+import type { TicketQrPayload, TicketQrTokenPort } from '../ports/ticketQrTokenPort';
 
 interface CachedRsaKeys {
   keyId: string;
@@ -17,8 +14,7 @@ function ensureRsaKeyPair(): CachedRsaKeys {
     return cachedRsaKeys;
   }
 
-  const keyId =
-    process.env.OFFLINE_CHECKIN_KEY_ID?.trim() || 'use-guide-rsa-pss-v1';
+  const keyId = process.env.OFFLINE_CHECKIN_KEY_ID?.trim() || 'use-guide-rsa-pss-v1';
   const envPem = process.env.OFFLINE_CHECKIN_PRIVATE_KEY_PEM?.trim();
 
   if (envPem) {
@@ -37,9 +33,7 @@ function ensureRsaKeyPair(): CachedRsaKeys {
   const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
     modulusLength: 2048,
   });
-  const privateKeyPem = privateKey
-    .export({ type: 'pkcs8', format: 'pem' })
-    .toString();
+  const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
   const publicKeyJwk = publicKey.export({ format: 'jwk' }) as JsonWebKey;
   cachedRsaKeys = {
     keyId,
@@ -52,9 +46,7 @@ function ensureRsaKeyPair(): CachedRsaKeys {
 export class RsaPssTicketQrTokenAdapter implements TicketQrTokenPort {
   issue(payload: TicketQrPayload): string {
     const { privateKeyPem } = ensureRsaKeyPair();
-    const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString(
-      'base64url'
-    );
+    const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
     const signature = crypto.sign('sha256', Buffer.from(payloadB64, 'utf8'), {
       key: privateKeyPem,
       padding: crypto.constants.RSA_PKCS1_PSS_PADDING,

=== server/domain/ticketing/controllers/ticketingController.ts — diff ===
@@ -170,7 +170,9 @@ export class TicketingController {
       const orderId = String(req.params.id || '');
       const parsed = payTicketOrderSchema.safeParse(req.body || {});
       if (!parsed.success) {
-        return res.status(400).json({ error: 'Dados de pagamento inválidos.', details: parsed.error.flatten() });
+        return res
+          .status(400)
+          .json({ error: 'Dados de pagamento inválidos.', details: parsed.error.flatten() });
       }
       const result = await createTicketOrderPaymentIntentApplicationUseCase(getActor(req), {
         orderId,
@@ -374,13 +376,9 @@ export class TicketingController {
       }
       const normalizedEvents = rawEvents.map((ev) => {
         const scannedAt =
-          ('scannedAt' in ev && ev.scannedAt) ||
-          ev.checkedInAt ||
-          new Date().toISOString();
+          ('scannedAt' in ev && ev.scannedAt) || ev.checkedInAt || new Date().toISOString();
         const occurrenceId =
-          ('occurrenceId' in ev && ev.occurrenceId) ||
-          parsed.data.occurrenceId ||
-          '';
+          ('occurrenceId' in ev && ev.occurrenceId) || parsed.data.occurrenceId || '';
         return {
           clientEventId: ev.clientEventId,
           sessionId: parsed.data.sessionId,
@@ -424,10 +422,7 @@ export class TicketingController {
     try {
       if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
       const eventListingId = String(req.params.id || '');
-      const orders = await listEventOrdersForPartnerOrAdminUseCase(
-        getActor(req),
-        eventListingId
-      );
+      const orders = await listEventOrdersForPartnerOrAdminUseCase(getActor(req), eventListingId);
       return res.status(200).json({ status: 'success', data: orders });
     } catch (error) {
       return handleTicketingError(res, error);
@@ -452,10 +447,7 @@ export class TicketingController {
     try {
       if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
       const eventListingId = String(req.params.id || '');
-      const refunds = await listEventRefundsForPartnerOrAdminUseCase(
-        getActor(req),
-        eventListingId
-      );
+      const refunds = await listEventRefundsForPartnerOrAdminUseCase(getActor(req), eventListingId);
       return res.status(200).json({ status: 'success', data: refunds });
     } catch (error) {
       return handleTicketingError(res, error);

=== server/domain/ticketing/dtos/ticketingPersistenceMappers.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type {
  EventCheckIn,
  EventPromoCode,
  EventWaitlistEntry,
  InventoryReservation,
  OfflineCheckInSession,
  Refund,
  Ticket,
  TicketOrder,
  TicketOrderItem,
  TicketOrderRefundPolicySnapshot,
  TicketTransfer,
  TicketType,
} from '../types/ticketingTypes';

function toIso(val: unknown, fallback: string): string {
  if (typeof val === 'string' && val.trim().length > 0) return val;
  if (
    val &&
    typeof val === 'object' &&
    'toDate' in val &&
    typeof (val as { toDate: () => Date }).toDate === 'function'
  ) {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return fallback;
}

function normalizeRefundPolicySnapshot(
  rawPolicy: Record<string, unknown>
): TicketOrderRefundPolicySnapshot {
  const allowBuyerCancellation =
    typeof rawPolicy.allowBuyerCancellation === 'boolean'
      ? rawPolicy.allowBuyerCancellation
      : typeof rawPolicy.enabled === 'boolean'
        ? rawPolicy.enabled
        : true;
  const buyerCancellationWindowHours =
    typeof rawPolicy.buyerCancellationWindowHours === 'number'
      ? rawPolicy.buyerCancellationWindowHours
      : typeof rawPolicy.cancellationWindowHours === 'number'
        ? rawPolicy.cancellationWindowHours
        : 24;
  const allowTicketTransfer =
    typeof rawPolicy.allowTicketTransfer === 'boolean' ? rawPolicy.allowTicketTransfer : true;
  const ticketTransferCutoffHours =
    typeof rawPolicy.ticketTransferCutoffHours === 'number'
      ? rawPolicy.ticketTransferCutoffHours
      : 4;

  return {
    allowBuyerCancellation,
    buyerCancellationWindowHours: allowBuyerCancellation ? buyerCancellationWindowHours : undefined,
    allowTicketTransfer,
    ticketTransferCutoffHours: allowTicketTransfer ? ticketTransferCutoffHours : undefined,
    enabled: allowBuyerCancellation,
    cancellationWindowHours: allowBuyerCancellation ? buyerCancellationWindowHours : undefined,
  };
}

export class TicketTypePersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): TicketType {
    const now = new Date().toISOString();
    return {
      id,
      occurrenceId: String(raw.occurrenceId || ''),
      eventListingId: typeof raw.eventListingId === 'string' ? raw.eventListingId : undefined,
      name: String(raw.name || ''),
      description: typeof raw.description === 'string' ? raw.description : undefined,
      kind:
        raw.kind === 'free' || raw.kind === 'courtesy' || raw.kind === 'half_entry'
          ? raw.kind
          : 'paid',
      priceMinor: typeof raw.priceMinor === 'number' ? Math.trunc(raw.priceMinor) : 0,
      currency: 'BRL',
      quantity: typeof raw.quantity === 'number' ? Math.trunc(raw.quantity) : 0,
      soldCount: typeof raw.soldCount === 'number' ? Math.trunc(raw.soldCount) : 0,
      reservedCount: typeof raw.reservedCount === 'number' ? Math.trunc(raw.reservedCount) : 0,
      minPerOrder: typeof raw.minPerOrder === 'number' ? Math.trunc(raw.minPerOrder) : 1,
      maxPerOrder: typeof raw.maxPerOrder === 'number' ? Math.trunc(raw.maxPerOrder) : 10,
      salesStartsAt: typeof raw.salesStartsAt === 'string' ? raw.salesStartsAt : undefined,
      salesEndsAt: typeof raw.salesEndsAt === 'string' ? raw.salesEndsAt : undefined,
      status:
        raw.status === 'draft' ||
        raw.status === 'paused' ||
        raw.status === 'sold_out' ||
        raw.status === 'ended' ||
        raw.status === 'archived'
          ? raw.status
          : 'on_sale',
      visibility:
        raw.visibility === 'hidden' || raw.visibility === 'restricted' ? raw.visibility : 'public',
      requiresEligibilityProof:
        typeof raw.requiresEligibilityProof === 'boolean'
          ? raw.requiresEligibilityProof
          : undefined,
      sortOrder: typeof raw.sortOrder === 'number' ? Math.trunc(raw.sortOrder) : 0,
      createdAt: toIso(raw.createdAt, now),
      updatedAt: toIso(raw.updatedAt, now),
    };
  }
}

export class TicketOrderPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): TicketOrder {
    const now = new Date().toISOString();
    const rawBuyer = (raw.buyerSnapshot as Record<string, unknown> | undefined) || {};
    const rawPolicy = (raw.refundPolicySnapshot as Record<string, unknown> | undefined) || {};
    const rawEvent = raw.eventSnapshot as Record<string, unknown> | undefined;

    return {
      id,
      buyerId: String(raw.buyerId || ''),
      eventListingId: String(raw.eventListingId || ''),
      occurrenceId: String(raw.occurrenceId || ''),
      status:
        raw.status === 'payment_processing' ||
        raw.status === 'paid' ||
        raw.status === 'payment_failed' ||
        raw.status === 'expired' ||
        raw.status === 'partially_refunded' ||
        raw.status === 'refunded' ||
        raw.status === 'canceled' ||
        raw.status === 'chargeback'
          ? raw.status
          : 'pending_payment',
      currency: 'BRL',
      subtotalMinor: typeof raw.subtotalMinor === 'number' ? Math.trunc(raw.subtotalMinor) : 0,
      discountMinor: typeof raw.discountMinor === 'number' ? Math.trunc(raw.discountMinor) : 0,
      platformFeeMinor:
        typeof raw.platformFeeMinor === 'number' ? Math.trunc(raw.platformFeeMinor) : 0,
      paymentFeeMinor:
        typeof raw.paymentFeeMinor === 'number' ? Math.trunc(raw.paymentFeeMinor) : 0,
      totalMinor: typeof raw.totalMinor === 'number' ? Math.trunc(raw.totalMinor) : 0,
      paymentId: typeof raw.paymentId === 'string' ? raw.paymentId : undefined,
      paymentIntentId: typeof raw.paymentIntentId === 'string' ? raw.paymentIntentId : undefined,
      promoCodeId: typeof raw.promoCodeId === 'string' ? raw.promoCodeId : undefined,
      promoterCode: typeof raw.promoterCode === 'string' ? raw.promoterCode : undefined,
      buyerSnapshot: {
        name: String(rawBuyer.name || ''),
        email: String(rawBuyer.email || ''),
      },
      eventSnapshot: rawEvent
        ? {
            title: String(rawEvent.title || ''),
            startsAt: String(rawEvent.startsAt || ''),
            endsAt: String(rawEvent.endsAt || ''),
            locationName:
              typeof rawEvent.locationName === 'string' ? rawEvent.locationName : undefined,
          }
        : undefined,
      refundPolicySnapshot: normalizeRefundPolicySnapshot(rawPolicy),
      idempotencyKey: String(raw.idempotencyKey || ''),
      expiresAt: typeof raw.expiresAt === 'string' ? raw.expiresAt : undefined,
      createdAt: toIso(raw.createdAt, now),
      paidAt: typeof raw.paidAt === 'string' ? raw.paidAt : undefined,
      canceledAt: typeof raw.canceledAt === 'string' ? raw.canceledAt : undefined,
      expiredAt: typeof raw.expiredAt === 'string' ? raw.expiredAt : undefined,
      updatedAt: toIso(raw.updatedAt, now),
    };
  }
}

export class TicketOrderItemPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): TicketOrderItem {
    const snap = (raw.ticketTypeSnapshot as Record<string, unknown> | undefined) || {};
    return {
      id,
      orderId: String(raw.orderId || ''),
      ticketTypeId: String(raw.ticketTypeId || ''),
      quantity: typeof raw.quantity === 'number' ? Math.trunc(raw.quantity) : 1,
      unitPriceMinor: typeof raw.unitPriceMinor === 'number' ? Math.trunc(raw.unitPriceMinor) : 0,
      discountMinor: typeof raw.discountMinor === 'number' ? Math.trunc(raw.discountMinor) : 0,
      allocatedPlatformFeeMinor:
        typeof raw.allocatedPlatformFeeMinor === 'number'
          ? Math.trunc(raw.allocatedPlatformFeeMinor)
          : 0,
      allocatedPaymentFeeMinor:
        typeof raw.allocatedPaymentFeeMinor === 'number'
          ? Math.trunc(raw.allocatedPaymentFeeMinor)
          : 0,
      totalMinor: typeof raw.totalMinor === 'number' ? Math.trunc(raw.totalMinor) : 0,
      ticketTypeSnapshot: {
        name: String(snap.name || ''),
        kind:
          snap.kind === 'free' || snap.kind === 'courtesy' || snap.kind === 'half_entry'
            ? snap.kind
            : 'paid',
      },
    };
  }
}

export class TicketPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): Ticket {
    const now = new Date().toISOString();
    const rawTypeSnap = raw.ticketTypeSnapshot as Record<string, unknown> | undefined;
    const rawEventSnap = raw.eventSnapshot as Record<string, unknown> | undefined;
    return {
      id,
      orderId: String(raw.orderId || ''),
      eventListingId: String(raw.eventListingId || ''),
      occurrenceId: String(raw.occurrenceId || ''),
      ticketTypeId: String(raw.ticketTypeId || ''),
      ownerUserId: String(raw.ownerUserId || ''),
      holderName: String(raw.holderName || ''),
      holderEmail: String(raw.holderEmail || ''),
      qrTokenHash: String(raw.qrTokenHash || ''),
      qrVersion:
        typeof raw.qrVersion === 'number' && raw.qrVersion >= 1 ? Math.trunc(raw.qrVersion) : 1,
      status:
        raw.status === 'reserved' ||
        raw.status === 'checked_in' ||
        raw.status === 'transferred' ||
        raw.status === 'refund_pending' ||
        raw.status === 'refunded' ||
        raw.status === 'canceled' ||
        raw.status === 'void' ||
        raw.status === 'expired'
          ? raw.status
          : 'issued',
      issuedAt: toIso(raw.issuedAt, now),
      checkedInAt: typeof raw.checkedInAt === 'string' ? raw.checkedInAt : undefined,
      checkedInBy: typeof raw.checkedInBy === 'string' ? raw.checkedInBy : undefined,
      transferredAt: typeof raw.transferredAt === 'string' ? raw.transferredAt : undefined,
      ticketTypeSnapshot: rawTypeSnap
        ? {
            name: String(rawTypeSnap.name || ''),
            kind:
              rawTypeSnap.kind === 'free' ||
              rawTypeSnap.kind === 'courtesy' ||
              rawTypeSnap.kind === 'half_entry'
                ? rawTypeSnap.kind
                : 'paid',
            unitPriceMinor:
              typeof rawTypeSnap.unitPriceMinor === 'number'
                ? Math.trunc(rawTypeSnap.unitPriceMinor)
                : 0,
            ...(typeof rawTypeSnap.effectivePaidMinor === 'number'
              ? {
                  effectivePaidMinor: Math.trunc(rawTypeSnap.effectivePaidMinor),
                }
              : {}),
          }
        : undefined,
      eventSnapshot: rawEventSnap
        ? {
            title: String(rawEventSnap.title || ''),
            startsAt: String(rawEventSnap.startsAt || ''),
            endsAt: String(rawEventSnap.endsAt || ''),
            locationName:
              typeof rawEventSnap.locationName === 'string' ? rawEventSnap.locationName : undefined,
          }
        : undefined,
    };
  }
}

export class RefundPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): Refund {
    const now = new Date().toISOString();
    return {
      id,
      orderId: String(raw.orderId || ''),
      ticketId: typeof raw.ticketId === 'string' ? raw.ticketId : undefined,
      amountMinor: typeof raw.amountMinor === 'number' ? Math.trunc(raw.amountMinor) : 0,
      requestedBy:
        raw.requestedBy === 'partner' || raw.requestedBy === 'admin' || raw.requestedBy === 'system'
          ? raw.requestedBy
          : 'buyer',
      reason: String(raw.reason || ''),
      status:
        raw.status === 'pending_provider' ||
        raw.status === 'approved' ||
        raw.status === 'failed' ||
        raw.status === 'rejected'
          ? raw.status
          : 'requested',
      provider: 'stripe',
      providerRefundId: typeof raw.providerRefundId === 'string' ? raw.providerRefundId : null,
      idempotencyKey: String(raw.idempotencyKey || ''),
      createdAt: toIso(raw.createdAt, now),
      completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : undefined,
    };
  }
}

export class InventoryReservationPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): InventoryReservation {
    const now = new Date().toISOString();
    return {
      id,
      occurrenceId: String(raw.occurrenceId || ''),
      ticketTypeId: String(raw.ticketTypeId || ''),
      orderId: String(raw.orderId || ''),
      quantity: typeof raw.quantity === 'number' ? Math.trunc(raw.quantity) : 1,
      status:
        raw.status === 'consumed' || raw.status === 'released' || raw.status === 'expired'
          ? raw.status
          : 'active',
      expiresAt: toIso(raw.expiresAt, now),
      createdAt: toIso(raw.createdAt, now),
      releasedAt: typeof raw.releasedAt === 'string' ? raw.releasedAt : undefined,
    };
  }
}

export class TicketTransferPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): TicketTransfer {
    const now = new Date().toISOString();
    return {
      id,
      ticketId: String(raw.ticketId || ''),
      fromUserId: String(raw.fromUserId || ''),
      toUserId: typeof raw.toUserId === 'string' ? raw.toUserId : undefined,
      recipientEmail: String(raw.recipientEmail || ''),
      recipientName: typeof raw.recipientName === 'string' ? raw.recipientName : undefined,
      status:
        raw.status === 'accepted' ||
        raw.status === 'rejected' ||
        raw.status === 'expired' ||
        raw.status === 'completed'
          ? raw.status
          : 'pending',
      expiresAt: toIso(raw.expiresAt, now),
      createdAt: toIso(raw.createdAt, now),
      completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : undefined,
    };
  }
}

export class EventWaitlistPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): EventWaitlistEntry {
    const now = new Date().toISOString();
    return {
      id,
      occurrenceId: String(raw.occurrenceId || ''),
      userId: String(raw.userId || ''),
      ticketTypeId: typeof raw.ticketTypeId === 'string' ? raw.ticketTypeId : undefined,
      quantity: typeof raw.quantity === 'number' ? Math.trunc(raw.quantity) : 1,
      status:
        raw.status === 'offered' ||
        raw.status === 'accepted' ||
        raw.status === 'expired' ||
        raw.status === 'canceled'
          ? raw.status
          : 'waiting',
      offeredUntil: typeof raw.offeredUntil === 'string' ? raw.offeredUntil : undefined,
      createdAt: toIso(raw.createdAt, now),
    };
  }
}

export class EventCheckInPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): EventCheckIn {
    const now = new Date().toISOString();
    return {
      id,
      ticketId: String(raw.ticketId || ''),
      occurrenceId: String(raw.occurrenceId || ''),
      checkedInBy: String(raw.checkedInBy || ''),
      source: raw.source === 'offline' ? 'offline' : 'online',
      offlineSessionId: typeof raw.offlineSessionId === 'string' ? raw.offlineSessionId : undefined,
      stationId: typeof raw.stationId === 'string' ? raw.stationId : undefined,
      clientEventId: typeof raw.clientEventId === 'string' ? raw.clientEventId : undefined,
      checkedInAt: toIso(raw.checkedInAt, now),
      syncedAt: typeof raw.syncedAt === 'string' ? raw.syncedAt : undefined,
    };
  }
}

export class OfflineCheckInSessionPersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): OfflineCheckInSession {
    const now = new Date().toISOString();
    return {
      id,
      partnerId: String(raw.partnerId || ''),
      occurrenceId: String(raw.occurrenceId || ''),
      eventListingId: String(raw.eventListingId || ''),
      stationId: String(raw.stationId || 'default'),
      issuedAt: toIso(raw.issuedAt, now),
      expiresAt: toIso(raw.expiresAt, now),
      manifestHash: String(raw.manifestHash || ''),
      status: raw.status === 'expired' || raw.status === 'revoked' ? raw.status : 'active',
      keyId: String(raw.keyId || 'use-guide-rsa-pss-v1'),
    };
  }
}

export class EventPromoCodePersistenceMapper {
  static toDomain(id: string, raw: Record<string, unknown>): EventPromoCode {
    const now = new Date().toISOString();
    return {
      id,
      eventListingId: String(raw.eventListingId || ''),
      code: String(raw.code || '').toUpperCase(),
      type: raw.type === 'fixed' ? 'fixed' : 'percentage',
      valueMinor: typeof raw.valueMinor === 'number' ? Math.trunc(raw.valueMinor) : undefined,
      percentage: typeof raw.percentage === 'number' ? Math.trunc(raw.percentage) : undefined,
      maxUses: typeof raw.maxUses === 'number' ? Math.trunc(raw.maxUses) : undefined,
      usedCount: typeof raw.usedCount === 'number' ? Math.trunc(raw.usedCount) : 0,
      startsAt: typeof raw.startsAt === 'string' ? raw.startsAt : undefined,
      endsAt: typeof raw.endsAt === 'string' ? raw.endsAt : undefined,
      ticketTypeIds: Array.isArray(raw.ticketTypeIds)
        ? raw.ticketTypeIds.filter((i): i is string => typeof i === 'string')
        : undefined,
      isActive: raw.isActive !== false,
      createdAt: toIso(raw.createdAt, now),
      updatedAt: toIso(raw.updatedAt, now),
    };
  }
}

=== server/domain/ticketing/factory.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { FirestoreTicketingAdapter } from './adapters/firestoreTicketingAdapter';
import { RsaPssTicketQrTokenAdapter } from './adapters/rsaPssTicketQrTokenAdapter';
import { CheckInService } from './services/checkInService';
import { OfflineCheckInService } from './services/offlineCheckInService';
import { TicketHolderService } from './services/ticketHolderService';
import { TicketOrderService } from './services/ticketOrderService';
import { TicketRefundService } from './services/ticketRefundService';
import { TicketTypeService } from './services/ticketTypeService';
import { TicketingReportService } from './services/ticketingReportService';

const ticketingAdapter = new FirestoreTicketingAdapter();
const ticketQrTokenAdapter = new RsaPssTicketQrTokenAdapter();

export const ticketTypeService = new TicketTypeService(ticketingAdapter);
export const ticketOrderService = new TicketOrderService(ticketingAdapter);
export const ticketRefundService = new TicketRefundService(ticketingAdapter);
export const ticketHolderService = new TicketHolderService(ticketingAdapter);
export const checkInService = new CheckInService(ticketingAdapter, ticketQrTokenAdapter);
export const offlineCheckInService = new OfflineCheckInService(
  ticketingAdapter,
  ticketQrTokenAdapter
);
export const ticketingReportService = new TicketingReportService(ticketingAdapter);

=== server/domain/ticketing/index.ts — diff ===
@@ -67,4 +67,4 @@ export {
   type VerifiedAttendanceForReview,
 } from './types/ticketingTypes';
 
-export type { TicketingActorContext } from './services/ticketingService';
+export type { TicketingActorContext } from './services/ticketingAccess';

=== server/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -76,10 +76,7 @@ export interface ReserveOrderTransactionResult {
 
 export interface TicketingPort {
   createTicketType(
-    input: Omit<
-      TicketType,
-      'id' | 'soldCount' | 'reservedCount' | 'createdAt' | 'updatedAt'
-    >
+    input: Omit<TicketType, 'id' | 'soldCount' | 'reservedCount' | 'createdAt' | 'updatedAt'>
   ): Promise<TicketType>;
   getTicketTypeById(id: string): Promise<TicketType | null>;
   listTicketTypesByOccurrenceId(occurrenceId: string): Promise<TicketType[]>;
@@ -120,10 +117,7 @@ export interface TicketingPort {
   }>;
 
   getOrderById(orderId: string): Promise<TicketOrder | null>;
-  getOrderByIdempotencyKey(
-    buyerId: string,
-    idempotencyKey: string
-  ): Promise<TicketOrder | null>;
+  getOrderByIdempotencyKey(buyerId: string, idempotencyKey: string): Promise<TicketOrder | null>;
   listOrderItemsByOrderId(orderId: string): Promise<TicketOrderItem[]>;
   listOrdersByBuyerId(buyerId: string): Promise<TicketOrder[]>;
   listOrdersByOccurrenceId(occurrenceId: string): Promise<TicketOrder[]>;
@@ -162,9 +156,7 @@ export interface TicketingPort {
   createOfflineCheckInSession(
     session: Omit<OfflineCheckInSession, 'id'>
   ): Promise<OfflineCheckInSession>;
-  getOfflineCheckInSessionById(
-    sessionId: string
-  ): Promise<OfflineCheckInSession | null>;
+  getOfflineCheckInSessionById(sessionId: string): Promise<OfflineCheckInSession | null>;
   syncOfflineCheckInsAtomic(params: {
     session: OfflineCheckInSession;
     checkedInBy: string;
@@ -211,15 +203,10 @@ export interface TicketingPort {
   createPromoCode(
     input: Omit<EventPromoCode, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>
   ): Promise<EventPromoCode>;
-  getPromoCodeByCode(
-    eventListingId: string,
-    code: string
-  ): Promise<EventPromoCode | null>;
+  getPromoCodeByCode(eventListingId: string, code: string): Promise<EventPromoCode | null>;
 
   createWaitlistEntry(
     input: Omit<EventWaitlistEntry, 'id' | 'status' | 'createdAt'>
   ): Promise<EventWaitlistEntry>;
-  listWaitlistByOccurrenceId(
-    occurrenceId: string
-  ): Promise<EventWaitlistEntry[]>;
+  listWaitlistByOccurrenceId(occurrenceId: string): Promise<EventWaitlistEntry[]>;
 }

=== server/domain/ticketing/routes/ticketingRoutes.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { Router } from 'express';
import { verifyAdminToken, verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { TicketingController } from '../controllers/ticketingController';

const router = Router();

export const adminTicketingEventsRouter = Router();
adminTicketingEventsRouter.get(
  '/:id/orders',
  verifyAdminToken,
  TicketingController.listEventOrders
);
adminTicketingEventsRouter.get(
  '/:id/refunds',
  verifyAdminToken,
  TicketingController.listEventRefunds
);
adminTicketingEventsRouter.get(
  '/:id/check-ins',
  verifyAdminToken,
  TicketingController.listEventCheckIns
);
adminTicketingEventsRouter.get(
  '/:id/analytics',
  verifyAdminToken,
  TicketingController.getEventSalesAnalytics
);

router.get('/occurrences/:occurrenceId/ticket-types', TicketingController.listPublicTicketTypes);
router.get(
  '/occurrences/:occurrenceId/ticket-types/manage',
  verifyAuthToken,
  TicketingController.listManagementTicketTypes
);
router.post('/ticket-types', verifyAuthToken, TicketingController.createTicketType);
router.patch('/ticket-types/:id', verifyAuthToken, TicketingController.updateTicketType);
router.delete('/ticket-types/:id', verifyAuthToken, TicketingController.archiveOrDeleteTicketType);

router.post('/orders', verifyAuthToken, TicketingController.createOrder);
router.get('/orders', verifyAuthToken, TicketingController.listUserOrders);
router.get('/orders/:id', verifyAuthToken, TicketingController.getOrder);
router.post('/orders/:id/pay', verifyAuthToken, TicketingController.createOrderPaymentIntent);
router.post(
  '/orders/:id/payment-intent',
  verifyAuthToken,
  TicketingController.createOrderPaymentIntent
);
router.post(
  '/orders/:id/confirm-return',
  verifyAuthToken,
  TicketingController.confirmOrderPaymentReturn
);
router.post('/orders/:id/expire', verifyAuthToken, TicketingController.expireOrder);
router.post('/orders/:id/refund', verifyAuthToken, TicketingController.requestRefund);

router.get('/tickets', verifyAuthToken, TicketingController.listUserTickets);
router.get('/tickets/:id/qr', verifyAuthToken, TicketingController.getTicketQrToken);
router.post('/tickets/:id/qr/reissue', verifyAuthToken, TicketingController.reissueTicketQrToken);
router.post('/tickets/:id/transfer', verifyAuthToken, TicketingController.transferTicket);

router.post('/check-in', verifyAuthToken, TicketingController.checkInTicket);
router.post(
  '/check-in/offline-sessions',
  verifyAuthToken,
  TicketingController.createOfflineCheckInSession
);
router.post('/check-in/offline-sync', verifyAuthToken, TicketingController.syncOfflineCheckIns);

router.get('/events/:id/orders', verifyAuthToken, TicketingController.listEventOrders);
router.get('/events/:id/refunds', verifyAuthToken, TicketingController.listEventRefunds);
router.get('/events/:id/check-ins', verifyAuthToken, TicketingController.listEventCheckIns);
router.get('/events/:id/analytics', verifyAuthToken, TicketingController.getEventSalesAnalytics);

router.post('/promo-codes', verifyAuthToken, TicketingController.createPromoCode);
router.post('/waitlist', verifyAuthToken, TicketingController.joinWaitlist);

export default router;

=== server/domain/ticketing/schemas/ticketingSchema.ts — diff ===
@@ -216,5 +216,3 @@ export const syncOfflineCheckInsSchema = z
       .optional(),
   })
   .strict();
-
-

=== server/domain/ticketing/services/checkInService.ts — ARQUIVO NOVO, conteúdo completo ===
import { createEventAuditLogUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
import type { TicketingPort } from '../ports/ticketingPort';
import { type EventCheckIn, type Ticket } from '../types/ticketingTypes';
import { listTicketQrTokenLookupHashes } from '../utils/qrToken';
import {
  assertCanManageOccurrence,
  getAuditActorType,
  isActorAdmin,
  type TicketingActorContext,
} from './ticketingAccess';

/** QR do ingresso e check-in online. */
export class CheckInService {
  constructor(
    private readonly port: TicketingPort,
    private readonly qrTokenPort?: TicketQrTokenPort
  ) {}

  async generateTicketPresentationQr(
    actor: TicketingActorContext,
    ticketId: string
  ): Promise<{
    ticketId: string;
    token: string;
    expiresAt: string;
  }> {
    const ticket = await this.port.getTicketById(ticketId);
    if (!ticket) {
      throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
    }
    if (!isActorAdmin(actor) && ticket.ownerUserId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Apenas o titular pode acessar o QR Code deste ingresso.'
      );
    }
    if (ticket.status !== 'issued') {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `QR Code indisponível para ingresso com status ${ticket.status}.`
      );
    }

    const occurrence = await getEventOccurrenceByIdUseCase(ticket.occurrenceId);
    const nowSec = Math.floor(Date.now() / 1000);
    const occEndSec = occurrence
      ? Math.floor(new Date(occurrence.endsAt).getTime() / 1000) + 6 * 3600
      : nowSec + 24 * 3600;
    const expSec = Math.max(nowSec + 3600, occEndSec);

    if (!this.qrTokenPort) {
      throw new TicketingDomainError(
        'SERVICE_UNAVAILABLE',
        'Serviço de assinatura de QR Code não disponível.'
      );
    }

    const token = this.qrTokenPort.issue({
      v: 1,
      ticketId: ticket.id,
      occurrenceId: ticket.occurrenceId,
      qrVersion: ticket.qrVersion || 1,
      iat: nowSec,
      exp: expSec,
    });

    return {
      ticketId: ticket.id,
      token,
      expiresAt: new Date(expSec * 1000).toISOString(),
    };
  }

  async checkInTicket(
    actor: TicketingActorContext,
    params: {
      occurrenceId: string;
      ticketId?: string;
      qrToken?: string;
    }
  ): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
    const { listing } = await assertCanManageOccurrence(actor, params.occurrenceId);

    let targetTicketId = params.ticketId;
    if (!targetTicketId && params.qrToken) {
      const rawToken = params.qrToken.trim();
      if (this.qrTokenPort && rawToken.includes('.')) {
        const verified = this.qrTokenPort.verify(rawToken);
        if (!verified) {
          throw new TicketingDomainError(
            'UNPROCESSABLE_ENTITY',
            'Assinatura ou validade do QR Code inválida.'
          );
        }
        if (verified.occurrenceId !== params.occurrenceId) {
          throw new TicketingDomainError(
            'UNPROCESSABLE_ENTITY',
            'Este ingresso pertence a outra sessão/ocorrência do evento.'
          );
        }
        const ticket = await this.port.getTicketById(verified.ticketId);
        if (!ticket) {
          throw new TicketingDomainError(
            'NOT_FOUND',
            'Ingresso não localizado para o QR Code informado.'
          );
        }
        if ((ticket.qrVersion || 1) !== verified.qrVersion) {
          throw new TicketingDomainError(
            'UNPROCESSABLE_ENTITY',
            'Este QR Code foi substituído ou invalidado por transferência.'
          );
        }
        targetTicketId = ticket.id;
      } else {
        let ticket: Awaited<ReturnType<TicketingPort['getTicketByQrTokenHash']>> = null;
        for (const candidateHash of listTicketQrTokenLookupHashes(rawToken)) {
          ticket = await this.port.getTicketByQrTokenHash(candidateHash);
          if (ticket) break;
        }
        if (!ticket) {
          throw new TicketingDomainError(
            'NOT_FOUND',
            'Ingresso não localizado para o QR Code informado.'
          );
        }
        targetTicketId = ticket.id;
      }
    }

    if (!targetTicketId) {
      throw new TicketingDomainError('INVALID_ARGUMENT', 'ID do ingresso ou QR Code obrigatório.');
    }

    const result = await this.port.checkInTicketAtomic({
      ticketId: targetTicketId,
      occurrenceId: params.occurrenceId,
      checkedInBy: actor.uid,
      source: 'online',
    });

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'ticket',
      resourceId: result.ticket.id,
      action: 'ticket.checked_in',
      after: {
        occurrenceId: params.occurrenceId,
        checkedInAt: result.checkIn.checkedInAt,
        source: 'online',
      },
    });

    return result;
  }
}

=== server/domain/ticketing/services/offlineCheckInService.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';
import { createEventAuditLogUseCase } from '../../events';
import { hashTicketIdForOfflineManifest } from '../adapters/rsaPssTicketQrTokenAdapter';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
import type { TicketingPort } from '../ports/ticketingPort';
import {
  type OfflineCheckInEvent,
  type OfflineCheckInManifest,
  type OfflineCheckInSession,
  type OfflineCheckInSyncResultItem,
} from '../types/ticketingTypes';
import {
  assertCanManageOccurrence,
  getAuditActorType,
  type TicketingActorContext,
} from './ticketingAccess';

/** Check-in offline: manifesto assinado e sincronização. */
export class OfflineCheckInService {
  constructor(
    private readonly port: TicketingPort,
    private readonly qrTokenPort?: TicketQrTokenPort
  ) {}

  async prepareOfflineCheckInSession(
    actor: TicketingActorContext,
    params: {
      occurrenceId: string;
      stationId?: string;
    }
  ): Promise<{
    session: OfflineCheckInSession;
    manifest: OfflineCheckInManifest;
  }> {
    const { occurrence, listing } = await assertCanManageOccurrence(actor, params.occurrenceId);

    const nowMs = Date.now();
    const startsAtMs = new Date(occurrence.startsAt).getTime();
    const endsAtMs = new Date(occurrence.endsAt).getTime();
    const minPrepMs = startsAtMs - 24 * 3600 * 1000;
    const maxExpireMs = endsAtMs + 6 * 3600 * 1000;

    if (nowMs < minPrepMs) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'A preparação offline só é permitida a partir de 24 horas antes do início da ocorrência.'
      );
    }
    if (nowMs > maxExpireMs) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'O período operacional desta ocorrência para check-in offline já encerrou.'
      );
    }

    if (!this.qrTokenPort) {
      throw new TicketingDomainError(
        'SERVICE_UNAVAILABLE',
        'Chave pública de validação offline não configurada.'
      );
    }

    const { keyId, publicKeyJwk } = this.qrTokenPort.getPublicKeyMetadata();
    const allTickets = await this.port.listTicketsByOccurrenceId(occurrence.id);
    const eligibleTickets = allTickets
      .filter((t) => t.status === 'issued')
      .map((t) => ({
        ticketIdHash: hashTicketIdForOfflineManifest(t.id),
        qrVersion: t.qrVersion || 1,
      }));

    const issuedAt = new Date(nowMs).toISOString();
    const expiresAt = new Date(maxExpireMs).toISOString();
    const stationId = params.stationId?.trim() || 'station-default';

    const manifestPayloadForHash = JSON.stringify({
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      stationId,
      issuedAt,
      expiresAt,
      keyId,
      tickets: eligibleTickets,
    });
    const manifestHash = crypto.createHash('sha256').update(manifestPayloadForHash).digest('hex');

    const session = await this.port.createOfflineCheckInSession({
      partnerId: listing.ownerId,
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      stationId,
      issuedAt,
      expiresAt,
      manifestHash,
      status: 'active',
      keyId,
    });

    const manifest: OfflineCheckInManifest = {
      version: 1,
      sessionId: session.id,
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      stationId,
      issuedAt,
      expiresAt,
      keyId,
      publicKeyJwk,
      tickets: eligibleTickets,
    };

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'occurrence',
      resourceId: occurrence.id,
      action: 'offline_checkin.session_prepared',
      after: {
        sessionId: session.id,
        stationId,
        eligibleCount: eligibleTickets.length,
        expiresAt,
      },
    });

    return { session, manifest };
  }

  async syncOfflineCheckInEvents(
    actor: TicketingActorContext,
    params: {
      sessionId: string;
      events: OfflineCheckInEvent[];
    }
  ): Promise<{
    sessionId: string;
    results: OfflineCheckInSyncResultItem[];
  }> {
    const session = await this.port.getOfflineCheckInSessionById(params.sessionId);
    if (!session) {
      throw new TicketingDomainError('NOT_FOUND', 'Sessão de check-in offline não encontrada.');
    }

    const { listing } = await assertCanManageOccurrence(actor, session.occurrenceId);

    if (session.status !== 'active') {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `Sessão offline não está ativa (status: ${session.status}).`
      );
    }

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      return {
        sessionId: session.id,
        results: params.events.map((ev) => ({
          clientEventId: ev.clientEventId,
          status: 'expired',
        })),
      };
    }

    const results = await this.port.syncOfflineCheckInsAtomic({
      session,
      checkedInBy: actor.uid,
      events: params.events,
    });

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'occurrence',
      resourceId: session.occurrenceId,
      action: 'offline_checkin.synced',
      after: {
        sessionId: session.id,
        eventsProcessed: params.events.length,
      },
    });

    return {
      sessionId: session.id,
      results,
    };
  }
}

=== server/domain/ticketing/services/orders/orderSaleGuards.ts — ARQUIVO NOVO, conteúdo completo ===
import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../../events';
import {
  TicketTypeUnavailableError,
  TicketingDomainError,
} from '../../errors/ticketingDomainError';
import type { TicketingPort } from '../../ports/ticketingPort';
import type { EventPromoCode } from '../../types/ticketingTypes';

/** Sessão aberta para venda: evento publicado e dentro da janela de vendas. */
export async function loadOccurrenceOnSale(occurrenceId: string, nowMs: number) {
  const occurrence = await getEventOccurrenceByIdUseCase(occurrenceId);
  if (!occurrence) {
    throw new TicketingDomainError('NOT_FOUND', 'Sessão do evento não encontrada.');
  }
  if (occurrence.status !== 'scheduled') {
    throw new TicketTypeUnavailableError('Esta sessão não está aberta para venda de ingressos.');
  }

  const listing = await getEventListingByIdUseCase(occurrence.eventListingId);
  if (listing?.status !== 'published' || listing.visibility === 'private') {
    throw new TicketTypeUnavailableError('Este evento não está disponível para compras.');
  }

  if (occurrence.salesStartsAt && nowMs < new Date(occurrence.salesStartsAt).getTime()) {
    throw new TicketTypeUnavailableError('As vendas para esta sessão ainda não iniciaram.');
  }
  const effectiveEnd = occurrence.salesEndsAt || occurrence.startsAt;
  if (nowMs > new Date(effectiveEnd).getTime()) {
    throw new TicketTypeUnavailableError('O período de vendas desta sessão já encerrou.');
  }
  return { occurrence, listing };
}

/** Limite de ingressos por comprador na sessão, contando os emitidos e os reservados em pedidos abertos. */
export async function assertBuyerWithinTicketLimit(
  port: TicketingPort,
  params: { buyerUid: string; occurrenceId: string; requested: number; max: number; nowMs: number }
): Promise<void> {
  const { buyerUid, occurrenceId, nowMs } = params;
  const occurrenceTickets = await port.listTicketsByOccurrenceId(occurrenceId);
  const occurrenceOrders = await port.listOrdersByOccurrenceId(occurrenceId);
  const activeHolderTicketsCount = occurrenceTickets.filter(
    (t) =>
      t.ownerUserId === buyerUid &&
      (t.status === 'reserved' || t.status === 'issued' || t.status === 'checked_in')
  ).length;
  const activePendingOrders = occurrenceOrders.filter(
    (o) =>
      o.buyerId === buyerUid &&
      (o.status === 'pending_payment' || o.status === 'payment_processing') &&
      (!o.expiresAt || new Date(o.expiresAt).getTime() > nowMs)
  );
  let activeReservedOrderTicketsCount = 0;
  for (const pendingOrder of activePendingOrders) {
    const orderItems = await port.listOrderItemsByOrderId(pendingOrder.id);
    activeReservedOrderTicketsCount += orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
  }
  if (activeHolderTicketsCount + activeReservedOrderTicketsCount + params.requested > params.max) {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      `Limite máximo de ${params.max} ingressos por usuário nesta ocorrência excedido.`
    );
  }
}

/** Cupom ativo, vigente e com usos disponíveis. */
export async function loadActivePromo(
  port: TicketingPort,
  listingId: string,
  code: string,
  nowMs: number
): Promise<EventPromoCode> {
  const promo = await port.getPromoCodeByCode(listingId, code);
  if (!promo?.isActive) {
    throw new TicketingDomainError('INVALID_ARGUMENT', 'Cupom promocional inválido ou inativo.');
  }
  if (promo.startsAt && nowMs < new Date(promo.startsAt).getTime()) {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      'Cupom promocional ainda não está vigente.'
    );
  }
  if (promo.endsAt && nowMs > new Date(promo.endsAt).getTime()) {
    throw new TicketingDomainError('UNPROCESSABLE_ENTITY', 'Cupom promocional expirado.');
  }
  if (promo.maxUses !== undefined && promo.usedCount >= promo.maxUses) {
    throw new TicketingDomainError('UNPROCESSABLE_ENTITY', 'Limite de uso deste cupom atingido.');
  }
  return promo;
}

=== server/domain/ticketing/services/orders/prepareOrderItems.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  InventoryConflictError,
  TicketTypeUnavailableError,
  TicketingDomainError,
} from '../../errors/ticketingDomainError';
import {
  deriveTicketTypeSaleStatus,
  type EventPromoCode,
  type TicketType,
} from '../../types/ticketingTypes';
import { generateOpaqueTicketQrToken } from '../../utils/qrToken';

export interface OrderItemRequest {
  ticketTypeId: string;
  quantity: number;
  holders?: Array<{ name: string; email: string }>;
}

/**
 * Confere cada lote (quantidade, estoque, janela de venda), aplica o cupom, gera os QR opacos dos titulares
 * e reparte a taxa da plataforma entre os itens. Preço sempre do lote no servidor (AGENTS.md §8.5).
 */
export function prepareOrderItems(params: {
  items: OrderItemRequest[];
  typeMap: Map<string, TicketType>;
  occurrenceCapacity: number;
  totalCommitted: number;
  nowMs: number;
  promo: EventPromoCode | null;
  buyer: { name: string; email: string };
  feePercent: number;
}) {
  let subtotalMinor = 0;
  let discountMinor = 0;

  const rawItemsPrepared: Array<{
    ticketType: TicketType;
    quantity: number;
    unitPriceMinor: number;
    lineSubtotal: number;
    lineDiscount: number;
    lineNetAfterDiscount: number;
    holders: Array<{
      name: string;
      email: string;
      qrTokenHash: string;
      rawQrToken: string;
    }>;
  }> = [];

  for (const reqItem of params.items) {
    const ticketType = params.typeMap.get(reqItem.ticketTypeId);
    if (!ticketType) {
      throw new TicketingDomainError('NOT_FOUND', 'Lote de ingresso não encontrado.');
    }

    if (reqItem.quantity < ticketType.minPerOrder || reqItem.quantity > ticketType.maxPerOrder) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `A quantidade para "${ticketType.name}" deve estar entre ${ticketType.minPerOrder} e ${ticketType.maxPerOrder}.`
      );
    }

    const { saleStatus, availableQuantity } = deriveTicketTypeSaleStatus({
      ticketType,
      occurrenceCapacity: params.occurrenceCapacity,
      occurrenceCommittedCount: params.totalCommitted,
      nowMs: params.nowMs,
    });

    if (saleStatus !== 'on_sale') {
      if (saleStatus === 'sold_out') {
        throw new InventoryConflictError(`O lote "${ticketType.name}" está esgotado.`);
      }
      throw new TicketTypeUnavailableError(
        `O lote "${ticketType.name}" não está aberto para vendas.`
      );
    }

    if (reqItem.quantity > availableQuantity) {
      throw new InventoryConflictError(
        `Restam apenas ${availableQuantity} ingressos disponíveis para "${ticketType.name}".`
      );
    }

    const unitPriceMinor = ticketType.priceMinor;
    const lineSubtotal = unitPriceMinor * reqItem.quantity;
    let lineDiscount = 0;

    const promo = params.promo;
    if (promo && (!promo.ticketTypeIds || promo.ticketTypeIds.includes(ticketType.id))) {
      if (promo.type === 'percentage' && promo.percentage) {
        lineDiscount = Math.floor((lineSubtotal * promo.percentage) / 100);
      } else if (promo.type === 'fixed' && promo.valueMinor) {
        lineDiscount = Math.min(lineSubtotal, promo.valueMinor);
      }
    }

    const lineNetAfterDiscount = Math.max(0, lineSubtotal - lineDiscount);
    subtotalMinor += lineSubtotal;
    discountMinor += lineDiscount;

    const holders: Array<{
      name: string;
      email: string;
      qrTokenHash: string;
      rawQrToken: string;
    }> = [];

    for (let idx = 0; idx < reqItem.quantity; idx += 1) {
      const customHolder = reqItem.holders?.[idx];
      const { rawQrToken, qrTokenHash } = generateOpaqueTicketQrToken();
      holders.push({
        name: customHolder?.name?.trim() || params.buyer.name.trim(),
        email: customHolder?.email?.trim() || params.buyer.email.trim(),
        qrTokenHash,
        rawQrToken,
      });
    }

    rawItemsPrepared.push({
      ticketType,
      quantity: reqItem.quantity,
      unitPriceMinor,
      lineSubtotal,
      lineDiscount,
      lineNetAfterDiscount,
      holders,
    });
  }

  const netSubtotalMinor = Math.max(0, subtotalMinor - discountMinor);
  const platformFeeMinor =
    netSubtotalMinor > 0 && params.feePercent > 0
      ? Math.round((netSubtotalMinor * params.feePercent) / 100)
      : 0;
  const paymentFeeMinor = 0;
  const totalMinor = netSubtotalMinor;

  let remainingFeeToAllocate = platformFeeMinor;
  const preparedItems = rawItemsPrepared.map((item, idx) => {
    const isLast = idx === rawItemsPrepared.length - 1;
    const allocatedPlatformFeeMinor =
      netSubtotalMinor > 0
        ? isLast
          ? remainingFeeToAllocate
          : Math.floor((platformFeeMinor * item.lineNetAfterDiscount) / netSubtotalMinor)
        : 0;
    remainingFeeToAllocate = Math.max(0, remainingFeeToAllocate - allocatedPlatformFeeMinor);

    return {
      ticketTypeId: item.ticketType.id,
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
      discountMinor: item.lineDiscount,
      allocatedPlatformFeeMinor,
      allocatedPaymentFeeMinor: 0,
      totalMinor: item.lineNetAfterDiscount,
      ticketTypeSnapshot: {
        name: item.ticketType.name,
        kind: item.ticketType.kind,
      },
      holders: item.holders,
    };
  });
  return {
    subtotalMinor,
    discountMinor,
    platformFeeMinor,
    paymentFeeMinor,
    totalMinor,
    preparedItems,
  };
}

=== server/domain/ticketing/services/ticketHolderService.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  createEventAuditLogUseCase,
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
} from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import { type EventWaitlistEntry, type Ticket, type TicketTransfer } from '../types/ticketingTypes';
import { generateOpaqueTicketQrToken } from '../utils/qrToken';
import {
  assertCanManageOccurrence,
  getAuditActorType,
  type TicketingActorContext,
} from './ticketingAccess';

/** Titularidade do ingresso: transferência, troca de sessão e lista de espera. */
export class TicketHolderService {
  constructor(private readonly port: TicketingPort) {}

  async transferTicket(
    actor: TicketingActorContext,
    params: {
      ticketId: string;
      recipientEmail: string;
      recipientName?: string;
      toUserId?: string;
    }
  ): Promise<{
    oldTicket: Ticket;
    newTicket: Ticket;
    transfer: TicketTransfer;
    newRawQrToken: string;
  }> {
    const ticket = await this.port.getTicketById(params.ticketId);
    if (!ticket) {
      throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
    }

    const [order, listing, occurrence] = await Promise.all([
      this.port.getOrderById(ticket.orderId),
      getEventListingByIdUseCase(ticket.eventListingId),
      getEventOccurrenceByIdUseCase(ticket.occurrenceId),
    ]);

    const allowTransfer =
      order?.refundPolicySnapshot?.allowTicketTransfer ??
      listing?.refundPolicy?.allowTicketTransfer ??
      true;

    if (!allowTransfer) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'A política deste evento não permite transferência de titularidade.'
      );
    }

    if (occurrence) {
      if (occurrence.status !== 'scheduled') {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Não é possível transferir ingressos de uma sessão encerrada ou cancelada.'
        );
      }

      const startsAtMs = new Date(occurrence.startsAt).getTime();
      const nowMs = Date.now();
      const cutoffHours =
        order?.refundPolicySnapshot?.ticketTransferCutoffHours ??
        listing?.refundPolicy?.ticketTransferCutoffHours ??
        4;
      const hoursUntilStart = (startsAtMs - nowMs) / (1000 * 60 * 60);
      if (hoursUntilStart < cutoffHours) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `O prazo limite para transferência de titularidade encerrou (${cutoffHours}h antes do início do evento).`
        );
      }
    }

    const { rawQrToken, qrTokenHash } = generateOpaqueTicketQrToken();
    const res = await this.port.transferTicketAtomic({
      ticketId: params.ticketId,
      fromUserId: actor.uid,
      toUserId: params.toUserId,
      recipientEmail: params.recipientEmail.trim(),
      recipientName: params.recipientName?.trim(),
      newQrTokenHash: qrTokenHash,
    });

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: 'user',
      resourceType: 'ticket',
      resourceId: res.newTicket.id,
      action: 'ticket.transferred',
      before: { oldTicketId: res.oldTicket.id, fromUserId: actor.uid },
      after: {
        newTicketId: res.newTicket.id,
        recipientEmail: params.recipientEmail,
      },
    });

    return {
      ...res,
      newRawQrToken: rawQrToken,
    };
  }

  async moveOrdersAndTicketsToOccurrence(
    actor: TicketingActorContext,
    params: {
      fromOccurrenceId: string;
      toOccurrenceId: string;
    }
  ): Promise<{ movedOrdersCount: number; movedTicketsCount: number }> {
    const { listing } = await assertCanManageOccurrence(actor, params.fromOccurrenceId);
    const targetOccurrence = await getEventOccurrenceByIdUseCase(params.toOccurrenceId);
    if (!targetOccurrence || targetOccurrence.eventListingId !== listing.id) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'A nova ocorrência deve pertencer ao mesmo evento.'
      );
    }

    const moved = await this.port.moveOrdersAndTicketsToOccurrenceAtomic({
      fromOccurrenceId: params.fromOccurrenceId,
      toOccurrenceId: params.toOccurrenceId,
      newStartsAt: targetOccurrence.startsAt,
      newEndsAt: targetOccurrence.endsAt,
    });

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'occurrence',
      resourceId: params.fromOccurrenceId,
      action: 'occurrence.orders_migrated',
      after: {
        toOccurrenceId: params.toOccurrenceId,
        ...moved,
      },
    });

    return moved;
  }

  async joinWaitlist(
    actor: TicketingActorContext,
    input: {
      occurrenceId: string;
      ticketTypeId?: string;
      quantity: number;
    }
  ): Promise<EventWaitlistEntry> {
    const occurrence = await getEventOccurrenceByIdUseCase(input.occurrenceId);
    if (!occurrence) {
      throw new TicketingDomainError('NOT_FOUND', 'Sessão do evento não encontrada.');
    }
    return this.port.createWaitlistEntry({
      occurrenceId: input.occurrenceId,
      userId: actor.uid,
      ticketTypeId: input.ticketTypeId,
      quantity: input.quantity,
    });
  }
}

=== server/domain/ticketing/services/ticketOrderService.ts — ARQUIVO NOVO, conteúdo completo ===
import { createEventAuditLogUseCase, getEventListingByIdUseCase } from '../../events';
import { OrderNotFoundError, TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import { resolvePlatformFeePercent } from '../../../shared/kernel/platformFee';
import {
  canTransitionOrderStatus,
  CHECKOUT_RESERVATION_MINUTES,
  type Ticket,
  type TicketOrder,
  type TicketOrderItem,
  type TicketType,
} from '../types/ticketingTypes';
import { generateOpaqueTicketQrToken } from '../utils/qrToken';
import {
  assertBuyerWithinTicketLimit,
  loadActivePromo,
  loadOccurrenceOnSale,
} from './orders/orderSaleGuards';
import { prepareOrderItems } from './orders/prepareOrderItems';
import { isActorAdmin, type TicketingActorContext } from './ticketingAccess';

/** Pedidos de ingresso: criação com reserva de estoque, pagamento e expiração. */
export class TicketOrderService {
  constructor(private readonly port: TicketingPort) {}

  async createTicketOrder(
    actor: TicketingActorContext,
    input: {
      occurrenceId: string;
      items: Array<{
        ticketTypeId: string;
        quantity: number;
        holders?: Array<{ name: string; email: string }>;
      }>;
      buyer: { name: string; email: string };
      promoCode?: string;
      promoterCode?: string;
      idempotencyKey: string;
    }
  ): Promise<{
    order: TicketOrder;
    items: TicketOrderItem[];
    issuedTickets: Array<{ ticket: Ticket; rawQrToken?: string }>;
    isIdempotentReplay: boolean;
    serverNow: string;
  }> {
    const nowMs = Date.now();
    const { occurrence, listing } = await loadOccurrenceOnSale(input.occurrenceId, nowMs);

    const existingReplayOrder = await this.port.getOrderByIdempotencyKey(
      actor.uid,
      input.idempotencyKey
    );
    if (!existingReplayOrder) {
      await assertBuyerWithinTicketLimit(this.port, {
        buyerUid: actor.uid,
        occurrenceId: occurrence.id,
        requested: input.items.reduce((sum, item) => sum + item.quantity, 0),
        max: listing.maxTicketsPerUserPerOccurrence ?? 5,
        nowMs,
      });
    }

    const allTypes = await this.port.listTicketTypesByOccurrenceId(occurrence.id);
    const typeMap = new Map(allTypes.map((t) => [t.id, t]));
    const totalCommitted = allTypes.reduce((sum, t) => sum + t.soldCount + t.reservedCount, 0);

    const promo = input.promoCode
      ? await loadActivePromo(this.port, listing.id, input.promoCode, nowMs)
      : null;

    const {
      subtotalMinor,
      discountMinor,
      platformFeeMinor,
      paymentFeeMinor,
      totalMinor,
      preparedItems,
    } = prepareOrderItems({
      items: input.items,
      typeMap,
      occurrenceCapacity: occurrence.capacity,
      totalCommitted,
      nowMs,
      promo,
      buyer: input.buyer,
      feePercent: resolvePlatformFeePercent(),
    });

    const expiresAt = new Date(nowMs + CHECKOUT_RESERVATION_MINUTES * 60 * 1000).toISOString();
    const issueImmediately = totalMinor === 0;

    const result = await this.port.reserveInventoryAndCreateOrderAtomic({
      occurrenceId: occurrence.id,
      occurrenceCapacity: occurrence.capacity,
      eventListingId: listing.id,
      buyerId: actor.uid,
      idempotencyKey: input.idempotencyKey,
      currency: 'BRL',
      subtotalMinor,
      discountMinor,
      platformFeeMinor,
      paymentFeeMinor,
      totalMinor,
      promoCodeId: promo?.id,
      promoterCode: input.promoterCode,
      buyerSnapshot: {
        name: input.buyer.name.trim(),
        email: input.buyer.email.trim(),
      },
      eventSnapshot: {
        title: listing.title,
        startsAt: occurrence.startsAt,
        endsAt: occurrence.endsAt,
        locationName: occurrence.locationOverride?.name || listing.location.name,
      },
      refundPolicySnapshot: {
        enabled:
          listing.refundPolicy.allowBuyerCancellation ?? listing.refundPolicy.enabled ?? true,
        cancellationWindowHours:
          listing.refundPolicy.buyerCancellationWindowHours ??
          listing.refundPolicy.cancellationWindowHours ??
          24,
        allowBuyerCancellation:
          listing.refundPolicy.allowBuyerCancellation ?? listing.refundPolicy.enabled ?? true,
        buyerCancellationWindowHours:
          listing.refundPolicy.buyerCancellationWindowHours ??
          listing.refundPolicy.cancellationWindowHours ??
          24,
        allowTicketTransfer: listing.refundPolicy.allowTicketTransfer ?? true,
        ticketTransferCutoffHours: listing.refundPolicy.ticketTransferCutoffHours ?? 4,
      },
      expiresAt,
      items: preparedItems,
      issueImmediately,
    });

    if (!result.isIdempotentReplay) {
      await createEventAuditLogUseCase({
        actorId: actor.uid,
        actorType: 'user',
        resourceType: 'order',
        resourceId: result.order.id,
        action: issueImmediately
          ? 'order.created_and_issued_free'
          : 'order.created_pending_payment',
        after: {
          orderId: result.order.id,
          totalMinor: result.order.totalMinor,
          status: result.order.status,
        },
      });
    }

    return {
      order: result.order,
      items: result.items,
      issuedTickets: result.issuedTickets,
      isIdempotentReplay: result.isIdempotentReplay,
      serverNow: new Date().toISOString(),
    };
  }

  async confirmTicketOrderPayment(params: {
    orderId: string;
    paymentId?: string;
    paymentIntentId?: string;
  }): Promise<{
    order: TicketOrder;
    tickets: Ticket[];
    alreadyPaid: boolean;
  }> {
    const order = await this.port.getOrderById(params.orderId);
    if (!order) {
      throw new OrderNotFoundError();
    }

    const items = await this.port.listOrderItemsByOrderId(order.id);
    const ticketsToIssue: Array<{
      orderItemId: string;
      ticketTypeId: string;
      holderName: string;
      holderEmail: string;
      qrTokenHash: string;
      ticketTypeSnapshot: {
        name: string;
        kind: TicketType['kind'];
        unitPriceMinor: number;
        effectivePaidMinor?: number;
      };
    }> = [];

    for (const item of items) {
      const perTicketPaidMinor =
        item.quantity > 0 ? Math.floor(item.totalMinor / item.quantity) : 0;
      for (let i = 0; i < item.quantity; i += 1) {
        const { qrTokenHash } = generateOpaqueTicketQrToken();
        ticketsToIssue.push({
          orderItemId: item.id,
          ticketTypeId: item.ticketTypeId,
          holderName: order.buyerSnapshot.name,
          holderEmail: order.buyerSnapshot.email,
          qrTokenHash,
          ticketTypeSnapshot: {
            name: item.ticketTypeSnapshot.name,
            kind: item.ticketTypeSnapshot.kind,
            unitPriceMinor: item.unitPriceMinor,
            effectivePaidMinor: perTicketPaidMinor,
          },
        });
      }
    }

    const confirmed = await this.port.confirmOrderPaymentAndIssueTicketsAtomic({
      orderId: order.id,
      paymentId: params.paymentId,
      paymentIntentId: params.paymentIntentId,
      ticketsToIssue,
    });

    if (!confirmed.alreadyPaid) {
      await createEventAuditLogUseCase({
        actorId: order.buyerId,
        actorType: 'system',
        resourceType: 'order',
        resourceId: order.id,
        action: 'order.paid_and_tickets_issued',
        after: {
          orderId: order.id,
          paymentId: params.paymentId,
          ticketsCount: confirmed.tickets.length,
        },
      });
    }

    return confirmed;
  }

  async updateOrderPaymentState(params: {
    orderId: string;
    status: TicketOrder['status'];
    paymentId?: string;
    paymentIntentId?: string;
  }): Promise<TicketOrder> {
    const order = await this.port.getOrderById(params.orderId);
    if (!order) {
      throw new OrderNotFoundError();
    }
    if (!canTransitionOrderStatus(order.status, params.status)) {
      return order;
    }
    return this.port.updateOrderStatus(order.id, params.status, {
      ...(params.paymentId ? { paymentId: params.paymentId } : {}),
      ...(params.paymentIntentId ? { paymentIntentId: params.paymentIntentId } : {}),
    });
  }

  async expireTicketOrder(
    orderId: string,
    actor?: TicketingActorContext
  ): Promise<{
    order: TicketOrder | null;
    releasedQuantity: number;
    alreadyReleased: boolean;
  }> {
    if (actor) {
      const existing = await this.port.getOrderById(orderId);
      if (!existing) {
        throw new OrderNotFoundError();
      }
      if (!isActorAdmin(actor) && existing.buyerId !== actor.uid) {
        throw new TicketingDomainError('FORBIDDEN', 'Sem permissão para expirar este pedido.');
      }
      if (existing.status === 'expired') {
        return {
          order: existing,
          releasedQuantity: 0,
          alreadyReleased: true,
        };
      }
    }
    return this.port.expireOrderAndReleaseInventoryAtomic(orderId);
  }

  async expireAllOverdueOrders(nowIso = new Date().toISOString()): Promise<number> {
    const expiredOrders = await this.port.listExpiredPendingOrders(nowIso);
    let count = 0;
    for (const order of expiredOrders) {
      const res = await this.port.expireOrderAndReleaseInventoryAtomic(order.id);
      if (!res.alreadyReleased) count += 1;
    }
    return count;
  }

  async getOrderForUser(
    actor: TicketingActorContext,
    orderId: string
  ): Promise<{
    order: TicketOrder;
    items: TicketOrderItem[];
    tickets: Ticket[];
    serverNow: string;
  }> {
    const order = await this.port.getOrderById(orderId);
    if (!order) {
      throw new OrderNotFoundError();
    }

    const listing = await getEventListingByIdUseCase(order.eventListingId);
    const isOwnerPartner = listing && listing.ownerId === actor.uid;

    if (!isActorAdmin(actor) && !isOwnerPartner && order.buyerId !== actor.uid) {
      throw new TicketingDomainError('FORBIDDEN', 'Sem permissão para visualizar este pedido.');
    }

    const [items, tickets] = await Promise.all([
      this.port.listOrderItemsByOrderId(order.id),
      this.port.listTicketsByOrderId(order.id),
    ]);

    return {
      order,
      items,
      tickets,
      serverNow: new Date().toISOString(),
    };
  }

  async listUserOrders(actor: TicketingActorContext): Promise<TicketOrder[]> {
    return this.port.listOrdersByBuyerId(actor.uid);
  }

  async listUserTickets(actor: TicketingActorContext): Promise<Ticket[]> {
    return this.port.listTicketsByOwnerUserId(actor.uid);
  }
}

=== server/domain/ticketing/services/ticketRefundService.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  createEventAuditLogUseCase,
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
} from '../../events';
import {
  OrderNotFoundError,
  RefundNotAllowedError,
  TicketingDomainError,
} from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import { type Refund, type TicketOrder } from '../types/ticketingTypes';
import { getAuditActorType, isActorAdmin, type TicketingActorContext } from './ticketingAccess';

/** Reembolso pedido pelo comprador e conclusão pelo webhook. */
export class TicketRefundService {
  constructor(private readonly port: TicketingPort) {}

  async requestTicketRefund(
    actor: TicketingActorContext,
    params: {
      orderId: string;
      ticketId?: string;
      reason: string;
      idempotencyKey: string;
      isEventCanceledByOrganizer?: boolean;
    }
  ): Promise<{ refund: Refund; isReplay: boolean; order: TicketOrder }> {
    const order = await this.port.getOrderById(params.orderId);
    if (!order) {
      throw new OrderNotFoundError();
    }

    const listing = await getEventListingByIdUseCase(order.eventListingId);
    const occurrence = await getEventOccurrenceByIdUseCase(order.occurrenceId);
    const isPartnerOwner = listing && listing.ownerId === actor.uid;
    const isAdmin = isActorAdmin(actor);

    if (!isAdmin && !isPartnerOwner && order.buyerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para solicitar reembolso deste pedido.'
      );
    }

    if (order.status !== 'paid' && order.status !== 'partially_refunded') {
      throw new RefundNotAllowedError(
        `Apenas pedidos pagos podem ser reembolsados (status atual: ${order.status}).`
      );
    }

    if (params.ticketId && !isAdmin && !isPartnerOwner) {
      throw new RefundNotAllowedError(
        'O reembolso autoatendimento do comprador aplica-se apenas ao pedido integral.'
      );
    }

    const occurrenceCanceledOrPostponed =
      occurrence?.status === 'canceled' ||
      occurrence?.status === 'postponed' ||
      params.isEventCanceledByOrganizer === true;

    if (!isAdmin && !isPartnerOwner && !occurrenceCanceledOrPostponed) {
      if (!order.refundPolicySnapshot.allowBuyerCancellation) {
        throw new RefundNotAllowedError(
          'A política deste evento não permite cancelamento voluntário.'
        );
      }

      if (occurrence) {
        const startsAtMs = new Date(occurrence.startsAt).getTime();
        const nowMs = Date.now();
        if (nowMs >= startsAtMs) {
          throw new RefundNotAllowedError(
            'Não é possível solicitar reembolso após o início do evento.'
          );
        }
        const windowHours =
          order.refundPolicySnapshot.buyerCancellationWindowHours ??
          order.refundPolicySnapshot.cancellationWindowHours ??
          24;
        const hoursUntilStart = (startsAtMs - nowMs) / (1000 * 60 * 60);
        if (hoursUntilStart < windowHours) {
          throw new RefundNotAllowedError(
            `O prazo para solicitação de reembolso encerrou (${windowHours}h antes do início do evento).`
          );
        }
      }
    }

    let amountMinor = order.totalMinor;
    if (params.ticketId) {
      const ticket = await this.port.getTicketById(params.ticketId);
      if (!ticket || ticket.orderId !== order.id) {
        throw new TicketingDomainError('NOT_FOUND', 'Ingresso não pertence a este pedido.');
      }
      if (ticket.ticketTypeSnapshot?.effectivePaidMinor !== undefined) {
        amountMinor = ticket.ticketTypeSnapshot.effectivePaidMinor;
      } else {
        const orderItems = await this.port.listOrderItemsByOrderId(order.id);
        const matchingItem = orderItems.find((i) => i.ticketTypeId === ticket.ticketTypeId);
        if (matchingItem && matchingItem.quantity > 0) {
          amountMinor = Math.floor(matchingItem.totalMinor / matchingItem.quantity);
        } else {
          throw new RefundNotAllowedError(
            'Não foi possível calcular a alocação financeira exata deste ingresso.'
          );
        }
      }
    }

    const requestedBy: Refund['requestedBy'] = isAdmin
      ? 'admin'
      : isPartnerOwner
        ? 'partner'
        : 'buyer';

    const { refund, isReplay } = await this.port.createRefundAtomic({
      orderId: order.id,
      ticketId: params.ticketId,
      amountMinor,
      requestedBy,
      reason: params.reason.trim(),
      idempotencyKey: params.idempotencyKey,
    });

    if (!isReplay) {
      await createEventAuditLogUseCase({
        actorId: actor.uid,
        actorType: getAuditActorType(actor, listing?.ownerId),
        resourceType: 'refund',
        resourceId: refund.id,
        action: 'refund.requested',
        reason: params.reason,
        after: {
          orderId: order.id,
          amountMinor,
          status: refund.status,
        },
      });
    }

    return { refund, isReplay, order };
  }

  async finalizeRefundStatus(
    refundId: string,
    status: Refund['status'],
    providerRefundId?: string | null
  ): Promise<Refund> {
    return this.port.updateRefundStatus(refundId, status, providerRefundId);
  }
}

=== server/domain/ticketing/services/ticketTypeService.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  createEventAuditLogUseCase,
  getEventListingByIdUseCase,
  getEventOccurrenceByIdUseCase,
  updateEventListingPricingSummaryUseCase,
} from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import {
  assertMoneyMinor,
  deriveTicketTypeSaleStatus,
  type EventPromoCode,
  type PublicTicketTypeProjection,
  type TicketType,
} from '../types/ticketingTypes';
import {
  assertCanManageOccurrence,
  getAuditActorType,
  isActorAdmin,
  type TicketingActorContext,
} from './ticketingAccess';

/** Lotes de ingresso, cupons e o resumo de preço do evento. */
export class TicketTypeService {
  constructor(private readonly port: TicketingPort) {}

  private async refreshListingPricingSummary(
    eventListingId: string,
    occurrenceId: string
  ): Promise<void> {
    try {
      const types = await this.port.listTicketTypesByOccurrenceId(occurrenceId);
      const activeTypes = types.filter((t) => t.status !== 'archived');
      if (activeTypes.length === 0) return;

      const hasPaid = activeTypes.some((t) => t.priceMinor > 0);
      const paidPrices = activeTypes.filter((t) => t.priceMinor > 0).map((t) => t.priceMinor);
      const startingPriceMinor = paidPrices.length > 0 ? Math.min(...paidPrices) : 0;

      await updateEventListingPricingSummaryUseCase(eventListingId, {
        pricingMode: hasPaid ? 'paid' : 'free',
        startingPriceMinor,
      });
    } catch {
      // Ignora erro não-bloqueante de sumário
    }
  }

  async createTicketType(
    actor: TicketingActorContext,
    input: {
      occurrenceId: string;
      name: string;
      description?: string;
      kind: TicketType['kind'];
      priceMinor: number;
      currency?: 'BRL';
      quantity: number;
      minPerOrder?: number;
      maxPerOrder?: number;
      salesStartsAt?: string;
      salesEndsAt?: string;
      status?: TicketType['status'];
      visibility?: TicketType['visibility'];
      requiresEligibilityProof?: boolean;
      sortOrder?: number;
    }
  ): Promise<TicketType> {
    assertMoneyMinor(input.priceMinor);
    const { occurrence, listing } = await assertCanManageOccurrence(actor, input.occurrenceId);

    if (input.quantity > occurrence.capacity) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `A quantidade do lote (${input.quantity}) não pode exceder a capacidade da ocorrência (${occurrence.capacity}).`
      );
    }

    const created = await this.port.createTicketType({
      occurrenceId: input.occurrenceId,
      eventListingId: listing.id,
      name: input.name.trim(),
      description: input.description?.trim(),
      kind: input.kind,
      priceMinor: input.kind === 'free' || input.kind === 'courtesy' ? 0 : input.priceMinor,
      currency: 'BRL',
      quantity: input.quantity,
      minPerOrder: input.minPerOrder ?? 1,
      maxPerOrder: input.maxPerOrder ?? 10,
      salesStartsAt: input.salesStartsAt,
      salesEndsAt: input.salesEndsAt,
      status: input.status ?? 'on_sale',
      visibility: input.visibility ?? 'public',
      requiresEligibilityProof: input.requiresEligibilityProof,
      sortOrder: input.sortOrder ?? 0,
    });

    await this.refreshListingPricingSummary(listing.id, occurrence.id);

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'ticketType',
      resourceId: created.id,
      action: 'ticket_type.created',
      after: {
        name: created.name,
        kind: created.kind,
        priceMinor: created.priceMinor,
        quantity: created.quantity,
      },
    });

    return created;
  }

  async updateTicketType(
    actor: TicketingActorContext,
    ticketTypeId: string,
    patch: Partial<
      Pick<
        TicketType,
        | 'name'
        | 'description'
        | 'priceMinor'
        | 'quantity'
        | 'minPerOrder'
        | 'maxPerOrder'
        | 'salesStartsAt'
        | 'salesEndsAt'
        | 'status'
        | 'visibility'
        | 'requiresEligibilityProof'
        | 'sortOrder'
      >
    >
  ): Promise<TicketType> {
    const existing = await this.port.getTicketTypeById(ticketTypeId);
    if (!existing) {
      throw new TicketingDomainError('NOT_FOUND', 'Lote de ingresso não encontrado.');
    }

    const { occurrence, listing } = await assertCanManageOccurrence(actor, existing.occurrenceId);

    const committed = existing.soldCount + existing.reservedCount;
    if (patch.quantity !== undefined) {
      if (patch.quantity < committed) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `Não é permitido reduzir a quantidade do lote (${patch.quantity}) abaixo dos ingressos já vendidos/reservados (${committed}).`
        );
      }
      if (patch.quantity > occurrence.capacity) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `A quantidade do lote não pode ultrapassar a capacidade da sessão (${occurrence.capacity}).`
        );
      }
    }

    if (
      patch.priceMinor !== undefined &&
      patch.priceMinor !== existing.priceMinor &&
      existing.soldCount > 0
    ) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'Não é permitido alterar o preço de um lote que já possui vendas confirmadas. Crie um novo lote.'
      );
    }

    const updated = await this.port.updateTicketType(ticketTypeId, patch);
    await this.refreshListingPricingSummary(listing.id, occurrence.id);

    await createEventAuditLogUseCase({
      actorId: actor.uid,
      actorType: getAuditActorType(actor, listing.ownerId),
      resourceType: 'ticketType',
      resourceId: updated.id,
      action: 'ticket_type.updated',
      before: {
        priceMinor: existing.priceMinor,
        quantity: existing.quantity,
        status: existing.status,
      },
      after: {
        priceMinor: updated.priceMinor,
        quantity: updated.quantity,
        status: updated.status,
      },
    });

    return updated;
  }

  async archiveOrDeleteTicketType(
    actor: TicketingActorContext,
    ticketTypeId: string
  ): Promise<{ mode: 'deleted' | 'archived' }> {
    const existing = await this.port.getTicketTypeById(ticketTypeId);
    if (!existing) {
      throw new TicketingDomainError('NOT_FOUND', 'Lote de ingresso não encontrado.');
    }
    const { occurrence, listing } = await assertCanManageOccurrence(actor, existing.occurrenceId);

    if (existing.soldCount > 0 || existing.reservedCount > 0) {
      await this.port.updateTicketType(ticketTypeId, { status: 'archived' });
      await this.refreshListingPricingSummary(listing.id, occurrence.id);
      return { mode: 'archived' };
    }

    await this.port.deleteTicketType(ticketTypeId);
    await this.refreshListingPricingSummary(listing.id, occurrence.id);
    return { mode: 'deleted' };
  }

  async listPublicTicketTypesByOccurrence(
    occurrenceId: string
  ): Promise<PublicTicketTypeProjection[]> {
    const occurrence = await getEventOccurrenceByIdUseCase(occurrenceId);
    if (!occurrence) {
      throw new TicketingDomainError('NOT_FOUND', 'Ocorrência do evento não encontrada.');
    }
    const listing = await getEventListingByIdUseCase(occurrence.eventListingId);
    if (listing?.status !== 'published' || listing.visibility === 'private') {
      throw new TicketingDomainError('NOT_FOUND', 'Evento indisponível para consulta pública.');
    }

    const types = await this.port.listTicketTypesByOccurrenceId(occurrenceId);
    const totalCommitted = types.reduce((sum, t) => sum + t.soldCount + t.reservedCount, 0);

    return types
      .filter((t) => t.visibility === 'public' && t.status !== 'archived' && t.status !== 'draft')
      .map((t) => {
        const { saleStatus, status, availableQuantity } = deriveTicketTypeSaleStatus({
          ticketType: t,
          occurrenceCapacity: occurrence.capacity,
          occurrenceCommittedCount: totalCommitted,
        });
        return {
          id: t.id,
          occurrenceId: t.occurrenceId,
          name: t.name,
          description: t.description,
          kind: t.priceMinor === 0 ? ('free' as const) : ('paid' as const),
          priceMinor: t.priceMinor,
          currency: 'BRL' as const,
          availableQuantity,
          minPerOrder: t.minPerOrder,
          maxPerOrder: t.maxPerOrder,
          salesStartsAt: t.salesStartsAt,
          salesEndsAt: t.salesEndsAt,
          requiresEligibilityProof: t.requiresEligibilityProof,
          sortOrder: t.sortOrder,
          status,
          saleStatus,
        };
      });
  }

  async listTicketTypesForManagement(
    actor: TicketingActorContext,
    occurrenceId: string
  ): Promise<TicketType[]> {
    await assertCanManageOccurrence(actor, occurrenceId);
    return this.port.listTicketTypesByOccurrenceId(occurrenceId);
  }

  async createPromoCode(
    actor: TicketingActorContext,
    input: {
      eventListingId: string;
      code: string;
      type: 'percentage' | 'fixed';
      valueMinor?: number;
      percentage?: number;
      maxUses?: number;
      startsAt?: string;
      endsAt?: string;
      ticketTypeIds?: string[];
      isActive?: boolean;
    }
  ): Promise<EventPromoCode> {
    const listing = await getEventListingByIdUseCase(input.eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError('FORBIDDEN', 'Sem permissão para criar cupons neste evento.');
    }

    return this.port.createPromoCode({
      eventListingId: input.eventListingId,
      code: input.code,
      type: input.type,
      valueMinor: input.valueMinor,
      percentage: input.percentage,
      maxUses: input.maxUses,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      ticketTypeIds: input.ticketTypeIds,
      isActive: input.isActive ?? true,
    });
  }
}

=== server/domain/ticketing/services/ticketingAccess.ts — ARQUIVO NOVO, conteúdo completo ===
import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';

export interface TicketingActorContext {
  uid: string;
  admin?: boolean;
  role?: string;
}

export function isActorAdmin(actor: TicketingActorContext): boolean {
  return actor.admin === true;
}

export function getAuditActorType(
  actor: TicketingActorContext,
  listingOwnerId?: string
): 'admin' | 'partner' | 'user' {
  if (isActorAdmin(actor)) return 'admin';
  if (listingOwnerId && actor.uid === listingOwnerId) return 'partner';
  return 'user';
}

/** Só o dono do evento (ou o admin) gerencia ingressos de uma sessão. */
export async function assertCanManageOccurrence(
  actor: TicketingActorContext,
  occurrenceId: string
) {
  const occurrence = await getEventOccurrenceByIdUseCase(occurrenceId);
  if (!occurrence) {
    throw new TicketingDomainError('NOT_FOUND', 'Ocorrência do evento não encontrada.');
  }
  const listing = await getEventListingByIdUseCase(occurrence.eventListingId);
  if (!listing) {
    throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
  }
  if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
    throw new TicketingDomainError(
      'FORBIDDEN',
      'Sem permissão para gerenciar os ingressos deste evento.'
    );
  }
  return { occurrence, listing };
}

=== server/domain/ticketing/services/ticketingReportService.ts — ARQUIVO NOVO, conteúdo completo ===
import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import {
  TicketNotEligibleForReviewError,
  TicketingDomainError,
} from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import {
  type EventCheckIn,
  type EventSalesAnalytics,
  type Refund,
  type Ticket,
  type TicketOrder,
  type VerifiedAttendanceForReview,
} from '../types/ticketingTypes';
import { isActorAdmin, type TicketingActorContext } from './ticketingAccess';

/** Relatórios do evento para o organizador e o admin, e presença verificada para avaliações. */
export class TicketingReportService {
  constructor(private readonly port: TicketingPort) {}

  async getEventSalesAnalytics(
    actor: TicketingActorContext,
    eventListingId: string,
    occurrenceId?: string
  ): Promise<EventSalesAnalytics> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para visualizar métricas financeiras deste evento.'
      );
    }

    const [orders, tickets, refunds] = await Promise.all([
      occurrenceId
        ? this.port.listOrdersByOccurrenceId(occurrenceId)
        : this.port.listOrdersByEventListingId(eventListingId),
      occurrenceId
        ? this.port.listTicketsByOccurrenceId(occurrenceId)
        : this.port.listTicketsByEventListingId(eventListingId),
      this.port.listRefundsByEventListingId(eventListingId),
    ]);

    const paidOrders = orders.filter(
      (o) => o.status === 'paid' || o.status === 'partially_refunded' || o.status === 'refunded'
    );

    const grossSalesMinor = paidOrders.reduce((sum, o) => sum + o.subtotalMinor, 0);
    const discountsMinor = paidOrders.reduce((sum, o) => sum + o.discountMinor, 0);
    const platformFeesMinor = paidOrders.reduce((sum, o) => sum + o.platformFeeMinor, 0);
    const paymentFeesMinor = paidOrders.reduce((sum, o) => sum + o.paymentFeeMinor, 0);

    const orderIdSet = new Set(orders.map((o) => o.id));
    const approvedRefunds = refunds.filter(
      (r) => r.status === 'approved' && orderIdSet.has(r.orderId)
    );
    const refundsMinor = approvedRefunds.reduce((sum, r) => sum + r.amountMinor, 0);

    const netSalesMinor = Math.max(
      0,
      grossSalesMinor - discountsMinor - platformFeesMinor - paymentFeesMinor - refundsMinor
    );

    const activeTickets = tickets.filter((t) => t.status === 'issued' || t.status === 'checked_in');
    const ticketsIssued = activeTickets.length;
    const ticketsCheckedIn = tickets.filter((t) => t.status === 'checked_in').length;
    const ticketsRefunded = tickets.filter((t) => t.status === 'refunded').length;
    const checkInRate =
      ticketsIssued > 0 ? Number(((ticketsCheckedIn / ticketsIssued) * 100).toFixed(2)) : 0;

    const byTypeMap = new Map<
      string,
      { ticketTypeId: string; name?: string; sold: number; grossMinor: number }
    >();

    for (const t of activeTickets) {
      const curr = byTypeMap.get(t.ticketTypeId) || {
        ticketTypeId: t.ticketTypeId,
        name: t.ticketTypeSnapshot?.name,
        sold: 0,
        grossMinor: 0,
      };
      curr.sold += 1;
      curr.grossMinor += t.ticketTypeSnapshot?.unitPriceMinor ?? 0;
      byTypeMap.set(t.ticketTypeId, curr);
    }

    return {
      grossSalesMinor,
      discountsMinor,
      platformFeesMinor,
      paymentFeesMinor,
      refundsMinor,
      netSalesMinor,
      ticketsIssued,
      ticketsCheckedIn,
      ticketsRefunded,
      checkInRate,
      byTicketType: Array.from(byTypeMap.values()),
    };
  }

  async listEventOrdersForPartnerOrAdmin(
    actor: TicketingActorContext,
    eventListingId: string
  ): Promise<TicketOrder[]> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para listar pedidos deste evento.'
      );
    }
    return this.port.listOrdersByEventListingId(eventListingId);
  }

  async listEventTicketsForPartnerOrAdmin(
    actor: TicketingActorContext,
    eventListingId: string
  ): Promise<Ticket[]> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para listar participantes deste evento.'
      );
    }
    return this.port.listTicketsByEventListingId(eventListingId);
  }

  async listEventCheckInsForPartnerOrAdmin(
    actor: TicketingActorContext,
    eventListingId: string
  ): Promise<EventCheckIn[]> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para listar check-ins deste evento.'
      );
    }
    return this.port.listCheckInsByEventListingId(eventListingId);
  }

  async listEventRefundsForPartnerOrAdmin(
    actor: TicketingActorContext,
    eventListingId: string
  ): Promise<Refund[]> {
    const listing = await getEventListingByIdUseCase(eventListingId);
    if (!listing) {
      throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
    }
    if (!isActorAdmin(actor) && listing.ownerId !== actor.uid) {
      throw new TicketingDomainError(
        'FORBIDDEN',
        'Sem permissão para listar reembolsos deste evento.'
      );
    }
    return this.port.listRefundsByEventListingId(eventListingId);
  }

  async getVerifiedAttendanceForReview(params: {
    userId: string;
    occurrenceId: string;
    ticketId: string;
  }): Promise<VerifiedAttendanceForReview> {
    const ticket = await this.port.getTicketById(params.ticketId);
    if (!ticket) {
      throw new TicketNotEligibleForReviewError('Ingresso não encontrado.');
    }
    if (ticket.ownerUserId !== params.userId) {
      throw new TicketNotEligibleForReviewError(
        'Apenas o titular do ingresso pode avaliar o evento.'
      );
    }
    if (ticket.occurrenceId !== params.occurrenceId) {
      throw new TicketNotEligibleForReviewError(
        'O ingresso informado não pertence a esta ocorrência.'
      );
    }
    if (ticket.status !== 'checked_in') {
      throw new TicketNotEligibleForReviewError(
        'Somente participantes com check-in confirmado podem avaliar o evento.'
      );
    }

    const occurrence = await getEventOccurrenceByIdUseCase(params.occurrenceId);
    if (!occurrence) {
      throw new TicketNotEligibleForReviewError('Sessão do evento não encontrada.');
    }

    const isCompleted =
      occurrence.status === 'completed' || new Date(occurrence.endsAt).getTime() <= Date.now();
    if (!isCompleted) {
      throw new TicketNotEligibleForReviewError(
        'A avaliação só pode ser enviada após o encerramento da sessão.'
      );
    }

    const listing = await getEventListingByIdUseCase(ticket.eventListingId);
    if (!listing) {
      throw new TicketNotEligibleForReviewError('Evento não encontrado.');
    }

    return {
      eligible: true,
      ticketId: ticket.id,
      occurrenceId: occurrence.id,
      eventListingId: listing.id,
      ownerUserId: ticket.ownerUserId,
      eventOwnerId: listing.ownerId,
      eventPartnerId: listing.partnerId,
      eventTitle: listing.title,
    };
  }
}

=== server/domain/ticketing/services/ticketingService.test.ts — APAGUE este arquivo ===

=== server/domain/ticketing/services/ticketingService.ts — APAGUE este arquivo ===

=== server/domain/ticketing/services/ticketingServices.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckInService } from './checkInService';
import { TicketHolderService } from './ticketHolderService';
import { TicketOrderService } from './ticketOrderService';
import { TicketTypeService } from './ticketTypeService';
import { TicketingReportService } from './ticketingReportService';
import type { TicketingPort } from '../ports/ticketingPort';
import type { TicketType } from '../types/ticketingTypes';

vi.mock('../../events', () => ({
  EventNotFoundError: class extends Error {
    code = 'NOT_FOUND';
  },
  EventOwnershipError: class extends Error {
    code = 'FORBIDDEN';
  },
  getEventListingByIdUseCase: vi.fn(),
  getEventOccurrenceByIdUseCase: vi.fn(),
  recordEventAuditLogUseCase: vi.fn().mockResolvedValue(undefined),
  createEventAuditLogUseCase: vi.fn().mockResolvedValue(undefined),
  updateEventListingPricingSummaryUseCase: vi.fn().mockResolvedValue(undefined),
}));

import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../events';

function createMockTicketType(overrides: Partial<TicketType> = {}): TicketType {
  return {
    id: 'tt_1',
    occurrenceId: 'occ_1',
    eventListingId: 'evt_1',
    name: '1º Lote',
    kind: 'paid',
    priceMinor: 5000,
    currency: 'BRL',
    quantity: 50,
    soldCount: 0,
    reservedCount: 0,
    minPerOrder: 1,
    maxPerOrder: 5,
    status: 'on_sale',
    visibility: 'public',
    requiresEligibilityProof: false,
    sortOrder: 0,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('serviços de ticketing', () => {
  let mockPort: TicketingPort;
  let services: {
    types: TicketTypeService;
    orders: TicketOrderService;
    holders: TicketHolderService;
    checkIn: CheckInService;
    reports: TicketingReportService;
  };

  beforeEach(() => {
    vi.stubEnv('TICKET_QR_SECRET', 'test-ticket-qr-secret-with-32-chars!');
    vi.stubEnv('USE_GUIDE_PLATFORM_FEE_PERCENT', '10');
    vi.clearAllMocks();

    vi.mocked(getEventOccurrenceByIdUseCase).mockResolvedValue({
      id: 'occ_1',
      eventListingId: 'evt_1',
      startsAt: '2026-12-20T20:00:00.000Z',
      endsAt: '2026-12-21T02:00:00.000Z',
      status: 'scheduled',
      capacity: 100,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    });

    vi.mocked(getEventListingByIdUseCase).mockResolvedValue({
      id: 'evt_1',
      ownerId: 'partner_1',
      partnerId: 'partner_1',
      organizerId: 'partner_1',
      title: 'Sunset Kitesurf Party',
      name: 'Sunset Kitesurf Party',
      summary: 'Festa',
      description: 'Festa na praia',
      category: 'party',
      eventCategory: 'party',
      coverImage: 'https://example.com/img.jpg',
      image: 'https://example.com/img.jpg',
      images: [],
      visibility: 'public',
      status: 'published',
      isActive: true,
      location: { name: 'Praia do Preá' },
      refundPolicy: { enabled: true, cancellationWindowHours: 48 },
      entryType: 'pago',
      pricingMode: 'paid',
      ratingSummary: { average: 0, count: 0 },
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    });

    mockPort = {
      createTicketType: vi
        .fn()
        .mockImplementation(async (input) => createMockTicketType({ ...input, id: 'tt_created' })),
      getTicketTypeById: vi.fn().mockResolvedValue(createMockTicketType()),
      listTicketTypesByOccurrenceId: vi.fn().mockResolvedValue([createMockTicketType()]),
      updateTicketType: vi
        .fn()
        .mockImplementation(async (_id, patch) => createMockTicketType(patch)),
      deleteTicketType: vi.fn().mockResolvedValue(undefined),
      reserveInventoryAndCreateOrderAtomic: vi.fn().mockImplementation(async (input) => ({
        order: {
          id: 'ord_1',
          buyerId: input.buyerId,
          eventListingId: input.eventListingId,
          occurrenceId: input.occurrenceId,
          status: input.issueImmediately ? 'paid' : 'pending_payment',
          currency: 'BRL',
          subtotalMinor: input.subtotalMinor,
          discountMinor: input.discountMinor,
          platformFeeMinor: input.platformFeeMinor,
          paymentFeeMinor: input.paymentFeeMinor,
          totalMinor: input.totalMinor,
          buyerSnapshot: input.buyerSnapshot,
          refundPolicySnapshot: input.refundPolicySnapshot,
          idempotencyKey: input.idempotencyKey,
          createdAt: '2026-10-05T00:00:00.000Z',
          updatedAt: '2026-10-05T00:00:00.000Z',
        },
        items: [],
        reservations: [],
        issuedTickets: [],
        isIdempotentReplay: false,
      })),
      confirmOrderPaymentAndIssueTicketsAtomic: vi.fn(),
      expireOrderAndReleaseInventoryAtomic: vi.fn(),
      getOrderById: vi.fn(),
      getOrderByIdempotencyKey: vi.fn(),
      listOrderItemsByOrderId: vi.fn().mockResolvedValue([]),
      listOrdersByBuyerId: vi.fn().mockResolvedValue([]),
      listOrdersByOccurrenceId: vi.fn().mockResolvedValue([]),
      listOrdersByEventListingId: vi.fn().mockResolvedValue([]),
      listExpiredPendingOrders: vi.fn().mockResolvedValue([]),
      updateOrderStatus: vi.fn(),
      getTicketById: vi.fn(),
      getTicketByQrTokenHash: vi.fn(),
      listTicketsByOrderId: vi.fn().mockResolvedValue([]),
      listTicketsByOwnerUserId: vi.fn().mockResolvedValue([]),
      listTicketsByOccurrenceId: vi.fn().mockResolvedValue([]),
      listTicketsByEventListingId: vi.fn().mockResolvedValue([]),
      updateTicketStatus: vi.fn(),
      checkInTicketAtomic: vi.fn(),
      listCheckInsByOccurrenceId: vi.fn().mockResolvedValue([]),
      listCheckInsByEventListingId: vi.fn().mockResolvedValue([]),
      createRefundAtomic: vi.fn(),
      updateRefundStatus: vi.fn(),
      getRefundById: vi.fn(),
      listRefundsByOrderId: vi.fn().mockResolvedValue([]),
      listRefundsByEventListingId: vi.fn().mockResolvedValue([]),
      transferTicketAtomic: vi.fn(),
      moveOrdersAndTicketsToOccurrenceAtomic: vi.fn(),
      createPromoCode: vi.fn(),
      getPromoCodeByCode: vi.fn().mockResolvedValue(null),
      createWaitlistEntry: vi.fn(),
      listWaitlistByOccurrenceId: vi.fn().mockResolvedValue([]),
      createOfflineCheckInSession: vi.fn(),
      getOfflineCheckInSessionById: vi.fn(),
      syncOfflineCheckInsAtomic: vi.fn(),
    };

    const mockQrTokenPort = {
      issue: vi.fn().mockReturnValue('ugt2.mock.sig'),
      verify: vi.fn(),
      getPublicKeyMetadata: vi.fn().mockReturnValue({
        keyId: 'key_mock',
        publicKeyJwk: { kty: 'RSA' },
      }),
    };

    services = {
      types: new TicketTypeService(mockPort),
      orders: new TicketOrderService(mockPort),
      holders: new TicketHolderService(mockPort),
      checkIn: new CheckInService(mockPort, mockQrTokenPort),
      reports: new TicketingReportService(mockPort),
    };
  });

  it('prevents changing priceMinor on a ticketType with existing sales or reservations', async () => {
    vi.mocked(mockPort.getTicketTypeById).mockResolvedValueOnce(
      createMockTicketType({ soldCount: 2 })
    );

    await expect(
      services.types.updateTicketType({ uid: 'partner_1' }, 'tt_1', { priceMinor: 8000 })
    ).rejects.toThrow(/Não é permitido alterar o preço/);
  });

  it('creates an order with minor units and calculates platform fee without floating point errors', async () => {
    const res = await services.orders.createTicketOrder(
      { uid: 'buyer_1' },
      {
        occurrenceId: 'occ_1',
        items: [{ ticketTypeId: 'tt_1', quantity: 2 }],
        buyer: { name: 'Maria', email: 'maria@example.com' },
        idempotencyKey: 'idem_12345678',
      }
    );

    expect(res.order.subtotalMinor).toBe(10000);
    expect(res.order.platformFeeMinor).toBe(1000);
    expect(res.order.totalMinor).toBe(10000);
    expect(res.order.status).toBe('pending_payment');
  });

  it('validates verified attendance for review only when ticket is checked_in and occurrence completed', async () => {
    vi.mocked(mockPort.getTicketById).mockResolvedValueOnce({
      id: 'tkt_1',
      orderId: 'ord_1',
      eventListingId: 'evt_1',
      occurrenceId: 'occ_1',
      ticketTypeId: 'tt_1',
      ownerUserId: 'buyer_1',
      holderName: 'Maria',
      holderEmail: 'maria@example.com',
      qrTokenHash: 'hash_123',
      qrVersion: 1,
      status: 'checked_in',
      issuedAt: '2026-10-01T10:00:00.000Z',
      checkedInAt: '2026-12-20T21:00:00.000Z',
    });

    vi.mocked(getEventOccurrenceByIdUseCase).mockResolvedValueOnce({
      id: 'occ_1',
      eventListingId: 'evt_1',
      startsAt: '2025-01-01T20:00:00.000Z',
      endsAt: '2025-01-02T02:00:00.000Z',
      status: 'completed',
      capacity: 100,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-02T02:00:00.000Z',
    });

    const verified = await services.reports.getVerifiedAttendanceForReview({
      userId: 'buyer_1',
      occurrenceId: 'occ_1',
      ticketId: 'tkt_1',
    });

    expect(verified.eligible).toBe(true);
    expect(verified.eventListingId).toBe('evt_1');
  });

  it('rejects verified attendance when ticket is refunded or not checked in', async () => {
    vi.mocked(mockPort.getTicketById).mockResolvedValueOnce({
      id: 'tkt_ref',
      orderId: 'ord_1',
      eventListingId: 'evt_1',
      occurrenceId: 'occ_1',
      ticketTypeId: 'tt_1',
      ownerUserId: 'buyer_1',
      holderName: 'Maria',
      holderEmail: 'maria@example.com',
      qrTokenHash: 'hash_ref',
      qrVersion: 1,
      status: 'refunded',
      issuedAt: '2026-10-01T10:00:00.000Z',
    });

    await expect(
      services.reports.getVerifiedAttendanceForReview({
        userId: 'buyer_1',
        occurrenceId: 'occ_1',
        ticketId: 'tkt_ref',
      })
    ).rejects.toThrow();
  });

  it('issues free tickets immediately without payment provider when totalMinor is 0', async () => {
    vi.mocked(mockPort.listTicketTypesByOccurrenceId).mockResolvedValueOnce([
      createMockTicketType({ id: 'tt_free', kind: 'free', priceMinor: 0 }),
    ]);

    const res = await services.orders.createTicketOrder(
      { uid: 'buyer_free' },
      {
        occurrenceId: 'occ_1',
        items: [{ ticketTypeId: 'tt_free', quantity: 2 }],
        buyer: { name: 'João', email: 'joao@example.com' },
        idempotencyKey: 'idem_free_1',
      }
    );

    expect(res.order.totalMinor).toBe(0);
    expect(res.order.status).toBe('paid');
    expect(mockPort.reserveInventoryAndCreateOrderAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        issueImmediately: true,
        totalMinor: 0,
      })
    );
  });

  it('rejects order when requested quantity exceeds occurrence global capacity', async () => {
    vi.mocked(getEventOccurrenceByIdUseCase).mockResolvedValueOnce({
      id: 'occ_1',
      eventListingId: 'evt_1',
      startsAt: '2026-12-20T20:00:00.000Z',
      endsAt: '2026-12-21T02:00:00.000Z',
      status: 'scheduled',
      capacity: 8,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    });

    vi.mocked(mockPort.listTicketTypesByOccurrenceId).mockResolvedValueOnce([
      createMockTicketType({ id: 'tt_a', quantity: 5, soldCount: 4 }),
      createMockTicketType({ id: 'tt_b', quantity: 5, soldCount: 3 }),
    ]);

    await expect(
      services.orders.createTicketOrder(
        { uid: 'buyer_1' },
        {
          occurrenceId: 'occ_1',
          items: [{ ticketTypeId: 'tt_b', quantity: 2 }],
          buyer: { name: 'Pedro', email: 'pedro@example.com' },
          idempotencyKey: 'idem_cap_exceed',
        }
      )
    ).rejects.toThrow(/não está disponível para compra|esgotar|Restam apenas/);
  });

  it('enforces buyer ownership on getTicketOrder and denies cross-user access', async () => {
    vi.mocked(mockPort.getOrderById).mockResolvedValueOnce({
      id: 'ord_secret',
      buyerId: 'user_b',
      eventListingId: 'evt_1',
      occurrenceId: 'occ_1',
      status: 'paid',
      currency: 'BRL',
      subtotalMinor: 5000,
      discountMinor: 0,
      platformFeeMinor: 500,
      paymentFeeMinor: 0,
      totalMinor: 5000,
      buyerSnapshot: { name: 'User B', email: 'b@example.com' },
      refundPolicySnapshot: {
        enabled: true,
        allowBuyerCancellation: true,
        allowTicketTransfer: true,
      },
      idempotencyKey: 'idem_b',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    });

    await expect(
      services.orders.getOrderForUser({ uid: 'user_a' }, 'ord_secret')
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('denies partner A from viewing sales analytics or checking in tickets of partner B event', async () => {
    await expect(
      services.reports.getEventSalesAnalytics({ uid: 'partner_other', admin: false }, 'evt_1')
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });

    await expect(
      services.checkIn.checkInTicket(
        { uid: 'partner_other', admin: false },
        { occurrenceId: 'occ_1', ticketId: 'tkt_1' }
      )
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('allows admin to view sales analytics without changing event ownerId', async () => {
    const analytics = await services.reports.getEventSalesAnalytics(
      { uid: 'admin_1', admin: true },
      'evt_1'
    );
    expect(analytics.grossSalesMinor).toBe(0);
  });

  it('transfers ticket atomically and invalidates previous holder ticket', async () => {
    vi.mocked(mockPort.getTicketById).mockResolvedValueOnce({
      id: 'tkt_orig',
      orderId: 'ord_1',
      eventListingId: 'evt_1',
      occurrenceId: 'occ_1',
      ticketTypeId: 'tt_1',
      ownerUserId: 'user_from',
      holderName: 'User From',
      holderEmail: 'from@example.com',
      qrTokenHash: 'old_hash',
      qrVersion: 1,
      status: 'issued',
      issuedAt: '2026-10-01T10:00:00.000Z',
    });

    vi.mocked(mockPort.transferTicketAtomic).mockResolvedValueOnce({
      transfer: {
        id: 'tr_1',
        ticketId: 'tkt_orig',
        fromUserId: 'user_from',
        toUserId: 'user_to',
        recipientEmail: 'to@example.com',
        status: 'completed',
        expiresAt: '2026-10-06T00:00:00.000Z',
        createdAt: '2026-10-05T00:00:00.000Z',
        completedAt: '2026-10-05T00:00:00.000Z',
      },
      oldTicket: {
        id: 'tkt_orig',
        orderId: 'ord_1',
        eventListingId: 'evt_1',
        occurrenceId: 'occ_1',
        ticketTypeId: 'tt_1',
        ownerUserId: 'user_from',
        holderName: 'User From',
        holderEmail: 'from@example.com',
        qrTokenHash: 'old_hash',
        qrVersion: 1,
        status: 'transferred',
        issuedAt: '2026-10-01T10:00:00.000Z',
      },
      newTicket: {
        id: 'tkt_new',
        orderId: 'ord_1',
        eventListingId: 'evt_1',
        occurrenceId: 'occ_1',
        ticketTypeId: 'tt_1',
        ownerUserId: 'user_to',
        holderName: 'User To',
        holderEmail: 'to@example.com',
        qrTokenHash: 'new_hash',
        qrVersion: 2,
        status: 'issued',
        issuedAt: '2026-10-05T00:00:00.000Z',
      },
    });

    const res = await services.holders.transferTicket(
      { uid: 'user_from' },
      {
        ticketId: 'tkt_orig',
        recipientEmail: 'to@example.com',
        recipientName: 'User To',
        toUserId: 'user_to',
      }
    );

    expect(res.oldTicket.status).toBe('transferred');
    expect(res.newTicket.status).toBe('issued');
    expect(res.newTicket.qrTokenHash).not.toBe(res.oldTicket.qrTokenHash);
  });
});

=== server/domain/ticketing/types/ticketingTypes.ts — diff ===
@@ -10,13 +10,7 @@ export function assertMoneyMinor(value: number): void {
 
 export type TicketTypeKind = 'paid' | 'free' | 'courtesy' | 'half_entry';
 
-export type TicketTypeStatus =
-  | 'draft'
-  | 'on_sale'
-  | 'paused'
-  | 'sold_out'
-  | 'ended'
-  | 'archived';
+export type TicketTypeStatus = 'draft' | 'on_sale' | 'paused' | 'sold_out' | 'ended' | 'archived';
 
 export interface TicketType {
   id: string;
@@ -188,12 +182,7 @@ export interface Ticket {
   };
 }
 
-export type RefundStatus =
-  | 'requested'
-  | 'pending_provider'
-  | 'approved'
-  | 'failed'
-  | 'rejected';
+export type RefundStatus = 'requested' | 'pending_provider' | 'approved' | 'failed' | 'rejected';
 
 export interface Refund {
   id: string;
@@ -288,12 +277,7 @@ export interface OfflineCheckInEvent {
 
 export interface OfflineCheckInSyncResultItem {
   clientEventId: string;
-  status:
-    | 'accepted'
-    | 'already_checked_in'
-    | 'invalid'
-    | 'expired'
-    | 'wrong_occurrence';
+  status: 'accepted' | 'already_checked_in' | 'invalid' | 'expired' | 'wrong_occurrence';
 }
 
 export interface EventPromoCode {
@@ -355,27 +339,12 @@ export interface VerifiedAttendanceForReview {
   eventTitle: string;
 }
 
-export function canTransitionOrderStatus(
-  from: TicketOrderStatus,
-  to: TicketOrderStatus
-): boolean {
+export function canTransitionOrderStatus(from: TicketOrderStatus, to: TicketOrderStatus): boolean {
   if (from === to) return true;
   const allowed: Record<TicketOrderStatus, TicketOrderStatus[]> = {
-    pending_payment: [
-      'payment_processing',
-      'paid',
-      'payment_failed',
-      'expired',
-      'canceled',
-    ],
+    pending_payment: ['payment_processing', 'paid', 'payment_failed', 'expired', 'canceled'],
     payment_processing: ['paid', 'payment_failed', 'expired', 'canceled'],
-    payment_failed: [
-      'pending_payment',
-      'payment_processing',
-      'paid',
-      'expired',
-      'canceled',
-    ],
+    payment_failed: ['pending_payment', 'payment_processing', 'paid', 'expired', 'canceled'],
     paid: ['partially_refunded', 'refunded', 'chargeback', 'canceled'],
     partially_refunded: ['refunded', 'chargeback'],
     refunded: [],
@@ -386,21 +355,11 @@ export function canTransitionOrderStatus(
   return allowed[from]?.includes(to) ?? false;
 }
 
-export function canTransitionTicketStatus(
-  from: TicketStatus,
-  to: TicketStatus
-): boolean {
+export function canTransitionTicketStatus(from: TicketStatus, to: TicketStatus): boolean {
   if (from === to) return true;
   const allowed: Record<TicketStatus, TicketStatus[]> = {
     reserved: ['issued', 'canceled', 'expired', 'void'],
-    issued: [
-      'checked_in',
-      'transferred',
-      'refund_pending',
-      'refunded',
-      'canceled',
-      'void',
-    ],
+    issued: ['checked_in', 'transferred', 'refund_pending', 'refunded', 'canceled', 'void'],
     refund_pending: ['refunded', 'issued', 'canceled'],
     checked_in: ['void'],
     transferred: ['void'],
@@ -429,10 +388,7 @@ export function deriveTicketTypeSaleStatus(params: {
     0,
     ticketType.quantity - (ticketType.soldCount + ticketType.reservedCount)
   );
-  const occurrenceRemaining = Math.max(
-    0,
-    occurrenceCapacity - occurrenceCommittedCount
-  );
+  const occurrenceRemaining = Math.max(0, occurrenceCapacity - occurrenceCommittedCount);
   const availableQuantity = Math.min(ticketTypeRemaining, occurrenceRemaining);
 
   if (

=== server/domain/ticketing/usecases/archiveTicketTypeUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketTypeService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function archiveTicketTypeUseCase(
  actor: TicketingActorContext,
  ticketTypeId: string
): Promise<{ mode: 'deleted' | 'archived' }> {
  return ticketTypeService.archiveOrDeleteTicketType(actor, ticketTypeId);
}

=== server/domain/ticketing/usecases/checkInTicketUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { checkInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventCheckIn, Ticket } from '../types/ticketingTypes';

export async function checkInTicketUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof checkInService.checkInTicket>[1]
): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
  return checkInService.checkInTicket(actor, params);
}

=== server/domain/ticketing/usecases/confirmTicketOrderPaymentUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketOrderService } from '../factory';
import type { Ticket, TicketOrder } from '../types/ticketingTypes';

export async function confirmTicketOrderPaymentUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<{ order: TicketOrder; tickets: Ticket[]; alreadyPaid: boolean }> {
  return ticketOrderService.confirmTicketOrderPayment(params);
}

=== server/domain/ticketing/usecases/createEventPromoCodeUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketTypeService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventPromoCode } from '../types/ticketingTypes';

export async function createEventPromoCodeUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketTypeService.createPromoCode>[1]
): Promise<EventPromoCode> {
  return ticketTypeService.createPromoCode(actor, input);
}

=== server/domain/ticketing/usecases/createOfflineCheckInSessionUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { offlineCheckInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { OfflineCheckInManifest, OfflineCheckInSession } from '../types/ticketingTypes';

export async function createOfflineCheckInSessionUseCase(
  actor: TicketingActorContext,
  params: { occurrenceId: string; stationId?: string }
): Promise<{
  session: OfflineCheckInSession;
  manifest: OfflineCheckInManifest;
}> {
  return offlineCheckInService.prepareOfflineCheckInSession(actor, params);
}

=== server/domain/ticketing/usecases/createTicketOrderUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketOrderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Ticket, TicketOrder, TicketOrderItem } from '../types/ticketingTypes';

export async function createTicketOrderUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketOrderService.createTicketOrder>[1]
): Promise<{
  order: TicketOrder;
  items: TicketOrderItem[];
  issuedTickets: Array<{ ticket: Ticket; rawQrToken?: string }>;
  isIdempotentReplay: boolean;
  serverNow: string;
}> {
  return ticketOrderService.createTicketOrder(actor, input);
}

=== server/domain/ticketing/usecases/createTicketTypeUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketTypeService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketType } from '../types/ticketingTypes';

export async function createTicketTypeUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketTypeService.createTicketType>[1]
): Promise<TicketType> {
  return ticketTypeService.createTicketType(actor, input);
}

=== server/domain/ticketing/usecases/expireAllOverdueOrdersUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketOrderService } from '../factory';

export async function expireAllOverdueOrdersUseCase(
  nowIso?: string
): Promise<{ expiredCount: number }> {
  const expiredCount = await ticketOrderService.expireAllOverdueOrders(nowIso);
  return { expiredCount };
}

=== server/domain/ticketing/usecases/expireTicketOrderUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketOrderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function expireTicketOrderUseCase(orderId: string, actor?: TicketingActorContext) {
  return ticketOrderService.expireTicketOrder(orderId, actor);
}

=== server/domain/ticketing/usecases/finalizeTicketRefundStatusUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketRefundService } from '../factory';
import type { Refund } from '../types/ticketingTypes';

export async function finalizeTicketRefundStatusUseCase(
  refundId: string,
  status: Refund['status'],
  providerRefundId?: string | null
): Promise<Refund> {
  return ticketRefundService.finalizeRefundStatus(refundId, status, providerRefundId);
}

=== server/domain/ticketing/usecases/getEventSalesAnalyticsUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketingReportService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventSalesAnalytics } from '../types/ticketingTypes';

export async function getEventSalesAnalyticsUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  occurrenceId?: string
): Promise<EventSalesAnalytics> {
  return ticketingReportService.getEventSalesAnalytics(actor, eventListingId, occurrenceId);
}

=== server/domain/ticketing/usecases/getTicketOrderUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketOrderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function getTicketOrderUseCase(actor: TicketingActorContext, orderId: string) {
  return ticketOrderService.getOrderForUser(actor, orderId);
}

=== server/domain/ticketing/usecases/getTicketQrTokenUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { checkInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function getTicketQrTokenUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{
  ticketId: string;
  token: string;
  expiresAt: string;
}> {
  return checkInService.generateTicketPresentationQr(actor, ticketId);
}

=== server/domain/ticketing/usecases/getVerifiedAttendanceForReviewUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketingReportService } from '../factory';
import type { VerifiedAttendanceForReview } from '../types/ticketingTypes';

export async function getVerifiedAttendanceForReviewUseCase(params: {
  userId: string;
  occurrenceId: string;
  ticketId: string;
}): Promise<VerifiedAttendanceForReview> {
  return ticketingReportService.getVerifiedAttendanceForReview(params);
}

=== server/domain/ticketing/usecases/joinEventWaitlistUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketHolderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventWaitlistEntry } from '../types/ticketingTypes';

export async function joinEventWaitlistUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketHolderService.joinWaitlist>[1]
): Promise<EventWaitlistEntry> {
  return ticketHolderService.joinWaitlist(actor, input);
}

=== server/domain/ticketing/usecases/listEventCheckInsForPartnerOrAdminUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketingReportService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventCheckIn } from '../types/ticketingTypes';

export async function listEventCheckInsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<EventCheckIn[]> {
  return ticketingReportService.listEventCheckInsForPartnerOrAdmin(actor, eventListingId);
}

=== server/domain/ticketing/usecases/listEventOrdersForPartnerOrAdminUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketingReportService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketOrder } from '../types/ticketingTypes';

export async function listEventOrdersForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<TicketOrder[]> {
  return ticketingReportService.listEventOrdersForPartnerOrAdmin(actor, eventListingId);
}

=== server/domain/ticketing/usecases/listEventRefundsForPartnerOrAdminUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketingReportService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Refund } from '../types/ticketingTypes';

export async function listEventRefundsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<Refund[]> {
  return ticketingReportService.listEventRefundsForPartnerOrAdmin(actor, eventListingId);
}

=== server/domain/ticketing/usecases/listPublicTicketTypesByOccurrenceUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketTypeService } from '../factory';
import type { PublicTicketTypeProjection } from '../types/ticketingTypes';

export async function listPublicTicketTypesByOccurrenceUseCase(
  occurrenceId: string
): Promise<PublicTicketTypeProjection[]> {
  return ticketTypeService.listPublicTicketTypesByOccurrence(occurrenceId);
}

=== server/domain/ticketing/usecases/listTicketTypesForManagementUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketTypeService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketType } from '../types/ticketingTypes';

export async function listTicketTypesForManagementUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<TicketType[]> {
  return ticketTypeService.listTicketTypesForManagement(actor, occurrenceId);
}

=== server/domain/ticketing/usecases/listUserTicketOrdersUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketOrderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketOrder } from '../types/ticketingTypes';

export async function listUserTicketOrdersUseCase(
  actor: TicketingActorContext
): Promise<TicketOrder[]> {
  return ticketOrderService.listUserOrders(actor);
}

=== server/domain/ticketing/usecases/listUserTicketsUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketOrderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Ticket } from '../types/ticketingTypes';

export async function listUserTicketsUseCase(actor: TicketingActorContext): Promise<Ticket[]> {
  return ticketOrderService.listUserTickets(actor);
}

=== server/domain/ticketing/usecases/markTicketOrderDisputedUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketOrderService } from '../factory';
import type { TicketOrder } from '../types/ticketingTypes';

export async function markTicketOrderDisputedUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<TicketOrder> {
  return ticketOrderService.updateOrderPaymentState({
    orderId: params.orderId,
    status: 'chargeback',
    paymentId: params.paymentId,
    paymentIntentId: params.paymentIntentId,
  });
}

=== server/domain/ticketing/usecases/markTicketOrderPaymentFailedUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketOrderService } from '../factory';
import type { TicketOrder } from '../types/ticketingTypes';

export async function markTicketOrderPaymentFailedUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<TicketOrder> {
  return ticketOrderService.updateOrderPaymentState({
    orderId: params.orderId,
    status: 'payment_failed',
    paymentId: params.paymentId,
    paymentIntentId: params.paymentIntentId,
  });
}

=== server/domain/ticketing/usecases/moveOrderToOccurrenceUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketHolderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function moveOrderToOccurrenceUseCase(
  actor: TicketingActorContext,
  params: {
    fromOccurrenceId: string;
    toOccurrenceId: string;
  }
) {
  return ticketHolderService.moveOrdersAndTicketsToOccurrence(actor, params);
}

=== server/domain/ticketing/usecases/reissueTicketQrTokenUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { checkInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function reissueTicketQrTokenUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{
  ticketId: string;
  token: string;
  expiresAt: string;
}> {
  return checkInService.generateTicketPresentationQr(actor, ticketId);
}

=== server/domain/ticketing/usecases/requestTicketRefundUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketRefundService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Refund, TicketOrder } from '../types/ticketingTypes';

export async function requestTicketRefundUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketRefundService.requestTicketRefund>[1]
): Promise<{ refund: Refund; isReplay: boolean; order: TicketOrder }> {
  return ticketRefundService.requestTicketRefund(actor, params);
}

=== server/domain/ticketing/usecases/syncOfflineCheckInsUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { offlineCheckInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
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
  return offlineCheckInService.syncOfflineCheckInEvents(actor, params);
}

=== server/domain/ticketing/usecases/transferTicketUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketHolderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Ticket, TicketTransfer } from '../types/ticketingTypes';

export async function transferTicketUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketHolderService.transferTicket>[1]
): Promise<{
  oldTicket: Ticket;
  newTicket: Ticket;
  transfer: TicketTransfer;
  newRawQrToken: string;
}> {
  return ticketHolderService.transferTicket(actor, params);
}

=== server/domain/ticketing/usecases/updateTicketTypeUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketTypeService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketType } from '../types/ticketingTypes';

export async function updateTicketTypeUseCase(
  actor: TicketingActorContext,
  ticketTypeId: string,
  patch: Parameters<typeof ticketTypeService.updateTicketType>[2]
): Promise<TicketType> {
  return ticketTypeService.updateTicketType(actor, ticketTypeId, patch);
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/domain/ticketing/adapters/firestoreTicketingAdapter.test.ts server/domain/ticketing/adapters/rsaPssTicketQrTokenAdapter.ts server/domain/ticketing/controllers/ticketingController.ts server/domain/ticketing/dtos/ticketingPersistenceMappers.ts server/domain/ticketing/factory.ts server/domain/ticketing/index.ts server/domain/ticketing/ports/ticketingPort.ts server/domain/ticketing/routes/ticketingRoutes.ts server/domain/ticketing/schemas/ticketingSchema.ts server/domain/ticketing/services/checkInService.ts server/domain/ticketing/services/offlineCheckInService.ts server/domain/ticketing/services/orders/orderSaleGuards.ts server/domain/ticketing/services/orders/prepareOrderItems.ts server/domain/ticketing/services/ticketHolderService.ts server/domain/ticketing/services/ticketOrderService.ts server/domain/ticketing/services/ticketRefundService.ts server/domain/ticketing/services/ticketTypeService.ts server/domain/ticketing/services/ticketingAccess.ts server/domain/ticketing/services/ticketingReportService.ts server/domain/ticketing/services/ticketingServices.test.ts server/domain/ticketing/types/ticketingTypes.ts server/domain/ticketing/usecases/archiveTicketTypeUseCase.ts server/domain/ticketing/usecases/checkInTicketUseCase.ts server/domain/ticketing/usecases/confirmTicketOrderPaymentUseCase.ts server/domain/ticketing/usecases/createEventPromoCodeUseCase.ts server/domain/ticketing/usecases/createOfflineCheckInSessionUseCase.ts server/domain/ticketing/usecases/createTicketOrderUseCase.ts server/domain/ticketing/usecases/createTicketTypeUseCase.ts server/domain/ticketing/usecases/expireAllOverdueOrdersUseCase.ts server/domain/ticketing/usecases/expireTicketOrderUseCase.ts server/domain/ticketing/usecases/finalizeTicketRefundStatusUseCase.ts server/domain/ticketing/usecases/getEventSalesAnalyticsUseCase.ts server/domain/ticketing/usecases/getTicketOrderUseCase.ts server/domain/ticketing/usecases/getTicketQrTokenUseCase.ts server/domain/ticketing/usecases/getVerifiedAttendanceForReviewUseCase.ts server/domain/ticketing/usecases/joinEventWaitlistUseCase.ts server/domain/ticketing/usecases/listEventCheckInsForPartnerOrAdminUseCase.ts server/domain/ticketing/usecases/listEventOrdersForPartnerOrAdminUseCase.ts server/domain/ticketing/usecases/listEventRefundsForPartnerOrAdminUseCase.ts server/domain/ticketing/usecases/listPublicTicketTypesByOccurrenceUseCase.ts server/domain/ticketing/usecases/listTicketTypesForManagementUseCase.ts server/domain/ticketing/usecases/listUserTicketOrdersUseCase.ts server/domain/ticketing/usecases/listUserTicketsUseCase.ts server/domain/ticketing/usecases/markTicketOrderDisputedUseCase.ts server/domain/ticketing/usecases/markTicketOrderPaymentFailedUseCase.ts server/domain/ticketing/usecases/moveOrderToOccurrenceUseCase.ts server/domain/ticketing/usecases/reissueTicketQrTokenUseCase.ts server/domain/ticketing/usecases/requestTicketRefundUseCase.ts server/domain/ticketing/usecases/syncOfflineCheckInsUseCase.ts server/domain/ticketing/usecases/transferTicketUseCase.ts server/domain/ticketing/usecases/updateTicketTypeUseCase.ts` (todos verdes). Não precisa rodar a suíte inteira.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
