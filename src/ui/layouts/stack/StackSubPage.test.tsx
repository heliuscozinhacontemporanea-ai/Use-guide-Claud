import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  StackSubPage,
  StackSubPageProvider,
  StackSubPageSlot,
  useStackSubPage,
  useStackSubPageHost,
} from './StackSubPage';

function Screen() {
  const sub = useStackSubPage();
  return (
    <div>
      <button type="button" onClick={() => sub.open('x')}>
        abrir
      </button>
      <span data-testid="state">{`${sub.inStack}:${sub.id ?? '-'}`}</span>
      {sub.id && <StackSubPage title="Detalhe">conteúdo {sub.id}</StackSubPage>}
    </div>
  );
}

function Host({ open }: { open: (id: string) => void }) {
  const [id, setId] = useState<string | null>(null);
  const host = useStackSubPageHost({
    id,
    renderedId: id,
    open: (next) => {
      open(next);
      setId(next);
    },
    close: () => setId(null),
  });
  return (
    <StackSubPageProvider value={host}>
      <Screen />
      <section aria-label="pagina">
        <StackSubPageSlot fallback={<span>carregando</span>} />
      </section>
      <span data-testid="title">{host.title ?? '-'}</span>
    </StackSubPageProvider>
  );
}

describe('StackSubPage', () => {
  it('fora da folha guarda o estado na própria tela', () => {
    render(<Screen />);
    expect(screen.getByTestId('state').textContent).toBe('false:-');
    act(() => screen.getByRole('button', { name: 'abrir' }).click());
    expect(screen.getByTestId('state').textContent).toBe('false:x');
  });

  it('na folha abre pelo host e desenha o conteúdo na página interna, com o título na barra', () => {
    const open = vi.fn();
    render(<Host open={open} />);
    expect(screen.getByText('carregando')).toBeTruthy();
    act(() => screen.getByRole('button', { name: 'abrir' }).click());
    expect(open).toHaveBeenCalledWith('x');
    expect(screen.getByRole('region', { name: 'pagina' }).textContent).toContain('conteúdo x');
    expect(screen.getByTestId('title').textContent).toBe('Detalhe');
    expect(screen.queryByText('carregando')).toBeNull();
  });
});
