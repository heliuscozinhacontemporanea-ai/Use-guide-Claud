import { eventsService } from '../factory';

export async function deleteEventsByOwnerUseCase(ownerId: string): Promise<void> {
  return eventsService.deleteListingsByOwner(ownerId);
}
