import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSyncLocaleWithUrl } from '../../shared/hooks/useLocalizedRouting';
import { i18n } from '../../shared/i18n';
import { AppRoutes } from './AppRoutes';

vi.mock('../../domain/guide/components/ExploreView', () => ({
  ExploreView: () => <div>explore-view</div>,
}));
vi.mock('../../domain/guide/components/GridView', () => ({
  GridView: ({ category }: { category: string }) => <div>grid-{category}</div>,
}));
vi.mock('../../domain/favorites', () => ({
  FavoritesList: () => <div>favorites-list</div>,
}));
vi.mock('../../domain/ticketing', () => ({
  CheckoutResultView: ({ orderId }: { orderId: string }) => <div>checkout-{orderId}</div>,
}));
vi.mock('../../domain/admin/components/AdminDispatcher', () => ({
  AdminDispatcher: () => <div>admin</div>,
}));
vi.mock('../../domain/auth/components/ResetPassword', () => ({
  ResetPassword: () => <div>reset</div>,
}));

function Harness() {
  const location = useLocation();
  useSyncLocaleWithUrl();
  return <AppRoutes location={location} onSelectItem={vi.fn()} onStickyChange={vi.fn()} />;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Harness />
    </MemoryRouter>
  );
}

describe('AppRoutes', () => {
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('rota em inglês renderiza a listagem e troca o idioma para en', async () => {
    renderAt('/en/tours');
    expect(screen.getByText('grid-tour')).toBeTruthy();
    await waitFor(() => expect(i18n.language).toBe('en'));
  });

  it('slug traduzido em francês leva à mesma listagem', () => {
    renderAt('/fr/hebergements');
    expect(screen.getByText('grid-hotel')).toBeTruthy();
  });

  it('/favoritos renderiza a lista de favoritos', () => {
    renderAt('/favoritos');
    expect(screen.getByText('favorites-list')).toBeTruthy();
  });

  it('/checkout/result com orderId mostra o resultado do pedido', () => {
    renderAt('/checkout/result?orderId=order-1');
    expect(screen.getByText('checkout-order-1')).toBeTruthy();
  });

  it('/checkout/result de plano orienta a abrir a área do parceiro', () => {
    renderAt('/checkout/result?kind=plan');
    expect(screen.getByText('Pagamento do plano em processamento')).toBeTruthy();
  });

  it('rota inexistente renderiza a página não encontrada sem mudar o idioma', async () => {
    await i18n.changeLanguage('fr');
    renderAt('/rota-inexistente');
    expect(screen.getByText('Page introuvable')).toBeTruthy();
    expect(i18n.language).toBe('fr');
  });
});
