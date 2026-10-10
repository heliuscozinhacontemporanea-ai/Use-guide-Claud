import { z } from 'zod';
import { partnerContentAdapter } from '../../factory';

const schema = z.object({
  id: z.string().min(1),
});

export async function deletePartnerContentItemUseCase(id: string): Promise<void> {
  schema.parse({ id });
  return partnerContentAdapter.deleteItem(id);
}
