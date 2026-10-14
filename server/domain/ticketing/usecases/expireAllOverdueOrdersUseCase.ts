import { ticketingService } from '../factory';

export async function expireAllOverdueOrdersUseCase(
  nowIso?: string
): Promise<{ expiredCount: number }> {
  const expiredCount = await ticketingService.expireAllOverdueOrders(nowIso);
  return { expiredCount };
}
