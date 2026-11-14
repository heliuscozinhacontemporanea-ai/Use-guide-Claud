import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PushStack } from './PushStack';
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
});
