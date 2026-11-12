import { getEventListingByIdUseCase, listEventOccurrencesUseCase } from '../../../domain/events';
import { listMyGateStaffUseCase } from '../../../domain/gateStaff';
import { PLATFORM_TIME_ZONE } from '../../../shared/kernel/timeZones';
import { courtesyBusinessName } from '../courtesies/courtesyBusinessName';

const HOUR_MS = 60 * 60 * 1000;
// A equipe opera a portaria até 6 h depois do fim da sessão (D20); depois disso a sessão some.
const GRACE_MS = 6 * HOUR_MS;
const SESSIONS_SHOWN = 5;

export interface MyGateView {
  memberId: string;
  status: 'invited' | 'active';
  eventId: string;
  title: string;
  /** Nome do estabelecimento do organizador; `null` quando o evento não tem. */
  business: string | null;
  timeZone: string;
  sessions: Array<{
    id: string;
    startsAt: string;
    endsAt: string | null;
    /** Só depois do fim das vendas pelo app a lista sem internet pode ser baixada (D21). */
    salesEndsAt: string;
  }>;
}

/**
 * Portaria da pessoa (C1): convites abertos e os eventos em que ela está na equipe, com as sessões
 * que ainda vão acontecer. Evento despublicado ou sem sessão pela frente não aparece.
 */
export async function listMyGatesApplicationUseCase(
  uid: string,
  now: Date = new Date()
): Promise<MyGateView[]> {
  const members = (await listMyGateStaffUseCase(uid)).filter(
    (member) => member.scope.type === 'event'
  );
  const views = await Promise.all(
    members.map(async (member): Promise<MyGateView | null> => {
      const listing = await getEventListingByIdUseCase(member.scope.id).catch(() => null);
      if (listing?.status !== 'published') return null;
      const sessions = (await listEventOccurrencesUseCase(listing.id))
        .filter(
          (occurrence) =>
            occurrence.status !== 'canceled' &&
            new Date(occurrence.endsAt || occurrence.startsAt).getTime() + GRACE_MS > now.getTime()
        )
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .slice(0, SESSIONS_SHOWN)
        .map((occurrence) => ({
          id: occurrence.id,
          startsAt: occurrence.startsAt,
          endsAt: occurrence.endsAt || null,
          salesEndsAt: occurrence.salesEndsAt || occurrence.startsAt,
        }));
      if (sessions.length === 0) return null;
      return {
        memberId: member.id,
        status: member.status === 'active' ? 'active' : 'invited',
        eventId: listing.id,
        title: listing.title || listing.name || '',
        business: await courtesyBusinessName(listing.establishmentId),
        timeZone: listing.timeZone ?? PLATFORM_TIME_ZONE,
        sessions,
      };
    })
  );
  return views
    .filter((view): view is MyGateView => view !== null)
    .sort((a, b) => (a.sessions[0]?.startsAt ?? '').localeCompare(b.sessions[0]?.startsAt ?? ''));
}
