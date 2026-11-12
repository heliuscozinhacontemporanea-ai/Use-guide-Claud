import { gateStaffAdapter } from '../../factory';
import type { OwnerGateStaff } from '../../types/gateStaff';

export function listOwnerGateStaffUseCase(): Promise<OwnerGateStaff> {
  return gateStaffAdapter.listOwnerGateStaff();
}
