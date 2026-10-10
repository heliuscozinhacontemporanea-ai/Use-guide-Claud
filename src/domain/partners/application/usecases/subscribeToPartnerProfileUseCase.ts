import { z } from 'zod';
import { subscribeToDocumentUseCase } from '../../../database';
import type { PublicPartnerProfile } from '../../types/partner';

const subscribeSchema = z.object({
  partnerId: z.string().min(1),
});

export function subscribeToPartnerProfileUseCase(
  partnerId: string,
  callback: (data: PublicPartnerProfile | null) => void,
  onError?: (error: Error) => void
): () => void {
  subscribeSchema.parse({
    partnerId,
  });
  return subscribeToDocumentUseCase<PublicPartnerProfile>(
    'publicPartners',
    partnerId,
    callback,
    onError
  );
}
