import type { Transaction } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { FleetDayChange } from '../ports/bookingsPort';
import type { FleetDay, FleetHold } from '../types/fleetTypes';
import { resizeFleetDay } from '../utils/fleetLedger';
import { FLEET_DAYS, nowIso } from './firestoreBookingsShared';

type Data = Record<string, unknown>;

function holdsOf(value: unknown): FleetHold[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((hold) =>
    hold &&
    typeof hold.bookingId === 'string' &&
    typeof hold.startsAt === 'string' &&
    typeof hold.endsAt === 'string' &&
    typeof hold.units === 'number'
      ? [
          {
            bookingId: hold.bookingId,
            startsAt: hold.startsAt,
            endsAt: hold.endsAt,
            units: hold.units,
          },
        ]
      : []
  );
}

export const FleetDayMapper = {
  toDomain(id: string, data: Data): FleetDay {
    const index = data.slotIndex && typeof data.slotIndex === 'object' ? data.slotIndex : {};
    return {
      id,
      offerId: String(data.offerId ?? ''),
      date: String(data.date ?? ''),
      vehicles: typeof data.vehicles === 'number' ? Math.trunc(data.vehicles) : 0,
      ...(typeof data.opensAt === 'string' ? { opensAt: data.opensAt } : {}),
      ...(typeof data.closesAt === 'string' ? { closesAt: data.closesAt } : {}),
      holds: holdsOf(data.holds),
      slotIndex: Object.fromEntries(
        Object.entries(index as Data).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string'
        )
      ),
      createdAt: String(data.createdAt ?? ''),
      updatedAt: String(data.updatedAt ?? ''),
    };
  },
  toPersistence(day: FleetDay): Data {
    const { id: _id, ...rest } = day;
    return JSON.parse(JSON.stringify(rest)) as Data;
  },
};

export async function readFleetDay(tx: Transaction, dayId: string): Promise<FleetDay | null> {
  const snapshot = await tx.get(adminDb.collection(FLEET_DAYS).doc(dayId));
  return snapshot.exists ? FleetDayMapper.toDomain(snapshot.id, snapshot.data() ?? {}) : null;
}

export function writeFleetDay(tx: Transaction, day: FleetDay): void {
  tx.set(adminDb.collection(FLEET_DAYS).doc(day.id), FleetDayMapper.toPersistence(day));
}

/** Dias abertos das ofertas por veículo (`fleetDays`, Interna, só backend; F3b). */
export class FirestoreFleetStore {
  async saveFleetDays(changes: FleetDayChange[]): Promise<FleetDay[]> {
    if (changes.length === 0) return [];
    const refs = changes.map((change) => adminDb.collection(FLEET_DAYS).doc(change.id));
    return adminDb.runTransaction(async (tx) => {
      const snapshots = await tx.getAll(...refs);
      const now = nowIso();
      return changes.map((change, index) => {
        const snapshot = snapshots[index];
        const current = snapshot?.exists
          ? FleetDayMapper.toDomain(snapshot.id, snapshot.data() ?? {})
          : null;
        const window = {
          ...(change.opensAt ? { opensAt: change.opensAt } : {}),
          ...(change.closesAt ? { closesAt: change.closesAt } : {}),
        };
        const day: FleetDay = current
          ? { ...resizeFleetDay(current, change.vehicles, now), ...window }
          : {
              id: change.id,
              offerId: change.offerId,
              date: change.date,
              vehicles: change.vehicles,
              ...window,
              holds: [],
              slotIndex: {},
              createdAt: now,
              updatedAt: now,
            };
        writeFleetDay(tx, day);
        return day;
      });
    });
  }

  async getFleetDay(dayId: string): Promise<FleetDay | null> {
    const snapshot = await adminDb.collection(FLEET_DAYS).doc(dayId).get();
    return snapshot.exists ? FleetDayMapper.toDomain(snapshot.id, snapshot.data() ?? {}) : null;
  }

  async listFleetDays(offerId: string, fromDate: string, toDate: string): Promise<FleetDay[]> {
    const snapshot = await adminDb
      .collection(FLEET_DAYS)
      .where('offerId', '==', offerId)
      .where('date', '>=', fromDate)
      .where('date', '<=', toDate)
      .orderBy('date', 'asc')
      .limit(120)
      .get();
    return snapshot.docs.map((doc) => FleetDayMapper.toDomain(doc.id, doc.data()));
  }
}
