import type { ListingPlanView } from '../types/listingPlan';

export type ListingPlanChipStatus =
  | 'none'
  | 'trial'
  | 'active'
  | 'admin'
  | 'suspended'
  | 'pendingSeal';

/** Resumo do plano para o selo do cadastro no painel; o selo público segue plano + verificação (D11). */
export function listingPlanChipStatus(view: ListingPlanView): ListingPlanChipStatus {
  if (!view.planActive) return 'none';
  if (view.sealSuspended) return 'suspended';
  if (!view.seal.isVerified) return 'pendingSeal';
  if (view.planType === 'trial') return 'trial';
  if (view.planType === 'admin') return 'admin';
  return 'active';
}

/** Data do plano no fuso do negócio (AGENTS.md §1, §12.4). */
export function formatPlanDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'America/Fortaleza',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
