/** Passos do tour do painel (etapa 6), na ordem. O passo sem elemento na tela é pulado. */
export const PANEL_TOUR_STEPS = [
  { id: 'shortcuts', target: 'shortcuts' },
  { id: 'establishment', target: 'establishment' },
  { id: 'attention', target: 'attention' },
  { id: 'cards', target: 'cards' },
  { id: 'agora', target: 'agora' },
  { id: 'catalog', target: 'tab-catalog' },
  { id: 'earnings', target: 'tab-earnings' },
] as const;

export type PanelTourStepId = (typeof PANEL_TOUR_STEPS)[number]['id'];

export function tourTarget(target: string, root: ParentNode = document): HTMLElement | null {
  return root.querySelector<HTMLElement>(`[data-tour="${target}"]`);
}

/** Passos com o elemento na tela agora; "Agora" e o filtro de estabelecimento nem sempre existem. */
export function visibleTourSteps(root: ParentNode = document): PanelTourStepId[] {
  return PANEL_TOUR_STEPS.filter((step) => tourTarget(step.target, root)).map((step) => step.id);
}
