import { computePromoDiscount, type PromoCode } from '../../../promotions';
import {
  type PlatformFeeConfig,
  type ServiceFeeMode,
  ticketOrderFees,
} from '../../../../shared/kernel/platformFees';
import {
  InventoryConflictError,
  TicketingDomainError,
  TicketTypeUnavailableError,
} from '../../errors/ticketingDomainError';
import { isCourtesyTicketTypeId } from '../../types/courtesyTypes';
import { deriveTicketTypeSaleStatus, type TicketType } from '../../types/ticketingTypes';
import { generateOpaqueTicketQrToken } from '../../utils/qrToken';

export interface OrderItemRequest {
  ticketTypeId: string;
  quantity: number;
  holders?: Array<{ name: string; email: string }>;
}

/**
 * Confere cada lote (quantidade, estoque, janela de venda), aplica o cupom, gera os QR opacos dos titulares
 * e calcula as taxas do pedido (D14): a da plataforma, repartida entre os itens, e a de serviço por ingresso pago. Preço sempre do lote no servidor (AGENTS.md §8.5).
 */
export function prepareOrderItems(params: {
  items: OrderItemRequest[];
  typeMap: Map<string, TicketType>;
  occurrenceCapacity: number;
  totalCommitted: number;
  nowMs: number;
  /** Cupom que vale para o evento e os lotes que levam desconto (B1). */
  promo: { promo: PromoCode; optionIds: string[] | null } | null;
  buyer: { name: string; email: string };
  feeConfig: PlatformFeeConfig;
  serviceFeeMode: ServiceFeeMode;
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
    // O lote das cortesias nunca é vendido, mesmo que alguém mande o ID dele (D27).
    if (!ticketType || isCourtesyTicketTypeId(ticketType.id)) {
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
    subtotalMinor += lineSubtotal;

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
      lineDiscount: 0,
      lineNetAfterDiscount: lineSubtotal,
      holders,
    });
  }

  // O desconto depende do pedido inteiro (valor fixo por pedido, máximo de ingressos com desconto).
  if (params.promo) {
    const discounts = computePromoDiscount(
      params.promo.promo,
      params.promo.optionIds,
      rawItemsPrepared.map((item) => ({
        optionId: item.ticketType.id,
        unitPriceMinor: item.unitPriceMinor,
        quantity: item.quantity,
      }))
    );
    rawItemsPrepared.forEach((item, index) => {
      const lineDiscount = Math.min(item.lineSubtotal, discounts[index] ?? 0);
      item.lineDiscount = lineDiscount;
      item.lineNetAfterDiscount = item.lineSubtotal - lineDiscount;
      discountMinor += lineDiscount;
    });
  }

  const netSubtotalMinor = Math.max(0, subtotalMinor - discountMinor);
  const paidTicketCount = rawItemsPrepared
    .filter((item) => item.lineNetAfterDiscount > 0)
    .reduce((sum, item) => sum + item.quantity, 0);
  const { platformFeeMinor, serviceFeeMinor } = ticketOrderFees(
    { netSubtotalMinor, paidTicketCount, mode: params.serviceFeeMode },
    params.feeConfig
  );
  const serviceFeePerTicketMinor = paidTicketCount > 0 ? serviceFeeMinor / paidTicketCount : 0;
  const paymentFeeMinor = 0;
  // A taxa de serviço soma no que o comprador paga; o preço do ingresso não muda (D14).
  const totalMinor = netSubtotalMinor + serviceFeeMinor;

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
      allocatedServiceFeeMinor:
        item.lineNetAfterDiscount > 0 ? serviceFeePerTicketMinor * item.quantity : 0,
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
    serviceFeeMinor,
    totalMinor,
    preparedItems,
  };
}
