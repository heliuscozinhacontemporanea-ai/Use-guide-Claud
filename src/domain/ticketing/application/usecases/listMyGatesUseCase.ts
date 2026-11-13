import { gateStaffAdapter } from '../../factory';
import type { MyGate } from '../../types/gateStaff';

export function listMyGatesUseCase(): Promise<MyGate[]> {
  return gateStaffAdapter.listMyGates();
}
