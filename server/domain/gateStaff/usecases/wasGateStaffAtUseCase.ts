import { getGateStaffService } from '../factory';
import type { GateScope } from '../types/gateStaffTypes';

/** A pessoa fazia parte da equipe naquele instante (entradas lidas sem internet). */
export function wasGateStaffAtUseCase(
  scope: GateScope,
  staffUid: string,
  atIso: string
): Promise<boolean> {
  return getGateStaffService().wasActiveAt(scope, staffUid, atIso);
}
