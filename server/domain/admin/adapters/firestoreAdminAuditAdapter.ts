import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { AdminAuditPort } from '../ports/adminAuditPort';
import type { AdminAuditEntry } from '../types/adminAudit';

/** `adminAuditLog`: coleção só do servidor (`allow read, write: if false`). */
export class FirestoreAdminAuditAdapter implements AdminAuditPort {
  async record(entry: AdminAuditEntry): Promise<void> {
    await adminDb.collection('adminAuditLog').add(entry);
  }
}
