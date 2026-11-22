import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { PartnerOffer } from '../../types/bookings';
import { ListingOffersLink } from './ListingOffersLink';

vi.mock('../../application/usecases/listPartnerOffersUseCase', () => ({
  listPartnerOffersUseCase: vi.fn(),
}));

import { listPartnerOffersUseCase } from '../../application/usecases/listPartnerOffersUseCase';

const offer = (id: string, guideItemId: string, status: string) =>
  ({ id, guideItemId, status }) as unknown as PartnerOffer;

describe('ListingOffersLink (protótipo da F3, tela 1)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('conta só as ofertas à venda do anúncio e abre a página do estabelecimento', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([
      offer('a', 'item-1', 'published'),
      offer('b', 'item-1', 'draft'),
      offer('c', 'item-2', 'published'),
    ]);
    const onOpen = vi.fn();
    render(<ListingOffersLink itemId="item-1" category="tour" onOpen={onOpen} />);
    const link = await screen.findByRole('button', { name: /Ver as ofertas deste passeio/ });
    expect(link).toHaveTextContent('1 oferta à venda');
    fireEvent.click(link);
    expect(onOpen).toHaveBeenCalled();
  });

  it('sem oferta à venda diz isso; categoria que não vende não mostra nada', async () => {
    vi.mocked(listPartnerOffersUseCase).mockResolvedValue([]);
    const { rerender } = render(
      <ListingOffersLink itemId="item-1" category="rental" onOpen={vi.fn()} />
    );
    expect(await screen.findByText('Nenhuma oferta à venda ainda')).toBeInTheDocument();
    expect(screen.getByText('Ver as ofertas deste aluguel')).toBeInTheDocument();
    rerender(<ListingOffersLink itemId="item-1" category="restaurant" onOpen={vi.fn()} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
