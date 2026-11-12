import { getGateStaffService } from '../factory';
import type { GateStaffMember } from '../types/gateStaffTypes';

/** O dono tira a pessoa da equipe ou cancela o convite. */
export function removeGateStaffUseCase(ownerId: string, id: string): Promise<GateStaffMember> {
  return getGateStaffService().remove(ownerId, id);
}
