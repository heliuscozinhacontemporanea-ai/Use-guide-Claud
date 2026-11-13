import type { GateScope, GateStaffMember, GateStaffStatus } from '../types/gateStaffTypes';

export interface GateStaffStorePort {
  /** Cria o convite se a pessoa ainda não está na equipe e o limite do escopo não estourou. */
  invite(input: Omit<GateStaffMember, 'id'>, limit: number): Promise<GateStaffMember>;
  get(id: string): Promise<GateStaffMember | null>;
  /** Muda a situação só se a atual for uma das esperadas (aceite, recusa, remoção, saída). */
  transition(
    id: string,
    from: GateStaffStatus[],
    patch: Partial<Pick<GateStaffMember, 'status' | 'acceptedAt' | 'endedAt'>>
  ): Promise<GateStaffMember>;
  listByOwner(ownerId: string): Promise<GateStaffMember[]>;
  listByStaff(staffUid: string): Promise<GateStaffMember[]>;
  findInScope(scope: GateScope, staffUid: string): Promise<GateStaffMember[]>;
  /** Tira o @ e o nome de quem excluiu a conta (§7.5). */
  anonymizeStaff(uid: string): Promise<number>;
}
