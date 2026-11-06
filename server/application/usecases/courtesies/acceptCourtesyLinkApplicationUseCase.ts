import { createNotificationUseCase } from '../../../domain/notifications';
import { claimCourtesyLinkUseCase } from '../../../domain/ticketing';
import { getUserProfileUseCase } from '../../../domain/users';
import { CourtesyRecipientError } from './courtesyRecipientError';

/**
 * Resgate do link de convite (D27): conta com e-mail confirmado recebe a cortesia, que fica presa a
 * ela. O organizador é avisado de que o convite foi aceito.
 */
export async function acceptCourtesyLinkApplicationUseCase(
  actor: { uid: string; emailVerified: boolean },
  courtesyId: string,
  token: string
): Promise<{ ticketId: string | null }> {
  if (!actor.emailVerified) {
    throw new CourtesyRecipientError(
      'RECIPIENT_NOT_VERIFIED',
      'Confirme seu e-mail para receber o ingresso.'
    );
  }
  const profile = await getUserProfileUseCase(actor.uid);
  const fullName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
  const courtesy = await claimCourtesyLinkUseCase(courtesyId, token, {
    uid: actor.uid,
    username: profile?.username ?? null,
    displayName: fullName || null,
    holderName: fullName || profile?.username || '',
    holderEmail: profile?.email ?? '',
  });
  await createNotificationUseCase({
    recipientUid: courtesy.invitedBy,
    type: 'courtesy_link_accepted',
    params: { username: profile?.username ? `@${profile.username}` : '' },
    link: { screen: 'partner' },
  }).catch(() => undefined);
  return { ticketId: courtesy.ticketId };
}
