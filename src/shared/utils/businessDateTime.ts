// Fortaleza é UTC−3 fixo, sem horário de verão (AGENTS.md §1): campos de data e hora dos
// formulários mostram e recebem a hora do negócio, qualquer que seja o fuso do navegador.
const BUSINESS_OFFSET_MS = 3 * 60 * 60 * 1000;
const INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** "AAAA-MM-DDTHH:MM" digitado em hora de Fortaleza → ISO UTC; vazio se inválido. */
export function businessDateTimeToIso(value: string): string {
  const match = INPUT_PATTERN.exec(value);
  if (!match) {
    return '';
  }
  const [, y, m, d, h, min] = match.map(Number) as [number, number, number, number, number, number];
  return new Date(Date.UTC(y, m - 1, d, h, min) + BUSINESS_OFFSET_MS).toISOString();
}

/** ISO → "AAAA-MM-DDTHH:MM" em hora de Fortaleza, para `<input type="datetime-local">`. */
export function isoToBusinessDateTime(value?: string): string {
  if (!value) {
    return '';
  }
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return '';
  }
  return new Date(time - BUSINESS_OFFSET_MS).toISOString().slice(0, 16);
}

const BUSINESS_TIME_ZONE = 'America/Fortaleza';

/** Data no fuso do negócio (AGENTS.md §12.4), com o formato que a tela pedir. */
export function formatBusinessDate(
  iso: string,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, { timeZone: BUSINESS_TIME_ZONE, ...options }).format(
    new Date(iso)
  );
}

/** "28 de out." — linhas curtas de status e prazo. */
export function formatBusinessDay(iso: string, locale: string): string {
  return formatBusinessDate(iso, locale, { day: 'numeric', month: 'short' });
}

/** "seg., 26 de out." — data de uma compra ou serviço. */
export function formatBusinessWeekday(iso: string, locale: string): string {
  return formatBusinessDate(iso, locale, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** "26 de out., 14:30" — data e hora de um registro. */
export function formatBusinessDateTime(iso: string, locale: string): string {
  return formatBusinessDate(iso, locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
