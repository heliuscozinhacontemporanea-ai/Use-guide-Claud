/** Nome de usuário (D21): 3 a 30 caracteres a–z, 0–9, ponto e sublinhado; sem ponto no início, no fim ou repetido. */
const USERNAME_PATTERN = /^(?!\.)(?!.*\.\.)(?!.*\.$)[a-z0-9._]{3,30}$/;

// Nomes que se passariam pela plataforma ou por funções do app.
const BLOCKED = new Set([
  'admin',
  'administrador',
  'root',
  'suporte',
  'support',
  'ajuda',
  'help',
  'useguide',
  'use.guide',
  'use_guide',
  'oficial',
  'official',
  'staff',
  'equipe',
  'moderador',
  'sistema',
  'system',
  'api',
  'www',
]);

export const USERNAME_CHANGE_INTERVAL_DAYS = 30;
export const USERNAME_RELEASE_DAYS = 14;

/** Aceita `@` na frente e maiúsculas; devolve o nome comparável ou null se não for válido. */
export function normalizeUsername(input: string): string | null {
  const value = input.trim().replace(/^@/, '').toLowerCase();
  if (!USERNAME_PATTERN.test(value)) return null;
  return BLOCKED.has(value) || value.startsWith('useguide') ? null : value;
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
