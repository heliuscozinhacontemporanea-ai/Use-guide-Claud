import { eventsService } from '../factory';

export async function recordEventAuditLogUseCase(entry: {
  actorId: string;
  actorType: 'admin' | 'partner' | 'user' | 'system';
  resourceType: 'event' | 'occurrence' | 'ticketType' | 'order' | 'ticket' | 'refund';
  resourceId: string;
  action: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
}) {
  return eventsService.recordAuditLog(entry);
}
