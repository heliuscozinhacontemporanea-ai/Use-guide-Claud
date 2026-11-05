import { partnerHomeAdapter } from '../../factory';
import type { PartnerReportPeriod, PartnerReports } from '../../types/partnerHome';

export function getPartnerReportsUseCase(period: PartnerReportPeriod): Promise<PartnerReports> {
  return partnerHomeAdapter.getReports(period);
}
