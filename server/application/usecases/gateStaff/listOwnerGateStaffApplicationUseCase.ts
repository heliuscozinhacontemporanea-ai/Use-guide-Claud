import { listOwnerEventListingsUseCase } from '../../../domain/events';
import { type GateScopeType, listOwnerGateStaffUseCase } from '../../../domain/gateStaff';
import { listEventCheckInsForPartnerOrAdminUseCase } from '../../../domain/ticketing';
import { ownerGatePlaces } from './ownerGatePlaces';

export interface OwnerGateStaffView {
  /** Eventos (não arquivados) e atrações com entrada do dono: onde dá para montar equipe. */
  targets: Array<{ type: GateScopeType; id: string; title: string }>;
  groups: Array<{
    type: GateScopeType;
    id: string;
    title: string;
    members: Array<{
      id: string;
      username: string | null;
      displayName: string | null;
      status: 'invited' | 'active';
      acceptedAt: string | null;
      /** Entradas que a pessoa liberou (só no evento) e a hora da última; `null` na atração. */
      entries: number | null;
      lastEntryAt: string | null;
    }>;
  }>;
}

/** Equipe da portaria do dono (C1), por evento e por atração. */
export async function listOwnerGateStaffApplicationUseCase(
  ownerUid: string
): Promise<OwnerGateStaffView> {
  const [members, listings, places] = await Promise.all([
    listOwnerGateStaffUseCase(ownerUid),
    listOwnerEventListingsUseCase(ownerUid),
    ownerGatePlaces(ownerUid),
  ]);
  const targets = [
    ...listings
      .filter((event) => event.status !== 'archived')
      .map((event) => ({
        type: 'event' as const,
        id: event.id,
        title: event.title || event.name || '',
      })),
    ...places.map((place) => ({ type: 'place' as const, ...place })),
  ];
  const actor = { uid: ownerUid, admin: false, role: 'partner' as const };
  const groups = await Promise.all(
    targets.map(async (target) => {
      const own = members.filter(
        (member) => member.scope.type === target.type && member.scope.id === target.id
      );
      if (own.length === 0) return null;
      const checkIns =
        target.type === 'event'
          ? await listEventCheckInsForPartnerOrAdminUseCase(actor, target.id).catch(() => [])
          : null;
      return {
        ...target,
        members: own.map((member) => {
          const mine = checkIns
            ?.filter((checkIn) => checkIn.checkedInBy === member.staffUid)
            .map((checkIn) => checkIn.checkedInAt)
            .sort();
          return {
            id: member.id,
            username: member.staff.username,
            displayName: member.staff.displayName,
            status: member.status === 'active' ? ('active' as const) : ('invited' as const),
            acceptedAt: member.acceptedAt,
            entries: mine ? mine.length : null,
            lastEntryAt: mine?.[mine.length - 1] ?? null,
          };
        }),
      };
    })
  );
  return { targets, groups: groups.filter((group) => group !== null) };
}
