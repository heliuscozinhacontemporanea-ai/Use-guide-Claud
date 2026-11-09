/** Número curto da reserva para as mensagens prontas (C2): os 6 últimos caracteres do id. */
export function bookingReference(bookingId: string): string {
  return bookingId
    .replace(/[^a-z0-9]/gi, '')
    .slice(-6)
    .toUpperCase();
}
