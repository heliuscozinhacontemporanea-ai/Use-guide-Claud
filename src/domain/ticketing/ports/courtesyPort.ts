import type { CourtesyLinkCreated, CourtesyLinkPreview, CourtesyRow } from '../types/courtesy';

/** Cortesias (D27). Erros chegam como `Error(code)` para a tela traduzir (§12.5). */
export interface CourtesyPort {
  listEventCourtesies(eventListingId: string): Promise<CourtesyRow[]>;
  inviteCourtesy(occurrenceId: string, username: string): Promise<CourtesyRow>;
  createCourtesyLink(occurrenceId: string): Promise<CourtesyLinkCreated>;
  cancelCourtesy(courtesyId: string): Promise<void>;
  previewCourtesyLink(courtesyId: string, token: string): Promise<CourtesyLinkPreview>;
  acceptCourtesyLink(courtesyId: string, token: string): Promise<{ ticketId: string | null }>;
}
