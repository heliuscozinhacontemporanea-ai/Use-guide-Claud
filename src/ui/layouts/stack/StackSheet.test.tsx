import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StackSheet } from './StackSheet';
import type { StackEntry } from './stackTypes';

const ENTRIES: StackEntry[] = [
  {
    key: 'main',
    title: 'Perfil',
    navBar: true,
    render: () => (
      <>
        <button type="button">primeiro</button>
        <button type="button">último</button>
      </>
    ),
  },
];
const LABELS = { back: 'Voltar', close: 'Fechar', dialog: 'Perfil' };

function Page({ open, onClose = vi.fn() }: { open: boolean; onClose?: () => void }) {
  return (
    <>
      <button type="button">abrir</button>
      <StackSheet
        isOpen={open}
        onClose={onClose}
        onBack={vi.fn()}
        entries={ENTRIES}
        labels={LABELS}
      />
    </>
  );
}

describe('StackSheet', () => {
  it('foco vai para a folha ao abrir, circula dentro dela com Tab e volta ao botão que abriu', () => {
    const { rerender } = render(<Page open={false} />);
    const opener = screen.getByRole('button', { name: 'abrir' });
    opener.focus();
    rerender(<Page open />);
    const dialog = screen.getByRole('dialog', { name: 'Perfil' });
    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Fechar' }));
    screen.getByRole('button', { name: 'último' }).focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Fechar' }));
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'último' }));

    rerender(<Page open={false} />);
    expect(document.activeElement).toBe(opener);
  });

  it('Esc na primeira tela fecha a folha', () => {
    const onClose = vi.fn();
    render(<Page open onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
