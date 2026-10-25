import { getEventListingByIdUseCase } from '../../domain/events';
import { assertListingCanSellUseCase, ListingVerificationError } from '../../domain/partners';
import { createPaymentForTicketOrderUseCase } from '../../domain/payment';
import {
  confirmTicketOrderPaymentUseCase,
  getTicketOrderUseCase,
  TicketingDomainError,
  type TicketOrder,
} from '../../domain/ticketing';
import { isPartnerSuspended } from './isPartnerSuspended';
import { OrchestrationActor } from './orchestrationActor';

export async function createTicketOrderPaymentIntentApplicationUseCase(
  actor: OrchestrationActor,
  input: {
    orderId: string;
    idempotencyKey: string;
  }
): Promise<{
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  orderStatus: TicketOrder['status'];
}> {
  const { order } = await getTicketOrderUseCase(actor, input.orderId);
  if (order.buyerId !== actor.uid && actor.admin !== true) {
    throw new TicketingDomainError('FORBIDDEN', 'Acesso negado a este pedido.');
  }

  if (order.status === 'paid') {
    return {
      orderId: order.id,
      paymentIntentId: order.paymentIntentId || order.paymentId || '',
      clientSecret: '',
      status: 'succeeded',
      orderStatus: 'paid',
    };
  }

  if (order.status === 'expired' || order.status === 'canceled') {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      `Este pedido não pode ser pago porque está com status "${order.status}".`
    );
  }

  if (order.expiresAt && new Date(order.expiresAt).getTime() <= Date.now()) {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      'O prazo de reserva deste pedido expirou.'
    );
  }

  if (order.totalMinor <= 0) {
    const confirmed = await confirmTicketOrderPaymentUseCase({
      orderId: order.id,
      paymentId: 'free_order',
    });
    return {
      orderId: confirmed.order.id,
      paymentIntentId: 'free_order',
      clientSecret: '',
      status: 'succeeded',
      orderStatus: confirmed.order.status,
    };
  }

  const listing = await getEventListingByIdUseCase(order.eventListingId);
  if (!listing) {
    throw new TicketingDomainError('NOT_FOUND', 'Evento não encontrado.');
  }

  const partnerId = listing.partnerId || listing.ownerId;

  if (await isPartnerSuspended(partnerId)) {
    throw new TicketingDomainError(
      'FORBIDDEN',
      'Este organizador não está vendendo ingressos no momento.'
    );
  }

  // Ingresso pago só de evento cujo estabelecimento ou perfil de produtor foi verificado (D12).
  let sellerAccountKey: string;
  try {
    ({ accountKey: sellerAccountKey } = await assertListingCanSellUseCase(
      listing.establishmentId ?? ''
    ));
  } catch (error) {
    if (error instanceof ListingVerificationError) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'Este organizador ainda não está liberado para vender ingressos.'
      );
    }
    throw error;
  }

  const paymentResult = await createPaymentForTicketOrderUseCase({
    orderId: order.id,
    buyerId: order.buyerId,
    sellerPartnerId: partnerId,
    sellerAccountKey,
    eventListingId: order.eventListingId,
    occurrenceId: order.occurrenceId,
    eventTitle: order.eventSnapshot?.title || listing.title,
    totalMinor: order.totalMinor,
    // A taxa de serviço do comprador também fica com a plataforma (D14).
    platformFeeMinor: order.platformFeeMinor + order.serviceFeeMinor,
    idempotencyKey: input.idempotencyKey,
  });

  return {
    orderId: order.id,
    paymentIntentId: paymentResult.paymentIntentId,
    clientSecret: paymentResult.clientSecret,
    status: paymentResult.status,
    orderStatus: order.status,
  };
}
