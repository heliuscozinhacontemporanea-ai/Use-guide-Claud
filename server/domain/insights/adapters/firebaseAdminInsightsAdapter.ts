import { InsightsRepositoryPort, CreateInteractionData } from '../ports/insightsRepositoryPort';
import type { InteractionType, ItemStats } from '../types/interaction';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { FieldValue } from 'firebase-admin/firestore';

// O tipo gravado é singular ('view'); o contador da resposta é 'views'.
const STAT_COUNTER: Record<InteractionType, 'views' | 'whatsapp_click' | 'share' | 'favorite'> = {
  view: 'views',
  whatsapp_click: 'whatsapp_click',
  share: 'share',
  favorite: 'favorite',
};

/** Dia no fuso do negócio, para o gráfico dos últimos 7 dias não depender do fuso do servidor. */
function formatBusinessDay(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Fortaleza',
  });
}

export class FirebaseAdminInsightsAdapter implements InsightsRepositoryPort {
  async recordInteraction(data: CreateInteractionData): Promise<void> {
    await adminDb.collection('interactions').add({
      itemId: data.itemId,
      itemCollection: data.itemCollection,
      type: data.type,
      timestamp: FieldValue.serverTimestamp(),
      userId: data.userId || null,
      partnerId: data.partnerId || null,
    });
  }

  async getItemStats(itemId: string, itemCollection: 'items' | 'events'): Promise<ItemStats> {
    const snapshot = await adminDb
      .collection('interactions')
      .where('itemId', '==', itemId)
      .where('itemCollection', '==', itemCollection)
      .get();

    const stats: ItemStats = {
      views: 0,
      whatsapp_click: 0,
      share: 0,
      favorite: 0,
      history: [],
    };

    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatBusinessDay(d);
      last7Days[dateStr] = 0;
    }

    snapshot.forEach((doc) => {
      const docData = doc.data();
      const counter = STAT_COUNTER[docData.type as InteractionType];
      if (counter) {
        stats[counter] += 1;
      }

      if (docData.type === 'view' && docData.timestamp) {
        let dateVal: Date;
        if (typeof docData.timestamp.toDate === 'function') {
          dateVal = docData.timestamp.toDate();
        } else if (typeof docData.timestamp.seconds === 'number') {
          dateVal = new Date(docData.timestamp.seconds * 1000);
        } else {
          dateVal = new Date(docData.timestamp);
        }

        const date = formatBusinessDay(dateVal);
        if (date in last7Days && typeof last7Days[date] === 'number') {
          last7Days[date] += 1;
        }
      }
    });

    stats.history = Object.entries(last7Days).map(([date, views]) => ({ date, views }));
    return stats;
  }
}
