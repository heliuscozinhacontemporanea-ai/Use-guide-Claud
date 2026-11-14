import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSheetLayer } from './sheetLayers';

function Layer({ id, open }: { id: string; open: boolean }) {
  const layer = useSheetLayer(id, open);
  return <span data-testid={id}>{`${layer.isBottom}:${layer.hasAbove}`}</span>;
}

describe('useSheetLayer', () => {
  it('a primeira folha aberta é a de baixo; a que tem outra por cima recua', () => {
    const { rerender } = render(
      <>
        <Layer id="perfil" open />
        <Layer id="detalhe" open={false} />
      </>
    );
    expect(screen.getByTestId('perfil').textContent).toBe('true:false');

    rerender(
      <>
        <Layer id="perfil" open />
        <Layer id="detalhe" open />
      </>
    );
    expect(screen.getByTestId('perfil').textContent).toBe('true:true');
    expect(screen.getByTestId('detalhe').textContent).toBe('false:false');

    rerender(
      <>
        <Layer id="perfil" open />
        <Layer id="detalhe" open={false} />
      </>
    );
    expect(screen.getByTestId('perfil').textContent).toBe('true:false');
  });
});
