import { courtesyService } from '../factory';

/** Lugares da sessão ocupados por cortesias: o "vendidos" da tela não conta convidados. */
export function countOccurrenceCourtesiesUseCase(occurrenceId: string): Promise<number> {
  return courtesyService.countHeld(occurrenceId);
}
