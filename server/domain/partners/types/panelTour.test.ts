import { describe, expect, it } from 'vitest';
import { EMPTY_PANEL_TOUR, shouldShowPanelTour } from './panelTour';

describe('shouldShowPanelTour', () => {
  it('abre na primeira entrada e volta uma vez depois de pulado', () => {
    expect(shouldShowPanelTour(EMPTY_PANEL_TOUR)).toBe(true);
    expect(shouldShowPanelTour({ ...EMPTY_PANEL_TOUR, shown: 1 })).toBe(true);
    expect(shouldShowPanelTour({ ...EMPTY_PANEL_TOUR, shown: 2 })).toBe(false);
  });

  it('não abre depois de concluído nem com as dicas desligadas', () => {
    expect(shouldShowPanelTour({ ...EMPTY_PANEL_TOUR, doneAt: '2026-11-07T12:00:00.000Z' })).toBe(
      false
    );
    expect(shouldShowPanelTour({ ...EMPTY_PANEL_TOUR, tipsOff: true })).toBe(false);
  });
});
