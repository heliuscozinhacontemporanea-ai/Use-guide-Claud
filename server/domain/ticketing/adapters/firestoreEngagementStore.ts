import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { EventWaitlistPersistenceMapper } from '../dtos/ticketingPersistenceMappers';
import type { EventWaitlistEntry } from '../types/ticketingTypes';

/** Lista de espera. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreEngagementStore {
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
