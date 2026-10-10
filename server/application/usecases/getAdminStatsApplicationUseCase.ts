import { listAllEventListingsUseCase } from '../../domain/events';
import { getGuideStatsUseCase } from '../../domain/guide';
import { getReviewsStatsUseCase } from '../../domain/reviews';
import { getUsersCountUseCase } from '../../domain/users';

export async function getAdminStatsApplicationUseCase() {
  const [guideStats, allEvents, totalUsers, reviewsStats] = await Promise.all([
    getGuideStatsUseCase(),
    listAllEventListingsUseCase(),
    getUsersCountUseCase(),
    getReviewsStatsUseCase(),
  ]);

  const activeEvents = allEvents.filter(
    (event) => event.status === 'published' && event.isActive !== false
  ).length;

  return {
    ...guideStats,
    totalEvents: allEvents.length,
    activeEvents,
    totalUsers,
    ...reviewsStats,
  };
}
