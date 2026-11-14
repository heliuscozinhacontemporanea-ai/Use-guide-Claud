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
