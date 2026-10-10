import { guideService } from '../factory';

export async function deleteResourcesByOwnerUseCase(ownerId: string): Promise<void> {
  if (!ownerId || !ownerId.trim()) return;
  return guideService.deleteResourcesByOwner(ownerId);
}
