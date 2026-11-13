import { listEntryGateSlotsUseCase } from '../../../domain/bookings';
import { getEventListingByIdUseCase, listEventOccurrencesUseCase } from '../../../domain/events';
import { getPublicGuideItemUseCase } from '../../../domain/guide';
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
  /** Evento (sessões) ou atração (horários de entrada). */
  type: 'event' | 'place';
  /** ID do evento ou do lugar. */
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
    /** Só na atração: a oferta de entrada do horário, para abrir a portaria. */
    offerId?: string;
  }>;
}

const PLACE_DAYS_AHEAD = 7;

/**
 * Portaria da pessoa (C1): convites abertos e os eventos em que ela está na equipe, com as sessões
 * que ainda vão acontecer. Evento despublicado ou sem sessão pela frente não aparece.
 */
export async function listMyGatesApplicationUseCase(
  uid: string,
  now: Date = new Date()
): Promise<MyGateView[]> {
  const members = await listMyGateStaffUseCase(uid);
  const views = await Promise.all(
    members.map((member) =>
      member.scope.type === 'place' ? placeView(uid, member, now) : eventView(member, now)
    )
  );
  return views
    .filter((view): view is MyGateView => view !== null)
    .sort((a, b) => (a.sessions[0]?.startsAt ?? '').localeCompare(b.sessions[0]?.startsAt ?? ''));
}

type Member = Awaited<ReturnType<typeof listMyGateStaffUseCase>>[number];

async function eventView(member: Member, now: Date): Promise<MyGateView | null> {
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
    type: 'event',
    eventId: listing.id,
    title: listing.title || listing.name || '',
    business: await courtesyBusinessName(listing.establishmentId),
    timeZone: listing.timeZone ?? PLATFORM_TIME_ZONE,
    sessions,
  };
}

/**
 * Atração: os horários de entrada até 7 dias à frente. Os horários só são lidos com o convite
 * aceito; antes disso o cartão mostra só o lugar.
 */
async function placeView(uid: string, member: Member, now: Date): Promise<MyGateView | null> {
  const item = await getPublicGuideItemUseCase(member.scope.id).catch(() => null);
  if (!item) return null;
  const active = member.status === 'active';
  const slots = active
    ? await listEntryGateSlotsUseCase(
        { uid, admin: false },
        member.scope.id,
        new Date(now.getTime() - GRACE_MS).toISOString(),
        new Date(now.getTime() + PLACE_DAYS_AHEAD * 24 * HOUR_MS).toISOString()
      ).catch(() => [])
    : [];
  return {
    memberId: member.id,
    status: active ? 'active' : 'invited',
    type: 'place',
    eventId: member.scope.id,
    title: item.name,
    business: null,
    timeZone: item.timeZone ?? slots[0]?.timeZone ?? PLATFORM_TIME_ZONE,
    sessions: slots.slice(0, SESSIONS_SHOWN * 2).map((slot) => ({
      id: slot.slotId,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      salesEndsAt: slot.startsAt,
      offerId: slot.offerId,
    })),
  };
}
