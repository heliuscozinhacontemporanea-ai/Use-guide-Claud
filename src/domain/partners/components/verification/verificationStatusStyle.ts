import type { ListingVerificationView } from '../../types/listingVerification';

export const VERIFICATION_STATUS_STYLE: Record<ListingVerificationView['status'], string> = {
  not_submitted: 'bg-white/5 text-white/70 border-white/10',
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};
