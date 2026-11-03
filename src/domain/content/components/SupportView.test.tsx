import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { SupportView } from './SupportView';

describe('SupportView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('busca sem acento, filtra por tema e abre a resposta', () => {
    render(<SupportView onBack={() => undefined} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar nas perguntas' }), {
      target: { value: 'reembolso' },
    });
    expect(screen.getByRole('button', { name: 'Quanto tempo o reembolso demora?' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Esqueci minha senha.' })).toBeNull();

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar nas perguntas' }), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Conta' }));
    const question = screen.getByRole('button', { name: 'Esqueci minha senha.' });
    fireEvent.click(question);
    expect(question.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/Esqueceu a senha\?/)).toBeTruthy();
  });

  it('atalhos de compras, ingressos e reservas só com login; e-mail único ajuda@', () => {
    const onOpenPurchases = vi.fn();
    const { rerender } = render(<SupportView onBack={() => undefined} />);
    expect(screen.queryByRole('button', { name: 'Minhas compras' })).toBeNull();
    rerender(<SupportView onBack={() => undefined} onOpenPurchases={onOpenPurchases} />);
    fireEvent.click(screen.getByRole('button', { name: 'Minhas compras' }));
    expect(onOpenPurchases).toHaveBeenCalled();
    expect(screen.getByText('ajuda@useguide.com.br')).toBeTruthy();
  });

  it('sem busca mostra as 5 mais procuradas e abre a lista inteira', () => {
    render(<SupportView onBack={() => undefined} />);
    expect(screen.queryByRole('button', { name: 'Como excluo minha conta?' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Ver todas as \d+ perguntas/ }));
    expect(screen.getByRole('button', { name: 'Como excluo minha conta?' })).toBeTruthy();
  });
});
