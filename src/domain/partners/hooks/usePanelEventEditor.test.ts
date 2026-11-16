import { act, renderHook, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import type { PartnerContentEditorState } from '../types/partnerContent';
import { usePanelEventEditor } from './usePanelEventEditor';
import { usePanelNavigation } from './usePanelNavigation';

vi.mock('./usePartnerEventSessions', () => ({
  usePartnerEventSessions: () => ({ loadState: 'ready', savedIds: ['s1'] }),
}));

const event = { id: 'ev1', name: 'Luau', category: 'event' } as PartnerContentEditorState;

function setup(save = vi.fn(async () => true), remove = vi.fn(async () => true)) {
  const setShowDeleteConfirm = vi.fn();
  const view = renderHook(() => {
    const nav = usePanelNavigation();
    const [isEditing, setIsEditing] = useState<PartnerContentEditorState | null>(null);
    const editor = usePanelEventEditor({
      nav,
      isEditing,
      setIsEditing,
      setShowDeleteConfirm,
      isLoading: false,
      handleSaveEvent: save,
      handleDeleteEvent: remove,
    });
    return { nav, editor };
  });
  // A pilha ouve o voltar do histórico enquanto alguém a mostra (o painel, no app).
  const stop = view.result.current.nav.pages.subscribe(() => undefined);
  return { ...view, save, remove, setShowDeleteConfirm, stop };
}

const views = (result: { current: { nav: ReturnType<typeof usePanelNavigation> } }) =>
  result.current.nav.pages.getPages().map((page) => page.view);

describe('usePanelEventEditor (item 4 da D33)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });
  afterEach(() => window.history.replaceState(null, ''));

  it('abre o editor por cima do evento; salvar fecha só as páginas do editor e relê os eventos', async () => {
    const { result, save, stop } = setup();
    act(() => result.current.nav.openEvent({ id: 'ev1', title: 'Luau' }));
    act(() => result.current.editor.openEditor(event, false));
    expect(result.current.nav.pages.getPages().at(-1)).toEqual({
      view: 'event-editor',
      title: 'Editar evento',
    });
    act(() => result.current.nav.openEventSection('info', 'Informações'));

    await act(async () => {
      await result.current.editor.save();
    });
    expect(save).toHaveBeenCalledWith({ sessionsLoadState: 'ready', savedSessionIds: ['s1'] });
    await waitFor(() => expect(views(result)).toEqual(['event']));
    expect(result.current.editor.item).toBeNull();
    expect(result.current.editor.eventsVersion).toBe(1);
    stop();
  });

  it('salvar que falha mantém o editor aberto, com o rascunho', async () => {
    const { result, stop } = setup(vi.fn(async () => false));
    act(() => result.current.editor.openNew('owner-1'));
    expect(result.current.nav.pages.getPages().at(-1)).toMatchObject({ title: 'Novo evento' });
    await act(async () => {
      await result.current.editor.save();
    });
    expect(views(result)).toEqual(['event-editor']);
    expect(result.current.editor.item).not.toBeNull();
    stop();
  });

  it('excluir fecha o editor e a página do evento excluído', async () => {
    const { result, stop } = setup();
    act(() => result.current.nav.openEvent({ id: 'ev1', title: 'Luau' }));
    act(() => result.current.editor.openEditor(event, false));
    await act(async () => {
      await result.current.editor.remove();
    });
    await waitFor(() => expect(views(result)).toEqual([]));
    stop();
  });

  it('voltar do editor descarta o rascunho e fecha a confirmação de excluir', async () => {
    const { result, setShowDeleteConfirm, stop } = setup();
    act(() => result.current.editor.openEditor(event, true));
    expect(result.current.editor.hasSales).toBe(true);
    act(() => result.current.nav.pages.back());
    await waitFor(() => expect(result.current.editor.item).toBeNull());
    expect(setShowDeleteConfirm).toHaveBeenCalledWith(false);
    stop();
  });
});
