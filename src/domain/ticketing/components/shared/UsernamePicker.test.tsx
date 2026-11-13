import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UsernamePicker } from './UsernamePicker';

const search = vi.hoisted(() => vi.fn());
vi.mock('../../../user', () => ({ searchUsernamesUseCase: search }));

const CARLA = { username: 'carla.jeri', displayName: 'Carla', photoURL: null };

function picker(onSelect: (p: unknown) => void, onError: (e: unknown) => void) {
  return (
    <UsernamePicker
      resetKey={1}
      label="Usuário"
      placeholder="@"
      notFound="Não encontrado"
      resultsLabel="Resultados"
      selected={null}
      onSelect={onSelect}
      onError={onError}
    />
  );
}

describe('UsernamePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    search.mockReset().mockResolvedValue([CARLA]);
  });
  afterEach(() => vi.useRealTimers());

  it('a escolha não se perde quando a tela troca as funções recebidas (ex.: novo `t` do i18n)', async () => {
    const onSelect = vi.fn();
    const { getByLabelText, rerender } = render(picker(onSelect, () => undefined));
    fireEvent.change(getByLabelText('Usuário'), { target: { value: 'carla.jeri' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(onSelect).toHaveBeenLastCalledWith(CARLA);

    onSelect.mockClear();
    rerender(picker(onSelect, () => undefined));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(onSelect).not.toHaveBeenCalled();
    expect(search).toHaveBeenCalledTimes(1);
  });
});
