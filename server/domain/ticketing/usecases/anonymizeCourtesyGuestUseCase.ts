import { courtesyService } from '../factory';

/** Exclusão de conta: tira @ e nome da pessoa das listas de convidados (§7.5). */
export function anonymizeCourtesyGuestUseCase(uid: string): Promise<number> {
  return courtesyService.anonymizeGuest(uid);
}
