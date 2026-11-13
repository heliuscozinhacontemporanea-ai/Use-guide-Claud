/** Onde a pessoa da equipe pode operar a portaria (C1): um evento ou uma atração. */
export type GateScopeType = 'event' | 'place';

export interface GateScope {
  type: GateScopeType;
  /** ID do evento (`events`) ou do item do guia da atração (`items`). */
  id: string;
}

export type GateStaffStatus = 'invited' | 'active' | 'declined' | 'removed' | 'left';

/**
 * Pessoa convidada para a portaria (C1). Classe Interna: só o backend lê e grava; o @ e o nome são
 * os públicos da pessoa. Não dá papel de parceiro: vale só para liberar entradas do escopo.
 */
export interface GateStaffMember {
  id: string;
  scope: GateScope;
  ownerId: string;
  staffUid: string;
  staff: { username: string | null; displayName: string | null };
  status: GateStaffStatus;
  createdAt: string;
  acceptedAt: string | null;
  /** Recusa, remoção pelo dono ou saída da pessoa. */
  endedAt: string | null;
}

/** Limite de pessoas (ativas ou convidadas) por evento ou atração. */
export const GATE_STAFF_LIMIT = 20;
