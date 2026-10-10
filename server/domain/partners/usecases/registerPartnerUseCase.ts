import { partnerService } from '../factory';
import type { PartnerRegistrationData, RegisterPartnerResult } from '../types/partnerTypes';

export async function registerPartnerUseCase(
  uid: string,
  data: PartnerRegistrationData
): Promise<RegisterPartnerResult> {
  if (!uid.trim()) {
    throw new Error('UID do usuário é obrigatório');
  }
  return partnerService.registerPartner(uid, data);
}
