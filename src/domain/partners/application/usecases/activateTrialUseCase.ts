import { z } from 'zod';
import { partnerAdapter } from '../../factory';

const activateTrialInputSchema = z.object({
  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
});

export async function activateTrialUseCase(partnerId: string): Promise<void> {
  activateTrialInputSchema.parse({ partnerId });
  return partnerAdapter.activateTrial(partnerId);
}
