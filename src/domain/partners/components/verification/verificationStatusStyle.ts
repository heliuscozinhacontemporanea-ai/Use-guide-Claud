import type { ListingVerificationView } from '../../types/listingVerification';

export const VERIFICATION_STATUS_STYLE: Record<ListingVerificationView['status'], string> = {
  not_submitted: 'bg-white/5 text-white/70 border-white/10',
  pending: 'bg-warn-soft text-warn border-warn-line',
  approved: 'bg-success-soft text-success border-success-line',
  rejected: 'bg-danger-soft text-danger border-danger-line',
};
