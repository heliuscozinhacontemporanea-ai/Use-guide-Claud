import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerContentRecord } from '../../types/partnerContent';

vi.mock('../verification/VerificationStatusChip', () => ({
  VerificationStatusChip: ({ onOpen }: { onOpen: () => void }) => (
    <button type="button" onClick={onOpen}>
      selo
    </button>
  ),
}));
vi.mock('../plan/ListingPlanChip', () => ({
  ListingPlanChip: ({ onOpen }: { onOpen: () => void }) => (
    <button type="button" onClick={onOpen}>
      plano
    </button>
  ),
}));

import { PartnerItemsTable } from './PartnerItemsTable';

const item = {
  id: 'item-1',
  name: 'Pousada Sol',
  category: 'hotel',
  description: '',
  image: '',
  location: 'jeri',
  isActive: true,
} as PartnerContentRecord;

function renderTable() {
  const props = {
    onEditItem: vi.fn(),
    onToggleActive: vi.fn().mockResolvedValue(undefined),
    onVerifyItem: vi.fn(),
    onOpenPlan: vi.fn(),
  };
  render(
    <PartnerItemsTable
      itemsList={[item]}
      loading={false}
      onCreateNew={vi.fn()}
      verificationVersion={0}
      planVersion={0}
      {...props}
    />
  );
  return props;
}

describe('PartnerItemsTable', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('cartão sem botão dentro de botão: editar, selos e interruptor são irmãos', () => {
    const props = renderTable();
    const edit = screen.getByRole('button', { name: 'Editar Pousada Sol' });
    expect(edit.querySelector('button')).toBeNull();
    expect(screen.getByRole('switch').closest('[role="button"]')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'selo' }));
    expect(props.onVerifyItem).toHaveBeenCalledWith(item);
    expect(props.onEditItem).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'plano' }));
    expect(props.onOpenPlan).toHaveBeenCalledWith(item);
    expect(props.onEditItem).not.toHaveBeenCalled();

    fireEvent.click(edit);
    expect(props.onEditItem).toHaveBeenCalledWith(item);
  });

  it('interruptor ativa ou desativa sem abrir o editor', () => {
    const props = renderTable();
    fireEvent.click(screen.getByRole('switch'));
    expect(props.onToggleActive).toHaveBeenCalledWith('item-1', true);
    expect(props.onEditItem).not.toHaveBeenCalled();
  });
});
