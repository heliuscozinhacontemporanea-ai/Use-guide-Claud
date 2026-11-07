import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../../domain/events';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  type CourtesyRow,
  inviteCourtesyByUsernameUseCase,
  type TicketingActorContext,
} from '../../../domain/ticketing';
import { getUserProfileUseCase, resolveUsernameOwnerUseCase } from '../../../domain/users';
import { assertActorPartnerTerms } from '../partnerTermsGate';
import { courtesyBusinessName } from './courtesyBusinessName';
import { CourtesyRecipientError } from './courtesyRecipientError';

/**
 * Cortesia pelo @ (D27): a conta precisa ter e-mail confirmado; nome e e-mail do ingresso vêm da
 * conta, nunca do cliente (§7.3). A pessoa recebe o aviso no sininho e no push.
 */
export async function inviteCourtesyByUsernameApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  username: string
): Promise<CourtesyRow> {
  await assertActorPartnerTerms(actor);
  const owner = await resolveUsernameOwnerUseCase(username);
  if (!owner.emailVerified) {
    throw new CourtesyRecipientError(
      'RECIPIENT_NOT_VERIFIED',
      'Esta conta ainda não confirmou o e-mail e não pode receber ingressos.'
    );
  }
  const profile = await getUserProfileUseCase(owner.uid);
  const fullName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
  const courtesy = await inviteCourtesyByUsernameUseCase(actor, occurrenceId, {
    uid: owner.uid,
    username: owner.username,
    displayName: owner.displayName,
    holderName: fullName || owner.displayName || owner.username,
    holderEmail: owner.email,
  });

  const [listing, occurrence] = await Promise.all([
    getEventListingByIdUseCase(courtesy.eventListingId),
    getEventOccurrenceByIdUseCase(courtesy.occurrenceId),
  ]);
  const business = await courtesyBusinessName(listing?.establishmentId);
  // O aviso não pode desfazer a cortesia já gravada.
  await createNotificationUseCase({
    recipientUid: owner.uid,
    type: 'courtesy_received',
    params: { event: listing?.title ?? '', business: business ?? '' },
    link: { screen: 'tickets' },
  }).catch(() => undefined);

  return {
    id: courtesy.id,
    occurrenceId: courtesy.occurrenceId,
    channel: courtesy.channel,
    status: 'in_wallet',
    guest: { username: owner.username, displayName: owner.displayName },
    checkedInAt: null,
    linkExpiresAt: null,
    createdAt: courtesy.createdAt || (occurrence?.startsAt ?? ''),
  };
}
