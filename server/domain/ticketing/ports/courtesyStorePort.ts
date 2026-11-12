import type {
  CourtesyChannel,
  CourtesyGuest,
  CourtesyTicketDraft,
  EventCourtesy,
} from '../types/courtesyTypes';

export interface IssueCourtesyInput {
  eventListingId: string;
  occurrenceId: string;
  occurrenceCapacity: number;
  invitedBy: string;
  channel: CourtesyChannel;
  /** Com @: a pessoa e o ingresso. Com link: os dois ficam para o resgate. */
  guest: CourtesyGuest | null;
  ticket: CourtesyTicketDraft | null;
  linkTokenHash: string | null;
  linkExpiresAt: string | null;
  nowIso: string;
}

export interface ClaimCourtesyLinkInput {
  courtesyId: string;
  guest: CourtesyGuest;
  ticket: CourtesyTicketDraft;
  nowIso: string;
}

/**
 * Cortesias (D27). Cada escrita é uma transação: o lugar na sessão, a trava de uma por pessoa por
 * evento, o ingresso e a cortesia mudam juntos.
 */
export interface CourtesyStorePort {
  issue(input: IssueCourtesyInput): Promise<EventCourtesy>;
  claimLink(input: ClaimCourtesyLinkInput): Promise<EventCourtesy>;
  cancel(courtesyId: string, nowIso: string): Promise<EventCourtesy>;
  get(courtesyId: string): Promise<EventCourtesy | null>;
  listByEvent(eventListingId: string, limit: number): Promise<EventCourtesy[]>;
  /** Lugares ocupados por cortesias (emitidas e links abertos) na sessão. */
  countHeldByOccurrence(occurrenceId: string): Promise<number>;
  /** Convidados da sessão que já passaram pela portaria (C7). */
  countEnteredByOccurrence(occurrenceId: string): Promise<number>;
  /** Exclusão de conta: apaga @ e nome guardados na lista do organizador (§7.5). */
  anonymizeGuest(uid: string): Promise<number>;
}
