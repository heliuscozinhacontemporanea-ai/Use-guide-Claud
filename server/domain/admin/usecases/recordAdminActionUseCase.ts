import { adminAudit } from '../factory';
import type { AdminAuditEntry } from '../types/adminAudit';

/** Grava uma ação de admin no registro de auditoria (A09, escolhas da F4). */
export async function recordAdminActionUseCase(entry: AdminAuditEntry): Promise<void> {
  await adminAudit.record(entry);
}
