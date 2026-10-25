import { checkInService } from '../factory';

export function hasCheckedInTicketForOrderUseCase(orderId: string): Promise<boolean> {
  return checkInService.orderHasCheckIn(orderId);
}
