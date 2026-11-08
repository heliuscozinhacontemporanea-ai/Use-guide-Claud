# Prompt 18.4b.0.2 — Adapter Firestore do ticketing dividido em stores · Parte 2 de 2

> Lote 16, gerado do commit de referência `0012702` da branch `claude/agents-md-v2`. Aplique depois do 18.4b.0.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4b.0.2 — Adapter Firestore do ticketing dividido em stores · Parte 2 de 2

Preparação do 18.4b: só reorganiza arquivos, sem mudar comportamento.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8); os campos antigos saem direto e os dados de teste podem ser recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

ESTE PROMPT NÃO MUDA COMPORTAMENTO. O server/domain/ticketing/adapters/firestoreTicketingAdapter.ts (1559 linhas) passa a compor stores menores em server/domain/ticketing/adapters/firestore/: tipos de ingresso, reserva do pedido, pagamento do pedido, consultas de pedidos, ingressos, check-in, reembolsos e engajamento (lista de espera, cupons, divulgadores), mais firestoreTicketingQueries.ts. O adapter continua implementando o mesmo TicketingPort.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/domain/ticketing/adapters/firestoreCheckInStore.ts (criar)
- server/domain/ticketing/adapters/firestoreEngagementStore.ts (criar)
- server/domain/ticketing/adapters/firestoreOrderPaymentStore.ts (criar)
- server/domain/ticketing/adapters/firestoreOrderQueryStore.ts (criar)
- server/domain/ticketing/adapters/firestoreOrderReservationStore.ts (criar)
- server/domain/ticketing/adapters/firestoreRefundStore.ts (criar)
- server/domain/ticketing/adapters/firestoreTicketStore.ts (criar)
- server/domain/ticketing/adapters/firestoreTicketTypeStore.ts (criar)
- server/domain/ticketing/adapters/firestoreTicketingAdapter.ts (alterar)
- server/domain/ticketing/adapters/firestoreTicketingQueries.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/domain/ticketing/adapters/firestoreCheckInStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  EventCheckInPersistenceMapper,
  OfflineCheckInSessionPersistenceMapper,
  TicketPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import { TicketAlreadyCheckedInError, TicketingDomainError } from '../errors/ticketingDomainError';
import type {
  EventCheckIn,
  OfflineCheckInEvent,
  OfflineCheckInSession,
  OfflineCheckInSyncResultItem,
  Ticket,
} from '../types/ticketingTypes';
import { hashTicketIdForOfflineManifest } from './rsaPssTicketQrTokenAdapter';

/** Check-in online e offline. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreCheckInStore {
  async checkInTicketAtomic(params: {
    ticketId: string;
    occurrenceId: string;
    checkedInBy: string;
    source?: 'online' | 'offline';
    offlineSessionId?: string;
    stationId?: string;
    clientEventId?: string;
  }): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
    return adminDb.runTransaction(async (tx) => {
      const ticketRef = adminDb.collection('tickets').doc(params.ticketId);
      const ticketSnap = await tx.get(ticketRef);
      if (!ticketSnap.exists) {
        throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
      }
      const ticket = TicketPersistenceMapper.toDomain(
        ticketSnap.id,
        (ticketSnap.data() || {}) as Record<string, unknown>
      );

      if (ticket.occurrenceId !== params.occurrenceId) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Este ingresso pertence a outra sessão/ocorrência do evento.'
        );
      }

      if (ticket.status === 'checked_in') {
        throw new TicketAlreadyCheckedInError();
      }

      if (ticket.status !== 'issued') {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `Ingresso inválido para entrada (status atual: ${ticket.status}).`
        );
      }

      const checkInId = `${params.ticketId}_${params.occurrenceId}`;
      const checkInRef = adminDb.collection('eventCheckIns').doc(checkInId);
      const existingCheckInSnap = await tx.get(checkInRef);
      if (existingCheckInSnap.exists) {
        throw new TicketAlreadyCheckedInError();
      }

      const nowIso = new Date().toISOString();
      const source = params.source || 'online';
      const checkInDoc: Record<string, unknown> = {
        ticketId: params.ticketId,
        occurrenceId: params.occurrenceId,
        eventListingId: ticket.eventListingId,
        checkedInBy: params.checkedInBy,
        source,
        ...(params.offlineSessionId ? { offlineSessionId: params.offlineSessionId } : {}),
        ...(params.stationId ? { stationId: params.stationId } : {}),
        ...(params.clientEventId ? { clientEventId: params.clientEventId } : {}),
        checkedInAt: nowIso,
        ...(source === 'offline' ? { syncedAt: nowIso } : {}),
      };
      tx.set(checkInRef, checkInDoc);
      tx.update(ticketRef, {
        status: 'checked_in',
        checkedInAt: nowIso,
        checkedInBy: params.checkedInBy,
      });

      return {
        ticket: {
          ...ticket,
          status: 'checked_in',
          checkedInAt: nowIso,
          checkedInBy: params.checkedInBy,
        },
        checkIn: EventCheckInPersistenceMapper.toDomain(checkInRef.id, checkInDoc),
      };
    });
  }

  async listCheckInsByOccurrenceId(occurrenceId: string): Promise<EventCheckIn[]> {
    const snap = await adminDb
      .collection('eventCheckIns')
      .where('occurrenceId', '==', occurrenceId)
      .get();
    return snap.docs.map((doc) =>
      EventCheckInPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async listCheckInsByEventListingId(eventListingId: string): Promise<EventCheckIn[]> {
    const snap = await adminDb
      .collection('eventCheckIns')
      .where('eventListingId', '==', eventListingId)
      .get();
    return snap.docs.map((doc) =>
      EventCheckInPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async createOfflineCheckInSession(
    session: Omit<OfflineCheckInSession, 'id'>
  ): Promise<OfflineCheckInSession> {
    const ref = adminDb.collection('offlineCheckInSessions').doc();
    const payload: Record<string, unknown> = {
      ...session,
    };
    await ref.set(payload);
    return OfflineCheckInSessionPersistenceMapper.toDomain(ref.id, payload);
  }

  async getOfflineCheckInSessionById(sessionId: string): Promise<OfflineCheckInSession | null> {
    const snap = await adminDb.collection('offlineCheckInSessions').doc(sessionId).get();
    if (!snap.exists) return null;
    return OfflineCheckInSessionPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async syncOfflineCheckInsAtomic(params: {
    session: OfflineCheckInSession;
    checkedInBy: string;
    events: OfflineCheckInEvent[];
  }): Promise<OfflineCheckInSyncResultItem[]> {
    const results: OfflineCheckInSyncResultItem[] = [];
    const nowIso = new Date().toISOString();

    for (const ev of params.events) {
      const outcome = await adminDb.runTransaction(
        async (tx): Promise<OfflineCheckInSyncResultItem['status']> => {
          if (ev.occurrenceId !== params.session.occurrenceId) {
            return 'wrong_occurrence';
          }

          const expectedHash = hashTicketIdForOfflineManifest(ev.ticketId);
          if (ev.ticketIdHash !== expectedHash) {
            return 'invalid';
          }

          const ticketRef = adminDb.collection('tickets').doc(ev.ticketId);
          const ticketSnap = await tx.get(ticketRef);
          if (!ticketSnap.exists) {
            return 'invalid';
          }
          const ticket = TicketPersistenceMapper.toDomain(
            ticketSnap.id,
            (ticketSnap.data() || {}) as Record<string, unknown>
          );

          if (ticket.occurrenceId !== params.session.occurrenceId) {
            return 'wrong_occurrence';
          }

          if (ticket.qrVersion !== ev.qrVersion) {
            return 'invalid';
          }

          const checkInId = `${ev.ticketId}_${params.session.occurrenceId}`;
          const checkInRef = adminDb.collection('eventCheckIns').doc(checkInId);
          const existingCheckInSnap = await tx.get(checkInRef);

          if (existingCheckInSnap.exists || ticket.status === 'checked_in') {
            const existingData = existingCheckInSnap.data() as Record<string, unknown> | undefined;
            if (existingData && existingData.clientEventId === ev.clientEventId) {
              return 'accepted';
            }
            return 'already_checked_in';
          }

          if (ticket.status !== 'issued') {
            return 'invalid';
          }

          const checkInDoc: Record<string, unknown> = {
            ticketId: ev.ticketId,
            occurrenceId: params.session.occurrenceId,
            eventListingId: params.session.eventListingId,
            checkedInBy: params.checkedInBy,
            source: 'offline',
            offlineSessionId: params.session.id,
            stationId: params.session.stationId,
            clientEventId: ev.clientEventId,
            checkedInAt: ev.scannedAt || nowIso,
            syncedAt: nowIso,
          };

          tx.set(checkInRef, checkInDoc);
          tx.update(ticketRef, {
            status: 'checked_in',
            checkedInAt: ev.scannedAt || nowIso,
            checkedInBy: params.checkedInBy,
          });

          return 'accepted';
        }
      );

      results.push({
        clientEventId: ev.clientEventId,
        status: outcome,
      });
    }

    return results;
  }
}

=== server/domain/ticketing/adapters/firestoreEngagementStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  EventPromoCodePersistenceMapper,
  EventWaitlistPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import type { EventPromoCode, EventWaitlistEntry } from '../types/ticketingTypes';

/** Cupons e lista de espera. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreEngagementStore {
  async createPromoCode(
    input: Omit<EventPromoCode, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>
  ): Promise<EventPromoCode> {
    const nowIso = new Date().toISOString();
    const ref = adminDb.collection('eventPromoCodes').doc();
    const doc: Record<string, unknown> = {
      ...input,
      code: input.code.trim().toUpperCase(),
      usedCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await ref.set(doc);
    return EventPromoCodePersistenceMapper.toDomain(ref.id, doc);
  }

  async getPromoCodeByCode(eventListingId: string, code: string): Promise<EventPromoCode | null> {
    const normalized = code.trim().toUpperCase();
    const snap = await adminDb
      .collection('eventPromoCodes')
      .where('eventListingId', '==', eventListingId)
      .where('code', '==', normalized)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    if (!doc) return null;
    return EventPromoCodePersistenceMapper.toDomain(
      doc.id,
      (doc.data() || {}) as Record<string, unknown>
    );
  }

  async createWaitlistEntry(
    input: Omit<EventWaitlistEntry, 'id' | 'status' | 'createdAt'>
  ): Promise<EventWaitlistEntry> {
    const nowIso = new Date().toISOString();
    const ref = adminDb.collection('eventWaitlistEntries').doc();
    const doc: Record<string, unknown> = {
      ...input,
      status: 'waiting',
      createdAt: nowIso,
    };
    await ref.set(doc);
    return EventWaitlistPersistenceMapper.toDomain(ref.id, doc);
  }

  async listWaitlistByOccurrenceId(occurrenceId: string): Promise<EventWaitlistEntry[]> {
    const snap = await adminDb
      .collection('eventWaitlistEntries')
      .where('occurrenceId', '==', occurrenceId)
      .get();
    return snap.docs.map((doc) =>
      EventWaitlistPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }
}

=== server/domain/ticketing/adapters/firestoreOrderPaymentStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  InventoryReservationPersistenceMapper,
  TicketOrderPersistenceMapper,
  TicketPersistenceMapper,
  TicketTypePersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import { OrderNotFoundError } from '../errors/ticketingDomainError';
import type { Ticket, TicketOrder, TicketType } from '../types/ticketingTypes';

/** Confirmação do pagamento (emite os ingressos) e expiração do pedido (libera o estoque), em transação. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreOrderPaymentStore {
  async confirmOrderPaymentAndIssueTicketsAtomic(params: {
    orderId: string;
    paymentId?: string;
    paymentIntentId?: string;
    ticketsToIssue: Array<{
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
    }>;
  }): Promise<{
    order: TicketOrder;
    tickets: Ticket[];
    alreadyPaid: boolean;
  }> {
    return adminDb.runTransaction(async (tx) => {
      const orderRef = adminDb.collection('ticketOrders').doc(params.orderId);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) {
        throw new OrderNotFoundError();
      }
      const order = TicketOrderPersistenceMapper.toDomain(
        orderSnap.id,
        (orderSnap.data() || {}) as Record<string, unknown>
      );

      const existingTicketsSnap = await tx.get(
        adminDb.collection('tickets').where('orderId', '==', params.orderId)
      );

      if (order.status === 'paid' && !existingTicketsSnap.empty) {
        return {
          order,
          tickets: existingTicketsSnap.docs.map((doc) =>
            TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
          ),
          alreadyPaid: true,
        };
      }

      const reservationsSnap = await tx.get(
        adminDb
          .collection('inventoryReservations')
          .where('orderId', '==', params.orderId)
          .where('status', '==', 'active')
      );

      const nowIso = new Date().toISOString();

      for (const resDoc of reservationsSnap.docs) {
        const res = InventoryReservationPersistenceMapper.toDomain(
          resDoc.id,
          (resDoc.data() || {}) as Record<string, unknown>
        );
        const typeRef = adminDb.collection('ticketTypes').doc(res.ticketTypeId);
        const typeSnap = await tx.get(typeRef);
        if (typeSnap.exists) {
          const tData = TicketTypePersistenceMapper.toDomain(
            typeSnap.id,
            (typeSnap.data() || {}) as Record<string, unknown>
          );
          tx.update(typeRef, {
            reservedCount: Math.max(0, tData.reservedCount - res.quantity),
            soldCount: tData.soldCount + res.quantity,
            updatedAt: nowIso,
          });
        }
        tx.update(resDoc.ref, {
          status: 'consumed',
          releasedAt: nowIso,
        });
      }

      const orderPatch: Record<string, unknown> = {
        status: 'paid',
        paidAt: nowIso,
        updatedAt: nowIso,
        ...(params.paymentId ? { paymentId: params.paymentId } : {}),
        ...(params.paymentIntentId ? { paymentIntentId: params.paymentIntentId } : {}),
      };
      tx.update(orderRef, orderPatch);

      const issuedTickets: Ticket[] = [];
      for (const tInput of params.ticketsToIssue) {
        const ticketRef = adminDb.collection('tickets').doc();
        const ticketDoc: Record<string, unknown> = {
          orderId: order.id,
          eventListingId: order.eventListingId,
          occurrenceId: order.occurrenceId,
          ticketTypeId: tInput.ticketTypeId,
          ownerUserId: order.buyerId,
          holderName: tInput.holderName,
          holderEmail: tInput.holderEmail,
          qrTokenHash: tInput.qrTokenHash,
          qrVersion: 1,
          status: 'issued',
          issuedAt: nowIso,
          ticketTypeSnapshot: tInput.ticketTypeSnapshot,
          ...(order.eventSnapshot ? { eventSnapshot: order.eventSnapshot } : {}),
        };
        tx.set(ticketRef, ticketDoc);
        issuedTickets.push(TicketPersistenceMapper.toDomain(ticketRef.id, ticketDoc));
      }

      return {
        order: {
          ...order,
          status: 'paid',
          paidAt: nowIso,
          paymentId: params.paymentId || order.paymentId,
          paymentIntentId: params.paymentIntentId || order.paymentIntentId,
        },
        tickets: issuedTickets,
        alreadyPaid: false,
      };
    });
  }

  async expireOrderAndReleaseInventoryAtomic(orderId: string): Promise<{
    order: TicketOrder | null;
    releasedQuantity: number;
    alreadyReleased: boolean;
  }> {
    return adminDb.runTransaction(async (tx) => {
      const orderRef = adminDb.collection('ticketOrders').doc(orderId);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) {
        return { order: null, releasedQuantity: 0, alreadyReleased: true };
      }
      const order = TicketOrderPersistenceMapper.toDomain(
        orderSnap.id,
        (orderSnap.data() || {}) as Record<string, unknown>
      );

      if (
        order.status !== 'pending_payment' &&
        order.status !== 'payment_failed' &&
        order.status !== 'payment_processing'
      ) {
        return { order, releasedQuantity: 0, alreadyReleased: true };
      }

      const reservationsSnap = await tx.get(
        adminDb
          .collection('inventoryReservations')
          .where('orderId', '==', orderId)
          .where('status', '==', 'active')
      );

      const nowIso = new Date().toISOString();
      let releasedQuantity = 0;

      for (const resDoc of reservationsSnap.docs) {
        const res = InventoryReservationPersistenceMapper.toDomain(
          resDoc.id,
          (resDoc.data() || {}) as Record<string, unknown>
        );
        const typeRef = adminDb.collection('ticketTypes').doc(res.ticketTypeId);
        const typeSnap = await tx.get(typeRef);
        if (typeSnap.exists) {
          const tData = TicketTypePersistenceMapper.toDomain(
            typeSnap.id,
            (typeSnap.data() || {}) as Record<string, unknown>
          );
          tx.update(typeRef, {
            reservedCount: Math.max(0, tData.reservedCount - res.quantity),
            updatedAt: nowIso,
          });
        }
        tx.update(resDoc.ref, {
          status: 'released',
          releasedAt: nowIso,
        });
        releasedQuantity += res.quantity;
      }

      tx.update(orderRef, {
        status: 'expired',
        expiredAt: nowIso,
        updatedAt: nowIso,
      });

      return {
        order: { ...order, status: 'expired', expiredAt: nowIso },
        releasedQuantity,
        alreadyReleased: false,
      };
    });
  }
}

=== server/domain/ticketing/adapters/firestoreOrderQueryStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  TicketOrderItemPersistenceMapper,
  TicketOrderPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import type { TicketOrder, TicketOrderItem, TicketOrderStatus } from '../types/ticketingTypes';

/** Leitura e status dos pedidos. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreOrderQueryStore {
  async getOrderById(orderId: string): Promise<TicketOrder | null> {
    const snap = await adminDb.collection('ticketOrders').doc(orderId).get();
    if (!snap.exists) return null;
    return TicketOrderPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async getOrderByIdempotencyKey(
    buyerId: string,
    idempotencyKey: string
  ): Promise<TicketOrder | null> {
    const snap = await adminDb
      .collection('ticketOrders')
      .where('buyerId', '==', buyerId)
      .where('idempotencyKey', '==', idempotencyKey)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    if (!doc) return null;
    return TicketOrderPersistenceMapper.toDomain(
      doc.id,
      (doc.data() || {}) as Record<string, unknown>
    );
  }

  async listOrderItemsByOrderId(orderId: string): Promise<TicketOrderItem[]> {
    const snap = await adminDb.collection('ticketOrderItems').where('orderId', '==', orderId).get();
    return snap.docs.map((doc) =>
      TicketOrderItemPersistenceMapper.toDomain(
        doc.id,
        (doc.data() || {}) as Record<string, unknown>
      )
    );
  }

  async listOrdersByBuyerId(buyerId: string): Promise<TicketOrder[]> {
    const snap = await adminDb.collection('ticketOrders').where('buyerId', '==', buyerId).get();
    return snap.docs
      .map((doc) =>
        TicketOrderPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listOrdersByOccurrenceId(occurrenceId: string): Promise<TicketOrder[]> {
    const snap = await adminDb
      .collection('ticketOrders')
      .where('occurrenceId', '==', occurrenceId)
      .get();
    return snap.docs
      .map((doc) =>
        TicketOrderPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listOrdersByEventListingId(eventListingId: string): Promise<TicketOrder[]> {
    const snap = await adminDb
      .collection('ticketOrders')
      .where('eventListingId', '==', eventListingId)
      .get();
    return snap.docs
      .map((doc) =>
        TicketOrderPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listExpiredPendingOrders(nowIso: string): Promise<TicketOrder[]> {
    const snap = await adminDb
      .collection('ticketOrders')
      .where('status', '==', 'pending_payment')
      .get();
    const nowMs = new Date(nowIso).getTime();
    return snap.docs
      .map((doc) =>
        TicketOrderPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .filter((o) => o.expiresAt && new Date(o.expiresAt).getTime() <= nowMs);
  }

  async updateOrderStatus(
    orderId: string,
    status: TicketOrderStatus,
    extra?: Partial<TicketOrder>
  ): Promise<TicketOrder> {
    const ref = adminDb.collection('ticketOrders').doc(orderId);
    const payload: Record<string, unknown> = {
      ...(extra || {}),
      status,
      updatedAt: new Date().toISOString(),
    };
    delete payload.id;
    await ref.update(payload);
    const snap = await ref.get();
    return TicketOrderPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }
}

=== server/domain/ticketing/adapters/firestoreOrderReservationStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  EventPromoCodePersistenceMapper,
  InventoryReservationPersistenceMapper,
  TicketOrderItemPersistenceMapper,
  TicketOrderPersistenceMapper,
  TicketPersistenceMapper,
  TicketTypePersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import { InventoryConflictError, TicketingDomainError } from '../errors/ticketingDomainError';
import type {
  ReserveOrderTransactionInput,
  ReserveOrderTransactionResult,
} from '../ports/ticketingPort';
import type {
  InventoryReservation,
  Ticket,
  TicketOrderItem,
  TicketOrderStatus,
  TicketType,
} from '../types/ticketingTypes';

import {
  getOrderByIdempotencyKey,
  listOrderItemsByOrderId,
  listTicketsByOrderId,
} from './firestoreTicketingQueries';

/** Criação do pedido com reserva de estoque, em transação. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreOrderReservationStore {
  async reserveInventoryAndCreateOrderAtomic(
    input: ReserveOrderTransactionInput
  ): Promise<ReserveOrderTransactionResult> {
    const existingOrder = await getOrderByIdempotencyKey(input.buyerId, input.idempotencyKey);
    if (existingOrder) {
      const existingItems = await listOrderItemsByOrderId(existingOrder.id);
      const existingTickets = await listTicketsByOrderId(existingOrder.id);
      return {
        order: existingOrder,
        items: existingItems,
        reservations: [],
        issuedTickets: existingTickets.map((ticket) => ({ ticket })),
        isIdempotentReplay: true,
      };
    }

    return adminDb.runTransaction(async (tx) => {
      const allTypeSnap = await tx.get(
        adminDb.collection('ticketTypes').where('occurrenceId', '==', input.occurrenceId)
      );

      const typeMap = new Map<string, TicketType>();
      let globalCommitted = 0;

      for (const doc of allTypeSnap.docs) {
        const domainType = TicketTypePersistenceMapper.toDomain(
          doc.id,
          (doc.data() || {}) as Record<string, unknown>
        );
        typeMap.set(doc.id, domainType);
        globalCommitted += domainType.soldCount + domainType.reservedCount;
      }

      const requestedTotalQty = input.items.reduce((acc, item) => acc + item.quantity, 0);
      if (globalCommitted + requestedTotalQty > input.occurrenceCapacity) {
        throw new InventoryConflictError('Capacidade máxima da sessão atingida.');
      }

      for (const item of input.items) {
        const ticketType = typeMap.get(item.ticketTypeId);
        if (!ticketType) {
          throw new TicketingDomainError('NOT_FOUND', 'Tipo de ingresso não encontrado.');
        }
        const remaining = ticketType.quantity - (ticketType.soldCount + ticketType.reservedCount);
        if (remaining < item.quantity) {
          throw new InventoryConflictError('Os últimos ingressos acabaram de esgotar.');
        }
      }

      if (input.promoCodeId) {
        const promoRef = adminDb.collection('eventPromoCodes').doc(input.promoCodeId);
        const promoSnap = await tx.get(promoRef);
        if (!promoSnap.exists) {
          throw new TicketingDomainError('INVALID_ARGUMENT', 'Cupom promocional inválido.');
        }
        const promo = EventPromoCodePersistenceMapper.toDomain(
          promoSnap.id,
          (promoSnap.data() || {}) as Record<string, unknown>
        );
        if (!promo.isActive || (promo.maxUses !== undefined && promo.usedCount >= promo.maxUses)) {
          throw new TicketingDomainError(
            'UNPROCESSABLE_ENTITY',
            'Cupom promocional esgotado ou inativo.'
          );
        }
        tx.update(promoRef, {
          usedCount: promo.usedCount + 1,
          updatedAt: new Date().toISOString(),
        });
      }

      const nowIso = new Date().toISOString();
      const orderRef = adminDb.collection('ticketOrders').doc();
      const orderStatus: TicketOrderStatus = input.issueImmediately ? 'paid' : 'pending_payment';

      const orderDoc: Record<string, unknown> = {
        buyerId: input.buyerId,
        eventListingId: input.eventListingId,
        occurrenceId: input.occurrenceId,
        status: orderStatus,
        currency: 'BRL',
        subtotalMinor: input.subtotalMinor,
        discountMinor: input.discountMinor,
        platformFeeMinor: input.platformFeeMinor,
        paymentFeeMinor: input.paymentFeeMinor,
        totalMinor: input.totalMinor,
        ...(input.promoCodeId ? { promoCodeId: input.promoCodeId } : {}),
        ...(input.promoterCode ? { promoterCode: input.promoterCode } : {}),
        buyerSnapshot: input.buyerSnapshot,
        eventSnapshot: input.eventSnapshot,
        refundPolicySnapshot: input.refundPolicySnapshot,
        idempotencyKey: input.idempotencyKey,
        expiresAt: input.expiresAt,
        createdAt: nowIso,
        updatedAt: nowIso,
        ...(input.issueImmediately ? { paidAt: nowIso } : {}),
      };
      tx.set(orderRef, orderDoc);

      const createdItems: TicketOrderItem[] = [];
      const createdReservations: InventoryReservation[] = [];
      const issuedTickets: Array<{ ticket: Ticket; rawQrToken?: string }> = [];

      for (const item of input.items) {
        const currentType = typeMap.get(item.ticketTypeId)!;
        const typeRef = adminDb.collection('ticketTypes').doc(item.ticketTypeId);

        if (input.issueImmediately) {
          tx.update(typeRef, {
            soldCount: currentType.soldCount + item.quantity,
            updatedAt: nowIso,
          });
        } else {
          tx.update(typeRef, {
            reservedCount: currentType.reservedCount + item.quantity,
            updatedAt: nowIso,
          });

          const resRef = adminDb.collection('inventoryReservations').doc();
          const resPayload: Record<string, unknown> = {
            occurrenceId: input.occurrenceId,
            ticketTypeId: item.ticketTypeId,
            orderId: orderRef.id,
            quantity: item.quantity,
            status: 'active',
            expiresAt: input.expiresAt,
            createdAt: nowIso,
          };
          tx.set(resRef, resPayload);
          createdReservations.push(
            InventoryReservationPersistenceMapper.toDomain(resRef.id, resPayload)
          );
        }

        const itemRef = adminDb.collection('ticketOrderItems').doc();
        const itemPayload: Record<string, unknown> = {
          orderId: orderRef.id,
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          unitPriceMinor: item.unitPriceMinor,
          discountMinor: item.discountMinor,
          allocatedPlatformFeeMinor: item.allocatedPlatformFeeMinor,
          allocatedPaymentFeeMinor: item.allocatedPaymentFeeMinor,
          totalMinor: item.totalMinor,
          ticketTypeSnapshot: item.ticketTypeSnapshot,
          holders: item.holders.map((h) => ({
            name: h.name,
            email: h.email,
            qrTokenHash: h.qrTokenHash,
          })),
        };
        tx.set(itemRef, itemPayload);
        createdItems.push(TicketOrderItemPersistenceMapper.toDomain(itemRef.id, itemPayload));

        if (input.issueImmediately) {
          const perTicketEffectiveMinor =
            item.quantity > 0 ? Math.floor(item.totalMinor / item.quantity) : 0;
          for (const holder of item.holders) {
            const ticketRef = adminDb.collection('tickets').doc();
            const ticketPayload: Record<string, unknown> = {
              orderId: orderRef.id,
              eventListingId: input.eventListingId,
              occurrenceId: input.occurrenceId,
              ticketTypeId: item.ticketTypeId,
              ownerUserId: input.buyerId,
              holderName: holder.name,
              holderEmail: holder.email,
              qrTokenHash: holder.qrTokenHash,
              qrVersion: 1,
              status: 'issued',
              issuedAt: nowIso,
              ticketTypeSnapshot: {
                name: item.ticketTypeSnapshot.name,
                kind: item.ticketTypeSnapshot.kind,
                unitPriceMinor: item.unitPriceMinor,
                effectivePaidMinor: perTicketEffectiveMinor,
              },
              eventSnapshot: input.eventSnapshot,
            };
            tx.set(ticketRef, ticketPayload);
            issuedTickets.push({
              ticket: TicketPersistenceMapper.toDomain(ticketRef.id, ticketPayload),
              rawQrToken: holder.rawQrToken,
            });
          }
        }
      }

      return {
        order: TicketOrderPersistenceMapper.toDomain(orderRef.id, orderDoc),
        items: createdItems,
        reservations: createdReservations,
        issuedTickets,
        isIdempotentReplay: false,
      };
    });
  }
}

=== server/domain/ticketing/adapters/firestoreRefundStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  RefundPersistenceMapper,
  TicketOrderPersistenceMapper,
  TicketPersistenceMapper,
  TicketTypePersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import {
  OrderNotFoundError,
  RefundNotAllowedError,
  TicketingDomainError,
} from '../errors/ticketingDomainError';
import type { Refund, RefundStatus } from '../types/ticketingTypes';

/** Reembolsos. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreRefundStore {
  async createRefundAtomic(params: {
    orderId: string;
    ticketId?: string;
    amountMinor: number;
    requestedBy: Refund['requestedBy'];
    reason: string;
    idempotencyKey: string;
  }): Promise<{ refund: Refund; isReplay: boolean }> {
    const existingSnap = await adminDb
      .collection('ticketRefunds')
      .where('orderId', '==', params.orderId)
      .where('idempotencyKey', '==', params.idempotencyKey)
      .limit(1)
      .get();
    const existingDoc = existingSnap.docs[0];
    if (existingDoc) {
      return {
        refund: RefundPersistenceMapper.toDomain(
          existingDoc.id,
          (existingDoc.data() || {}) as Record<string, unknown>
        ),
        isReplay: true,
      };
    }

    return adminDb.runTransaction(async (tx) => {
      const orderRef = adminDb.collection('ticketOrders').doc(params.orderId);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) {
        throw new OrderNotFoundError();
      }
      const order = TicketOrderPersistenceMapper.toDomain(
        orderSnap.id,
        (orderSnap.data() || {}) as Record<string, unknown>
      );

      if (order.status === 'refunded') {
        throw new RefundNotAllowedError('Este pedido já foi reembolsado.');
      }

      const ticketsSnap = await tx.get(
        adminDb.collection('tickets').where('orderId', '==', params.orderId)
      );
      const tickets = ticketsSnap.docs.map((doc) => ({
        ref: doc.ref,
        domain: TicketPersistenceMapper.toDomain(
          doc.id,
          (doc.data() || {}) as Record<string, unknown>
        ),
      }));

      for (const { ref, domain } of tickets) {
        if (params.ticketId && domain.id !== params.ticketId) continue;
        if (domain.status === 'checked_in') {
          throw new RefundNotAllowedError(
            'Ingresso já utilizado no check-in não pode ser reembolsado.'
          );
        }
        if (domain.status === 'refunded' || domain.status === 'refund_pending') {
          throw new RefundNotAllowedError(
            'Reembolso já solicitado ou concluído para este ingresso.'
          );
        }
        tx.update(ref, {
          status: order.totalMinor === 0 ? 'refunded' : 'refund_pending',
        });
      }

      const nowIso = new Date().toISOString();
      const refundRef = adminDb.collection('ticketRefunds').doc();
      const initialStatus: RefundStatus = order.totalMinor === 0 ? 'approved' : 'pending_provider';
      const refundDoc: Record<string, unknown> = {
        orderId: params.orderId,
        eventListingId: order.eventListingId,
        ...(params.ticketId ? { ticketId: params.ticketId } : {}),
        amountMinor: params.amountMinor,
        requestedBy: params.requestedBy,
        reason: params.reason,
        status: initialStatus,
        provider: 'stripe',
        providerRefundId: null,
        idempotencyKey: params.idempotencyKey,
        createdAt: nowIso,
        ...(order.totalMinor === 0 ? { completedAt: nowIso } : {}),
      };
      tx.set(refundRef, refundDoc);

      if (order.totalMinor === 0) {
        tx.update(orderRef, {
          status: 'refunded',
          updatedAt: nowIso,
        });
      }

      return {
        refund: RefundPersistenceMapper.toDomain(refundRef.id, refundDoc),
        isReplay: false,
      };
    });
  }

  async updateRefundStatus(
    refundId: string,
    status: RefundStatus,
    providerRefundId?: string | null
  ): Promise<Refund> {
    return adminDb.runTransaction(async (tx) => {
      const refundRef = adminDb.collection('ticketRefunds').doc(refundId);
      const refundSnap = await tx.get(refundRef);
      if (!refundSnap.exists) {
        throw new TicketingDomainError('NOT_FOUND', 'Solicitação de reembolso não encontrada.');
      }
      const refund = RefundPersistenceMapper.toDomain(
        refundSnap.id,
        (refundSnap.data() || {}) as Record<string, unknown>
      );

      // Idempotência: se o reembolso já atingiu estado aprovado ou já está no mesmo status
      // (com o mesmo providerRefundId), encerra sem duplicar efeitos colaterais (estoque/pedido).
      if (
        refund.status === 'approved' ||
        (refund.status === status &&
          (providerRefundId === undefined || providerRefundId === refund.providerRefundId))
      ) {
        return refund;
      }

      const nowIso = new Date().toISOString();
      const patch: Record<string, unknown> = {
        status,
        ...(providerRefundId !== undefined ? { providerRefundId } : {}),
        ...(status === 'approved' ? { completedAt: nowIso } : {}),
      };

      if (status === 'approved') {
        const orderRef = adminDb.collection('ticketOrders').doc(refund.orderId);
        const ticketsSnap = await tx.get(
          adminDb.collection('tickets').where('orderId', '==', refund.orderId)
        );

        const targetTicketDocs = ticketsSnap.docs.filter((doc) => {
          if (refund.ticketId && doc.id !== refund.ticketId) return false;
          const tData = TicketPersistenceMapper.toDomain(
            doc.id,
            (doc.data() || {}) as Record<string, unknown>
          );
          return tData.status !== 'refunded';
        });

        // Firestore exige todas as leituras antes de qualquer escrita na transação
        const decrementByTypeId = new Map<string, number>();
        for (const doc of targetTicketDocs) {
          const tData = TicketPersistenceMapper.toDomain(
            doc.id,
            (doc.data() || {}) as Record<string, unknown>
          );
          decrementByTypeId.set(
            tData.ticketTypeId,
            (decrementByTypeId.get(tData.ticketTypeId) || 0) + 1
          );
        }

        const typeUpdates: Array<{
          ref: FirebaseFirestore.DocumentReference;
          newSoldCount: number;
        }> = [];
        for (const [ticketTypeId, decrementCount] of decrementByTypeId.entries()) {
          const typeRef = adminDb.collection('ticketTypes').doc(ticketTypeId);
          const typeSnap = await tx.get(typeRef);
          if (typeSnap.exists) {
            const typeDomain = TicketTypePersistenceMapper.toDomain(
              typeSnap.id,
              (typeSnap.data() || {}) as Record<string, unknown>
            );
            typeUpdates.push({
              ref: typeRef,
              newSoldCount: Math.max(0, typeDomain.soldCount - decrementCount),
            });
          }
        }

        tx.update(refundRef, patch);
        tx.update(orderRef, {
          status: refund.ticketId ? 'partially_refunded' : 'refunded',
          updatedAt: nowIso,
        });

        for (const doc of targetTicketDocs) {
          tx.update(doc.ref, { status: 'refunded' });
        }

        for (const typeUpdate of typeUpdates) {
          tx.update(typeUpdate.ref, {
            soldCount: typeUpdate.newSoldCount,
            updatedAt: nowIso,
          });
        }
      } else if (status === 'failed') {
        const ticketsSnap = await tx.get(
          adminDb.collection('tickets').where('orderId', '==', refund.orderId)
        );
        const pendingTicketDocs = ticketsSnap.docs.filter((doc) => {
          if (refund.ticketId && doc.id !== refund.ticketId) return false;
          const tData = TicketPersistenceMapper.toDomain(
            doc.id,
            (doc.data() || {}) as Record<string, unknown>
          );
          return tData.status === 'refund_pending';
        });

        tx.update(refundRef, patch);
        for (const doc of pendingTicketDocs) {
          tx.update(doc.ref, { status: 'issued' });
        }
      } else {
        tx.update(refundRef, patch);
      }

      return {
        ...refund,
        status,
        providerRefundId:
          providerRefundId !== undefined ? providerRefundId : refund.providerRefundId,
        completedAt: status === 'approved' ? nowIso : refund.completedAt,
      };
    });
  }

  async getRefundById(refundId: string): Promise<Refund | null> {
    const snap = await adminDb.collection('ticketRefunds').doc(refundId).get();
    if (!snap.exists) return null;
    return RefundPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async listRefundsByOrderId(orderId: string): Promise<Refund[]> {
    const snap = await adminDb.collection('ticketRefunds').where('orderId', '==', orderId).get();
    return snap.docs.map((doc) =>
      RefundPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async listRefundsByEventListingId(eventListingId: string): Promise<Refund[]> {
    const snap = await adminDb
      .collection('ticketRefunds')
      .where('eventListingId', '==', eventListingId)
      .get();
    return snap.docs.map((doc) =>
      RefundPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }
}

=== server/domain/ticketing/adapters/firestoreTicketStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  TicketOrderPersistenceMapper,
  TicketPersistenceMapper,
  TicketTransferPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { Ticket, TicketStatus, TicketTransfer } from '../types/ticketingTypes';

/** Ingressos: leitura, status, transferência e troca de sessão. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreTicketStore {
  async getTicketById(ticketId: string): Promise<Ticket | null> {
    const snap = await adminDb.collection('tickets').doc(ticketId).get();
    if (!snap.exists) return null;
    return TicketPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async getTicketByQrTokenHash(qrTokenHash: string): Promise<Ticket | null> {
    const snap = await adminDb
      .collection('tickets')
      .where('qrTokenHash', '==', qrTokenHash)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    if (!doc) return null;
    return TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>);
  }

  async listTicketsByOrderId(orderId: string): Promise<Ticket[]> {
    const snap = await adminDb.collection('tickets').where('orderId', '==', orderId).get();
    return snap.docs.map((doc) =>
      TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async listTicketsByOwnerUserId(ownerUserId: string): Promise<Ticket[]> {
    const snap = await adminDb.collection('tickets').where('ownerUserId', '==', ownerUserId).get();
    return snap.docs
      .map((doc) =>
        TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  async listTicketsByOccurrenceId(occurrenceId: string): Promise<Ticket[]> {
    const snap = await adminDb
      .collection('tickets')
      .where('occurrenceId', '==', occurrenceId)
      .get();
    return snap.docs.map((doc) =>
      TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async listTicketsByEventListingId(eventListingId: string): Promise<Ticket[]> {
    const snap = await adminDb
      .collection('tickets')
      .where('eventListingId', '==', eventListingId)
      .get();
    return snap.docs.map((doc) =>
      TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    extra?: Partial<Ticket>
  ): Promise<Ticket> {
    const ref = adminDb.collection('tickets').doc(ticketId);
    const payload: Record<string, unknown> = {
      ...(extra || {}),
      status,
    };
    delete payload.id;
    await ref.update(payload);
    const snap = await ref.get();
    return TicketPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async transferTicketAtomic(params: {
    ticketId: string;
    fromUserId: string;
    toUserId?: string;
    recipientEmail: string;
    recipientName?: string;
    newQrTokenHash: string;
  }): Promise<{
    oldTicket: Ticket;
    newTicket: Ticket;
    transfer: TicketTransfer;
  }> {
    return adminDb.runTransaction(async (tx) => {
      const oldTicketRef = adminDb.collection('tickets').doc(params.ticketId);
      const oldSnap = await tx.get(oldTicketRef);
      if (!oldSnap.exists) {
        throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
      }
      const oldTicket = TicketPersistenceMapper.toDomain(
        oldSnap.id,
        (oldSnap.data() || {}) as Record<string, unknown>
      );

      if (oldTicket.ownerUserId !== params.fromUserId) {
        throw new TicketingDomainError(
          'FORBIDDEN',
          'Apenas o titular atual pode transferir este ingresso.'
        );
      }

      if (oldTicket.status !== 'issued') {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Apenas ingressos emitidos e não utilizados podem ser transferidos.'
        );
      }

      const nowIso = new Date().toISOString();
      const expiresAtIso = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      const nextQrVersion = (oldTicket.qrVersion || 1) + 1;

      tx.update(oldTicketRef, {
        status: 'transferred',
        transferredAt: nowIso,
        qrVersion: nextQrVersion,
      });

      const newTicketRef = adminDb.collection('tickets').doc();
      const newTicketDoc: Record<string, unknown> = {
        orderId: oldTicket.orderId,
        eventListingId: oldTicket.eventListingId,
        occurrenceId: oldTicket.occurrenceId,
        ticketTypeId: oldTicket.ticketTypeId,
        ownerUserId: params.toUserId || params.fromUserId,
        holderName: params.recipientName || params.recipientEmail.split('@')[0],
        holderEmail: params.recipientEmail,
        qrTokenHash: params.newQrTokenHash,
        qrVersion: nextQrVersion,
        status: 'issued',
        issuedAt: nowIso,
        ...(oldTicket.ticketTypeSnapshot
          ? { ticketTypeSnapshot: oldTicket.ticketTypeSnapshot }
          : {}),
        ...(oldTicket.eventSnapshot ? { eventSnapshot: oldTicket.eventSnapshot } : {}),
      };
      tx.set(newTicketRef, newTicketDoc);

      const transferRef = adminDb.collection('ticketTransfers').doc();
      const transferDoc: Record<string, unknown> = {
        ticketId: oldTicket.id,
        newTicketId: newTicketRef.id,
        fromUserId: params.fromUserId,
        ...(params.toUserId ? { toUserId: params.toUserId } : {}),
        recipientEmail: params.recipientEmail,
        ...(params.recipientName ? { recipientName: params.recipientName } : {}),
        status: 'completed',
        expiresAt: expiresAtIso,
        createdAt: nowIso,
        completedAt: nowIso,
      };
      tx.set(transferRef, transferDoc);

      return {
        oldTicket: {
          ...oldTicket,
          status: 'transferred',
          transferredAt: nowIso,
          qrVersion: nextQrVersion,
        },
        newTicket: TicketPersistenceMapper.toDomain(newTicketRef.id, newTicketDoc),
        transfer: TicketTransferPersistenceMapper.toDomain(transferRef.id, transferDoc),
      };
    });
  }

  async moveOrdersAndTicketsToOccurrenceAtomic(params: {
    fromOccurrenceId: string;
    toOccurrenceId: string;
    newStartsAt: string;
    newEndsAt: string;
  }): Promise<{ movedOrdersCount: number; movedTicketsCount: number }> {
    return adminDb.runTransaction(async (tx) => {
      const ordersSnap = await tx.get(
        adminDb.collection('ticketOrders').where('occurrenceId', '==', params.fromOccurrenceId)
      );
      const ticketsSnap = await tx.get(
        adminDb.collection('tickets').where('occurrenceId', '==', params.fromOccurrenceId)
      );

      const nowIso = new Date().toISOString();
      let movedOrdersCount = 0;
      let movedTicketsCount = 0;

      for (const orderDoc of ordersSnap.docs) {
        const order = TicketOrderPersistenceMapper.toDomain(
          orderDoc.id,
          (orderDoc.data() || {}) as Record<string, unknown>
        );
        if (order.status === 'paid' || order.status === 'pending_payment') {
          tx.update(orderDoc.ref, {
            occurrenceId: params.toOccurrenceId,
            ...(order.eventSnapshot
              ? {
                  eventSnapshot: {
                    ...order.eventSnapshot,
                    startsAt: params.newStartsAt,
                    endsAt: params.newEndsAt,
                  },
                }
              : {}),
            updatedAt: nowIso,
          });
          movedOrdersCount += 1;
        }
      }

      for (const ticketDoc of ticketsSnap.docs) {
        const ticket = TicketPersistenceMapper.toDomain(
          ticketDoc.id,
          (ticketDoc.data() || {}) as Record<string, unknown>
        );
        if (ticket.status === 'issued' || ticket.status === 'reserved') {
          tx.update(ticketDoc.ref, {
            occurrenceId: params.toOccurrenceId,
            ...(ticket.eventSnapshot
              ? {
                  eventSnapshot: {
                    ...ticket.eventSnapshot,
                    startsAt: params.newStartsAt,
                    endsAt: params.newEndsAt,
                  },
                }
              : {}),
          });
          movedTicketsCount += 1;
        }
      }

      return { movedOrdersCount, movedTicketsCount };
    });
  }
}

=== server/domain/ticketing/adapters/firestoreTicketTypeStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { TicketTypePersistenceMapper } from '../dtos/ticketingPersistenceMappers';
import type { TicketType } from '../types/ticketingTypes';

/** Lotes de ingresso. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreTicketTypeStore {
  async createTicketType(
    input: Omit<TicketType, 'id' | 'soldCount' | 'reservedCount' | 'createdAt' | 'updatedAt'>
  ): Promise<TicketType> {
    const nowIso = new Date().toISOString();
    const ref = adminDb.collection('ticketTypes').doc();
    const payload: Record<string, unknown> = {
      ...input,
      soldCount: 0,
      reservedCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await ref.set(payload);
    return TicketTypePersistenceMapper.toDomain(ref.id, payload);
  }

  async getTicketTypeById(id: string): Promise<TicketType | null> {
    const snap = await adminDb.collection('ticketTypes').doc(id).get();
    if (!snap.exists) return null;
    return TicketTypePersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async listTicketTypesByOccurrenceId(occurrenceId: string): Promise<TicketType[]> {
    const snap = await adminDb
      .collection('ticketTypes')
      .where('occurrenceId', '==', occurrenceId)
      .get();
    return snap.docs
      .map((doc) =>
        TicketTypePersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async updateTicketType(id: string, patch: Partial<TicketType>): Promise<TicketType> {
    const ref = adminDb.collection('ticketTypes').doc(id);
    const updatePayload: Record<string, unknown> = {
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload.id;
    delete updatePayload.soldCount;
    delete updatePayload.reservedCount;
    await ref.update(updatePayload);
    const updatedSnap = await ref.get();
    return TicketTypePersistenceMapper.toDomain(
      updatedSnap.id,
      (updatedSnap.data() || {}) as Record<string, unknown>
    );
  }

  async deleteTicketType(id: string): Promise<void> {
    await adminDb.collection('ticketTypes').doc(id).delete();
  }
}

=== server/domain/ticketing/adapters/firestoreTicketingAdapter.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type { TicketingPort } from '../ports/ticketingPort';
import { FirestoreTicketTypeStore } from './firestoreTicketTypeStore';
import { FirestoreOrderReservationStore } from './firestoreOrderReservationStore';
import { FirestoreOrderPaymentStore } from './firestoreOrderPaymentStore';
import { FirestoreOrderQueryStore } from './firestoreOrderQueryStore';
import { FirestoreTicketStore } from './firestoreTicketStore';
import { FirestoreCheckInStore } from './firestoreCheckInStore';
import { FirestoreRefundStore } from './firestoreRefundStore';
import { FirestoreEngagementStore } from './firestoreEngagementStore';

/** Implementação do `TicketingPort` no Firestore, composta pelos stores de cada parte do ticketing. */
export class FirestoreTicketingAdapter implements TicketingPort {
  private readonly ticketType = new FirestoreTicketTypeStore();
  private readonly orderReservation = new FirestoreOrderReservationStore();
  private readonly orderPayment = new FirestoreOrderPaymentStore();
  private readonly orderQuery = new FirestoreOrderQueryStore();
  private readonly ticket = new FirestoreTicketStore();
  private readonly checkIn = new FirestoreCheckInStore();
  private readonly refund = new FirestoreRefundStore();
  private readonly engagement = new FirestoreEngagementStore();

  readonly createTicketType = this.ticketType.createTicketType.bind(this.ticketType);
  readonly getTicketTypeById = this.ticketType.getTicketTypeById.bind(this.ticketType);
  readonly listTicketTypesByOccurrenceId = this.ticketType.listTicketTypesByOccurrenceId.bind(
    this.ticketType
  );
  readonly updateTicketType = this.ticketType.updateTicketType.bind(this.ticketType);
  readonly deleteTicketType = this.ticketType.deleteTicketType.bind(this.ticketType);
  readonly reserveInventoryAndCreateOrderAtomic =
    this.orderReservation.reserveInventoryAndCreateOrderAtomic.bind(this.orderReservation);
  readonly confirmOrderPaymentAndIssueTicketsAtomic =
    this.orderPayment.confirmOrderPaymentAndIssueTicketsAtomic.bind(this.orderPayment);
  readonly expireOrderAndReleaseInventoryAtomic =
    this.orderPayment.expireOrderAndReleaseInventoryAtomic.bind(this.orderPayment);
  readonly getOrderById = this.orderQuery.getOrderById.bind(this.orderQuery);
  readonly getOrderByIdempotencyKey = this.orderQuery.getOrderByIdempotencyKey.bind(
    this.orderQuery
  );
  readonly listOrderItemsByOrderId = this.orderQuery.listOrderItemsByOrderId.bind(this.orderQuery);
  readonly listOrdersByBuyerId = this.orderQuery.listOrdersByBuyerId.bind(this.orderQuery);
  readonly listOrdersByOccurrenceId = this.orderQuery.listOrdersByOccurrenceId.bind(
    this.orderQuery
  );
  readonly listOrdersByEventListingId = this.orderQuery.listOrdersByEventListingId.bind(
    this.orderQuery
  );
  readonly listExpiredPendingOrders = this.orderQuery.listExpiredPendingOrders.bind(
    this.orderQuery
  );
  readonly updateOrderStatus = this.orderQuery.updateOrderStatus.bind(this.orderQuery);
  readonly getTicketById = this.ticket.getTicketById.bind(this.ticket);
  readonly getTicketByQrTokenHash = this.ticket.getTicketByQrTokenHash.bind(this.ticket);
  readonly listTicketsByOrderId = this.ticket.listTicketsByOrderId.bind(this.ticket);
  readonly listTicketsByOwnerUserId = this.ticket.listTicketsByOwnerUserId.bind(this.ticket);
  readonly listTicketsByOccurrenceId = this.ticket.listTicketsByOccurrenceId.bind(this.ticket);
  readonly listTicketsByEventListingId = this.ticket.listTicketsByEventListingId.bind(this.ticket);
  readonly updateTicketStatus = this.ticket.updateTicketStatus.bind(this.ticket);
  readonly checkInTicketAtomic = this.checkIn.checkInTicketAtomic.bind(this.checkIn);
  readonly listCheckInsByOccurrenceId = this.checkIn.listCheckInsByOccurrenceId.bind(this.checkIn);
  readonly listCheckInsByEventListingId = this.checkIn.listCheckInsByEventListingId.bind(
    this.checkIn
  );
  readonly createOfflineCheckInSession = this.checkIn.createOfflineCheckInSession.bind(
    this.checkIn
  );
  readonly getOfflineCheckInSessionById = this.checkIn.getOfflineCheckInSessionById.bind(
    this.checkIn
  );
  readonly syncOfflineCheckInsAtomic = this.checkIn.syncOfflineCheckInsAtomic.bind(this.checkIn);
  readonly createRefundAtomic = this.refund.createRefundAtomic.bind(this.refund);
  readonly updateRefundStatus = this.refund.updateRefundStatus.bind(this.refund);
  readonly getRefundById = this.refund.getRefundById.bind(this.refund);
  readonly listRefundsByOrderId = this.refund.listRefundsByOrderId.bind(this.refund);
  readonly listRefundsByEventListingId = this.refund.listRefundsByEventListingId.bind(this.refund);
  readonly transferTicketAtomic = this.ticket.transferTicketAtomic.bind(this.ticket);
  readonly moveOrdersAndTicketsToOccurrenceAtomic =
    this.ticket.moveOrdersAndTicketsToOccurrenceAtomic.bind(this.ticket);
  readonly createPromoCode = this.engagement.createPromoCode.bind(this.engagement);
  readonly getPromoCodeByCode = this.engagement.getPromoCodeByCode.bind(this.engagement);
  readonly createWaitlistEntry = this.engagement.createWaitlistEntry.bind(this.engagement);
  readonly listWaitlistByOccurrenceId = this.engagement.listWaitlistByOccurrenceId.bind(
    this.engagement
  );
}

=== server/domain/ticketing/adapters/firestoreTicketingQueries.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  TicketOrderItemPersistenceMapper,
  TicketOrderPersistenceMapper,
  TicketPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import type { Ticket, TicketOrder, TicketOrderItem } from '../types/ticketingTypes';

/** Consultas usadas por mais de um store do ticketing. */
export async function getOrderByIdempotencyKey(
  buyerId: string,
  idempotencyKey: string
): Promise<TicketOrder | null> {
  const snap = await adminDb
    .collection('ticketOrders')
    .where('buyerId', '==', buyerId)
    .where('idempotencyKey', '==', idempotencyKey)
    .limit(1)
    .get();
  const doc = snap.docs[0];
  if (!doc) return null;
  return TicketOrderPersistenceMapper.toDomain(
    doc.id,
    (doc.data() || {}) as Record<string, unknown>
  );
}

export async function listOrderItemsByOrderId(orderId: string): Promise<TicketOrderItem[]> {
  const snap = await adminDb.collection('ticketOrderItems').where('orderId', '==', orderId).get();
  return snap.docs.map((doc) =>
    TicketOrderItemPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
  );
}

export async function listTicketsByOrderId(orderId: string): Promise<Ticket[]> {
  const snap = await adminDb.collection('tickets').where('orderId', '==', orderId).get();
  return snap.docs.map((doc) =>
    TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
  );
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/domain/ticketing/adapters/firestoreCheckInStore.ts server/domain/ticketing/adapters/firestoreEngagementStore.ts server/domain/ticketing/adapters/firestoreOrderPaymentStore.ts server/domain/ticketing/adapters/firestoreOrderQueryStore.ts server/domain/ticketing/adapters/firestoreOrderReservationStore.ts server/domain/ticketing/adapters/firestoreRefundStore.ts server/domain/ticketing/adapters/firestoreTicketStore.ts server/domain/ticketing/adapters/firestoreTicketTypeStore.ts server/domain/ticketing/adapters/firestoreTicketingAdapter.ts server/domain/ticketing/adapters/firestoreTicketingQueries.ts` (todos verdes). Não precisa rodar a suíte inteira.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
