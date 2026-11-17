import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { isEventEditorPage, usePanelNavigation } from '../../hooks/usePanelNavigation';
import {
  type PartnerPanelPageContext,
  PartnerPanelPageContent,
  partnerPanelPageAction,
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
  onOpenListingBlock: vi.fn(),
  onListingDeleted: vi.fn(),
  onListingCreated: vi.fn(),
  renderEventEditor: vi.fn(() => null),
  registerOfferSave: vi.fn(),
  onOfferSaved: vi.fn(),
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

  it('editores (F2): título na barra e "Salvar" nos blocos e nas páginas do evento', () => {
    const t = i18n.t.bind(i18n);
    expect(
      partnerPanelPageTitle({ view: 'listing-editor', itemId: 'p1', title: 'Buggy' }, t, null)
    ).toBe('Editar anúncio');
    expect(partnerPanelPageTitle({ view: 'listing-new' }, t, null)).toBe('Novo estabelecimento');
    expect(partnerPanelPageTitle({ view: 'listing-new', categories: ['producer'] }, t, null)).toBe(
      'Perfil de produtor'
    );
    expect(
      partnerPanelPageTitle(
        { view: 'event-section', section: 'info', title: 'Informações' },
        t,
        null
      )
    ).toBe('Informações');

    const actions = {
      saveListing: vi.fn(),
      saveOffer: vi.fn(),
      saveEvent: vi.fn(),
      savingEvent: false,
    };
    // Oferta (F3): o título vem de quem pediu a página; só o editor tem "Salvar".
    const offerEditor = {
      view: 'offer',
      request: { kind: 'editor', itemId: 'p1', category: 'tour', title: 'Nova oferta' },
    } as const;
    expect(partnerPanelPageTitle(offerEditor, t, null)).toBe('Nova oferta');
    const saveOffer = partnerPanelPageAction(offerEditor, t, actions);
    expect(saveOffer?.label).toBe('Salvar');
    saveOffer?.onClick();
    expect(actions.saveOffer).toHaveBeenCalled();
    expect(
      partnerPanelPageAction(
        { view: 'offer', request: { kind: 'slots', offerId: 'o1', title: 'Horários' } },
        t,
        actions
      )
    ).toBeUndefined();
    const step = { view: 'listing-step', itemId: 'p1', step: 'name', title: 'Nome' } as const;
    partnerPanelPageAction(step, t, actions)?.onClick();
    expect(actions.saveListing).toHaveBeenCalled();
    expect(partnerPanelPageAction({ ...step, step: 'publish' }, t, actions)).toBeUndefined();
    expect(
      partnerPanelPageAction({ view: 'listing-editor', itemId: 'p1', title: 'B' }, t, actions)
    ).toBeUndefined();
    const event = partnerPanelPageAction(
      { view: 'event-editor', title: 'Editar evento' },
      t,
      actions
    );
    expect(event?.label).toBe('Salvar');
    event?.onClick();
    expect(actions.saveEvent).toHaveBeenCalled();
    expect(
      partnerPanelPageAction({ view: 'event-editor', title: 'E' }, t, {
        ...actions,
        savingEvent: true,
      })?.label
    ).toBe('Salvando…');
  });

  it('salvar o evento fecha só as páginas do editor; o evento excluído fecha também a dele', async () => {
    const { result } = renderHook(() => usePanelNavigation());
    // A pilha ouve o voltar do histórico enquanto alguém a mostra (o painel, no app).
    const stop = result.current.pages.subscribe(() => undefined);
    act(() => result.current.openEvent({ id: 'e1', title: 'Luau' }));
    act(() => result.current.openEventEditor('Editar evento'));
    act(() => result.current.openEventSection('info', 'Informações'));
    act(() => result.current.closeTop(isEventEditorPage));
    await waitFor(() =>
      expect(result.current.pages.getPages()).toEqual([{ view: 'event', id: 'e1', title: 'Luau' }])
    );

    act(() => result.current.openEventEditor('Editar evento'));
    act(() =>
      result.current.closeTop(
        (page) => isEventEditorPage(page) || (page.view === 'event' && page.id === 'e1')
      )
    );
    await waitFor(() => expect(result.current.pages.getPages()).toEqual([]));
    stop();
  });

  it('o editor do anúncio mostra os blocos do item, com os passos do estabelecimento', async () => {
    const onOpenListingBlock = vi.fn();
    render(
      <PartnerPanelPageContent
        page={{ view: 'listing-editor', itemId: 'p1', title: 'Buggy' }}
        context={context({
          items: [
            {
              id: 'p1',
              name: 'Buggy do Preá',
              category: 'tour',
              images: [],
              operationalInfo: {},
            } as never,
          ],
          establishments: [
            {
              id: 'p1',
              publication: 'draft',
              setupSteps: [{ id: 'photos', done: false, missing: ['images'] }],
            } as never,
          ],
          onOpenListingBlock,
        })}
      />
    );
    expect(screen.getByText('Rascunho: ainda fora do guia')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Fotos/ }).textContent).toContain('Falta: uma foto');
    screen.getByRole('button', { name: /Fotos/ }).click();
    expect(onOpenListingBlock).toHaveBeenCalledWith('p1', 'photos', 'Fotos');
  });
});
