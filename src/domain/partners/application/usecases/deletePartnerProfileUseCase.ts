import { z } from 'zod';
import { partnerAdapter } from '../../factory';

const deleteProfileSchema = z.object({
  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
});

export async function deletePartnerProfileUseCase(partnerId: string): Promise<void> {
  deleteProfileSchema.parse({ partnerId });
  return partnerAdapter.deletePartnerProfile(partnerId);
}
