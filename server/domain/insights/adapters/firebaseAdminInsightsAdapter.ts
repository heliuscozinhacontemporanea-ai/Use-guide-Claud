import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type {
  InsightsRepositoryPort,
  RecordInteractionInput,
} from '../ports/insightsRepositoryPort';
import type { InteractionCounter, ItemStats } from '../types/interaction';
import { lastBusinessDays } from '../utils/businessDay';

// Coleções só do backend (firestore.rules nega leitura e escrita ao cliente).
const STATS_COLLECTION = 'interactionStats';
const GUARDS_COLLECTION = 'interactionGuards';
const HISTORY_DAYS = 7;
const COUNTERS: InteractionCounter[] = [
  'viewsSignedIn',
  'viewsAnonymous',
  'whatsapp_click',
  'share',
  'favorite',
];

function statsDocId(itemCollection: string, itemId: string, day: string): string {
  return `${itemCollection}_${itemId}_${day}`;
}

function counterValue(data: Record<string, unknown>, counter: InteractionCounter): number {
  const value = data[counter];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** Rótulo dd/mm do gráfico a partir do dia AAAA-MM-DD. */
function dayLabel(day: string): string {
  const [, month, date] = day.split('-');
  return `${date}/${month}`;
}

export class FirebaseAdminInsightsAdapter implements InsightsRepositoryPort {
  async recordInteraction(input: RecordInteractionInput): Promise<boolean> {
    const guardRef = adminDb.collection(GUARDS_COLLECTION).doc(input.guardId);
    const statsRef = adminDb
      .collection(STATS_COLLECTION)
      .doc(statsDocId(input.itemCollection, input.itemId, input.day));

    return adminDb.runTransaction(async (transaction) => {
      const guard = await transaction.get(guardRef);
      const expiresAt = guard.exists ? guard.get('expiresAt') : null;
      if (expiresAt instanceof Timestamp && expiresAt.toMillis() > input.now.getTime()) {
        return false;
      }
      // expiresAt também alimenta a política de TTL do Firestore, que apaga as chaves vencidas.
      transaction.set(guardRef, {
        expiresAt: Timestamp.fromMillis(input.now.getTime() + input.guardWindowMs),
      });
      transaction.set(
        statsRef,
        {
          itemId: input.itemId,
          itemCollection: input.itemCollection,
          day: input.day,
          [input.counter]: FieldValue.increment(1),
        },
        { merge: true }
      );
      return true;
    });
  }

  async getItemStats(
    itemId: string,
    itemCollection: 'items' | 'events',
    today: Date
  ): Promise<ItemStats> {
    const snapshot = await adminDb
      .collection(STATS_COLLECTION)
      .where('itemId', '==', itemId)
      .where('itemCollection', '==', itemCollection)
      .get();

    const totals = Object.fromEntries(COUNTERS.map((counter) => [counter, 0])) as Record<
      InteractionCounter,
      number
    >;
    const viewsByDay = new Map<string, number>();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      for (const counter of COUNTERS) {
        totals[counter] += counterValue(data, counter);
      }
      if (typeof data.day === 'string') {
        viewsByDay.set(
          data.day,
          counterValue(data, 'viewsSignedIn') + counterValue(data, 'viewsAnonymous')
        );
      }
    }

    return {
      views: totals.viewsSignedIn + totals.viewsAnonymous,
      viewsSignedIn: totals.viewsSignedIn,
      viewsAnonymous: totals.viewsAnonymous,
      whatsapp_click: totals.whatsapp_click,
      share: totals.share,
      favorite: totals.favorite,
      history: lastBusinessDays(today, HISTORY_DAYS).map((day) => ({
        date: dayLabel(day),
        views: viewsByDay.get(day) ?? 0,
      })),
    };
  }
}
