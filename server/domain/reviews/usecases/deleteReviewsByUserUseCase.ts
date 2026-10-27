import { reviewReportService, reviewService } from '../factory';

/** Exclusão de conta (LGPD, AGENTS.md §7.5): as avaliações e as denúncias feitas pela pessoa. */
export async function deleteReviewsByUserUseCase(uid: string): Promise<void> {
  await reviewService.deleteReviewsByUser(uid);
  await reviewReportService.deleteByReporter(uid);
}
