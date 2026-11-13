import type { GateCounts, GateScopeType, MyGate, OwnerGateStaff } from '../types/gateStaff';

/** Equipe da portaria (C1): o dono convida e remove; a pessoa responde, vê as portarias e sai. */
export interface GateStaffPort {
  listOwnerGateStaff(): Promise<OwnerGateStaff>;
  inviteGateStaff(target: { type: GateScopeType; id: string }, username: string): Promise<void>;
  removeGateStaff(memberId: string): Promise<void>;
  listMyGates(): Promise<MyGate[]>;
  respondGateInvite(memberId: string, accept: boolean): Promise<void>;
  leaveGate(memberId: string): Promise<void>;
  getGateCounts(occurrenceId: string): Promise<GateCounts>;
}
