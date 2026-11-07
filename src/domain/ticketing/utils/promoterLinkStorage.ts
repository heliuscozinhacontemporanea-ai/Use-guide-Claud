const STORAGE_KEY = 'useguide.promoterLink';
// A venda vai para o último link usado nos últimos 7 dias (D27).
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PARAM = /^[a-z0-9._]{0,30}-?[A-Za-z0-9]{6}$/;

/** Guarda o `d` do link do divulgador no aparelho; o servidor confere na compra. */
export function rememberPromoterLink(value: string, now = Date.now()): void {
  const param = value.trim();
  if (!PARAM.test(param)) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ param, at: now }));
  } catch {
    // Sem armazenamento, a compra só sai sem divulgador.
  }
}

export function readPromoterLink(now = Date.now()): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { param?: unknown; at?: unknown };
    if (typeof saved.param !== 'string' || typeof saved.at !== 'number') return null;
    return now - saved.at <= TTL_MS ? saved.param : null;
  } catch {
    return null;
  }
}
