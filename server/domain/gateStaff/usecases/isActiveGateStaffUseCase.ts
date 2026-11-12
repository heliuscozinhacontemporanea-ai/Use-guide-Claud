import { getGateStaffService } from '../factory';
import type { GateScope } from '../types/gateStaffTypes';

/** A pessoa pode operar a portaria deste evento ou atração agora. */
export function isActiveGateStaffUseCase(scope: GateScope, staffUid: string): Promise<boolean> {
  return getGateStaffService().isActive(scope, staffUid);
}
