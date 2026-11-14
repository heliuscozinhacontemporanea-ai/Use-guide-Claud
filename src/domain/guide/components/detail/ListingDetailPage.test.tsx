import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BOTTOM_NAV_CLEARANCE } from '../../../../shared/constants/bottomNav';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { i18n } from '../../../../shared/i18n';
import type { GuideItem } from '../../types/guide';
import { ListingDetailPage } from './ListingDetailPage';

vi.mock('../../../favorites/components/FavoriteButton', () => ({ FavoriteButton: () => null }));
vi.mock('../../../../ui/components/ShareButton', () => ({ ShareButton: () => null }));
vi.mock('../../../insights', () => ({ trackInteractionUseCase: vi.fn() }));

const ITEM = {
  id: 'buggy',
  name: 'Buggy do Preá',
  category: 'tour',
  location: 'prea',
  images: ['https://images.unsplash.com/a', 'https://images.unsplash.com/b'],
} as GuideItem;

const page = (coversTabBar?: boolean) =>
  render(
    <ListingDetailPage
      item={ITEM}
      onClose={vi.fn()}
      locationLabel="Preá, Ceará"
      favoriteLabel="passeio"
      coversTabBar={coversTabBar}
    >
      <p>conteúdo</p>
    </ListingDetailPage>
  );

describe('ListingDetailPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('é página da aba: abaixo da barra de abas, sem prender o leitor de tela, com espaço para a barra', () => {
    page();
    const region = screen.getByRole('region', { name: 'Buggy do Preá' });
    expect(region).not.toHaveAttribute('aria-modal');
    expect(region.parentElement).toHaveStyle({ zIndex: String(Z_INDEX.tabPage) });
    expect(Z_INDEX.tabPage).toBeLessThan(Z_INDEX.bottomNav);
    expect(Z_INDEX.tabPage).toBeGreaterThan(Z_INDEX.header);
    const content = screen.getByText('conteúdo').parentElement;
    expect(content?.style.paddingBottom).toBe(BOTTOM_NAV_CLEARANCE);
  });

  it('aberto pela busca fica por cima de tudo, como janela à parte', () => {
    page(true);
    const dialog = screen.getByRole('dialog', { name: 'Buggy do Preá' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.parentElement).toHaveStyle({ zIndex: String(Z_INDEX.modal) });
  });

  it('etiqueta da categoria e texto das fotos no idioma ativo', async () => {
    await i18n.changeLanguage('fr');
    page();
    expect(screen.getByText('Excursions')).toBeInTheDocument();
    expect(screen.getByAltText('Buggy do Preá, photo 2 sur 2')).toBeInTheDocument();
  });
});
