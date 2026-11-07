import { getEventListingByIdUseCase } from '../../../domain/events';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  invitePromoterUseCase,
  type PromoterEarning,
  type TicketingActorContext,
} from '../../../domain/ticketing';
import { resolveUsernameOwnerUseCase } from '../../../domain/users';
import { courtesyBusinessName } from '../courtesies/courtesyBusinessName';
import { assertActorPartnerTerms } from '../partnerTermsGate';

/** Convite pelo @ (D27): a pessoa é avisada e vê quanto ganha antes de aceitar. */
export async function invitePromoterApplicationUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  username: string,
  earning: PromoterEarning
): Promise<{ id: string }> {
  await assertActorPartnerTerms(actor);
  const owner = await resolveUsernameOwnerUseCase(username);
  const promoter = await invitePromoterUseCase(
    actor,
    eventListingId,
    { uid: owner.uid, username: owner.username, displayName: owner.displayName },
    earning
  );
  const listing = await getEventListingByIdUseCase(eventListingId).catch(() => null);
  const business = await courtesyBusinessName(listing?.establishmentId);
  // O aviso não pode desfazer o convite já gravado.
  await createNotificationUseCase({
    recipientUid: owner.uid,
    type: 'promoter_invited',
    params: { event: listing?.title ?? '', business: business ?? '' },
    link: { screen: 'promotions' },
  }).catch(() => undefined);
  return { id: promoter.id };
}
