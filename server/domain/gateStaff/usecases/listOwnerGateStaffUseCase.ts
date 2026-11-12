import { getGateStaffService } from '../factory';
import type { GateStaffMember } from '../types/gateStaffTypes';

/** Equipe ativa e convites abertos do dono. */
export function listOwnerGateStaffUseCase(ownerId: string): Promise<GateStaffMember[]> {
  return getGateStaffService().listForOwner(ownerId);
}
