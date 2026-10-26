/** Datas do repasse no fuso do negócio (AGENTS.md §1, §12.4). */
export function formatFortalezaDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'America/Fortaleza',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const KNOWN_ERRORS = [
  'NOT_FOUND',
  'DEBT_ALREADY_SETTLED',
  'DEBT_SUSPENDED',
  'FORCE_MAJEURE_ALREADY_DECLARED',
  'FORCE_MAJEURE_TOO_LATE',
  'FORCE_MAJEURE_NOT_ALLOWED',
  'INVALID_PROOF_FILE',
  'IMAGE_TOO_LARGE',
  'INVALID_DOCUMENT_FILE',
];

/** Erros chegam pelo `code` da API (AGENTS.md §12.5); o texto vem das traduções. */
export function receivablesErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return `receivables.errors.${KNOWN_ERRORS.includes(code) ? code : 'UNAVAILABLE'}`;
}
