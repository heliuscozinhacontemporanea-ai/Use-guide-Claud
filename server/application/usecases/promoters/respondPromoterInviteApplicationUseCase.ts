import { getEventListingByIdUseCase } from '../../../domain/events';
import { createNotificationUseCase } from '../../../domain/notifications';
import { respondPromoterInviteUseCase } from '../../../domain/ticketing';

/** Aceite ou recusa do convite; o organizador é avisado (D27). */
export async function respondPromoterInviteApplicationUseCase(
  uid: string,
  promoterId: string,
  accept: boolean
): Promise<void> {
  const promoter = await respondPromoterInviteUseCase(uid, promoterId, accept);
  const listing = await getEventListingByIdUseCase(promoter.eventListingId).catch(() => null);
  await createNotificationUseCase({
    recipientUid: promoter.ownerId,
    type: accept ? 'promoter_accepted' : 'promoter_declined',
    params: {
      username: promoter.promoter.username ? `@${promoter.promoter.username}` : '',
      event: listing?.title ?? '',
    },
    link: { screen: 'partner' },
  }).catch(() => undefined);
}
