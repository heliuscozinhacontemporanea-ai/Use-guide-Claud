import { createNotificationUseCase } from '../../../domain/notifications';
import { expireAllOverdueOrdersUseCase } from '../../../domain/ticketing';

/**
 * Pedido não pago no prazo (ex.: Pix vencido) libera os ingressos e avisa o comprador (D25).
 * Só quem chegou ao pagamento é avisado: sem pagamento iniciado, a pessoa só olhou.
 */
export async function expireUnpaidTicketOrdersApplicationUseCase(): Promise<{
  expiredCount: number;
}> {
  const { expired } = await expireAllOverdueOrdersUseCase();
  for (const order of expired) {
    if (!order.paymentIntentId) continue;
    await createNotificationUseCase({
      recipientUid: order.buyerId,
      type: 'purchase_expired',
      params: { offer: order.eventSnapshot?.title || '' },
      link: { screen: 'purchases' },
      dedupeKey: `purchase_expired_${order.id}`,
    }).catch(() => undefined);
  }
  return { expiredCount: expired.length };
}
