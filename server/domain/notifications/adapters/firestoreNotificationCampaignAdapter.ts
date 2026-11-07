import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type {
  NotificationCampaign,
  NotificationCampaignPort,
} from '../ports/notificationCampaignPort';

// Só o backend (rules `if false`): controle de envio, sem dado pessoal.
const CAMPAIGNS = 'notificationCampaigns';

export class FirestoreNotificationCampaignAdapter implements NotificationCampaignPort {
  async get(id: string): Promise<NotificationCampaign | null> {
    const snap = await adminDb.collection(CAMPAIGNS).doc(id).get();
    if (!snap.exists) return null;
    const data = snap.data() ?? {};
    return {
      id,
      status: data.status === 'done' ? 'done' : 'sending',
      cursor: typeof data.cursor === 'string' ? data.cursor : null,
      sent: typeof data.sent === 'number' ? data.sent : 0,
      updatedAt: String(data.updatedAt ?? ''),
    };
  }

  async save(campaign: NotificationCampaign): Promise<void> {
    const { id, ...data } = campaign;
    await adminDb.collection(CAMPAIGNS).doc(id).set(data);
  }
}
