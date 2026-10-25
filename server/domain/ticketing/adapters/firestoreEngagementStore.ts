import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  EventPromoCodePersistenceMapper,
  EventWaitlistPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import type { EventPromoCode, EventWaitlistEntry } from '../types/ticketingTypes';

/** Cupons e lista de espera. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreEngagementStore {
  async createPromoCode(
    input: Omit<EventPromoCode, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>
  ): Promise<EventPromoCode> {
    const nowIso = new Date().toISOString();
    const ref = adminDb.collection('eventPromoCodes').doc();
    const doc: Record<string, unknown> = {
      ...input,
      code: input.code.trim().toUpperCase(),
      usedCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await ref.set(doc);
    return EventPromoCodePersistenceMapper.toDomain(ref.id, doc);
  }

  async getPromoCodeByCode(eventListingId: string, code: string): Promise<EventPromoCode | null> {
    const normalized = code.trim().toUpperCase();
    const snap = await adminDb
      .collection('eventPromoCodes')
      .where('eventListingId', '==', eventListingId)
      .where('code', '==', normalized)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    if (!doc) return null;
    return EventPromoCodePersistenceMapper.toDomain(
      doc.id,
      (doc.data() || {}) as Record<string, unknown>
    );
  }

  async createWaitlistEntry(
    input: Omit<EventWaitlistEntry, 'id' | 'status' | 'createdAt'>
  ): Promise<EventWaitlistEntry> {
    const nowIso = new Date().toISOString();
    const ref = adminDb.collection('eventWaitlistEntries').doc();
    const doc: Record<string, unknown> = {
      ...input,
      status: 'waiting',
      createdAt: nowIso,
    };
    await ref.set(doc);
    return EventWaitlistPersistenceMapper.toDomain(ref.id, doc);
  }

  async listWaitlistByOccurrenceId(occurrenceId: string): Promise<EventWaitlistEntry[]> {
    const snap = await adminDb
      .collection('eventWaitlistEntries')
      .where('occurrenceId', '==', occurrenceId)
      .get();
    return snap.docs.map((doc) =>
      EventWaitlistPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }
}
