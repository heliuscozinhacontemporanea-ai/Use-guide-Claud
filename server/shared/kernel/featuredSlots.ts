const DEFAULT_FEATURED_SLOTS = 3;
const MAX_FEATURED_SLOTS = 12;

/**
 * Vagas de "Destaque" por lista (D11), lidas de `FEATURED_SLOTS_PER_LIST`. Sem valor vale 3;
 * valor inválido falha na chamada (§2.2.4) em vez de publicar um número de vagas não configurado.
 */
export function resolveFeaturedSlotsPerList(...args: [raw?: string | undefined]): number {
  const raw = args.length > 0 ? args[0] : process.env.FEATURED_SLOTS_PER_LIST;
  const trimmed = (raw ?? '').trim();
  if (trimmed === '') return DEFAULT_FEATURED_SLOTS;
  const slots = Number(trimmed);
  if (!Number.isInteger(slots) || slots < 0 || slots > MAX_FEATURED_SLOTS) {
    throw new Error(`FEATURED_SLOTS_PER_LIST deve ser um inteiro entre 0 e ${MAX_FEATURED_SLOTS}.`);
  }
  return slots;
}
