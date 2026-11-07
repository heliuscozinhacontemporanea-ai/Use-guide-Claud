import type { PartnerPanelTab } from '../components/panel/partnerPanelTabs';

/**
 * Tour do painel (proposta 2, 2026-11-07): um capítulo por aba, na ordem das abas. `anchor` é o
 * elemento que diz que a aba abriu; os passos sem elemento na tela são pulados.
 */
export const PANEL_TOUR_CHAPTERS = [
  {
    tab: 'home',
    anchor: 'shortcuts',
    steps: ['shortcuts', 'establishment', 'attention', 'agora', 'cards'],
  },
  { tab: 'agenda', anchor: 'agenda-week', steps: ['agenda-week', 'agenda-day'] },
  {
    tab: 'catalog',
    anchor: 'catalog-kinds',
    steps: ['catalog-kinds', 'catalog-create', 'catalog-first'],
  },
  {
    tab: 'earnings',
    anchor: 'earnings-tabs',
    steps: ['earnings-totals', 'earnings-tabs', 'earnings-links'],
  },
  { tab: 'more', anchor: 'more-list', steps: ['more-list'] },
] as const satisfies ReadonlyArray<{
  tab: PartnerPanelTab;
  anchor: string;
  steps: readonly string[];
}>;

/** Concluído, pulado ou com "Não mostrar dicas do painel" marcado. */
export type PanelTourResult = 'done' | 'skip' | 'tips_off';

export type PanelTourStepId = (typeof PANEL_TOUR_CHAPTERS)[number]['steps'][number];

/** O primeiro item da lista do Catálogo, não a lista inteira. */
const SELECTORS: Partial<Record<PanelTourStepId, string>> = {
  'catalog-first': '[data-tour="catalog-list"] li',
};

/** Elementos do passo; um passo pode marcar mais de um (ex.: setas e faixa da semana). */
export function tourTargets(step: string, root: ParentNode = document): HTMLElement[] {
  const selector = SELECTORS[step as PanelTourStepId] ?? `[data-tour="${step}"]`;
  const all = [...root.querySelectorAll<HTMLElement>(selector)];
  return step in SELECTORS ? all.slice(0, 1) : all;
}

export interface TourRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Retângulo que cobre todos os elementos do passo. */
export function tourRect(step: string, root: ParentNode = document): TourRect | null {
  const rects = tourTargets(step, root).map((element) => element.getBoundingClientRect());
  if (rects.length === 0) return null;
  const top = Math.min(...rects.map((rect) => rect.top));
  const left = Math.min(...rects.map((rect) => rect.left));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  const right = Math.max(...rects.map((rect) => rect.right));
  return { top, left, width: right - left, height: bottom - top };
}

/** A aba abriu: o elemento-âncora está na tela e nada está carregando. */
export function chapterReady(chapter: number, root: ParentNode = document): boolean {
  const current = PANEL_TOUR_CHAPTERS[chapter];
  if (!current) return false;
  return tourTargets(current.anchor, root).length > 0 && !root.querySelector('[data-loading]');
}

/** Passos do capítulo com elemento na tela agora. */
export function visibleChapterSteps(chapter: number, root: ParentNode = document) {
  return (PANEL_TOUR_CHAPTERS[chapter]?.steps ?? []).filter(
    (step) => tourTargets(step, root).length > 0
  );
}
