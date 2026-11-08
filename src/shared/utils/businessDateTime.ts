import { capitalizeFirst } from './formatters';
import { isoToZonedDateTime, PLATFORM_TIME_ZONE, zonedDateTimeToIso } from './timeZones';

// A hora de um serviço é a do lugar onde ele acontece (D28, AGENTS.md §1): formulários e telas recebem
// o fuso do estabelecimento; sem ele, usam o da plataforma.

/** "AAAA-MM-DDTHH:MM" digitado na hora do lugar → ISO UTC; vazio se inválido. */
export function businessDateTimeToIso(value: string, timeZone = PLATFORM_TIME_ZONE): string {
  return zonedDateTimeToIso(value, timeZone);
}

/** ISO → "AAAA-MM-DDTHH:MM" na hora do lugar, para `<input type="datetime-local">`. */
export function isoToBusinessDateTime(value?: string, timeZone = PLATFORM_TIME_ZONE): string {
  return value ? isoToZonedDateTime(value, timeZone) : '';
}

/** Data na hora do lugar (AGENTS.md §12.4), com o formato que a tela pedir. */
export function formatBusinessDate(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
  timeZone = PLATFORM_TIME_ZONE
): string {
  return new Intl.DateTimeFormat(locale, { timeZone, ...options }).format(new Date(iso));
}

/** "28 de out." — linhas curtas de status e prazo. */
export function formatBusinessDay(iso: string, locale: string, timeZone?: string): string {
  return formatBusinessDate(iso, locale, { day: 'numeric', month: 'short' }, timeZone);
}

/** "seg., 26 de out." — data de uma compra ou serviço. */
export function formatBusinessWeekday(iso: string, locale: string, timeZone?: string): string {
  return formatBusinessDate(
    iso,
    locale,
    { weekday: 'short', day: 'numeric', month: 'short' },
    timeZone
  );
}

/** "26 de out., 14:30" — data e hora de um registro. */
export function formatBusinessDateTime(iso: string, locale: string, timeZone?: string): string {
  return formatBusinessDate(
    iso,
    locale,
    { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' },
    timeZone
  );
}

/** "Sáb., 20 de dez. · 20:00" — sessão de evento na hora do lugar. */
export function formatSessionLabel(iso: string, locale: string, timeZone?: string): string {
  const time = formatBusinessDate(iso, locale, { hour: '2-digit', minute: '2-digit' }, timeZone);
  return `${capitalizeFirst(formatBusinessWeekday(iso, locale, timeZone), locale)} · ${time}`;
}
