import { ticketingService } from '../factory';
import type { VerifiedAttendanceForReview } from '../types/ticketingTypes';

export async function getVerifiedAttendanceForReviewUseCase(params: {
  userId: string;
  occurrenceId: string;
  ticketId: string;
}): Promise<VerifiedAttendanceForReview> {
  return ticketingService.getVerifiedAttendanceForReview(params);
}
