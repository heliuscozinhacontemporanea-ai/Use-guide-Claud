import { createNotificationUseCase } from '../../domain/notifications';
import { getAllPartnersUseCase } from '../../domain/partners';

const ALERT_DAYS_BEFORE = 3;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Notifica parceiros verificados cujo plano expira nos próximos 3 dias,
 * usando ID determinístico por dia restante para garantir idempotência.
 */
export async function checkExpiringPartnerPlansApplicationUseCase(
  now: Date = new Date()
): Promise<number> {
  const alertThreshold = new Date(now);
  alertThreshold.setDate(alertThreshold.getDate() + ALERT_DAYS_BEFORE);

  const partners = await getAllPartnersUseCase();
  let notified = 0;

  for (const partner of partners) {
    if (!partner.isVerified || partner.isVerificationSuspended || !partner.verifiedUntil) {
      continue;
    }

    const verifiedUntil = new Date(partner.verifiedUntil);
    if (Number.isNaN(verifiedUntil.getTime())) {
      continue;
    }

    if (verifiedUntil > alertThreshold || verifiedUntil < now) {
      continue;
    }

    const daysRemaining = Math.max(
      1,
      Math.ceil((verifiedUntil.getTime() - now.getTime()) / MS_PER_DAY)
    );
    const expirationDateStr = verifiedUntil.toISOString().split('T')[0];
    const notificationId = `plan_expiring_${partner.id}_${daysRemaining}d_${expirationDateStr}`;

    const created = await createNotificationUseCase({
      id: notificationId,
      recipientPartnerId: partner.id,
      type: 'plan_expiring',
      title: 'Seu plano está expirando',
      message: `Sua assinatura expira em ${daysRemaining} dia${daysRemaining > 1 ? 's' : ''}. Renove para manter seu selo de verificação ativo.`,
    });

    if (created) {
      notified++;
    }
  }

  return notified;
}
