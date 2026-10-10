import { z } from 'zod';
import { partnerAdapter } from '../../factory';
import { PartnerProfile } from '../../types/partner';

const getProfileInputSchema = z.object({
  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
});

export async function getPartnerProfileUseCase(partnerId: string): Promise<PartnerProfile | null> {
  getProfileInputSchema.parse({ partnerId });
  return partnerAdapter.getPartnerProfile(partnerId);
}
