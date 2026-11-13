/** Pessoa da equipe da portaria de um evento, como o dono vê (C1). */
export interface GateStaffMemberView {
  id: string;
  username: string | null;
  displayName: string | null;
  status: 'invited' | 'active';
  acceptedAt: string | null;
  /** Entradas que a pessoa liberou (só no evento) e a hora da última; `null` na atração. */
  entries: number | null;
  lastEntryAt: string | null;
}

export type GateScopeType = 'event' | 'place';

/** Evento ou atração do dono em que dá para montar equipe. */
export interface GateTarget {
  type: GateScopeType;
  id: string;
  title: string;
}

export interface OwnerGateStaff {
  targets: GateTarget[];
  groups: Array<GateTarget & { members: GateStaffMemberView[] }>;
}

/** Evento em que a pessoa foi convidada ou está na equipe, com as sessões pela frente (C1). */
export interface MyGate {
  memberId: string;
  status: 'invited' | 'active';
  /** Evento (sessões) ou atração (horários de entrada). */
  type: GateScopeType;
  /** ID do evento ou do lugar. */
  eventId: string;
  title: string;
  business: string | null;
  timeZone: string;
  sessions: Array<{
    id: string;
    startsAt: string;
    endsAt: string | null;
    salesEndsAt: string;
    /** Só na atração: a oferta de entrada do horário. */
    offerId?: string;
  }>;
}

export interface GateCounts {
  total: number;
  entered: number;
}
