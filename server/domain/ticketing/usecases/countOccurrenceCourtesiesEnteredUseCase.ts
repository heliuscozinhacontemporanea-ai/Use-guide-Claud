import { courtesyService } from '../factory';

/** Convidados da sessão que já entraram (C7); quem chama já conferiu a posse do evento. */
export function countOccurrenceCourtesiesEnteredUseCase(occurrenceId: string): Promise<number> {
  return courtesyService.countEntered(occurrenceId);
}
