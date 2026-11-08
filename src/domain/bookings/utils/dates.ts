import {
  isoToZonedDateTime,
  PLATFORM_TIME_ZONE,
  zonedDateTimeToIso,
  zonedDayKey,
} from '../../../shared/utils/timeZones';

// Horário de passeio é sempre o do lugar da oferta (D28, AGENTS.md §1 e §12.4); sem fuso, o da plataforma.
const DAY_MS = 86_400_000;

export function formatSlotDateTime(iso: string, locale: string, timeZone = PLATFORM_TIME_ZONE) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatSlotTime(iso: string, locale: string, timeZone = PLATFORM_TIME_ZONE) {
  return new Intl.DateTimeFormat(locale, { timeZone, hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso)
  );
}

export function formatDayLabel(iso: string, locale: string, timeZone = PLATFORM_TIME_ZONE) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(iso));
}

/** Data local do lugar (AAAA-MM-DD) de um instante; agrupa horários por dia. */
export function placeDateKey(iso: string, timeZone = PLATFORM_TIME_ZONE): string {
  return zonedDayKey(iso, timeZone);
}

/** Início (domingo 00:00 na hora do lugar) da semana que contém `reference`, em UTC. */
export function startOfPlaceWeek(reference: Date, timeZone = PLATFORM_TIME_ZONE): Date {
  const local = isoToZonedDateTime(reference.toISOString(), timeZone).slice(0, 10);
  const weekday = new Date(`${local}T00:00:00.000Z`).getUTCDay();
  const sunday = new Date(Date.parse(`${local}T00:00:00.000Z`) - weekday * DAY_MS);
  return new Date(zonedDateTimeToIso(`${sunday.toISOString().slice(0, 10)}T00:00`, timeZone));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Converte "AAAA-MM-DDTHH:MM" digitado na hora do lugar em ISO UTC. */
export function placeInputToIso(value: string, timeZone = PLATFORM_TIME_ZONE): string | null {
  return zonedDateTimeToIso(value, timeZone) || null;
}
