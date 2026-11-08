import { receivablesApiAdapter } from '../../factory';
import type { PayoutPage } from '../../types/receivables';

export function listPayoutsUseCase(query: {
  accountKey?: string;
  cursor?: string;
}): Promise<PayoutPage> {
  return receivablesApiAdapter.listPayouts(query);
}
