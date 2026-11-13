import { getGateStaffService } from '../factory';

/** Tira o @ e o nome de quem excluiu a conta (§7.5). */
export function anonymizeGateStaffUseCase(uid: string): Promise<number> {
  return getGateStaffService().anonymizeStaff(uid);
}
