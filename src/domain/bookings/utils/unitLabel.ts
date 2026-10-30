import type { TFunction } from 'i18next';
import type { BookingSummary } from '../types/bookings';

const DAY_MS = 24 * 60 * 60_000;

/** Rótulo de uma unidade da reserva: o nome, "Pessoa 2" ou "Grupo" (D20). */
export function unitLabel(
  t: TFunction,
  booking: Pick<BookingSummary, 'sellingUnit' | 'participantsCount'>,
  unit: number,
  name?: string | null
): string {
  if (name) return name;
  if (booking.sellingUnit === 'group') {
    const tag = t('serviceProof.units.groupTag');
    return booking.participantsCount > 1 ? `${tag} ${unit + 1}` : tag;
  }
  return t('serviceProof.units.person', { n: unit + 1 });
}

/** Mesma regra do backend: o primeiro nome é livre; trocar, uma vez e até 24 h antes. */
export function canEditUnitName(
  booking: Pick<BookingSummary, 'requiresParticipantNames' | 'offer'>,
  pass: { name: string | null; nameChanged: boolean; checkedInAt: string | null },
  now: Date
): boolean {
  if (!booking.requiresParticipantNames || pass.checkedInAt) return false;
  if (!pass.name) return true;
  return !pass.nameChanged && now.getTime() < new Date(booking.offer.startsAt).getTime() - DAY_MS;
}
