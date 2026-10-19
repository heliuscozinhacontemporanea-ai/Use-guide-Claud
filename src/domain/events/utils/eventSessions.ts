import type { EventSessionDraft } from '../types/eventSession';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export interface EventSessionChanges {
  toCreate: EventSessionDraft[];
  toUpdate: Array<EventSessionDraft & { id: string }>;
  toDeleteIds: string[];
}

/** Compara as sessões salvas com as editadas: o que criar, alterar e apagar. */
export function planEventSessionChanges(
  savedIds: string[],
  sessions: EventSessionDraft[]
): EventSessionChanges {
  const keptIds = new Set(sessions.map((session) => session.id).filter(Boolean));
  return {
    toCreate: sessions.filter((session) => !session.id),
    toUpdate: sessions.filter((session): session is EventSessionDraft & { id: string } =>
      Boolean(session.id)
    ),
    toDeleteIds: savedIds.filter((id) => !keptIds.has(id)),
  };
}

/** Mensagem do primeiro problema encontrado, ou `null` se as sessões estão válidas. */
export function validateEventSessions(sessions: EventSessionDraft[]): string | null {
  if (sessions.length === 0) return 'Adicione ao menos uma sessão ao evento.';
  for (const [index, session] of sessions.entries()) {
    const start = new Date(session.startsAt).getTime();
    const end = new Date(session.endsAt).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return `Informe início e término da sessão ${index + 1}.`;
    }
    if (end <= start) {
      return `O término da sessão ${index + 1} deve ser depois do início.`;
    }
    if (!Number.isInteger(session.capacity) || session.capacity < 1) {
      return `A capacidade da sessão ${index + 1} deve ser de pelo menos 1 pessoa.`;
    }
  }
  return null;
}

/** Período do evento na agenda: do início da primeira sessão ao término da última. */
export function eventDateRangeFromSessions(sessions: EventSessionDraft[]): {
  date: string;
  endDate: string;
} {
  const starts = sessions.map((session) => new Date(session.startsAt).getTime());
  const ends = sessions.map((session) => new Date(session.endsAt).getTime());
  return {
    date: new Date(Math.min(...starts)).toISOString(),
    endDate: new Date(Math.max(...ends)).toISOString(),
  };
}

/** Sessão sugerida ao adicionar: começa agora e dura três horas. */
export function newEventSessionDraft(now: Date = new Date()): EventSessionDraft {
  return {
    startsAt: now.toISOString(),
    endsAt: new Date(now.getTime() + THREE_HOURS_MS).toISOString(),
    capacity: 100,
  };
}
