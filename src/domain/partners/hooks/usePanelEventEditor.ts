import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PartnerContentEditorState } from '../types/partnerContent';
import { newPartnerEventDraft } from '../utils/newPartnerEventDraft';
import { isEventEditorPage, type usePanelNavigation } from './usePanelNavigation';
import type { SaveEventSessionsContext } from './usePartnerContentActions';
import { usePartnerEventSessions } from './usePartnerEventSessions';

interface PanelEventEditorOptions {
  nav: ReturnType<typeof usePanelNavigation>;
  isEditing: PartnerContentEditorState | null;
  setIsEditing: Dispatch<SetStateAction<PartnerContentEditorState | null>>;
  setShowDeleteConfirm: (open: boolean) => void;
  isLoading: boolean;
  handleSaveEvent: (context: SaveEventSessionsContext) => Promise<boolean>;
  handleDeleteEvent: () => Promise<boolean>;
}

/**
 * Editor de evento como páginas empilhadas do painel (item 4 da D33). Salvar fecha as páginas do
 * editor; excluir fecha também a página do evento; sair delas (voltar, salvar ou excluir) descarta o
 * rascunho e relê os eventos.
 */
export function usePanelEventEditor({
  nav,
  isEditing,
  setIsEditing,
  setShowDeleteConfirm,
  isLoading,
  handleSaveEvent,
  handleDeleteEvent,
}: PanelEventEditorOptions) {
  const { t } = useTranslation();
  const [hasSales, setHasSales] = useState(false);
  const [eventsVersion, setEventsVersion] = useState(0);
  const open = useRef(false);

  useEffect(
    () =>
      nav.pages.subscribe(() => {
        const nowOpen = nav.pages.getPages().some(isEventEditorPage);
        if (open.current && !nowOpen) {
          setIsEditing(null);
          setShowDeleteConfirm(false);
          setEventsVersion((version) => version + 1);
        }
        open.current = nowOpen;
      }),
    [nav.pages, setIsEditing, setShowDeleteConfirm]
  );

  const editingEventId = isEditing?.category === 'event' ? isEditing.id || undefined : undefined;
  const sessions = usePartnerEventSessions(editingEventId, (details) =>
    setIsEditing((current) => (current ? { ...current, ...details } : current))
  );

  const openEditor = (item: PartnerContentEditorState, sales: boolean) => {
    setHasSales(sales);
    setIsEditing(item);
    nav.openEventEditor(
      t(item.id ? 'partnerCatalog.editor.titleEdit' : 'partnerCatalog.editor.titleNew')
    );
  };

  const save = async () => {
    if (isLoading) return;
    const saved = await handleSaveEvent({
      sessionsLoadState: sessions.loadState,
      savedSessionIds: sessions.savedIds,
    });
    if (saved) nav.closeTop(isEventEditorPage);
  };

  const remove = async () => {
    const eventId = isEditing?.id;
    if (await handleDeleteEvent()) {
      nav.closeTop(
        (page) => isEventEditorPage(page) || (page.view === 'event' && page.id === eventId)
      );
    }
  };

  return {
    item: isEditing?.category === 'event' ? isEditing : null,
    hasSales,
    eventsVersion,
    sessionsLoadState: sessions.loadState,
    lockedSessionIds: sessions.lockedIds,
    openEditor,
    openNew: (ownerId: string) => openEditor(newPartnerEventDraft(ownerId), false),
    save,
    remove,
  };
}
