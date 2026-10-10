import { z } from 'zod';
import { partnerContentAdapter } from '../../factory';
import type { PartnerContentEventInput } from '../../types/partnerContent';

const schema = z.object({
  data: z.object({}).passthrough(),
});

export async function createPartnerContentEventUseCase(
  data: PartnerContentEventInput
): Promise<string> {
  schema.parse({ data });
  return partnerContentAdapter.createEvent(data);
}
