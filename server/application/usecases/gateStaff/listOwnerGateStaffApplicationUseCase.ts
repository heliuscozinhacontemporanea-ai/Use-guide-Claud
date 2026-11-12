import { listOwnerEventListingsUseCase } from '../../../domain/events';
import { listOwnerGateStaffUseCase } from '../../../domain/gateStaff';
import { listEventCheckInsForPartnerOrAdminUseCase } from '../../../domain/ticketing';

export interface OwnerGateStaffView {
  /** Eventos do dono que podem receber equipe (os não arquivados). */
  events: Array<{ id: string; title: string }>;
  groups: Array<{
    eventId: string;
    title: string;
    members: Array<{
      id: string;
      username: string | null;
      displayName: string | null;
      status: 'invited' | 'active';
      acceptedAt: string | null;
      /** Entradas que a pessoa liberou neste evento e a hora da última. */
      entries: number;
      lastEntryAt: string | null;
    }>;
  }>;
}

/** Equipe da portaria do dono (C1), por evento, com quantas entradas cada pessoa liberou. */
export async function listOwnerGateStaffApplicationUseCase(
  ownerUid: string
): Promise<OwnerGateStaffView> {
  const [members, listings] = await Promise.all([
    listOwnerGateStaffUseCase(ownerUid),
    listOwnerEventListingsUseCase(ownerUid),
  ]);
  const events = listings
    .filter((event) => event.status !== 'archived')
    .map((event) => ({ id: event.id, title: event.title || event.name || '' }));
  const titles = new Map(events.map((event) => [event.id, event.title]));
  const eventIds = [
    ...new Set(
      members.filter((member) => member.scope.type === 'event').map((member) => member.scope.id)
    ),
  ];
  const actor = { uid: ownerUid, admin: false, role: 'partner' as const };
  const groups = await Promise.all(
    eventIds
      .filter((eventId) => titles.has(eventId))
      .map(async (eventId) => {
        const checkIns = await listEventCheckInsForPartnerOrAdminUseCase(actor, eventId).catch(
          () => []
        );
        return {
          eventId,
          title: titles.get(eventId) ?? '',
          members: members
            .filter((member) => member.scope.type === 'event' && member.scope.id === eventId)
            .map((member) => {
              const own = checkIns
                .filter((checkIn) => checkIn.checkedInBy === member.staffUid)
                .map((checkIn) => checkIn.checkedInAt)
                .sort();
              return {
                id: member.id,
                username: member.staff.username,
                displayName: member.staff.displayName,
                status: member.status === 'active' ? ('active' as const) : ('invited' as const),
                acceptedAt: member.acceptedAt,
                entries: own.length,
                lastEntryAt: own[own.length - 1] ?? null,
              };
            }),
        };
      })
  );
  return { events, groups };
}
