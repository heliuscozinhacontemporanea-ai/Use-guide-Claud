/** Tour do painel do parceiro (proposta 2 do tour, 2026-11-07). Classe Interna: só o dono, pela API. */
export interface PanelTourState {
  doneAt: string | null;
  /** Vezes que o tour abriu sozinho. */
  shown: number;
  /** "Não mostrar dicas do painel": desliga o tour e as dicas que vierem depois. */
  tipsOff: boolean;
}

export const PANEL_TOUR_ACTIONS = ['shown', 'done', 'tips_off'] as const;
export type PanelTourAction = (typeof PANEL_TOUR_ACTIONS)[number];

/** Pulado, o tour volta uma vez só (limite de vezes, como no TipKit da Apple). */
export const PANEL_TOUR_MAX_SHOWN = 2;

export const EMPTY_PANEL_TOUR: PanelTourState = { doneAt: null, shown: 0, tipsOff: false };

/** Se o tour abre sozinho na próxima entrada no painel. */
export function shouldShowPanelTour(state: PanelTourState): boolean {
  return state.doneAt === null && !state.tipsOff && state.shown < PANEL_TOUR_MAX_SHOWN;
}
