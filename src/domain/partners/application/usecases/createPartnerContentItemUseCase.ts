import { z } from 'zod';
import { partnerContentAdapter } from '../../factory';
import type { PartnerContentItemInput } from '../../types/partnerContent';

const schema = z.object({
  data: z.object({}).passthrough(),
});

export async function createPartnerContentItemUseCase(
  data: PartnerContentItemInput
): Promise<string> {
  schema.parse({ data });
  return partnerContentAdapter.createItem(data);
}
