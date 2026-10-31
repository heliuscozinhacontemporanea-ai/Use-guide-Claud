/** Mesmas regras do backend (D21): a tela avisa antes de enviar; quem decide é o servidor. */
const USERNAME_PATTERN = /^(?!\.)(?!.*\.\.)(?!.*\.$)[a-z0-9._]{3,30}$/;
const CHANGE_INTERVAL_MS = 30 * 24 * 60 * 60_000;

export function normalizeUsernameInput(value: string): string {
  return value.trim().replace(/^@/, '').toLowerCase();
}

export function isUsernameFormatValid(value: string): boolean {
  return USERNAME_PATTERN.test(normalizeUsernameInput(value));
}

/** Data a partir da qual o @ pode ser trocado de novo; null se já pode. */
export function nextUsernameChangeAt(
  username: string | null | undefined,
  changedAt: string | null | undefined,
  now: Date
): Date | null {
  if (!username || !changedAt) return null;
  const next = new Date(new Date(changedAt).getTime() + CHANGE_INTERVAL_MS);
  return next > now ? next : null;
}
