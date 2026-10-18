import type { PartnerVerificationData } from '../types/partnerTypes';

const ADMIN_VERIFICATION_DAYS = 365;
const DAY_MS = 86_400_000;

function isFuture(iso: string | null, now: Date): boolean {
  return Boolean(iso) && new Date(iso as string).getTime() > now.getTime();
}

/** Plano pago ou trial em vigor: o admin nunca altera tipo nem validade dele. */
export function hasActivePlanVerification(current: PartnerVerificationData, now: Date): boolean {
  return (
    current.isVerified &&
    current.verificationType !== null &&
    current.verificationType !== 'admin' &&
    isFuture(current.verifiedUntil, now)
  );
}

/**
 * Selo concedido ou retirado pelo admin. Com plano em vigor, só liga ou desliga a suspensão do
 * selo, preservando o plano; sem plano, concede o selo `admin` por um ano ou o remove.
 */
export function resolveAdminVerification(
  current: PartnerVerificationData,
  grant: boolean,
  now: Date
): PartnerVerificationData {
  if (hasActivePlanVerification(current, now)) {
    return { ...current, isVerificationSuspended: !grant };
  }
  if (!grant) {
    return {
      isVerified: false,
      verifiedUntil: null,
      verificationType: null,
      isVerificationSuspended: false,
    };
  }
  if (
    current.isVerified &&
    current.verificationType === 'admin' &&
    isFuture(current.verifiedUntil, now)
  ) {
    return { ...current, isVerificationSuspended: false };
  }
  return {
    isVerified: true,
    verifiedUntil: new Date(now.getTime() + ADMIN_VERIFICATION_DAYS * DAY_MS).toISOString(),
    verificationType: 'admin',
    isVerificationSuspended: false,
  };
}
