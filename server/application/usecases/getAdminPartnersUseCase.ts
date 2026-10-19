import { getAllPartnersUseCase } from '../../domain/partners';
import type { PartnerProfileDTO } from '../../domain/partners';
import { getUserProfilesBatchUseCase } from '../../domain/users';

export interface AdminPartnerSummaryDTO {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Estabelecimentos e eventos vinculados ao parceiro (a categoria é de cada estabelecimento). */
  listingsCount: number;
  status: PartnerProfileDTO['status'];
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: PartnerProfileDTO['verificationType'];
  isVerificationSuspended: boolean;
}

export async function getAdminPartnersUseCase(): Promise<AdminPartnerSummaryDTO[]> {
  const partners = await getAllPartnersUseCase();
  if (partners.length === 0) {
    return [];
  }

  const profilesByUid = await getUserProfilesBatchUseCase(partners.map((partner) => partner.id));

  return partners.map((partner) => {
    const user = profilesByUid[partner.id];
    return {
      id: partner.id,
      businessName: partner.businesses?.[0]?.businessName || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      listingsCount: partner.businesses?.length ?? 0,
      status: partner.status,
      isVerified: partner.isVerified,
      verifiedUntil: partner.verifiedUntil,
      verificationType: partner.verificationType,
      isVerificationSuspended: partner.isVerificationSuspended,
    };
  });
}
