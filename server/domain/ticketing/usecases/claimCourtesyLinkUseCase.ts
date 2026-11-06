import { courtesyService } from '../factory';
import type { CourtesyRecipient } from '../services/courtesyService';
import type { EventCourtesy } from '../types/courtesyTypes';

/** Resgate do link de convite: a cortesia fica presa à conta de quem abriu (D27). */
export function claimCourtesyLinkUseCase(
  courtesyId: string,
  token: string,
  recipient: CourtesyRecipient
): Promise<EventCourtesy> {
  return courtesyService.claim(courtesyId, token, recipient);
}
