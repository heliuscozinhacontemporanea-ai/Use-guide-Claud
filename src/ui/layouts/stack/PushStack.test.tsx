import { fireEvent, render, screen } from '@testing-library/react';
import { Pencil } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { PushStack } from './PushStack';
import { useStackPageAction } from './stackPageAction';
import type { StackEntry } from './stackTypes';

const ROOT: StackEntry = {
  key: 'root',
  navBar: false,
  bare: true,
  render: () => <div className="relative z-10">raiz</div>,
};
const PAGE: StackEntry = {
  key: 'page',
  title: 'Planos',
  navBar: true,
  render: () => <p>página</p>,
};

const layerOf = (text: string) => screen.getByText(text).closest('.absolute.inset-0');

function EditablePage({ onEdit }: { onEdit: () => void }) {
  const inBar = useStackPageAction({ label: 'Editar', icon: Pencil, onClick: onEdit });
  return inBar ? <p>na barra</p> : <button type="button">Editar no conteúdo</button>;
}

describe('PushStack', () => {
  it('cada tela isola o próprio z-index: a raiz parada não pinta por cima da página aberta', () => {
    render(<PushStack entries={[ROOT, PAGE]} backLabel="Voltar" onBack={vi.fn()} />);
    const root = layerOf('raiz');
    const page = layerOf('página');
    expect(root).toHaveClass('isolate');
    expect(page).toHaveClass('isolate');
    expect(root?.compareDocumentPosition(page as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('a tela de trás fica fora do toque e do leitor de tela', () => {
    render(<PushStack entries={[ROOT, PAGE]} backLabel="Voltar" onBack={vi.fn()} />);
    expect(layerOf('raiz')).toHaveAttribute('inert');
    expect(layerOf('página')).not.toHaveAttribute('inert');
  });

  it('a página declara a ação da barra; fora da pilha, ela mesma mostra a ação', () => {
    const onEdit = vi.fn();
    const entries: StackEntry[] = [
      ROOT,
      { key: 'edit', title: 'Lugar', navBar: true, render: () => <EditablePage onEdit={onEdit} /> },
    ];
    const { unmount } = render(<PushStack entries={entries} backLabel="Voltar" onBack={vi.fn()} />);
    expect(screen.getByText('na barra')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    unmount();

    render(<EditablePage onEdit={onEdit} />);
    expect(screen.getByRole('button', { name: 'Editar no conteúdo' })).toBeInTheDocument();
  });
});
