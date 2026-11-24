// Mesmo limite que o servidor aceita com folga (100); nome maior que isso vem errado do provedor.
const MAX_NAME = 50;

/**
 * Nome e sobrenome da conta nova a partir do nome da conta Google. O servidor exige os dois; quando
 * falta um, entra o padrão traduzido no idioma de quem está criando a conta.
 */
export function nameFromProvider(
  displayName: string | null,
  fallback: { first: string; last: string }
): { firstName: string; lastName: string } {
  const parts = (displayName ?? '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: (parts[0] || fallback.first).slice(0, MAX_NAME),
    lastName: (parts.slice(1).join(' ') || fallback.last).slice(0, MAX_NAME),
  };
}
