import {
  linkBusinessUseCase,
  type PartnerBusiness,
  unlinkBusinessUseCase,
  updateBusinessUseCase,
} from '../../domain/partners';
import { isUseGuideOwner } from '../../shared/kernel/useGuideOwner';

// O dono Use Guide não tem perfil de parceiro (escolhas da F4): os vínculos do anúncio e do evento
// com o perfil existem só para o dono parceiro.

export async function linkOwnerBusiness(ownerId: string, business: PartnerBusiness): Promise<void> {
  if (isUseGuideOwner(ownerId)) return;
  await linkBusinessUseCase(ownerId, business);
}

export async function unlinkOwnerBusiness(ownerId: string, businessId: string): Promise<void> {
  if (isUseGuideOwner(ownerId)) return;
  await unlinkBusinessUseCase(ownerId, businessId);
}

export async function renameOwnerBusiness(
  ownerId: string,
  business: PartnerBusiness
): Promise<void> {
  if (isUseGuideOwner(ownerId)) return;
  await updateBusinessUseCase(ownerId, business);
}
