import { releasePayoutHoldUseCase } from '../../../domain/payment';

/** A reserva ganhou a prova do serviço ou uma decisão final: o repasse deixa de esperar por ela (D20). */
export async function releaseServiceProofHold(bookingId: string): Promise<void> {
  await releasePayoutHoldUseCase('booking', bookingId, 'service_proof');
}
