import { describe, expect, it, vi } from 'vitest';

type Listener = (records: Array<Record<string, unknown>>) => void;
const listeners = vi.hoisted(() => new Map<string, Listener>());
vi.mock('../../database', () => ({
  subscribeToCollectionUseCase: (name: string, onData: Listener) => {
    listeners.set(name, onData);
    return () => listeners.delete(name);
  },
}));

import { FirebaseGuideCatalogAdapter } from './firebaseGuideCatalogAdapter';

describe('catálogo do guia: primeira entrega', () => {
  it('só avisa depois que itens e eventos chegaram, para o link direto de evento abrir', () => {
    const onUpdate = vi.fn();
    new FirebaseGuideCatalogAdapter().subscribe(onUpdate, vi.fn());
    listeners.get('featuredListings')?.([]);
    listeners.get('items')?.([{ id: 'i1', name: 'Buggy', category: 'tour', isActive: true }]);
    expect(onUpdate).not.toHaveBeenCalled();
    const date = new Date(Date.now() + 86_400_000).toISOString();
    listeners.get('events')?.([{ id: 'e1', name: 'Luau', date, isActive: true }]);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0]?.[0]).toMatchObject({
      items: [{ id: 'i1' }],
      events: [{ id: 'e1', category: 'event' }],
    });
    listeners.get('items')?.([]);
    expect(onUpdate).toHaveBeenCalledTimes(2);
  });
});
