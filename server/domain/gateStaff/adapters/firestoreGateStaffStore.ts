import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { GateStaffError } from '../errors/gateStaffError';
import type { GateStaffStorePort } from '../ports/gateStaffStorePort';
import type { GateScope, GateStaffMember, GateStaffStatus } from '../types/gateStaffTypes';

// Coleção só do backend (rules `if false` pela regra geral); dono e equipe leem pela API (§6.2).
const STAFF = 'gateStaff';
const STATUSES: GateStaffStatus[] = ['invited', 'active', 'declined', 'removed', 'left'];

function str(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

function toMember(id: string, raw: Record<string, unknown>): GateStaffMember {
  const staff = (raw.staff ?? {}) as Record<string, unknown>;
  return {
    id,
    scope: { type: raw.scopeType === 'place' ? 'place' : 'event', id: String(raw.scopeId ?? '') },
    ownerId: String(raw.ownerId ?? ''),
    staffUid: String(raw.staffUid ?? ''),
    staff: { username: str(staff.username), displayName: str(staff.displayName) },
    status: STATUSES.find((status) => status === raw.status) ?? 'invited',
    createdAt: String(raw.createdAt ?? ''),
    acceptedAt: str(raw.acceptedAt),
    endedAt: str(raw.endedAt),
  };
}

function toDoc(member: Omit<GateStaffMember, 'id'>) {
  const { scope, ...rest } = member;
  return { ...rest, scopeType: scope.type, scopeId: scope.id };
}

/** Equipe da portaria em Firestore (C1). As consultas usam só igualdades, sem índice composto. */
export class FirestoreGateStaffStore implements GateStaffStorePort {
  private scoped(scope: GateScope) {
    return adminDb
      .collection(STAFF)
      .where('scopeType', '==', scope.type)
      .where('scopeId', '==', scope.id);
  }

  invite(input: Omit<GateStaffMember, 'id'>, limit: number): Promise<GateStaffMember> {
    return adminDb.runTransaction(async (tx) => {
      const current = (await tx.get(this.scoped(input.scope))).docs
        .map((doc) => toMember(doc.id, doc.data()))
        .filter((member) => member.status === 'invited' || member.status === 'active');
      if (current.some((member) => member.staffUid === input.staffUid)) {
        throw new GateStaffError(
          'GATE_STAFF_ALREADY_INVITED',
          'Esta pessoa já está na equipe ou foi convidada.'
        );
      }
      if (current.length >= limit) {
        throw new GateStaffError('GATE_STAFF_LIMIT', 'A equipe já está no limite de pessoas.');
      }
      const ref = adminDb.collection(STAFF).doc();
      tx.set(ref, toDoc(input));
      return { id: ref.id, ...input };
    });
  }

  async get(id: string): Promise<GateStaffMember | null> {
    const snap = await adminDb.collection(STAFF).doc(id).get();
    return snap.exists ? toMember(snap.id, snap.data() ?? {}) : null;
  }

  transition(
    id: string,
    from: GateStaffStatus[],
    patch: Partial<Pick<GateStaffMember, 'status' | 'acceptedAt' | 'endedAt'>>
  ): Promise<GateStaffMember> {
    return adminDb.runTransaction(async (tx) => {
      const ref = adminDb.collection(STAFF).doc(id);
      const snap = await tx.get(ref);
      if (!snap.exists) {
        throw new GateStaffError('GATE_STAFF_NOT_FOUND', 'Convite não encontrado.');
      }
      const current = toMember(snap.id, snap.data() ?? {});
      if (!from.includes(current.status)) {
        throw new GateStaffError(
          'GATE_STAFF_WRONG_STATUS',
          'Este convite já foi respondido ou encerrado.'
        );
      }
      tx.update(ref, patch);
      return { ...current, ...patch };
    });
  }

  async listByOwner(ownerId: string): Promise<GateStaffMember[]> {
    const snap = await adminDb.collection(STAFF).where('ownerId', '==', ownerId).get();
    return snap.docs.map((doc) => toMember(doc.id, doc.data()));
  }

  async listByStaff(staffUid: string): Promise<GateStaffMember[]> {
    const snap = await adminDb.collection(STAFF).where('staffUid', '==', staffUid).get();
    return snap.docs.map((doc) => toMember(doc.id, doc.data()));
  }

  async findInScope(scope: GateScope, staffUid: string): Promise<GateStaffMember[]> {
    const snap = await this.scoped(scope).where('staffUid', '==', staffUid).get();
    return snap.docs.map((doc) => toMember(doc.id, doc.data()));
  }

  async anonymizeStaff(uid: string): Promise<number> {
    const snap = await adminDb.collection(STAFF).where('staffUid', '==', uid).get();
    if (snap.empty) return 0;
    const batch = adminDb.batch();
    for (const doc of snap.docs) {
      batch.update(doc.ref, { 'staff.username': null, 'staff.displayName': null });
    }
    await batch.commit();
    return snap.size;
  }
}
