/** Pessoa da equipe da portaria de um evento, como o dono vê (C1). */
export interface GateStaffMemberView {
  id: string;
  username: string | null;
  displayName: string | null;
  status: 'invited' | 'active';
  acceptedAt: string | null;
  /** Entradas que a pessoa liberou neste evento e a hora da última. */
  entries: number;
  lastEntryAt: string | null;
}

export interface OwnerGateStaff {
  /** Eventos do dono que podem receber equipe. */
  events: Array<{ id: string; title: string }>;
  groups: Array<{ eventId: string; title: string; members: GateStaffMemberView[] }>;
}

/** Evento em que a pessoa foi convidada ou está na equipe, com as sessões pela frente (C1). */
export interface MyGate {
  memberId: string;
  status: 'invited' | 'active';
  eventId: string;
  title: string;
  business: string | null;
  timeZone: string;
  sessions: Array<{ id: string; startsAt: string; endsAt: string | null; salesEndsAt: string }>;
}

export interface GateCounts {
  total: number;
  entered: number;
}
