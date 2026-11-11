import { bookingsApi } from '../../factory';

/** "Iniciar serviço" do horário (C4); devolve a hora que o servidor guardou. */
export async function startSlotServiceUseCase(
  offerId: string,
  slotId: string
): Promise<string | null> {
  return (await bookingsApi.startSlotService(offerId, slotId)).startedAt;
}
