import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { usePanelNavigation } from '../../hooks/usePanelNavigation';
import {
  type PartnerPanelPageContext,
  PartnerPanelPageContent,
  partnerPanelPageTitle,
} from './PartnerPanelPageContent';

const context = (overrides: Partial<PartnerPanelPageContext> = {}): PartnerPanelPageContext => ({
  items: [],
  events: [],
  establishments: [],
  eventReloadKey: 0,
  eventsVersion: 0,
  verificationVersion: 0,
  planVersion: 0,
  catalogRenders: {},
  earningsRenders: {},
  reportsProfile: null,
  onOpenSession: vi.fn(),
  onEditItem: vi.fn(),
  onEditEvent: vi.fn(),
  onOpenPlan: vi.fn(),
  onVerify: vi.fn(),
  onToggleActive: vi.fn(),
  onOpenReportsProfile: vi.fn(),
  onOpenAccount: vi.fn(),
  listingSteps: [],
  registerListingSave: vi.fn(),
  onListingDone: vi.fn(),
  ...overrides,
});

describe('páginas do painel (D33): Catálogo e Ganhos', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });
  afterEach(() => window.history.replaceState(null, ''));

  it('estabelecimento, evento e conta levam o nome da linha tocada para a barra', () => {
    const t = i18n.t.bind(i18n);
    expect(
      partnerPanelPageTitle({ view: 'place', id: 'p1', title: 'Buggy do Preá' }, t, null)
    ).toBe('Buggy do Preá');
    expect(partnerPanelPageTitle({ view: 'event', id: 'e1', title: 'Luau' }, t, null)).toBe('Luau');
    expect(partnerPanelPageTitle({ view: 'reports' }, t, null)).toBe(
      i18n.t('partnerEarnings.reports.title')
    );
    expect(partnerPanelPageTitle({ view: 'reports-profile' }, t, null)).toBe(
      i18n.t('partnerEarnings.reports.profile')
    );
    expect(partnerPanelPageTitle({ view: 'accounts' }, t, null)).toBe(
      i18n.t('paymentAccounts.page.title')
    );
  });

  it('a página abre por cima da aba atual; ir para outra aba fecha as páginas', async () => {
    const { result } = renderHook(() => usePanelNavigation());
    act(() => result.current.openPlace({ id: 'p1', name: 'Buggy do Preá' }));
    act(() => result.current.openReportsProfile());
    expect(result.current.pages.getPages()).toEqual([
      { view: 'place', id: 'p1', title: 'Buggy do Preá' },
      { view: 'reports-profile' },
    ]);
    expect(result.current.panelTab).toBe('home');

    act(() => result.current.openTab('earnings'));
    expect(result.current.panelTab).toBe('earnings');
    await waitFor(() => expect(result.current.pages.getPages()).toEqual([]));
  });

  it('as contas abrem a conta tocada por cima, com o nome dela', () => {
    const onOpenAccount = vi.fn();
    render(
      <PartnerPanelPageContent
        page={{ view: 'accounts' }}
        context={context({
          onOpenAccount,
          earningsRenders: {
            renderAccounts: ({ onOpenAccount: open }) => (
              <button type="button" onClick={() => open({ key: 'k1', title: 'Buggy do Preá' })}>
                conta
              </button>
            ),
          },
        })}
      />
    );
    screen.getByRole('button', { name: 'conta' }).click();
    expect(onOpenAccount).toHaveBeenCalledWith({ key: 'k1', title: 'Buggy do Preá' });
  });

  it('a conta e as visitas e avaliações mostram o que a composição monta', () => {
    const { unmount } = render(
      <PartnerPanelPageContent
        page={{ view: 'account', key: 'k1', title: 'Buggy do Preá' }}
        context={context({ earningsRenders: { renderAccount: (key) => <p>conta {key}</p> } })}
      />
    );
    expect(screen.getByText('conta k1')).toBeTruthy();
    unmount();
    render(
      <PartnerPanelPageContent
        page={{ view: 'reports-profile' }}
        context={context({ reportsProfile: <p>visitas</p> })}
      />
    );
    expect(screen.getByText('visitas')).toBeTruthy();
  });
});
