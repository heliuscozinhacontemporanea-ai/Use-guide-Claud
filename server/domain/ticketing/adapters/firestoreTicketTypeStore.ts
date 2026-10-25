import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { TicketTypePersistenceMapper } from '../dtos/ticketingPersistenceMappers';
import type { TicketType } from '../types/ticketingTypes';

/** Lotes de ingresso. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreTicketTypeStore {
  async createTicketType(
    input: Omit<TicketType, 'id' | 'soldCount' | 'reservedCount' | 'createdAt' | 'updatedAt'>
  ): Promise<TicketType> {
    const nowIso = new Date().toISOString();
    const ref = adminDb.collection('ticketTypes').doc();
    const payload: Record<string, unknown> = {
      ...input,
      soldCount: 0,
      reservedCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await ref.set(payload);
    return TicketTypePersistenceMapper.toDomain(ref.id, payload);
  }

  async getTicketTypeById(id: string): Promise<TicketType | null> {
    const snap = await adminDb.collection('ticketTypes').doc(id).get();
    if (!snap.exists) return null;
    return TicketTypePersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async listTicketTypesByOccurrenceId(occurrenceId: string): Promise<TicketType[]> {
    const snap = await adminDb
      .collection('ticketTypes')
      .where('occurrenceId', '==', occurrenceId)
      .get();
    return snap.docs
      .map((doc) =>
        TicketTypePersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async updateTicketType(id: string, patch: Partial<TicketType>): Promise<TicketType> {
    const ref = adminDb.collection('ticketTypes').doc(id);
    const updatePayload: Record<string, unknown> = {
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload.id;
    delete updatePayload.soldCount;
    delete updatePayload.reservedCount;
    await ref.update(updatePayload);
    const updatedSnap = await ref.get();
    return TicketTypePersistenceMapper.toDomain(
      updatedSnap.id,
      (updatedSnap.data() || {}) as Record<string, unknown>
    );
  }

  async deleteTicketType(id: string): Promise<void> {
    await adminDb.collection('ticketTypes').doc(id).delete();
  }
}
