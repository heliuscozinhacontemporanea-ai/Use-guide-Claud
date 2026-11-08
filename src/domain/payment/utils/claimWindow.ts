import type { ClaimableSale } from '../types/saleClaims';

/** Janela de reclamação depois do fim do serviço, igual à do backend (D14). */
export const CLAIM_WINDOW_HOURS = 48;

/** Do início do serviço até 48 h depois do fim; quem decide é o backend. */
export function isWithinClaimWindow(sale: ClaimableSale, now: Date): boolean {
  const start = new Date(sale.serviceStartsAt).getTime();
  const end = new Date(sale.serviceEndsAt).getTime() + CLAIM_WINDOW_HOURS * 3_600_000;
  return now.getTime() >= start && now.getTime() <= end;
}
