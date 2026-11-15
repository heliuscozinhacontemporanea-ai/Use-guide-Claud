/**
 * Movimento do app num lugar só (DESIGN.md §9.1, P10, D33). Valores medidos quadro a quadro no vídeo de
 * referência: a mola descreveu abrir página, voltar e abrir folha com erro de 0,1–0,2%.
 */

/** Mola padrão: criticamente amortecida (sem quique), ω ≈ 18,4/s; para em ~350 ms. */
export const SPRING = { type: 'spring', stiffness: 340, damping: 37, mass: 1 } as const;

/** "Reduzir movimento": o que é automático troca com esmaecido curto. */
export const FADE = { duration: 0.15, ease: 'easeOut' } as const;

/** Quanto a página de trás recua para a esquerda quando outra entra por cima. */
export const RECEDE_SHIFT = 0.26;

/** O fundo que vira cartão atrás de uma folha. */
export const CARD_SCALE = 0.9;
export const CARD_RADIUS_PX = 12;
/** Fresta do cartão que aparece acima da folha. */
export const CARD_PEEK_PX = 10;

/** Movimento mínimo para virar arraste (e cancelar o toque). */
export const DRAG_SLOP_PX = 8;
/** Folha fecha passado 1/3 da altura ou com arraste rápido; página volta passada a metade ou rápido. */
export const SHEET_CLOSE_FRACTION = 1 / 3;
export const SHEET_CLOSE_VELOCITY = 900;
export const PAGE_BACK_FRACTION = 0.5;
export const PAGE_BACK_VELOCITY = 500;
/** Puxar a folha para cima estica com resistência. */
export const OVERDRAG_RESISTANCE = 0.15;

/**
 * A mola do efeito anda de 0 a 1 (progresso). Com o repouso padrão ela só termina ~250 ms depois de
 * pousar. Abrindo, termina a menos de 1 px da tela cheia; fechando, a 1% do cartão, quando a foto já
 * pousou e o cartão de verdade toma o lugar dela.
 */
const HERO_REST = { restDelta: 0.002, restSpeed: 0.5 } as const;
const HERO_REST_CLOSE = { restDelta: 0.01, restSpeed: 0.5 } as const;

/**
 * Foto do cartão que vira a capa do anúncio, e volta (pedido de 2026-11-15). Medido quadro a quadro
 * no vídeo de referência (Fotos do iPhone): a foto já sai em movimento no primeiro quadro (velocidade
 * inicial) e assenta sem passar do ponto, em ~230 ms ao abrir e ~200 ms ao fechar.
 */
export const HERO_OPEN = {
  type: 'spring',
  stiffness: 306,
  damping: 31.5,
  mass: 1,
  velocity: 13,
  ...HERO_REST,
} as const;
export const HERO_CLOSE = {
  type: 'spring',
  stiffness: 420,
  damping: 37,
  mass: 1,
  velocity: -15,
  ...HERO_REST_CLOSE,
} as const;
/** O fundo do anúncio aparece em ~150 ms, acelerando, e some em ~170 ms (mesma referência). */
export const HERO_BACKDROP_IN = { duration: 0.15, ease: 'easeIn' } as const;
export const HERO_BACKDROP_OUT = { duration: 0.17, ease: 'easeInOut' } as const;
