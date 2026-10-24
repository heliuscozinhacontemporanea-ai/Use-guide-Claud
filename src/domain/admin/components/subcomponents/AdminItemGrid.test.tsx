import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminItemGrid } from './AdminItemGrid';

const baseProps = {
  categories: [{ id: 'all', label: 'Todos', color: '' }],
  filter: 'all',
  setFilter: vi.fn(),
  filteredItems: [],
  dataLoading: false,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe('AdminItemGrid', () => {
  it('na aba de itens mostra "Nova dica" separado do novo cadastro', () => {
    const onInitNew = vi.fn();
    const onInitNewTip = vi.fn();
    render(
      <AdminItemGrid
        {...baseProps}
        activeTab="items"
        onInitNew={onInitNew}
        onInitNewTip={onInitNewTip}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Nova dica/ }));
    expect(onInitNewTip).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /Novo Registro/ }));
    expect(onInitNew).toHaveBeenCalledTimes(1);
  });

  it('sem onInitNewTip (agenda) não mostra o botão de dica', () => {
    render(<AdminItemGrid {...baseProps} activeTab="events" onInitNew={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Nova dica/ })).toBeNull();
  });

  it('selo do estabelecimento abre sem disparar o editor; dicas não têm selo (D11)', () => {
    const onEdit = vi.fn();
    const items = [
      {
        id: 'item-1',
        name: 'Pousada Sol',
        category: 'hotel',
        description: '',
        image: '',
        location: 'jeri',
      },
      { id: 'tip-1', name: 'Dica', category: 'tips', description: '', image: '', location: 'jeri' },
    ];
    render(
      <AdminItemGrid
        {...baseProps}
        activeTab="items"
        onInitNew={vi.fn()}
        filteredItems={items as never}
        onEdit={onEdit}
        renderListingSeal={(item) => <button type="button">{`selo ${item.name}`}</button>}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'selo Pousada Sol' }));
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'selo Dica' })).toBeNull();
  });
});
