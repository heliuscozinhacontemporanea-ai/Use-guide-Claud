import { ticketRefundService } from '../factory';
import type { Refund } from '../types/ticketingTypes';

export async function finalizeTicketRefundStatusUseCase(
  refundId: string,
  status: Refund['status'],
  providerRefundId?: string | null
): Promise<Refund> {
  return ticketRefundService.finalizeRefundStatus(refundId, status, providerRefundId);
}
