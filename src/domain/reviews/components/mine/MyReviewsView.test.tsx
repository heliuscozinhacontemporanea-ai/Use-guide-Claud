import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { MyReviewsSource } from '../../hooks/useMyReviews';
import type { FirestoreReview } from '../../types/review';
import { MyReviewsView } from './MyReviewsView';

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
    expect(screen.getByText(/Experiência verificada/)).toBeTruthy();
    expect(screen.getByText('Resposta do estabelecimento')).toBeTruthy();
    expect(screen.getByRole('img', { name: '5 de 5 estrelas' })).toBeTruthy();
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
});
