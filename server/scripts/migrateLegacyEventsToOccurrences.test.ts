import { describe, expect, it, vi } from 'vitest';

vi.mock('../infrastructure/firebase/adminClient', () => ({
  adminDb: {},
}));

import {
  migrateLegacyEventsToOccurrences,
  type LegacyEventsMigrationStore,
} from './migrateLegacyEventsToOccurrences';

describe('migrateLegacyEventsToOccurrences', () => {
  it('cria occurrence apenas para eventos legados sem occurrence existente e é idempotente em reexecuções', async () => {
    const existingOccurrences = new Set<string>(['event-already-migrated']);
    let seq = 1;

    const store: LegacyEventsMigrationStore = {
      listEventDocs: vi.fn(async () => [
        {
          id: 'event-legacy-1',
          data: {
            name: 'Luau Jeri',
            date: '2026-12-10T20:00:00.000Z',
            endDate: '2026-12-11T02:00:00.000Z',
          },
        },
        {
          id: 'event-already-migrated',
          data: {
            name: 'Jazz na Praia',
            date: '2026-12-15T19:00:00.000Z',
            endDate: '2026-12-15T23:00:00.000Z',
          },
        },
        {
          id: 'event-without-date',
          data: {
            name: 'Rascunho',
          },
        },
      ]),
      hasOccurrenceForListing: vi.fn(async (eventListingId: string) =>
        existingOccurrences.has(eventListingId)
      ),
      createOccurrenceAndMarkDeprecated: vi.fn(async ({ eventListingId }) => {
        existingOccurrences.add(eventListingId);
        return `occ-${seq++}`;
      }),
    };

    const firstRun = await migrateLegacyEventsToOccurrences({}, store);
    expect(firstRun.scannedEvents).toBe(3);
    expect(firstRun.migratedOccurrences).toBe(1);
    expect(firstRun.skippedAlreadyMigrated).toBe(1);
    expect(firstRun.skippedMissingDates).toBe(1);
    expect(firstRun.createdOccurrenceIds).toEqual(['occ-1']);

    const secondRun = await migrateLegacyEventsToOccurrences({}, store);
    expect(secondRun.migratedOccurrences).toBe(0);
    expect(secondRun.skippedAlreadyMigrated).toBe(2);
    expect(secondRun.createdOccurrenceIds).toEqual([]);
  });
});
