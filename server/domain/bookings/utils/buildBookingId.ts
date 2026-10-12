import { createHash } from 'node:crypto';

/** ID determinístico: a mesma tentativa (comprador + chave de idempotência) sempre cai na mesma reserva. */
export function buildBookingId(buyerId: string, idempotencyKey: string): string {
  const digest = createHash('sha256').update(`${buyerId}:${idempotencyKey}`).digest('hex');
  return `bk_${digest.slice(0, 32)}`;
}

/** Um horário por oferta e instante de início: criar o mesmo horário duas vezes não duplica. */
export function buildSlotId(offerId: string, startsAtIso: string): string {
  return `${offerId}_${Math.floor(new Date(startsAtIso).getTime() / 1000)}`;
}
