import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { ReviewModerationQueue } from './ReviewModerationQueue';

const m = vi.hoisted(() => ({ list: vi.fn(), decide: vi.fn() }));
vi.mock('../../application/usecases/listOpenReviewReportsUseCase', () => ({
  listOpenReviewReportsUseCase: m.list,
}));
vi.mock('../../application/usecases/decideReviewReportUseCase', () => ({
  decideReviewReportUseCase: m.decide,
}));

const REPORT = {
  id: 'rep1',
  reviewId: 'items_tamarindo_u1',
  reason: 'offensive',
  details: 'Me chamou de mentirosa.',
  status: 'open',
  responseText: 'Mentira sua.',
  reviewRating: 2,
  reviewComment: 'Demorou muito.',
  itemId: 'tamarindo',
  itemCollection: 'items',
  placeName: 'Restaurante Tamarindo',
  createdAt: '2026-10-27T12:00:00.000Z',
  decideBy: '2026-10-30T12:00:00.000Z',
};

describe('aba Moderação (D19)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    m.list.mockResolvedValue({ data: [REPORT], nextCursor: null });
    m.decide.mockResolvedValue(undefined);
    await i18n.changeLanguage('pt-BR');
  });

  it('mostra o lugar, a avaliação, a resposta denunciada, o motivo e o relato', async () => {
    render(<ReviewModerationQueue />);
    expect(await screen.findByText('Restaurante Tamarindo')).toBeTruthy();
    expect(screen.getByText('Mentira sua.')).toBeTruthy();
    expect(screen.getByText('Motivo: Ofensiva ou desrespeitosa')).toBeTruthy();
    expect(screen.getByText('Relato: Me chamou de mentirosa.')).toBeTruthy();
  });

  it('remover pede confirmação; manter decide direto; a denúncia sai da fila', async () => {
    render(<ReviewModerationQueue />);
    fireEvent.click(await screen.findByRole('button', { name: 'Remover resposta' }));
    expect(m.decide).not.toHaveBeenCalled();
    const buttons = screen.getAllByRole('button', { name: 'Remover resposta' });
    fireEvent.click(buttons[buttons.length - 1] as HTMLElement);
    await waitFor(() => expect(m.decide).toHaveBeenCalledWith('rep1', 'upheld'));
    expect(await screen.findByText('Resposta removida.')).toBeTruthy();
    expect(screen.queryByText('Mentira sua.')).toBeNull();
  });
});
