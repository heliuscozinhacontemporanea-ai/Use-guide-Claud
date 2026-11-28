import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FilterPills } from './FilterPills';

describe('FilterPills', () => {
  it('marca a escolhida e avisa a troca', () => {
    const onChange = vi.fn();
    render(
      <FilterPills
        label="Tipo"
        value="a"
        onChange={onChange}
        options={[
          { value: 'a', label: 'Todas' },
          { value: 'b', label: 'Passeios' },
        ]}
      />
    );
    expect(screen.getByRole('group', { name: 'Tipo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Passeios' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
