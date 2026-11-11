import type { PartnerGuestSession } from '../types/partnerHome';
import { addBusinessDays, businessDay } from './agendaCalendar';

const HOUR = 3_600_000;
// Sessão sem fim informado: a portaria fica aberta 6 h, como o código do ingresso (D20).
const SESSION_WITHOUT_END = 6 * HOUR;

export type GuestsPhase = 'before' | 'open' | 'after';

/**
 * Sessão do cartão Convidados (C7): primeiro a que está com a portaria aberta (2 h antes até o
 * fim), depois a que acabou (o resumo fica até o fim do dia seguinte) e, por último, a próxima.
 */
export function pickGuestSession(
  sessions: PartnerGuestSession[],
  nowMs: number,
  timeZone: string
): { session: PartnerGuestSession; phase: GuestsPhase } | null {
  const ranked = sessions.map((session) => {
    const start = new Date(session.startsAt).getTime();
    const end = session.endsAt ? new Date(session.endsAt).getTime() : start + SESSION_WITHOUT_END;
    const summaryUntil = addBusinessDays(businessDay(new Date(end), timeZone), 2, timeZone);
    const phase: GuestsPhase | null =
      nowMs < start - 2 * HOUR
        ? 'before'
        : nowMs <= end
          ? 'open'
          : nowMs < summaryUntil.getTime()
            ? 'after'
            : null;
    return { session, phase, start };
  });
  const of = (phase: GuestsPhase) => ranked.filter((item) => item.phase === phase);
  const chosen =
    of('open')[0] ?? of('after').sort((a, b) => b.start - a.start)[0] ?? of('before')[0];
  return chosen?.phase ? { session: chosen.session, phase: chosen.phase } : null;
}
