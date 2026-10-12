import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../domain/auth/types/auth';
import { i18n } from '../../shared/i18n';
import { useUIStore } from '../../shared/stores/useUIStore';
import { PartnerPortalComposition } from './PartnerPortalComposition';

const authState = vi.hoisted(() => ({
  value: { user: null as null | { uid: string; role: string }, loading: false },
}));

vi.mock('../../domain/auth/context/AuthContext', () => ({
  useAuthContext: () => authState.value,
}));
vi.mock('../../domain/partners', () => ({
  PartnerPanel: () => <div>partner-panel</div>,
  getPartnerProfileUseCase: vi.fn(),
}));
vi.mock('../../domain/admin', () => ({
  getActiveSubscriptionPlansUseCase: vi.fn().mockResolvedValue([]),
}));
vi.mock('../../domain/insights', () => ({ ReportsView: () => null }));
vi.mock('../../domain/payment', () => ({
  CheckoutModal: () => null,
  isPaidPlanId: () => false,
  PlanSubscriptionCard: () => null,
}));
vi.mock('../../domain/notifications', () => ({ NotificationBell: () => null }));
vi.mock('../../domain/ticketing', () => ({ PartnerEventTicketingManager: () => null }));
vi.mock('./PartnerBookingsComposition', () => ({ PartnerBookingsComposition: () => null }));

function renderPortal() {
  return render(
    <MemoryRouter initialEntries={['/?partner=1']}>
      <PartnerPortalComposition />
    </MemoryRouter>
  );
}

describe('PartnerPortalComposition', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    useUIStore.getState().closeLoginModal();
  });

  it('sem login: pede para entrar em vez de carregar para sempre', async () => {
    authState.value = { user: null, loading: false };
    renderPortal();
    const btn = await screen.findByRole('button', { name: 'Entrar' });
    fireEvent.click(btn);
    expect(useUIStore.getState().isLoginModalOpen).toBe(true);
  });

  it('quem não é parceiro vê o aviso com caminho de volta ao guia', async () => {
    authState.value = { user: { uid: 'u1', role: UserRole.USER }, loading: false };
    renderPortal();
    expect(
      await screen.findByText('Este painel é exclusivo para parceiros cadastrados.')
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Voltar ao início' })).toBeTruthy();
  });
});

describe('PartnerPortalComposition — parceiro suspenso', () => {
  it('mostra o aviso de suspensão em vez do painel', async () => {
    const { getPartnerProfileUseCase } = await import('../../domain/partners');
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue({
      id: 'p1',
      status: 'suspended',
    } as never);
    authState.value = { user: { uid: 'p1', role: UserRole.PARTNER }, loading: false };
    await i18n.changeLanguage('pt-BR');
    renderPortal();
    expect(await screen.findByText('Conta de parceiro suspensa')).toBeTruthy();
    expect(screen.queryByText('partner-panel')).toBeNull();
  });
});
