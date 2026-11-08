import { applyPayoutRefundUseCase } from '../../../domain/payment';
import type { Refund } from '../../../domain/ticketing';

/** Reembolso de ingresso concluído desconta o repasse do pedido; chamado na resposta e no webhook. */
export async function applyTicketRefundToPayoutApplicationUseCase(refund: Refund): Promise<void> {
  if (refund.status !== 'approved' || refund.amountMinor <= 0) return;
  await applyPayoutRefundUseCase({
    referenceType: 'ticket_order',
    referenceId: refund.orderId,
    refundKey: refund.id,
    amountMinor: refund.amountMinor,
    serviceFeeMinor: refund.serviceFeeMinor,
  });
}
