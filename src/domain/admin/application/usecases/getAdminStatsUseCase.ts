import { adminReportsAdapter } from '../../factory';
import type { AdminStats } from '../../types/admin';

export function getAdminStatsUseCase(): Promise<AdminStats> {
  return adminReportsAdapter.getStats();
}
