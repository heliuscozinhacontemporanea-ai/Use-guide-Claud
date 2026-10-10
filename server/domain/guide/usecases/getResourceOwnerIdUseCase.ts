import { guideService } from '../factory';

export async function getResourceOwnerIdUseCase(
  resourceType: 'items',
  resourceId: string
): Promise<string | null> {
  if (resourceType !== 'items') {
    return null;
  }
  const item = await guideService.getItemById(resourceId);
  return item?.ownerId ?? null;
}
