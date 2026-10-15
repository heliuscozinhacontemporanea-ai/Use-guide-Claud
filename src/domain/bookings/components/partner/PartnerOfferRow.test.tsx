import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerOffer } from '../../types/bookings';
import { PartnerOfferRow } from './PartnerOfferRow';

const OFFER = {
  id: 'o1',
  guideItemId: 'item-1',
  kind: 'tour',
  status: 'draft',
  title: { 'pt-BR': 'Passeio de buggy' },
  pricing: { priceOptions: [{ id: 'a', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 15000 }] },
  createdAt: '',
  updatedAt: '',
} as unknown as PartnerOffer;

function renderRow(canPublish: boolean, onStatus = vi.fn()) {
  render(
    <PartnerOfferRow
      offer={OFFER}
      busy={false}
      canPublish={canPublish}
      onEdit={vi.fn()}
      onSlots={vi.fn()}
      onBookings={vi.fn()}
      onStatus={onStatus}
    />
  );
  return onStatus;
}

describe('PartnerOfferRow', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('sem conta financeira pronta, "Publicar" fica desabilitado e explica o motivo', () => {
    const onStatus = renderRow(false);
    const publish = screen.getByRole('button', { name: 'Publicar' });
    expect((publish as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Conclua a configuração financeira para publicar.')).toBeTruthy();
    fireEvent.click(publish);
    expect(onStatus).not.toHaveBeenCalled();
  });

  it('com a conta pronta, publica', () => {
    const onStatus = renderRow(true);
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(onStatus).toHaveBeenCalledWith('published');
  });
});
