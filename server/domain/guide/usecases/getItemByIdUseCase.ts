import { guideService } from '../factory';

export interface PublicResourceDTO {
  id: string;
  ownerId?: string;
  name?: string;
  title?: string;
  category?: string;
  imageUrl?: string;
  coverImage?: string;
  [key: string]: unknown;
}

export async function getItemByIdUseCase(id: string): Promise<PublicResourceDTO | null> {
  const item = await guideService.getItemById(id);
  if (!item) return null;
  return item as unknown as PublicResourceDTO;
}
