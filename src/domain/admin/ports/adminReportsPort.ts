import type { AdminPartnerSummary, AdminStats } from '../types/admin';

export interface AdminReportsPort {
  getStats(): Promise<AdminStats>;
  getPartners(): Promise<AdminPartnerSummary[]>;
}
