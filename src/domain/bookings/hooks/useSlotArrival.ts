import { useCallback } from 'react';
import { currentLocation } from '../adapters/browserLocation';
import { recordSlotArrivalUseCase } from '../application/usecases/recordSlotArrivalUseCase';

/** "Cheguei" do horário inteiro (D27); devolve se a localização foi junto, para avisar quando não foi. */
export function useSlotArrival() {
  return useCallback(async (offerId: string, slotId: string): Promise<{ located: boolean }> => {
    const location = await currentLocation();
    await recordSlotArrivalUseCase(offerId, slotId, location ?? undefined);
    return { located: location !== null };
  }, []);
}
