import { ticketOrderService } from '../factory';

export async function expireAllOverdueOrdersUseCase(
  nowIso?: string
): Promise<{ expiredCount: number }> {
  const expiredCount = await ticketOrderService.expireAllOverdueOrders(nowIso);
  return { expiredCount };
}
