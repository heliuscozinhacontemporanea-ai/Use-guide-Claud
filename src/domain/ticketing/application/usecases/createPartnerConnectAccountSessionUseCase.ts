import { ticketingAdapter } from '../../factory';

export function createPartnerConnectAccountSessionUseCase() {
  return ticketingAdapter.createPartnerConnectAccountSession();
}
