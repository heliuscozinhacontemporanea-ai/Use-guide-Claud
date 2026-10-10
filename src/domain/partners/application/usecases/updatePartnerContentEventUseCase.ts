import { z } from 'zod';
import { partnerContentAdapter } from '../../factory';
import type { PartnerContentEventInput } from '../../types/partnerContent';

const schema = z.object({
  id: z.string().min(1),
  data: z.object({}).passthrough(),
});

export async function updatePartnerContentEventUseCase(
  id: string,
  data: Partial<PartnerContentEventInput>
): Promise<void> {
  schema.parse({ id, data });
  return partnerContentAdapter.updateEvent(id, data);
}
