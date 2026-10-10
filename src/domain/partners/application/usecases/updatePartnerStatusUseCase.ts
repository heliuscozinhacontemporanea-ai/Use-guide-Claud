import { z } from 'zod';
import { partnerAdapter } from '../../factory';

const updateStatusSchema = z.object({
  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
  status: z.enum(['active', 'pending', 'suspended']),
});

export async function updatePartnerStatusUseCase(
  partnerId: string,
  status: 'active' | 'pending' | 'suspended'
): Promise<void> {
  updateStatusSchema.parse({ partnerId, status });
  return partnerAdapter.updatePartnerStatus(partnerId, status);
}
