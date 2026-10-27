import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { MyReviewsSource } from '../../hooks/useMyReviews';
import type { FirestoreReview } from '../../types/review';
import { MyReviewsView } from './MyReviewsView';

const r = vi.hoisted(() => ({ mine: vi.fn(), report: vi.fn() }));
vi.mock('../../application/usecases/listMyReviewReportsUseCase', () => ({
  listMyReviewReportsUseCase: r.mine,
}));
vi.mock('../../application/usecases/reportReviewResponseUseCase', () => ({
  reportReviewResponseUseCase: r.report,
}));

const REVIEW: FirestoreReview = {
  id: 'items_tamarindo_u1',
  itemId: 'tamarindo',
  itemCollection: 'items',
  userId: 'u1',
  userName: 'Ana',
  rating: 5,
  comment: 'Peixe fresco.',
  createdAt: '2026-10-12T15:00:00.000Z',
  verifiedAttendance: true,
  partnerResponse: 'Obrigado, Ana!',
};

function source(data: FirestoreReview[]): MyReviewsSource {
  return {
    data,
    loading: false,
    error: null,
    hasMore: false,
    reload: vi.fn(async () => undefined),
    loadMore: vi.fn(async () => undefined),
    remove: vi.fn(async () => undefined),
    save: vi.fn(async () => undefined),
  };
}

function openMenu() {
  // O Radix abre o menu no pointerdown, não no click.
  const trigger = screen.getByRole('button', { name: 'Mais opções' });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
}

describe('Minhas avaliações', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    r.mine.mockResolvedValue([]);
    await i18n.changeLanguage('pt-BR');
  });

  it('cada avaliação em um cartão, com o nome do lugar, o selo e a resposta', () => {
    render(
      <MyReviewsView
        source={source([REVIEW])}
        onBack={vi.fn()}
        titleOf={() => 'Restaurante Tamarindo'}
      />
    );
    expect(screen.getByText('Restaurante Tamarindo')).toBeTruthy();
    expect(screen.getByText('Experiência verificada')).toBeTruthy();
    expect(screen.getByRole('heading', { name: '12 de outubro' })).toBeTruthy();
    expect(screen.getByText('Resposta do estabelecimento')).toBeTruthy();
    expect(screen.getByRole('img', { name: '5 de 5 estrelas' })).toBeTruthy();
  });

  it('agrupa pelo dia da avaliação, com o ano só quando não é o atual', () => {
    const older = { ...REVIEW, id: 'r2', createdAt: '2025-06-23T15:00:00.000Z' };
    const sameDay = { ...REVIEW, id: 'r3', createdAt: '2026-10-12T20:00:00.000Z' };
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-27T12:00:00.000Z'));
    render(
      <MyReviewsView
        source={source([sameDay, REVIEW, older])}
        onBack={vi.fn()}
        titleOf={() => 'Tamarindo'}
      />
    );
    vi.useRealTimers();
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['12 de outubro', '23 de junho de 2025']);
  });

  it('lugar fora do guia mostra o aviso no lugar do nome', () => {
    render(<MyReviewsView source={source([REVIEW])} onBack={vi.fn()} titleOf={() => undefined} />);
    expect(screen.getByText('Lugar fora do guia')).toBeTruthy();
  });

  it('excluir pede confirmação e só então chama o backend', async () => {
    const src = source([REVIEW]);
    render(<MyReviewsView source={src} onBack={vi.fn()} titleOf={() => 'Tamarindo'} />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: /Excluir/ }));
    expect(screen.getByText('Excluir esta avaliação?')).toBeTruthy();
    expect(screen.getByText('A ação é definitiva e não poderá ser recuperada.')).toBeTruthy();
    expect(src.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(src.remove).toHaveBeenCalledWith(REVIEW.id));
    expect(await screen.findByText('Avaliação excluída.')).toBeTruthy();
  });

  it('editar abre a folha com a nota e o texto e salva por cima', async () => {
    const src = source([REVIEW]);
    render(<MyReviewsView source={src} onBack={vi.fn()} titleOf={() => 'Tamarindo'} />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: /Editar/ }));
    const comment = screen.getByRole('textbox');
    expect((comment as HTMLTextAreaElement).value).toBe('Peixe fresco.');
    fireEvent.click(screen.getByRole('radio', { name: 'Dar 4 estrelas' }));
    fireEvent.change(comment, { target: { value: 'Bom, mas demorou.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(src.save).toHaveBeenCalledWith(REVIEW, 4, 'Bom, mas demorou.'));
  });

  it('comentário vazio não salva e mostra a mensagem traduzida', async () => {
    const src = source([REVIEW]);
    render(<MyReviewsView source={src} onBack={vi.fn()} titleOf={() => 'Tamarindo'} />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: /Editar/ }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Escreva um comentário sobre sua experiência.')).toBeTruthy();
    expect(src.save).not.toHaveBeenCalled();
  });

  it('denunciar a resposta: motivo obrigatório, envia e mostra o status no cartão', async () => {
    r.report.mockResolvedValue({
      id: 'rep1',
      reviewId: REVIEW.id,
      status: 'open',
      createdAt: '2026-10-27T12:00:00.000Z',
      decideBy: '2026-10-30T12:00:00.000Z',
    });
    render(
      <MyReviewsView source={source([REVIEW])} onBack={vi.fn()} titleOf={() => 'Tamarindo'} />
    );
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: /Denunciar resposta/ }));
    const submit = screen.getByRole('button', { name: 'Enviar denúncia' });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('radio', { name: 'Fraude ou golpe' }));
    fireEvent.click(submit);
    await waitFor(() =>
      expect(r.report).toHaveBeenCalledWith({
        reviewId: REVIEW.id,
        reason: 'fraud',
        details: undefined,
      })
    );
    expect(await screen.findByText(/Denúncia em análise/)).toBeTruthy();
  });

  it('sem resposta do estabelecimento ou com denúncia aberta, não oferece denunciar', async () => {
    r.mine.mockResolvedValue([
      {
        id: 'rep1',
        reviewId: REVIEW.id,
        status: 'open',
        createdAt: '2026-10-27T12:00:00.000Z',
        decideBy: '2026-10-30T12:00:00.000Z',
      },
    ]);
    render(
      <MyReviewsView
        source={source([REVIEW, { ...REVIEW, id: 'r2', partnerResponse: null }])}
        onBack={vi.fn()}
        titleOf={() => 'Tamarindo'}
      />
    );
    expect(await screen.findByText(/Denúncia em análise/)).toBeTruthy();
    for (const trigger of screen.getAllByRole('button', { name: 'Mais opções' })) {
      fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: 'mouse' });
      expect(await screen.findByRole('menuitem', { name: /Editar/ })).toBeTruthy();
      expect(screen.queryByRole('menuitem', { name: /Denunciar resposta/ })).toBeNull();
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    }
  });
});
