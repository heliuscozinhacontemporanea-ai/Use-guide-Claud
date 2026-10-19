import { PartnerDomainError } from '../errors/partnerDomainError';
import type {
  PartnerBusiness,
  PartnerBusinessType,
  PartnerProfileDTO,
  PartnerStatus,
  PartnerVerificationType,
  PublicPartnerProfileDTO,
} from '../types/partnerTypes';

function toPartnerStatus(value: unknown): PartnerStatus {
  if (value === 'active' || value === 'pending' || value === 'suspended') {
    return value;
  }

  throw new PartnerDomainError(
    'INVALID_ARGUMENT',
    'Status Partner inválido persistido no Firestore.'
  );
}

function toPartnerBusinessType(value: unknown): PartnerBusinessType {
  if (value === 'item' || value === 'event') {
    return value;
  }

  throw new PartnerDomainError('INVALID_ARGUMENT', 'Tipo de negócio Parceiro inválido.');
}

function toPartnerVerificationType(value: unknown): PartnerVerificationType {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    value === 'trial' ||
    value === 'monthly' ||
    value === 'semi-annual' ||
    value === 'annual' ||
    value === 'admin'
  ) {
    return value;
  }

  throw new PartnerDomainError(
    'INVALID_ARGUMENT',
    'Tipo de verificação Partner inválido persistido no Firestore.'
  );
}

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

export function toPartnerProfileDTO(id: string, raw: Record<string, unknown>): PartnerProfileDTO {
  const businesses = Array.isArray(raw.businesses)
    ? (raw.businesses as PartnerBusiness[]).map((b) => ({
        businessId: String(b?.businessId || ''),
        businessName: String(b?.businessName || ''),
        type: toPartnerBusinessType(b?.type),
      }))
    : [];

  return {
    id,
    businesses,
    cpfCnpj: typeof raw.cpfCnpj === 'string' ? raw.cpfCnpj : undefined,
    isVerified: raw.isVerified === true,
    verifiedUntil: toIsoString(raw.verifiedUntil),
    verificationType: toPartnerVerificationType(raw.verificationType),
    isVerificationSuspended: raw.isVerificationSuspended === true,
    status: toPartnerStatus(raw.status),
    hasUsedTrial: raw.hasUsedTrial === true,
    termsAccepted: raw.termsAccepted === true,
    createdAt: toIsoString(raw.createdAt) || undefined,
    updatedAt: toIsoString(raw.updatedAt) || undefined,
  };
}

export function toPublicPartnerProfileDTO(
  partnerId: string,
  raw: Record<string, unknown>
): PublicPartnerProfileDTO {
  const businesses = Array.isArray(raw.businesses)
    ? (raw.businesses as PartnerBusiness[]).map((business) => ({
        businessId: String(business?.businessId ?? ''),
        businessName: String(business?.businessName ?? ''),
        type: toPartnerBusinessType(business?.type),
      }))
    : [];

  return {
    id: partnerId,
    businesses,
    isVerified: raw.isVerified === true,
    verifiedUntil: raw.isVerified === true ? toIsoString(raw.verifiedUntil) : null,
    isVerificationSuspended: raw.isVerificationSuspended === true,
    status: toPartnerStatus(raw.status),
  };
}
