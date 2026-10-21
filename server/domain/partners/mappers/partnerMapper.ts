import { PartnerDomainError } from '../errors/partnerDomainError';
import type {
  PartnerBusiness,
  PartnerBusinessType,
  PartnerProfileDTO,
  PartnerStatus,
  PublicPartnerProfileDTO,
} from '../types/partnerTypes';

function toPartnerStatus(value: unknown): PartnerStatus {
  if (value === 'active' || value === 'suspended') {
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
    status: toPartnerStatus(raw.status),
  };
}
