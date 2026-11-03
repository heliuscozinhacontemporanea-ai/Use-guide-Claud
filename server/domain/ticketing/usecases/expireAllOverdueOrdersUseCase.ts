import { ticketOrderService } from '../factory';
import type { TicketOrder } from '../types/ticketingTypes';

/** Expira os pedidos não pagos no prazo. `expired` traz os que expiraram nesta rodada. */
export async function expireAllOverdueOrdersUseCase(
  nowIso?: string
): Promise<{ expiredCount: number; expired: TicketOrder[] }> {
  const expired = await ticketOrderService.expireAllOverdueOrders(nowIso);
  return { expiredCount: expired.length, expired };
}
