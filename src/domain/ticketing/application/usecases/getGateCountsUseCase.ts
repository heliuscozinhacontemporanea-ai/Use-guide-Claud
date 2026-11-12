import { gateStaffAdapter } from '../../factory';
import type { GateCounts } from '../../types/gateStaff';

export function getGateCountsUseCase(occurrenceId: string): Promise<GateCounts> {
  return gateStaffAdapter.getGateCounts(occurrenceId);
}
