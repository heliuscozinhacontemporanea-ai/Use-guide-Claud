/** Cortesias do organizador (D27), como a API devolve. */
export type CourtesyRowStatus =
  | 'checked_in'
  | 'in_wallet'
  | 'link_pending'
  | 'link_expired'
  | 'canceled';

export interface CourtesyRow {
  id: string;
  occurrenceId: string;
  channel: 'username' | 'link';
  status: CourtesyRowStatus;
  guest: { username: string | null; displayName: string | null } | null;
  checkedInAt: string | null;
  linkExpiresAt: string | null;
  createdAt: string;
}

export interface CourtesyLinkCreated {
  courtesyId: string;
  token: string;
  expiresAt: string;
}

export interface CourtesyLinkPreview {
  businessName: string | null;
  eventTitle: string;
  startsAt: string;
  locationName: string | null;
  timeZone?: string;
  city?: string;
  expiresAt: string;
}
