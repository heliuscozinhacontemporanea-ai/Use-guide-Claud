import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import type { PartnerContentEditorState } from '../types/partnerContent';
import { usePartnerContentActions } from './usePartnerContentActions';

const m = vi.hoisted(() => ({
  toast: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  updateItem: vi.fn(),
  sessions: vi.fn(),
}));
vi.mock('../../../shared/stores/useUIStore', () => ({ useUI: () => ({ showToast: m.toast }) }));
vi.mock('../application/usecases/createPartnerContentEventUseCase', () => ({
  createPartnerContentEventUseCase: m.create,
}));
vi.mock('../application/usecases/updatePartnerContentEventUseCase', () => ({
  updatePartnerContentEventUseCase: m.update,
}));
vi.mock('../application/usecases/deletePartnerContentEventUseCase', () => ({
  deletePartnerContentEventUseCase: m.remove,
}));
vi.mock('../application/usecases/updatePartnerContentItemUseCase', () => ({
  updatePartnerContentItemUseCase: m.updateItem,
}));
vi.mock('../../events', async (original) => ({
  ...(await original<typeof import('../../events')>()),
  saveEventSessionsUseCase: m.sessions,
}));

const user = { uid: 'owner-1' } as never;
const event = {
  id: 'ev1',
  name: 'Luau na Duna',
  category: 'event',
  eventCategory: 'Festa',
  location: 'Jericoacoara',
  googleMapsLink: 'https://maps.app.goo.gl/x',
  images: ['a'],
  sessions: [
    {
      id: 's1',
      startsAt: '2026-12-01T22:00:00.000Z',
      endsAt: '2026-12-02T03:00:00.000Z',
      capacity: 50,
    },
  ],
} as unknown as PartnerContentEditorState;

const setup = (isEditing: PartnerContentEditorState | null = event) => {
  const setShowDeleteConfirm = vi.fn();
  const { result } = renderHook(() =>
    usePartnerContentActions({ user, isEditing, setShowDeleteConfirm, setIsLoading: vi.fn() })
  );
  return { result, setShowDeleteConfirm };
};
const loaded = { sessionsLoadState: 'ready' as const, savedSessionIds: ['s1'] };

describe('usePartnerContentActions', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });
  afterEach(() => vi.clearAllMocks());

  it('salvar devolve verdadeiro e avisa; o rascunho fica para as páginas fecharem', async () => {
    m.update.mockResolvedValue(undefined);
    m.sessions.mockResolvedValue(undefined);
    const { result } = setup();
    let saved = false;
    await act(async () => {
      saved = await result.current.handleSaveEvent(loaded);
    });
    expect(saved).toBe(true);
    expect(m.update).toHaveBeenCalledWith('ev1', expect.objectContaining({ name: 'Luau na Duna' }));
    expect(m.update.mock.calls[0]?.[1]).not.toHaveProperty('establishmentId');
    expect(m.toast).toHaveBeenCalledWith('Evento salvo', 'success');
  });

  it('campo obrigatório: não grava e mostra a mensagem traduzida do campo', async () => {
    const { result } = setup({ ...event, images: [] });
    let saved = true;
    await act(async () => {
      saved = await result.current.handleSaveEvent(loaded);
    });
    expect(saved).toBe(false);
    expect(m.update).not.toHaveBeenCalled();
    expect(m.toast).toHaveBeenCalledWith('Adicione ao menos uma foto.', 'error');
  });

  it('sessões ainda carregando: não grava', async () => {
    const { result } = setup();
    await act(async () => {
      await result.current.handleSaveEvent({ ...loaded, sessionsLoadState: 'loading' });
    });
    expect(m.update).not.toHaveBeenCalled();
    expect(m.toast).toHaveBeenCalledWith(
      'Aguarde as sessões do evento carregarem para salvar.',
      'error'
    );
  });

  it('erro do servidor vira a mensagem do código, nunca o texto do servidor', async () => {
    m.update.mockRejectedValue(new Error('CONTACT_IN_TEXT'));
    const { result } = setup();
    await act(async () => {
      await result.current.handleSaveEvent(loaded);
    });
    expect(m.toast).toHaveBeenCalledWith(expect.stringMatching(/^Tire telefone/), 'error');

    m.update.mockRejectedValue(new Error('Firestore exploded at line 3'));
    await act(async () => {
      await result.current.handleSaveEvent(loaded);
    });
    expect(m.toast).toHaveBeenLastCalledWith(
      'Não foi possível salvar o evento agora. Tente de novo.',
      'error'
    );
  });

  it('sessão vendida removida ou com data mudada: a mensagem diz o que fazer', async () => {
    m.update.mockResolvedValue(undefined);
    const { result } = setup();
    for (const [code, text] of [
      ['SESSION_HAS_SALES', /não foi excluída/],
      ['SESSION_DATE_LOCKED', /Use Adiar na folha da sessão/],
      ['CAPACITY_BELOW_SOLD', /abaixo dos ingressos vendidos/],
    ] as const) {
      m.sessions.mockRejectedValueOnce(new Error(code));
      let saved = true;
      await act(async () => {
        saved = await result.current.handleSaveEvent(loaded);
      });
      expect(saved).toBe(false);
      expect(m.toast).toHaveBeenLastCalledWith(expect.stringMatching(text), 'error');
    }
  });

  it('excluir: evento com vendas é recusado com a explicação; sem vendas, devolve verdadeiro', async () => {
    m.remove.mockRejectedValueOnce(new Error('EVENT_HAS_SALES'));
    const { result, setShowDeleteConfirm } = setup();
    let deleted = true;
    await act(async () => {
      deleted = await result.current.handleDeleteEvent();
    });
    expect(deleted).toBe(false);
    expect(m.toast).toHaveBeenCalledWith(expect.stringMatching(/já tem vendas/), 'error');

    m.remove.mockResolvedValueOnce(undefined);
    await act(async () => {
      deleted = await result.current.handleDeleteEvent();
    });
    expect(deleted).toBe(true);
    expect(m.remove).toHaveBeenLastCalledWith('ev1');
    expect(setShowDeleteConfirm).toHaveBeenLastCalledWith(false);
  });

  it('pausar no guia vale só para o estabelecimento', async () => {
    m.updateItem.mockResolvedValue(undefined);
    const { result } = setup(null);
    await act(async () => {
      await result.current.handleToggleActive('item-1', true);
    });
    expect(m.updateItem).toHaveBeenCalledWith('item-1', { isActive: false });
    expect(m.toast).toHaveBeenCalledWith('Pausado no guia', 'success');
  });
});
