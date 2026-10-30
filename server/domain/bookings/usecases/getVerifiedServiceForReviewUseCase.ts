import { getBookingServiceProofService } from '../factory';

/** Confere que o comprador usou o serviço da reserva, para a avaliação verificada (§9.4, D20). */
export async function getVerifiedServiceForReviewUseCase(params: {
  userId: string;
  bookingId: string;
}): Promise<{ guideItemId: string }> {
  return getBookingServiceProofService().getVerifiedServiceForReview(
    params.userId,
    params.bookingId
  );
}
