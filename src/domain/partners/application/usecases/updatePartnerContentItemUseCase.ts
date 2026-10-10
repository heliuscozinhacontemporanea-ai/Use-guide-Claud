import { z } from 'zod';
import { partnerContentAdapter } from '../../factory';
import type { PartnerContentItemInput } from '../../types/partnerContent';

const schema = z.object({
  id: z.string().min(1),
  data: z.object({}).passthrough(),
});

export async function updatePartnerContentItemUseCase(
  id: string,
  data: Partial<PartnerContentItemInput>
): Promise<void> {
  schema.parse({ id, data });
  return partnerContentAdapter.updateItem(id, data);
}
