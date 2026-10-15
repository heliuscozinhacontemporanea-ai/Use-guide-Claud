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
