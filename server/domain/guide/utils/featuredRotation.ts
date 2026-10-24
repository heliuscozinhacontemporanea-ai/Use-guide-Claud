const BUSINESS_TIME_ZONE = 'America/Fortaleza';

/** Dia do rodízio no fuso do negócio, para que a troca aconteça à meia-noite de Jericoacoara. */
export function featuredRotationDay(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

// FNV-1a de 32 bits: só espalha a semente; o sorteio não protege nada e não precisa de criptografia.
function hashSeed(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// mulberry32: gerador pequeno e determinístico; a mesma semente gera o mesmo sorteio.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sorteio do destaque com semente fixa do dia e da lista (D11): o resultado não depende da ordem
 * de leitura dos candidatos e é o mesmo para qualquer execução do job no mesmo dia.
 */
export function pickFeaturedListingIds(
  candidateIds: readonly string[],
  seedKey: string,
  slots: number
): string[] {
  const ids = [...new Set(candidateIds)].sort();
  const random = seededRandom(hashSeed(seedKey));
  for (let index = ids.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    const current = ids[index];
    const picked = ids[swap];
    if (current === undefined || picked === undefined) continue;
    ids[index] = picked;
    ids[swap] = current;
  }
  return ids.slice(0, Math.max(0, slots));
}
