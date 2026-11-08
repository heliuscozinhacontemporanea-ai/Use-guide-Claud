import type { StatusTone } from '../../../ui/components/StatusText';
import type { CourtesyRowStatus } from '../types/courtesy';

/** Cor do status na lista de convidados (p13): verde-menta entrou, ciano na carteira. */
export const COURTESY_TONE: Record<CourtesyRowStatus, StatusTone> = {
  checked_in: 'success',
  in_wallet: 'info',
  link_pending: 'warn',
  link_expired: 'muted',
  canceled: 'muted',
};

export function isCourtesyActive(status: CourtesyRowStatus): boolean {
  return status === 'in_wallet' || status === 'link_pending' || status === 'checked_in';
}
