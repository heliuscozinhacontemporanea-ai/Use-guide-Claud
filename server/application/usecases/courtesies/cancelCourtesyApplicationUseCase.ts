import { getEventListingByIdUseCase } from '../../../domain/events';
import { createNotificationUseCase } from '../../../domain/notifications';
import { cancelCourtesyUseCase, type TicketingActorContext } from '../../../domain/ticketing';

/** Cancela a cortesia (até a pessoa entrar) e avisa quem tinha recebido (D27). */
export async function cancelCourtesyApplicationUseCase(
  actor: TicketingActorContext,
  courtesyId: string
): Promise<void> {
  const courtesy = await cancelCourtesyUseCase(actor, courtesyId);
  if (!courtesy.guest) return;
  const listing = await getEventListingByIdUseCase(courtesy.eventListingId).catch(() => null);
  await createNotificationUseCase({
    recipientUid: courtesy.guest.uid,
    type: 'courtesy_canceled',
    params: { event: listing?.title ?? '' },
    link: { screen: 'tickets' },
  }).catch(() => undefined);
}
