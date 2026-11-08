import { bookingsApi } from '../../factory';

export async function getEntryVerificationKeysUseCase(
  offerId: string
): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>> {
  return bookingsApi.getEntryVerificationKeys(offerId);
}
