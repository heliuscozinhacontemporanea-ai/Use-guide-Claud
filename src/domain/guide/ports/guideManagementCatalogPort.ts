import { GuideItem } from '../types/guide';

export interface GuideManagementCatalogSnapshot {
  items: GuideItem[];
  events: GuideItem[];
}

export interface GuideManagementCatalogPort {
  subscribe(
    ownerId: string | undefined,
    onUpdate: (snapshot: GuideManagementCatalogSnapshot) => void,
    onError: (error: Error) => void
  ): () => void;
}
