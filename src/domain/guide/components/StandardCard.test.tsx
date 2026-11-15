import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import type { GuideItem } from '../types/guide';
import { StandardCard } from './StandardCard';

const ITEM = {
  id: 'buggy',
  name: 'Buggy do Preá',
  category: 'tour',
  location: 'prea',
  image: 'https://images.unsplash.com/a',
  rating: 4.8,
} as GuideItem;

describe('StandardCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('é um botão: o toque abre o anúncio', () => {
    const onClick = vi.fn();
    render(<StandardCard item={ITEM} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /Buggy do Preá/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('em pé: sem máscara na foto inteira; etiqueta e nota com fundo escuro próprio sobre a foto', () => {
    const { container } = render(<StandardCard item={ITEM} onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    // Nenhuma camada escura cobrindo a foto toda (opção C de 2026-11-15).
    expect(button.querySelector('.inset-0.bg-black\\/20')).toBeNull();
    expect(screen.getByText('Passeios')).toHaveClass('bg-black/70');
    expect(screen.getByText('4.8').closest('span')).toHaveClass('bg-black/70');
    expect(container.querySelector('.bg-gradient-to-t')).not.toBeNull();
  });

  it('horizontal: o texto fica ao lado da foto, com a etiqueta na cor da categoria', () => {
    render(<StandardCard item={ITEM} variant="horizontal" onClick={vi.fn()} />);
    expect(screen.getByText('Passeios')).not.toHaveClass('bg-black/70');
    expect(document.querySelector('.bg-gradient-to-t')).toBeNull();
  });
});
