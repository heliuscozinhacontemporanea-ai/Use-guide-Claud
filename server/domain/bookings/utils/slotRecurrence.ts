import { PLATFORM_TIME_ZONE, zonedDateTimeToIso } from '../../../shared/kernel/timeZones';
import { BookingDomainError } from '../errors/bookingDomainError';

const MAX_DAYS = 370;

export interface SlotRecurrence {
  startDate: string;
  endDate: string;
  weekdays: number[];
  times: string[];
}

function parseDate(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new BookingDomainError('VALIDATION_ERROR', 'Data inválida.');
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function parseTime(value: string): { hours: number; minutes: number } {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) throw new BookingDomainError('VALIDATION_ERROR', 'Horário inválido.');
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

/** Converte data e hora locais do lugar (fuso IANA) em ISO UTC. */
export function placeLocalToUtcIso(date: string, time: string, timeZone: string): string {
  parseDate(date);
  parseTime(time);
  return zonedDateTimeToIso(`${date}T${time}`, timeZone);
}

/**
 * Expande a recorrência (dias da semana 0=domingo … 6=sábado, horários na hora do lugar) em instantes
 * UTC. Sem fuso do estabelecimento, usa o da plataforma (D28).
 */
export function expandSlotRecurrence(
  recurrence: SlotRecurrence,
  timeZone: string = PLATFORM_TIME_ZONE
): string[] {
  const start = parseDate(recurrence.startDate);
  const end = parseDate(recurrence.endDate);
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  const days = Math.round((endUtc - startUtc) / 86_400_000);
  if (days < 0 || days > MAX_DAYS) {
    throw new BookingDomainError('VALIDATION_ERROR', 'Período da recorrência inválido.');
  }
  const weekdays = new Set(recurrence.weekdays);
  const result: string[] = [];
  for (let offset = 0; offset <= days; offset += 1) {
    const current = new Date(startUtc + offset * 86_400_000);
    if (!weekdays.has(current.getUTCDay())) continue;
    const date = current.toISOString().slice(0, 10);
    for (const time of recurrence.times) {
      result.push(placeLocalToUtcIso(date, time, timeZone));
    }
  }
  return result;
}
