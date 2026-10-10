import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionTitle } from './components/SectionTitle';
import { expect, test, vi } from 'vitest';

test('renders SectionTitle component with title', () => {
  render(<SectionTitle title="Atrações Populares" />);

  // Verifica se o título principal é exibido
  expect(screen.getByText('Atrações Populares')).toBeInTheDocument();
});

test('renders SectionTitle component with subtitle', () => {
  render(<SectionTitle title="Hotéis" subtitle="Melhores estadias" />);

  // Verifica se o título e o subtítulo são exibidos
  expect(screen.getByText('Hotéis')).toBeInTheDocument();
  expect(screen.getByText('Melhores estadias')).toBeInTheDocument();
});

test('calls onSeeAll callback when Ver Tudo is clicked', () => {
  const handleSeeAll = vi.fn();
  render(<SectionTitle title="Restaurantes" onSeeAll={handleSeeAll} />);

  const button = screen.getByRole('button', { name: /Ver Tudo/i });
  fireEvent.click(button);

  // Verifica se a função de retorno (callback) foi disparada
  expect(handleSeeAll).toHaveBeenCalledTimes(1);
});
