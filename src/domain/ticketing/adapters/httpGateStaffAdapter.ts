import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { GateStaffPort } from '../ports/gateStaffPort';
import type { GateCounts, MyGate, OwnerGateStaff } from '../types/gateStaff';

const BASE = '/api/gate-staff';

async function call<T>(
  path: string,
  method: 'GET' | 'POST' | 'DELETE',
  body?: unknown
): Promise<T> {
  const res = await firebaseApiFetch(
    `${BASE}${path}`,
    {
      method,
      ...(body
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : {}),
    },
    { requireAuth: true }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.code || 'INTERNAL_ERROR');
  return json?.data as T;
}

const member = (memberId: string) => `/${encodeURIComponent(memberId)}`;

export class HttpGateStaffAdapter implements GateStaffPort {
  listOwnerGateStaff(): Promise<OwnerGateStaff> {
    return call('', 'GET');
  }

  async inviteGateStaff(eventListingId: string, username: string): Promise<void> {
    await call('', 'POST', { eventListingId, username });
  }

  async removeGateStaff(memberId: string): Promise<void> {
    await call(member(memberId), 'DELETE');
  }

  listMyGates(): Promise<MyGate[]> {
    return call('/me', 'GET');
  }

  async respondGateInvite(memberId: string, accept: boolean): Promise<void> {
    await call(`${member(memberId)}/response`, 'POST', { accept });
  }

  async leaveGate(memberId: string): Promise<void> {
    await call(`${member(memberId)}/leave`, 'POST');
  }

  getGateCounts(occurrenceId: string): Promise<GateCounts> {
    return call(`/occurrences/${encodeURIComponent(occurrenceId)}/counts`, 'GET');
  }
}
