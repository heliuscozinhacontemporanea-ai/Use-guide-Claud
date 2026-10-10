import { describe, expect, it, vi } from 'vitest';
import * as databaseDomain from '../../database';
import { FirebaseGuideManagementCatalogAdapter } from './firebaseGuideManagementCatalogAdapter';

describe('FirebaseGuideManagementCatalogAdapter', () => {
  it('filtra por ownerId quando proprietário é informado', () => {
    const unsubscribeItems = vi.fn();
    const unsubscribeEvents = vi.fn();
    vi.spyOn(databaseDomain, 'subscribeToCollectionUseCase').mockImplementation(
      (collectionName, _onUpdate, _onError, whereClauses) => {
        expect(whereClauses).toEqual([
          {
            field: 'ownerId',
            op: '==',
            value: 'partner-1',
          },
        ]);
        if (collectionName === 'items') {
          return unsubscribeItems;
        }
        if (collectionName === 'events') {
          return unsubscribeEvents;
        }
        return vi.fn();
      }
    );
    const adapter = new FirebaseGuideManagementCatalogAdapter();
    const unsubscribe = adapter.subscribe('partner-1', vi.fn(), vi.fn());
    unsubscribe();
    expect(unsubscribeItems).toHaveBeenCalledTimes(1);
    expect(unsubscribeEvents).toHaveBeenCalledTimes(1);
  });

  it('não aplica filtro de owner para administrador', () => {
    vi.spyOn(databaseDomain, 'subscribeToCollectionUseCase').mockImplementation(
      (_collectionName, _onUpdate, _onError, whereClauses) => {
        expect(whereClauses).toBeUndefined();
        return vi.fn();
      }
    );
    const adapter = new FirebaseGuideManagementCatalogAdapter();
    const unsubscribe = adapter.subscribe(undefined, vi.fn(), vi.fn());
    unsubscribe();
  });
});
