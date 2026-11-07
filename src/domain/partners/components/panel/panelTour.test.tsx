import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ complete: vi.fn() }));
vi.mock('../../application/usecases/completePanelTourUseCase', () => ({
  completePanelTourUseCase: m.complete,
}));

import { usePanelTour } from '../../hooks/usePanelTour';
import { PartnerPanelTour } from './PartnerPanelTour';

function Targets({ withAgora = false }: { withAgora?: boolean }) {
  return (
    <div>
      <nav data-tour="shortcuts">
        <button type="button" data-tour="tab-catalog">
          c
        </button>
        <button type="button" data-tour="tab-earnings">
          g
        </button>
      </nav>
      <section data-tour="attention">a</section>
      <section data-tour="cards">b</section>
      {withAgora && <section data-tour="agora">n</section>}
    </div>
  );
}

describe('tour do painel (etapa 6)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    m.complete.mockResolvedValue(undefined);
  });

  it('pula os passos sem elemento na tela e conclui no último', () => {
    const onClose = vi.fn();
    render(
      <>
        <Targets />
        <PartnerPanelTour onClose={onClose} />
      </>
    );
    expect(screen.getByText('1 de 5')).toBeTruthy();
    expect(screen.getByText('Tudo a um toque')).toBeTruthy();
    for (let i = 0; i < 4; i += 1) fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(screen.getByText('Ganhos')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it('Pular sem a caixa volta depois; com "Não mostrar novamente" encerra de vez', () => {
    const onClose = vi.fn();
    render(
      <>
        <Targets withAgora />
        <PartnerPanelTour onClose={onClose} />
      </>
    );
    expect(screen.getByText('1 de 6')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    expect(onClose).toHaveBeenLastCalledWith(false);
    fireEvent.click(screen.getByLabelText('Não mostrar novamente'));
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    expect(onClose).toHaveBeenLastCalledWith(true);
  });

  it('abre sozinho só no Início e enquanto não foi concluído; concluir grava na conta', () => {
    const onTabChange = vi.fn();
    const { result, rerender } = renderHook(
      (props: { tourDone: boolean | undefined; tab: 'home' | 'agenda' }) =>
        usePanelTour({ ...props, editing: false, onTabChange }),
      {
        initialProps: {
          tourDone: undefined as boolean | undefined,
          tab: 'agenda' as 'home' | 'agenda',
        },
      }
    );
    expect(result.current.open).toBe(false);
    rerender({ tourDone: true, tab: 'home' });
    expect(result.current.open).toBe(false);
    rerender({ tourDone: false, tab: 'home' });
    expect(result.current.open).toBe(true);
    act(() => result.current.close(true));
    expect(m.complete).toHaveBeenCalled();
    act(() => result.current.replay());
    expect(onTabChange).toHaveBeenCalledWith('home');
    expect(result.current.open).toBe(true);
  });
});
