import { courtesyAdapter } from '../../factory';

export function listEventCourtesiesUseCase(eventListingId: string) {
  return courtesyAdapter.listEventCourtesies(eventListingId);
}
