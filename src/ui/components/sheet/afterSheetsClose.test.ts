import { afterEach, describe, expect, it, vi } from 'vitest';
import { afterSheetsClose } from './useSheetHistory';

describe('afterSheetsClose', () => {
  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '');
  });

  it('sem folha no histórico, roda na hora', () => {
    const run = vi.fn();
    afterSheetsClose(run);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('com folha no histórico, espera a entrada dela sair (uma vez só)', () => {
    window.history.replaceState({ ugSheets: ['folha-1'] }, '');
    const run = vi.fn();
    afterSheetsClose(run);
    expect(run).not.toHaveBeenCalled();
    window.history.replaceState({}, '');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('se a folha não voltar no histórico, segue depois do prazo', () => {
    vi.useFakeTimers();
    window.history.replaceState({ ugSheets: ['folha-1'] }, '');
    const run = vi.fn();
    afterSheetsClose(run);
    vi.advanceTimersByTime(1000);
    expect(run).toHaveBeenCalledTimes(1);
  });
});
