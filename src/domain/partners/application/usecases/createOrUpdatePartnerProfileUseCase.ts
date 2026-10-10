import { partnerAdapter } from '../../factory';
import type { PartnerRegistrationPayload } from '../../types/partner';

export async function createOrUpdatePartnerProfileUseCase(
  formData: PartnerRegistrationPayload
): Promise<void> {
  return partnerAdapter.registerPartner(formData);
}
