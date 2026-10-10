import { subscribeToCollectionUseCase } from '../../database';
import {
  GuideManagementCatalogPort,
  GuideManagementCatalogSnapshot,
} from '../ports/guideManagementCatalogPort';
import { GuideItem } from '../types/guide';
import { mapGuideItem } from './firebaseGuideCatalogAdapter';

export class FirebaseGuideManagementCatalogAdapter implements GuideManagementCatalogPort {
  subscribe(
    ownerId: string | undefined,
    onUpdate: (snapshot: GuideManagementCatalogSnapshot) => void,
    onError: (error: Error) => void
  ): () => void {
    let items: GuideItem[] = [];
    let events: GuideItem[] = [];

    const emit = () => {
      onUpdate({
        items,
        events,
      });
    };

    const whereClauses = ownerId
      ? [
          {
            field: 'ownerId',
            op: '==' as const,
            value: ownerId,
          },
        ]
      : undefined;

    const unsubscribeItems = subscribeToCollectionUseCase(
      'items',
      (records) => {
        items = records.map(mapGuideItem);
        emit();
      },
      onError,
      whereClauses
    );

    const unsubscribeEvents = subscribeToCollectionUseCase(
      'events',
      (records) => {
        events = records.map((record) =>
          mapGuideItem({
            ...record,
            category: 'event',
          })
        );
        emit();
      },
      onError,
      whereClauses
    );

    return () => {
      unsubscribeItems();
      unsubscribeEvents();
    };
  }
}
