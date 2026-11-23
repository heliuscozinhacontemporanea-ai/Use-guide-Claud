import type { AdminAuditEntry } from '../types/adminAudit';

export interface AdminAuditPort {
  record(entry: AdminAuditEntry): Promise<void>;
}
