import { adminDb } from '../infrastructure/firebase/adminClient';

export interface LegacyEventMigrationOptions {
  dryRun?: boolean;
  defaultCapacity?: number;
}

export interface LegacyEventMigrationReport {
  scannedEvents: number;
  migratedOccurrences: number;
  skippedAlreadyMigrated: number;
  skippedMissingDates: number;
  createdOccurrenceIds: string[];
}

export interface LegacyEventsMigrationStore {
  listEventDocs(): Promise<Array<{ id: string; data: Record<string, unknown> }>>;
  hasOccurrenceForListing(eventListingId: string): Promise<boolean>;
  createOccurrenceAndMarkDeprecated(params: {
    eventListingId: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
  }): Promise<string>;
}

const firestoreMigrationStore: LegacyEventsMigrationStore = {
  async listEventDocs() {
    const snap = await adminDb.collection('events').get();
    return snap.docs.map((doc) => ({
      id: doc.id,
      data: (doc.data() || {}) as Record<string, unknown>,
    }));
  },
  async hasOccurrenceForListing(eventListingId: string) {
    const snap = await adminDb
      .collection('eventOccurrences')
      .where('eventListingId', '==', eventListingId)
      .limit(1)
      .get();
    return !snap.empty;
  },
  async createOccurrenceAndMarkDeprecated(params) {
    const nowIso = new Date().toISOString();
    const occRef = adminDb.collection('eventOccurrences').doc();
    const eventRef = adminDb.collection('events').doc(params.eventListingId);

    const batch = adminDb.batch();
    batch.set(occRef, {
      eventListingId: params.eventListingId,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      status: 'scheduled',
      capacity: params.capacity,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    batch.update(eventRef, {
      legacyDateFieldsDeprecated: true,
      migratedToOccurrencesAt: nowIso,
    });
    await batch.commit();
    return occRef.id;
  },
};

/**
 * Migra eventos legados que possuem date/endDate para eventOccurrences de forma idempotente.
 */
export async function migrateLegacyEventsToOccurrences(
  options: LegacyEventMigrationOptions = {},
  store: LegacyEventsMigrationStore = firestoreMigrationStore
): Promise<LegacyEventMigrationReport> {
  const dryRun = options.dryRun === true;
  const defaultCapacity = options.defaultCapacity ?? 100;

  const events = await store.listEventDocs();
  const report: LegacyEventMigrationReport = {
    scannedEvents: events.length,
    migratedOccurrences: 0,
    skippedAlreadyMigrated: 0,
    skippedMissingDates: 0,
    createdOccurrenceIds: [],
  };

  for (const eventDoc of events) {
    const rawDate = typeof eventDoc.data.date === 'string' ? eventDoc.data.date.trim() : '';
    const rawEndDate =
      typeof eventDoc.data.endDate === 'string' ? eventDoc.data.endDate.trim() : '';

    if (!rawDate) {
      report.skippedMissingDates += 1;
      continue;
    }

    const alreadyHasOccurrence = await store.hasOccurrenceForListing(eventDoc.id);
    if (alreadyHasOccurrence) {
      report.skippedAlreadyMigrated += 1;
      continue;
    }

    const startMs = new Date(rawDate).getTime();
    const endMs = rawEndDate ? new Date(rawEndDate).getTime() : NaN;
    const effectiveEndsAt =
      Number.isFinite(endMs) && endMs > startMs
        ? rawEndDate
        : new Date((Number.isFinite(startMs) ? startMs : Date.now()) + 3 * 3600 * 1000).toISOString();

    if (dryRun) {
      report.migratedOccurrences += 1;
      continue;
    }

    const createdId = await store.createOccurrenceAndMarkDeprecated({
      eventListingId: eventDoc.id,
      startsAt: rawDate,
      endsAt: effectiveEndsAt,
      capacity: defaultCapacity,
    });
    report.migratedOccurrences += 1;
    report.createdOccurrenceIds.push(createdId);
  }

  return report;
}
