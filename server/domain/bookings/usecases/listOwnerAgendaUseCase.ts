import { getOwnerAgendaService } from '../factory';
import type { OwnerOpenAbsence, OwnerSlotSummary } from '../services/ownerAgendaService';
import type { BookingActor } from '../types/bookingTypes';

export function listOwnerAgendaUseCase(
  actor: BookingActor,
  fromIso: string,
  toIso: string
): Promise<{ slots: OwnerSlotSummary[]; openAbsences: OwnerOpenAbsence[] }> {
  return getOwnerAgendaService().listOwnerAgenda(actor, fromIso, toIso);
}
