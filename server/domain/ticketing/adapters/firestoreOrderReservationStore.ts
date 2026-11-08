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
        serviceFeeMinor: input.serviceFeeMinor,
        totalMinor: input.totalMinor,
        ...(input.promoCodeId ? { promoCodeId: input.promoCodeId } : {}),
        ...(input.promoterCode ? { promoterCode: input.promoterCode } : {}),
        buyerSnapshot: input.buyerSnapshot,
        eventSnapshot: input.eventSnapshot,
        salesPolicySnapshot: input.salesPolicySnapshot,
        termsAcceptance: input.termsAcceptance,
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
          allocatedServiceFeeMinor: item.allocatedServiceFeeMinor,
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
              updatedAt: nowIso,
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
