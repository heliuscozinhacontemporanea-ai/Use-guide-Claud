import { whatsAppUrl } from '../../../../shared/utils/phone';
import { bookingsApi } from '../../factory';

/**
 * Link do WhatsApp com mensagem pronta para o outro lado da reserva (C2/B37). O número só existe
 * no link: a tela nunca o mostra escrito. `null` quando o outro lado não deixou telefone.
 */
export async function openBookingContactUseCase(
  bookingId: string,
  message: string
): Promise<string | null> {
  const { phone } = await bookingsApi.getBookingContact(bookingId);
  return phone ? whatsAppUrl(phone, message) : null;
}
