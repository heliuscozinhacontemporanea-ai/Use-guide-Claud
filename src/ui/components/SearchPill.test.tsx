import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchPill } from './SearchPill';

describe('SearchPill (D37 item 4)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('tem nome fixo, abre a busca e troca a frase com o tempo', () => {
    const onClick = vi.fn();
    render(
      <SearchPill
        label="Buscar"
        phrases={['Para onde você vai?', 'Buscar passeios']}
        onClick={onClick}
      />
    );
    const button = screen.getByRole('button', { name: 'Buscar' });
    expect(button.textContent).toContain('Para onde você vai?');
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(button.textContent).toContain('Buscar passeios');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
