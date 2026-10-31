import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  EventCheckInPersistenceMapper,
  OfflineCheckInSessionPersistenceMapper,
  TicketPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import { TicketAlreadyCheckedInError, TicketingDomainError } from '../errors/ticketingDomainError';
import type {
  EventCheckIn,
  OfflineCheckInEvent,
  OfflineCheckInSession,
  OfflineCheckInSyncResultItem,
  Ticket,
} from '../types/ticketingTypes';
import { hashTicketIdForOfflineManifest } from '../utils/offlineManifest';

/** Check-in online e offline. Coleções só de backend; o cliente lê pela API (§6.2). */
const CODE_FAILURES = 'ticketCheckInCodeFailures';

export class FirestoreCheckInStore {
  async checkInTicketAtomic(params: {
    ticketId: string;
    occurrenceId: string;
    checkedInBy: string;
    source?: 'online' | 'offline';
    offlineSessionId?: string;
    stationId?: string;
    clientEventId?: string;
  }): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
    return adminDb.runTransaction(async (tx) => {
      const ticketRef = adminDb.collection('tickets').doc(params.ticketId);
      const ticketSnap = await tx.get(ticketRef);
      if (!ticketSnap.exists) {
        throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
      }
      const ticket = TicketPersistenceMapper.toDomain(
        ticketSnap.id,
        (ticketSnap.data() || {}) as Record<string, unknown>
      );

      if (ticket.occurrenceId !== params.occurrenceId) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Este ingresso pertence a outra sessão/ocorrência do evento.'
        );
      }

      if (ticket.status === 'checked_in') {
        throw new TicketAlreadyCheckedInError();
      }

      if (ticket.status !== 'issued') {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          `Ingresso inválido para entrada (status atual: ${ticket.status}).`
        );
      }

      const checkInId = `${params.ticketId}_${params.occurrenceId}`;
      const checkInRef = adminDb.collection('eventCheckIns').doc(checkInId);
      const existingCheckInSnap = await tx.get(checkInRef);
      if (existingCheckInSnap.exists) {
        throw new TicketAlreadyCheckedInError();
      }

      const nowIso = new Date().toISOString();
      const source = params.source || 'online';
      const checkInDoc: Record<string, unknown> = {
        ticketId: params.ticketId,
        occurrenceId: params.occurrenceId,
        eventListingId: ticket.eventListingId,
        checkedInBy: params.checkedInBy,
        source,
        ...(params.offlineSessionId ? { offlineSessionId: params.offlineSessionId } : {}),
        ...(params.stationId ? { stationId: params.stationId } : {}),
        ...(params.clientEventId ? { clientEventId: params.clientEventId } : {}),
        checkedInAt: nowIso,
        ...(source === 'offline' ? { syncedAt: nowIso } : {}),
      };
      tx.set(checkInRef, checkInDoc);
      tx.update(ticketRef, {
        status: 'checked_in',
        checkedInAt: nowIso,
        checkedInBy: params.checkedInBy,
      });

      return {
        ticket: {
          ...ticket,
          status: 'checked_in',
          checkedInAt: nowIso,
          checkedInBy: params.checkedInBy,
        },
        checkIn: EventCheckInPersistenceMapper.toDomain(checkInRef.id, checkInDoc),
      };
    });
  }

  async countCheckInCodeFailures(
    occurrenceId: string,
    sinceIso: string,
    actorUid?: string
  ): Promise<number> {
    let query = adminDb.collection(CODE_FAILURES).where('occurrenceId', '==', occurrenceId);
    if (actorUid) query = query.where('actorUid', '==', actorUid);
    const snapshot = await query.where('at', '>=', sinceIso).count().get();
    return snapshot.data().count;
  }

  async addCheckInCodeFailure(
    occurrenceId: string,
    actorUid: string,
    atIso: string
  ): Promise<void> {
    // Só a sessão, quem digitou e quando: nunca o código digitado (AGENTS.md §10.3).
    await adminDb.collection(CODE_FAILURES).add({ occurrenceId, actorUid, at: atIso });
  }

  async listCheckInsByOccurrenceId(occurrenceId: string): Promise<EventCheckIn[]> {
    const snap = await adminDb
      .collection('eventCheckIns')
      .where('occurrenceId', '==', occurrenceId)
      .get();
    return snap.docs.map((doc) =>
      EventCheckInPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async listCheckInsByEventListingId(eventListingId: string): Promise<EventCheckIn[]> {
    const snap = await adminDb
      .collection('eventCheckIns')
      .where('eventListingId', '==', eventListingId)
      .get();
    return snap.docs.map((doc) =>
      EventCheckInPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async createOfflineCheckInSession(
    session: Omit<OfflineCheckInSession, 'id'>
  ): Promise<OfflineCheckInSession> {
    const ref = adminDb.collection('offlineCheckInSessions').doc();
    const payload: Record<string, unknown> = {
      ...session,
    };
    await ref.set(payload);
    return OfflineCheckInSessionPersistenceMapper.toDomain(ref.id, payload);
  }

  async getOfflineCheckInSessionById(sessionId: string): Promise<OfflineCheckInSession | null> {
    const snap = await adminDb.collection('offlineCheckInSessions').doc(sessionId).get();
    if (!snap.exists) return null;
    return OfflineCheckInSessionPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async syncOfflineCheckInsAtomic(params: {
    session: OfflineCheckInSession;
    checkedInBy: string;
    events: OfflineCheckInEvent[];
  }): Promise<OfflineCheckInSyncResultItem[]> {
    const results: OfflineCheckInSyncResultItem[] = [];
    const nowIso = new Date().toISOString();

    for (const ev of params.events) {
      const outcome = await adminDb.runTransaction(
        async (tx): Promise<OfflineCheckInSyncResultItem['status']> => {
          if (ev.occurrenceId !== params.session.occurrenceId) {
            return 'wrong_occurrence';
          }

          const expectedHash = hashTicketIdForOfflineManifest(ev.ticketId);
          if (ev.ticketIdHash !== expectedHash) {
            return 'invalid';
          }

          const ticketRef = adminDb.collection('tickets').doc(ev.ticketId);
          const ticketSnap = await tx.get(ticketRef);
          if (!ticketSnap.exists) {
            return 'invalid';
          }
          const ticket = TicketPersistenceMapper.toDomain(
            ticketSnap.id,
            (ticketSnap.data() || {}) as Record<string, unknown>
          );

          if (ticket.occurrenceId !== params.session.occurrenceId) {
            return 'wrong_occurrence';
          }

          if (ticket.qrVersion !== ev.qrVersion) {
            return 'invalid';
          }

          const checkInId = `${ev.ticketId}_${params.session.occurrenceId}`;
          const checkInRef = adminDb.collection('eventCheckIns').doc(checkInId);
          const existingCheckInSnap = await tx.get(checkInRef);

          if (existingCheckInSnap.exists || ticket.status === 'checked_in') {
            const existingData = existingCheckInSnap.data() as Record<string, unknown> | undefined;
            if (existingData && existingData.clientEventId === ev.clientEventId) {
              return 'accepted';
            }
            return 'already_checked_in';
          }

          if (ticket.status !== 'issued') {
            return 'invalid';
          }

          const checkInDoc: Record<string, unknown> = {
            ticketId: ev.ticketId,
            occurrenceId: params.session.occurrenceId,
            eventListingId: params.session.eventListingId,
            checkedInBy: params.checkedInBy,
            source: 'offline',
            offlineSessionId: params.session.id,
            stationId: params.session.stationId,
            clientEventId: ev.clientEventId,
            checkedInAt: ev.scannedAt || nowIso,
            syncedAt: nowIso,
          };

          tx.set(checkInRef, checkInDoc);
          tx.update(ticketRef, {
            status: 'checked_in',
            checkedInAt: ev.scannedAt || nowIso,
            checkedInBy: params.checkedInBy,
          });

          return 'accepted';
        }
      );

      results.push({
        clientEventId: ev.clientEventId,
        status: outcome,
      });
    }

    return results;
  }
}
