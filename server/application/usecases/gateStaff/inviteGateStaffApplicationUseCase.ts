import { getEventListingByIdUseCase } from '../../../domain/events';
import { type GateScope, GateStaffError, inviteGateStaffUseCase } from '../../../domain/gateStaff';
import { createNotificationUseCase } from '../../../domain/notifications';
import { resolveUsernameOwnerUseCase } from '../../../domain/users';
import { courtesyBusinessName } from '../courtesies/courtesyBusinessName';
import { ownerGatePlaces } from './ownerGatePlaces';

/** Nome do evento ou da atração e do estabelecimento, para o aviso; `null` quando não é do dono. */
async function scopeOf(ownerUid: string, scope: GateScope) {
  if (scope.type === 'place') {
    const place = (await ownerGatePlaces(ownerUid)).find((item) => item.id === scope.id);
    return place ? { title: place.title, business: place.title } : null;
  }
  const listing = await getEventListingByIdUseCase(scope.id);
  if (listing?.ownerId !== ownerUid) return null;
  return {
    title: listing.title || listing.name || '',
    business: await courtesyBusinessName(listing.establishmentId),
  };
}

/**
 * Convite para a portaria de um evento ou de uma atração (C1): só o dono convida, pelo @. A pessoa é
 * avisada e só entra na equipe depois de aceitar. Escopo de outro dono responde como inexistente
 * (§7.10).
 */
export async function inviteGateStaffApplicationUseCase(
  ownerUid: string,
  scope: GateScope,
  username: string
): Promise<{ id: string }> {
  const target = await scopeOf(ownerUid, scope);
  if (!target) throw new GateStaffError('GATE_STAFF_NOT_FOUND', 'Evento ou lugar não encontrado.');
  const person = await resolveUsernameOwnerUseCase(username);
  const member = await inviteGateStaffUseCase(ownerUid, scope, {
    uid: person.uid,
    username: person.username,
    displayName: person.displayName,
  });
  // O aviso não pode desfazer o convite já gravado.
  await createNotificationUseCase({
    recipientUid: person.uid,
    type: 'gate_staff_invited',
    params: { event: target.title, business: target.business ?? '' },
    link: { screen: 'gate' },
  }).catch(() => undefined);
  return { id: member.id };
}
