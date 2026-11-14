import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  createStackPageSettledStore,
  StackPageSettledContext,
  useStackPageSettled,
} from './stackPageSettled';

function Probe() {
  return <p>{useStackPageSettled() ? 'parada' : 'entrando'}</p>;
}

describe('useStackPageSettled', () => {
  it('fora da pilha, a página está sempre parada', () => {
    render(<Probe />);
    expect(screen.getByText('parada')).toBeInTheDocument();
  });

  it('entrando espera; depois de parar uma vez, o arraste de volta não muda nada', () => {
    const store = createStackPageSettledStore(false);
    render(
      <StackPageSettledContext.Provider value={store}>
        <Probe />
      </StackPageSettledContext.Provider>
    );
    expect(screen.getByText('entrando')).toBeInTheDocument();
    act(() => store.set(true));
    expect(screen.getByText('parada')).toBeInTheDocument();
    act(() => store.set(false));
    expect(screen.getByText('parada')).toBeInTheDocument();
  });
});
