import type { PartnerTodayItem } from '../types/partnerHome';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
// Fortaleza é UTC−3 fixo (AGENTS.md §1): a véspera começa às 00:00 do dia anterior lá.
const BUSINESS_OFFSET = 3 * HOUR;

const CODE_KINDS = ['tour', 'rental', 'transfer'];
// Aluguel com entrega ainda não existe: o "Cheguei" fica no passeio e no translado (D27).
const ARRIVE_KINDS = ['tour', 'transfer'];
// Sessão sem fim informado: a portaria fica aberta como o código do ingresso, 6 h (D20).
const SESSION_WITHOUT_END = 6 * HOUR;

export type AgoraCard =
  | { type: 'arrive'; item: PartnerTodayItem }
  | { type: 'code'; item: PartnerTodayItem; arrived: boolean; noShowAt: string | null }
  | { type: 'start'; item: PartnerTodayItem }
  | { type: 'gate'; item: PartnerTodayItem }
  | { type: 'offline'; item: PartnerTodayItem };

const ms = (iso: string) => new Date(iso).getTime();
const eveStart = (startMs: number) =>
  Math.floor((startMs - BUSINESS_OFFSET) / DAY) * DAY + BUSINESS_OFFSET - DAY;

function slotCard(item: PartnerTodayItem, now: number, started: boolean): AgoraCard | null {
  const start = ms(item.startsAt);
  const end = ms(item.serviceEndsAt ?? item.endsAt ?? item.startsAt);
  if (item.offerKind === 'private_entry') {
    // Portaria de 1 h antes da abertura ao fechamento; a lista sai na véspera (D27).
    if (now >= start - HOUR && now <= end) return { type: 'gate', item };
    if (now >= eveStart(start) && now < start - HOUR) return { type: 'offline', item };
    return null;
  }
  if (!CODE_KINDS.includes(item.offerKind ?? '') || (item.bookings ?? item.sold) === 0) return null;
  const waiting = item.waitingBookings ?? 0;
  const codeOpen = now >= start - 2 * HOUR && now <= end + 12 * HOUR;
  if (waiting === 0) {
    // "Iniciar serviço" só depois do check-in (D20) e até o fim do serviço.
    return codeOpen && !started && (item.checkedIn ?? 0) > 0 && now < end
      ? { type: 'start', item }
      : null;
  }
  if (ARRIVE_KINDS.includes(item.offerKind ?? '') && !item.arrivedAt) {
    if (now >= start - 30 * MIN && now < start) return { type: 'arrive', item };
  }
  if (!codeOpen) return null;
  const arrived = Boolean(item.arrivedAt) && now <= end;
  return {
    type: 'code',
    item,
    arrived,
    noShowAt: item.arrivedAt ? new Date(ms(item.arrivedAt) + 30 * MIN).toISOString() : null,
  };
}

function sessionCard(item: PartnerTodayItem, now: number): AgoraCard | null {
  const start = ms(item.startsAt);
  const end = item.endsAt ? ms(item.endsAt) : start + SESSION_WITHOUT_END;
  if (now >= start - 2 * HOUR && now <= end) return { type: 'gate', item };
  if (now >= eveStart(start) && now < start - 2 * HOUR) return { type: 'offline', item };
  return null;
}

/**
 * Cartões de "Agora" (D27): cada um aparece e some sozinho pela janela do horário. `started` são
 * os horários em que o prestador já tocou "Iniciar serviço" neste aparelho.
 */
export function agoraCards(
  items: PartnerTodayItem[],
  nowMs: number,
  started: ReadonlySet<string> = new Set()
): AgoraCard[] {
  return items
    .map((item) =>
      item.kind === 'slot' ? slotCard(item, nowMs, started.has(item.id)) : sessionCard(item, nowMs)
    )
    .filter((card): card is AgoraCard => card !== null);
}
