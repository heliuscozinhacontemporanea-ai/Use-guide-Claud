import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ record: vi.fn() }));
vi.mock('../../application/usecases/recordPanelTourUseCase', () => ({
  recordPanelTourUseCase: m.record,
}));

import { usePanelTour } from '../../hooks/usePanelTour';
import { PartnerPanelTour } from './PartnerPanelTour';
import type { PartnerPanelTab } from './partnerPanelTabs';

/** Painel de mentira: cada aba mostra só os elementos que o tour procura. */
function Panel({ tab, loadingTab }: { tab: PartnerPanelTab; loadingTab?: PartnerPanelTab }) {
  if (tab === loadingTab) return <div data-loading="">carregando</div>;
  if (tab === 'home')
    return (
      <>
        <nav data-tour="shortcuts">atalhos</nav>
        <section data-tour="attention">a</section>
        <section data-tour="cards">b</section>
      </>
    );
  if (tab === 'agenda')
    return (
      <>
        <div data-tour="agenda-week">semana</div>
        <div data-tour="agenda-day">dia</div>
      </>
    );
  if (tab === 'catalog')
    return (
      <>
        <div data-tour="catalog-kinds">tipos</div>
        <button type="button" data-tour="catalog-create">
          criar
        </button>
        <div data-tour="catalog-list">
          <ul>
            <li>Pousada</li>
          </ul>
        </div>
      </>
    );
  if (tab === 'earnings')
    return (
      <>
        <div data-tour="earnings-totals">totais</div>
        <div data-tour="earnings-tabs">abas</div>
        <div data-tour="earnings-links">contas</div>
      </>
    );
  return <ul data-tour="more-list">mais</ul>;
}

function Harness({
  onClose,
  startChapter,
  loadingTab,
}: {
  onClose: (result: string) => void;
  startChapter?: number;
  loadingTab?: PartnerPanelTab;
}) {
  const [tab, setTab] = useState<PartnerPanelTab>('home');
  return (
    <>
      <p data-testid="tab">{tab}</p>
      <Panel tab={tab} loadingTab={loadingTab} />
      <PartnerPanelTour startChapter={startChapter} onTabChange={setTab} onClose={onClose} />
    </>
  );
}

const next = () => fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));

describe('Tour do painel em capítulos', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    m.record.mockResolvedValue(undefined);
  });

  it('passa por todas as abas, pula o que não está na tela e conclui em Mais', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    expect(await screen.findByText('Início · 1 de 3')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Tudo a um toque' })).toBeTruthy();
    // Sem filtro de estabelecimento nem "Agora" na tela: 3 passos no Início.
    next();
    next();
    next();
    expect(await screen.findByText('Agenda · 1 de 2')).toBeTruthy();
    expect(screen.getByTestId('tab').textContent).toBe('agenda');
    next();
    next();
    expect(await screen.findByText('Catálogo · 1 de 3')).toBeTruthy();
    next();
    next();
    expect(screen.getByRole('heading', { name: 'Cada anúncio' })).toBeTruthy();
    next();
    expect(await screen.findByText('Ganhos · 1 de 3')).toBeTruthy();
    next();
    next();
    next();
    expect(await screen.findByText('Mais · 1 de 1')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(onClose).toHaveBeenCalledWith('done');
  });

  it('Voltar no primeiro passo de uma aba volta ao último passo da anterior', async () => {
    render(<Harness onClose={vi.fn()} />);
    await screen.findByText('Início · 1 de 3');
    expect(screen.queryByRole('button', { name: 'Voltar' })).toBeNull();
    next();
    next();
    next();
    await screen.findByText('Agenda · 1 de 2');
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(await screen.findByText('Início · 3 de 3')).toBeTruthy();
    expect(screen.getByTestId('tab').textContent).toBe('home');
  });

  it('aba que não abre em 5 s tem o capítulo pulado', async () => {
    vi.useFakeTimers();
    try {
      render(<Harness onClose={vi.fn()} startChapter={2} loadingTab="catalog" />);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5200);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      expect(screen.getByText('Ganhos · 1 de 3')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('começa no capítulo escolhido; a caixa desliga as dicas; Esc pula', async () => {
    const onClose = vi.fn();
    const { unmount } = render(<Harness onClose={onClose} startChapter={2} />);
    expect(await screen.findByText('Catálogo · 1 de 3')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Voltar' })).toBeNull();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenLastCalledWith('skip');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Não mostrar dicas do painel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    expect(onClose).toHaveBeenLastCalledWith('tips_off');
    unmount();
  });
});

describe('usePanelTour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.record.mockResolvedValue(undefined);
  });

  it('abre sozinho no Início quando o servidor manda mostrar, uma vez por sessão', () => {
    const onTabChange = vi.fn();
    const { result, rerender } = renderHook(
      (props: { show: boolean | undefined; tab: PartnerPanelTab }) =>
        usePanelTour({
          tour: props.show === undefined ? undefined : { show: props.show, tipsOff: false },
          tab: props.tab,
          editing: false,
          onTabChange,
        }),
      { initialProps: { show: undefined as boolean | undefined, tab: 'home' as PartnerPanelTab } }
    );
    expect(result.current.open).toBe(false);
    rerender({ show: false, tab: 'home' });
    expect(result.current.open).toBe(false);
    rerender({ show: true, tab: 'agenda' });
    expect(result.current.open).toBe(false);
    rerender({ show: true, tab: 'home' });
    expect(result.current.open).toBe(true);
    expect(m.record).toHaveBeenCalledWith('shown');

    act(() => result.current.close('skip'));
    expect(result.current.open).toBe(false);
    expect(onTabChange).toHaveBeenLastCalledWith('home');
    expect(m.record).toHaveBeenCalledTimes(1);
    rerender({ show: true, tab: 'home' });
    expect(result.current.open).toBe(false);

    act(() => result.current.replay(3));
    expect(result.current).toMatchObject({ open: true, startChapter: 3 });
    act(() => result.current.close('tips_off'));
    expect(m.record).toHaveBeenLastCalledWith('tips_off');
  });
});
