import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { SupportView } from './SupportView';

describe('SupportView', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('busca sem acento e mostra só os resultados', () => {
    render(<SupportView onBack={() => undefined} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar nas perguntas' }), {
      target: { value: 'reembolso' },
    });
    expect(screen.getByText('Resultados')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Quanto tempo o reembolso demora\?/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Esqueci minha senha/ })).toBeNull();
    expect(screen.queryByText('Assuntos')).toBeNull();
  });

  it('assunto abre a própria lista e a resposta', () => {
    render(<SupportView onBack={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sua conta' }));
    const question = screen.getByRole('button', { name: 'Esqueci minha senha.' });
    fireEvent.click(question);
    expect(question.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/Esqueceu a senha\?/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Como vendo pelo Use Guide/ })).toBeNull();
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
});
