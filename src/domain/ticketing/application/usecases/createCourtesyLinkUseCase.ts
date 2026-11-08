import { courtesyAdapter } from '../../factory';

export function createCourtesyLinkUseCase(occurrenceId: string) {
  return courtesyAdapter.createCourtesyLink(occurrenceId);
}
