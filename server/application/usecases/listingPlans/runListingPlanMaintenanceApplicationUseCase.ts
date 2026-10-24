import { getItemByIdUseCase } from '../../../domain/guide';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  listExpiredListingSealsUseCase,
  listExpiringListingSealsUseCase,
} from '../../../domain/partners';
import { syncListingSealApplicationUseCase } from './syncListingSealApplicationUseCase';

const ALERT_DAYS_BEFORE = 3;
const BATCH_LIMIT = 200;
const MS_PER_DAY = 86_400_000;

/**
 * Job diário (D11): desliga o selo vencido nos itens e eventos e avisa o dono dos planos que
 * vencem nos próximos 3 dias. O aviso tem ID determinístico por dia restante (idempotente).
 */
export async function runListingPlanMaintenanceApplicationUseCase(
  now: Date = new Date()
): Promise<{ expired: number; notified: number }> {
  const expired = await listExpiredListingSealsUseCase(BATCH_LIMIT);
  for (const plan of expired) {
    await syncListingSealApplicationUseCase(plan.itemId);
  }

  let notified = 0;
  for (const plan of await listExpiringListingSealsUseCase(ALERT_DAYS_BEFORE, BATCH_LIMIT)) {
    if (!plan.planUntil || plan.sealSuspended) continue;
    const until = new Date(plan.planUntil);
    const daysRemaining = Math.max(1, Math.ceil((until.getTime() - now.getTime()) / MS_PER_DAY));
    const item = await getItemByIdUseCase(plan.itemId);
    const listingName = typeof item?.name === 'string' ? item.name : '';
    // TODO: notifications ainda não aceita chave i18n (AGENTS.md §12.5); texto em pt-BR por enquanto.
    const created = await createNotificationUseCase({
      id: `plan_expiring_${plan.itemId}_${daysRemaining}d_${plan.planUntil.slice(0, 10)}`,
      recipientPartnerId: plan.ownerId,
      type: 'plan_expiring',
      title: 'Seu plano está expirando',
      message: `O plano de ${listingName || 'um estabelecimento'} vence em ${daysRemaining} dia(s). Renove para manter o selo.`,
    });
    if (created) notified++;
  }

  return { expired: expired.length, notified };
}
