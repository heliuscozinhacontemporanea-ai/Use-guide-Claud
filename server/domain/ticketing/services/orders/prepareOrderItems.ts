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
