import {
  broadcastNotificationUseCase,
  getNotificationCampaignUseCase,
  type NotificationCampaign,
  saveNotificationCampaignUseCase,
} from '../../../domain/notifications';
import { getAllPartnerIdsUseCase } from '../../../domain/partners';
import { listUserIdsPageUseCase } from '../../../domain/users';
import { TERMS_RELEASES, type TermsRelease } from '../../../shared/kernel/legalTerms';

const PAGE = 500;
// Por execução; o job roda de hora em hora e continua de onde parou.
const MAX_PAGES = 20;

/**
 * Aviso automático de mudança grande nos termos (aprovado em 2026-11-07): parceiros quando mudam os
 * termos do parceiro; todas as contas quando mudam os termos de uso e compra. Uma vez por versão.
 */
export async function announceTermsUpdatesApplicationUseCase(
  now: Date = new Date()
): Promise<{ sent: number }> {
  let sent = 0;
  for (const release of TERMS_RELEASES.filter((item) => item.major)) {
    sent += await announce(release, now);
  }
  return { sent };
}

async function announce(release: TermsRelease, now: Date): Promise<number> {
  const id = `terms_${release.audience}_${release.version}`;
  const current = await getNotificationCampaignUseCase(id);
  if (current?.status === 'done') return 0;
  const campaign: NotificationCampaign = current ?? {
    id,
    status: 'sending',
    cursor: null,
    sent: 0,
    updatedAt: now.toISOString(),
  };
  const data =
    release.audience === 'partner'
      ? { type: 'terms_updated_partner' as const, link: { screen: 'partner_terms' as const } }
      : { type: 'terms_updated_buyer' as const, link: { screen: 'terms' as const } };

  let sent = 0;
  if (release.audience === 'partner') {
    sent = await broadcastNotificationUseCase(await getAllPartnerIdsUseCase(), data);
    campaign.status = 'done';
  } else {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const { ids, nextCursor } = await listUserIdsPageUseCase(campaign.cursor, PAGE);
      sent += await broadcastNotificationUseCase(ids, data);
      campaign.cursor = nextCursor;
      if (!nextCursor) {
        campaign.status = 'done';
        break;
      }
    }
  }
  await saveNotificationCampaignUseCase({
    ...campaign,
    sent: campaign.sent + sent,
    updatedAt: now.toISOString(),
  });
  return sent;
}
