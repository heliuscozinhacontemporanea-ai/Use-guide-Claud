import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

initializeApp();

const databaseId = process.env.FIRESTORE_DATABASE_ID?.trim();

if (!databaseId) {
  throw new Error('FIRESTORE_DATABASE_ID não configurado');
}

const db = getFirestore(databaseId);

const EXPIRATION_DAYS = 30;
const ALERT_DAYS_BEFORE = 3;

export const checkExpiringPlans = onSchedule(
  { schedule: '0 6 * * *', timeZone: 'America/Fortaleza' },
  async () => {
    const now = new Date();
    const alertThreshold = new Date(now);
    alertThreshold.setDate(alertThreshold.getDate() + ALERT_DAYS_BEFORE);

    const partnersSnapshot = await db
      .collection('partners')
      .where('isVerified', '==', true)
      .get();

    let notified = 0;

    for (const doc of partnersSnapshot.docs) {
      const data = doc.data();
      let verifiedUntil: Date | null = null;

      if (data.verifiedUntil) {
        if (typeof data.verifiedUntil.toDate === 'function') {
          verifiedUntil = data.verifiedUntil.toDate();
        } else if (typeof data.verifiedUntil === 'string' || typeof data.verifiedUntil === 'number') {
          const d = new Date(data.verifiedUntil);
          if (!isNaN(d.getTime())) {
            verifiedUntil = d;
          }
        }
      }

      if (!verifiedUntil) continue;
      if (verifiedUntil > alertThreshold || verifiedUntil < now) continue;

      const settingsDoc = await db.collection('partnerNotificationSettings').doc(doc.id).get();
      const isEnabled = settingsDoc.exists
        ? settingsDoc.data()?.planExpiringNotifications !== false
        : true;

      if (!isEnabled) continue;

      const daysRemaining = Math.max(1, Math.ceil((verifiedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      const expirationDateStr = verifiedUntil.toISOString().split('T')[0];
      const notificationDocId = `plan_expiring_${doc.id}_${daysRemaining}d_${expirationDateStr}`;
      const notificationRef = db.collection('notifications').doc(notificationDocId);

      const existingSnap = await notificationRef.get();
      if (existingSnap.exists) {
        continue;
      }

      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + EXPIRATION_DAYS);

      await notificationRef.set({
        recipientPartnerId: doc.id,
        type: 'plan_expiring',
        title: 'Seu plano está expirando',
        message: `Sua assinatura expira em ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''}. Renove para manter seu selo de verificação ativo.`,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt,
      });

      notified++;
    }

    console.info(`[checkExpiringPlans] Verificação concluída. ${notified} parceiro(s) notificado(s).`);
  }
);
