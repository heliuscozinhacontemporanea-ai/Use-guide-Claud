import { reviewService } from '../factory';

export async function deleteReviewsByUserUseCase(uid: string): Promise<void> {
  await reviewService.deleteReviewsByUser(uid);
}
