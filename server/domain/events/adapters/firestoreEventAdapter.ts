import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  EventListingPersistenceMapper,
  EventOccurrencePersistenceMapper,
} from '../dtos/eventPersistenceMappers';
import { EventNotFoundError, OccurrenceNotFoundError } from '../errors/eventDomainError';
import type { EventsPort } from '../ports/eventsPort';
import type {
  CreateEventListingInput,
  CreateEventOccurrenceInput,
  EventAuditLog,
  EventListing,
  EventOccurrence,
  EventRatingSummary,
  UpdateEventListingInput,
  UpdateEventOccurrenceInput,
} from '../types/eventTypes';

export class FirestoreEventAdapter implements EventsPort {
  async createListing(input: CreateEventListingInput): Promise<EventListing> {
    const docRef = adminDb.collection('events').doc();
    const payload = EventListingPersistenceMapper.toPersistenceCreate(input);
    await docRef.set(payload);
    return EventListingPersistenceMapper.toDomain(docRef.id, payload);
  }

  async getListingById(id: string): Promise<EventListing | null> {
    const snap = await adminDb.collection('events').doc(id).get();
    if (!snap.exists) {
      return null;
    }
    return EventListingPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async listPublicListings(): Promise<EventListing[]> {
    const snap = await adminDb.collection('events').get();
    return snap.docs
      .map((doc) =>
        EventListingPersistenceMapper.toDomain(
          doc.id,
          (doc.data() || {}) as Record<string, unknown>
        )
      )
      .filter((item) => item.status === 'published' && item.visibility === 'public');
  }

  async listAllListings(): Promise<EventListing[]> {
    const snap = await adminDb.collection('events').get();
    return snap.docs.map((doc) =>
      EventListingPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async updateListing(id: string, input: UpdateEventListingInput): Promise<EventListing> {
    const docRef = adminDb.collection('events').doc(id);
    const current = await docRef.get();
    if (!current.exists) {
      throw new EventNotFoundError();
    }
    const patch = EventListingPersistenceMapper.toPersistenceUpdate(input);
    await docRef.update(patch);
    const updated = await docRef.get();
    return EventListingPersistenceMapper.toDomain(
      updated.id,
      (updated.data() || {}) as Record<string, unknown>
    );
  }

  async deleteListing(id: string): Promise<void> {
    await adminDb.collection('events').doc(id).delete();
  }

  async updateRatingSummary(id: string, summary: EventRatingSummary): Promise<void> {
    const docRef = adminDb.collection('events').doc(id);
    await docRef.update({
      ratingSummary: {
        average: summary.average,
        count: summary.count,
      },
      rating: summary.average,
      reviewCount: summary.count,
      updatedAt: new Date().toISOString(),
    });
  }

  async updateVerificationByEstablishment(
    establishmentId: string,
    verification: {
      isVerified: boolean;
      verifiedUntil: string | null;
      verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
      isVerificationSuspended: boolean;
    }
  ): Promise<void> {
    const eventsSnapshot = await adminDb
      .collection('events')
      .where('establishmentId', '==', establishmentId)
      .get();
    if (eventsSnapshot.empty) {
      return;
    }
    const batch = adminDb.batch();
    eventsSnapshot.forEach((doc) => {
      batch.update(doc.ref, verification);
    });
    await batch.commit();
  }

  async deleteListingsByOwner(ownerId: string): Promise<void> {
    const eventsSnapshot = await adminDb.collection('events').where('ownerId', '==', ownerId).get();
    if (eventsSnapshot.empty) {
      return;
    }
    const batch = adminDb.batch();
    eventsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  async createOccurrence(input: CreateEventOccurrenceInput): Promise<EventOccurrence> {
    const docRef = adminDb.collection('eventOccurrences').doc();
    const payload = EventOccurrencePersistenceMapper.toPersistenceCreate(input);
    await docRef.set(payload);
    return EventOccurrencePersistenceMapper.toDomain(docRef.id, payload);
  }

  async getOccurrenceById(occurrenceId: string): Promise<EventOccurrence | null> {
    const snap = await adminDb.collection('eventOccurrences').doc(occurrenceId).get();
    if (!snap.exists) {
      return null;
    }
    return EventOccurrencePersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async listOccurrencesByListingId(eventListingId: string): Promise<EventOccurrence[]> {
    const snap = await adminDb
      .collection('eventOccurrences')
      .where('eventListingId', '==', eventListingId)
      .get();

    return snap.docs
      .map((doc) =>
        EventOccurrencePersistenceMapper.toDomain(
          doc.id,
          (doc.data() || {}) as Record<string, unknown>
        )
      )
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }

  async updateOccurrence(
    occurrenceId: string,
    input: UpdateEventOccurrenceInput
  ): Promise<EventOccurrence> {
    const docRef = adminDb.collection('eventOccurrences').doc(occurrenceId);
    const current = await docRef.get();
    if (!current.exists) {
      throw new OccurrenceNotFoundError();
    }
    const patch: Record<string, unknown> = {
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await docRef.update(patch);
    const updated = await docRef.get();
    return EventOccurrencePersistenceMapper.toDomain(
      updated.id,
      (updated.data() || {}) as Record<string, unknown>
    );
  }

  async deleteOccurrence(occurrenceId: string): Promise<void> {
    await adminDb.collection('eventOccurrences').doc(occurrenceId).delete();
  }

  async createAuditLog(entry: Omit<EventAuditLog, 'id' | 'createdAt'>): Promise<EventAuditLog> {
    const docRef = adminDb.collection('eventAuditLogs').doc();
    const nowIso = new Date().toISOString();
    const record: EventAuditLog = {
      ...entry,
      id: docRef.id,
      createdAt: nowIso,
    };
    await docRef.set(record);
    return record;
  }
}
