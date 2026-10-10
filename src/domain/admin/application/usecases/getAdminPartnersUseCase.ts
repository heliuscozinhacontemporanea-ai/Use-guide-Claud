import { adminReportsAdapter } from '../../factory';
import type { AdminPartnerSummary } from '../../types/admin';

export function getAdminPartnersUseCase(): Promise<AdminPartnerSummary[]> {
  return adminReportsAdapter.getPartners();
}
