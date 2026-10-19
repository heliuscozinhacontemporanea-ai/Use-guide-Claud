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
vi.mock('../../domain/ticketing', () => ({
  CheckoutResultView: ({ orderId }: { orderId: string }) => <div>checkout-{orderId}</div>,
}));
vi.mock('../compositions/AdminPanelComposition', () => ({
  AdminPanelComposition: () => <div>admin</div>,
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
    expect(await screen.findByText('grid-tour')).toBeTruthy();
    await waitFor(() => expect(i18n.language).toBe('en'));
  });

  it('slug traduzido em francês leva à mesma listagem', async () => {
    renderAt('/fr/hebergements');
    expect(await screen.findByText('grid-hotel')).toBeTruthy();
  });

  it('/favoritos não é página: favoritos ficam no menu lateral', async () => {
    renderAt('/favoritos');
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy();
    expect(screen.queryByText(/grid-|explore-view/)).toBeNull();
  });

  it('/checkout/result com orderId mostra o resultado do pedido', async () => {
    renderAt('/checkout/result?orderId=order-1');
    expect(await screen.findByText('checkout-order-1')).toBeTruthy();
  });

  it('/checkout/result de plano orienta a abrir a área do parceiro', async () => {
    renderAt('/checkout/result?kind=plan');
    expect(await screen.findByText('Pagamento do plano em processamento')).toBeTruthy();
  });

  it('rota inexistente renderiza a página não encontrada sem mudar o idioma', async () => {
    await i18n.changeLanguage('fr');
    renderAt('/rota-inexistente');
    expect(await screen.findByText('Page introuvable')).toBeTruthy();
    expect(i18n.language).toBe('fr');
  });
});
