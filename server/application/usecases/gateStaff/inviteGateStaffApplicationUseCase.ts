import { getEventListingByIdUseCase } from '../../../domain/events';
import { GateStaffError, inviteGateStaffUseCase } from '../../../domain/gateStaff';
import { createNotificationUseCase } from '../../../domain/notifications';
import { resolveUsernameOwnerUseCase } from '../../../domain/users';
import { courtesyBusinessName } from '../courtesies/courtesyBusinessName';

/**
 * Convite para a portaria de um evento (C1): só o dono do evento convida, pelo @. A pessoa é avisada
 * e só entra na equipe depois de aceitar. Evento de outro dono responde como inexistente (§7.10).
 */
export async function inviteGateStaffApplicationUseCase(
  ownerUid: string,
  eventListingId: string,
  username: string
): Promise<{ id: string }> {
  const listing = await getEventListingByIdUseCase(eventListingId);
  if (listing?.ownerId !== ownerUid) {
    throw new GateStaffError('GATE_STAFF_NOT_FOUND', 'Evento não encontrado.');
  }
  const person = await resolveUsernameOwnerUseCase(username);
  const member = await inviteGateStaffUseCase(
    ownerUid,
    { type: 'event', id: listing.id },
    { uid: person.uid, username: person.username, displayName: person.displayName }
  );
  const business = await courtesyBusinessName(listing.establishmentId);
  // O aviso não pode desfazer o convite já gravado.
  await createNotificationUseCase({
    recipientUid: person.uid,
    type: 'gate_staff_invited',
    params: { event: listing.title || listing.name || '', business: business ?? '' },
    link: { screen: 'gate' },
  }).catch(() => undefined);
  return { id: member.id };
}
