import crypto from 'crypto';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { PromoterError } from '../errors/promoterError';
import type { PromoterStorePort } from '../ports/promoterStorePort';
import {
  type EventPromoter,
  PROMOTER_CODE_LENGTH,
  type PromoterEarning,
  promoterCodeAlphabet,
} from '../types/promoterTypes';

// Coleção só do backend (rules `if false`); organizador e divulgador leem pela API (§6.2).
const PROMOTERS = 'eventPromoters';

function str(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

function toEarning(raw: unknown): PromoterEarning {
  const value = (raw ?? {}) as Record<string, unknown>;
  if (value.type === 'per_ticket' || value.type === 'flat_fee') {
    return { type: value.type, amountMinor: Math.trunc(Number(value.amountMinor ?? 0)) };
  }
  return { type: 'commission', basisPoints: Math.trunc(Number(value.basisPoints ?? 0)) };
}

function toPromoter(id: string, raw: Record<string, unknown>): EventPromoter {
  const promoter = (raw.promoter ?? {}) as Record<string, unknown>;
  const status = raw.status;
  return {
    id,
    eventListingId: String(raw.eventListingId ?? ''),
    ownerId: String(raw.ownerId ?? ''),
    promoterUid: String(raw.promoterUid ?? ''),
    promoter: { username: str(promoter.username), displayName: str(promoter.displayName) },
    code: String(raw.code ?? ''),
    earning: toEarning(raw.earning),
    status: status === 'active' || status === 'declined' || status === 'ended' ? status : 'invited',
    createdAt: String(raw.createdAt ?? ''),
    acceptedAt: str(raw.acceptedAt),
    declinedAt: str(raw.declinedAt),
    endedAt: str(raw.endedAt),
  };
}

// Não é segredo (vai no link público), só precisa ser único no evento.
function randomCode(): string {
  const alphabet = promoterCodeAlphabet();
  const bytes = crypto.randomBytes(PROMOTER_CODE_LENGTH);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

/** Divulgadores em Firestore (D27). */
export class FirestorePromoterStore implements PromoterStorePort {
  async invite(input: Omit<EventPromoter, 'id' | 'code'>): Promise<EventPromoter> {
    return adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(
        adminDb
          .collection(PROMOTERS)
          .where('eventListingId', '==', input.eventListingId)
          .where('promoterUid', '==', input.promoterUid)
      );
      if (existing.docs.some((doc) => ['invited', 'active'].includes(doc.data().status))) {
        throw new PromoterError(
          'PROMOTER_ALREADY_INVITED',
          'Esta pessoa já divulga ou foi convidada para este evento.'
        );
      }
      let code = randomCode();
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const taken = await tx.get(
          adminDb
            .collection(PROMOTERS)
            .where('eventListingId', '==', input.eventListingId)
            .where('code', '==', code)
            .limit(1)
        );
        if (taken.empty) break;
        code = randomCode();
      }
      const ref = adminDb.collection(PROMOTERS).doc();
      const doc = { ...input, code };
      tx.set(ref, doc);
      return toPromoter(ref.id, doc);
    });
  }

  async get(id: string): Promise<EventPromoter | null> {
    const snap = await adminDb.collection(PROMOTERS).doc(id).get();
    return snap.exists ? toPromoter(snap.id, snap.data() ?? {}) : null;
  }

  transition(
    id: string,
    from: EventPromoter['status'][],
    patch: Partial<Pick<EventPromoter, 'status' | 'acceptedAt' | 'declinedAt' | 'endedAt'>>
  ): Promise<EventPromoter> {
    return adminDb.runTransaction(async (tx) => {
      const ref = adminDb.collection(PROMOTERS).doc(id);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new PromoterError('PROMOTER_NOT_FOUND', 'Divulgador não encontrado.');
      const current = toPromoter(snap.id, snap.data() ?? {});
      if (!from.includes(current.status)) {
        throw new PromoterError(
          'PROMOTER_WRONG_STATUS',
          'Este convite já foi respondido ou encerrado.'
        );
      }
      tx.update(ref, patch);
      return { ...current, ...patch };
    });
  }

  async listByEvent(eventListingId: string): Promise<EventPromoter[]> {
    const snap = await adminDb
      .collection(PROMOTERS)
      .where('eventListingId', '==', eventListingId)
      .get();
    return snap.docs.map((doc) => toPromoter(doc.id, doc.data()));
  }

  async listByPromoter(promoterUid: string): Promise<EventPromoter[]> {
    const snap = await adminDb.collection(PROMOTERS).where('promoterUid', '==', promoterUid).get();
    return snap.docs.map((doc) => toPromoter(doc.id, doc.data()));
  }

  async findByCode(eventListingId: string, code: string): Promise<EventPromoter | null> {
    const snap = await adminDb
      .collection(PROMOTERS)
      .where('eventListingId', '==', eventListingId)
      .where('code', '==', code)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    return doc ? toPromoter(doc.id, doc.data()) : null;
  }

  async anonymizePromoter(uid: string): Promise<number> {
    const snap = await adminDb.collection(PROMOTERS).where('promoterUid', '==', uid).get();
    if (snap.empty) return 0;
    const batch = adminDb.batch();
    for (const doc of snap.docs) {
      batch.update(doc.ref, { 'promoter.username': null, 'promoter.displayName': null });
    }
    await batch.commit();
    return snap.size;
  }
}
