import { payoutService } from '../factory';
import type { ReleaseSummary } from '../services/payoutService';

/** Job de hora em hora (D14): transfere os repasses vencidos. */
export function releaseDuePayoutsUseCase(limit = 200): Promise<ReleaseSummary> {
  return payoutService.releaseDue(limit);
}
