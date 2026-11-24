/** Nome de usuário (D21): 3 a 30 caracteres a–z, 0–9, ponto e sublinhado; sem ponto no início, no fim ou repetido. */
const USERNAME_PATTERN = /^(?!\.)(?!.*\.\.)(?!.*\.$)[a-z0-9._]{3,30}$/;

export const USERNAME_CHANGE_INTERVAL_DAYS = 30;
export const USERNAME_RELEASE_DAYS = 14;

/**
 * Aceita `@` na frente e maiúsculas; devolve o nome comparável ou null se o formato não for válido.
 * Os nomes reservados (D35, item 10) são conferidos à parte, com código próprio.
 */
export function normalizeUsername(input: string): string | null {
  const value = input.trim().replace(/^@/, '').toLowerCase();
  return USERNAME_PATTERN.test(value) ? value : null;
}

/** Base da sugestão a partir do nome, sem acentos nem espaços (ex.: "Ana Souza" → "anasouza"). */
export function usernameBaseFromName(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 24);
  return base.length >= 3 ? base : `viajante${base}`.slice(0, 24);
}
