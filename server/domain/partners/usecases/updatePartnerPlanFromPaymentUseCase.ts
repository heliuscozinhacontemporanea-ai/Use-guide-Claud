import { partnerService } from '../factory';

export async function updatePartnerPlanFromPaymentUseCase(params: {
  partnerId: string;
  planId: string;
  billingCycle: 'monthly' | 'quarterly' | 'semiannual';
  paymentId: string;
}): Promise<void> {
  const now = new Date();
  const days =
    params.billingCycle === 'semiannual'
      ? 180
      : params.billingCycle === 'quarterly'
        ? 90
        : 30;
  const verifiedUntil = new Date(
    now.getTime() + days * 24 * 60 * 60 * 1000
  ).toISOString();

  const verificationType =
    params.billingCycle === 'semiannual' ? 'semi-annual' : 'monthly';

  await partnerService.updatePartnerVerificationProfile(params.partnerId, {
    isVerified: true,
    verifiedUntil,
    verificationType,
    isVerificationSuspended: false,
  });
}
