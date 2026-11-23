import { useSyncExternalStore } from 'react';
import type { EventSessionsLoadState } from '../../../domain/events';
import type { PartnerContentEditorState } from '../../../domain/partners';

/**
 * O evento aberto no editor do admin (escolhas da F4), dividido entre a página das linhas e as páginas
 * de cada seção, como no painel do parceiro. Fechar o editor limpa o rascunho.
 */
export interface AdminEventState {
  draft: PartnerContentEditorState | null;
  sessionsLoadState: EventSessionsLoadState;
  savedSessionIds: string[];
  lockedSessionIds: string[];
  isUploading: boolean;
  deleteConfirm: boolean;
}

const EMPTY: AdminEventState = {
  draft: null,
  sessionsLoadState: 'idle',
  savedSessionIds: [],
  lockedSessionIds: [],
  isUploading: false,
  deleteConfirm: false,
};

let state = EMPTY;
const listeners = new Set<() => void>();

export function setAdminEvent(patch: Partial<AdminEventState>): void {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

/** Junta ao rascunho atual o que chegou depois (sessões e regras de venda salvas). */
export function mergeAdminEventDraft(patch: Partial<PartnerContentEditorState>): void {
  if (state.draft) setAdminEvent({ draft: { ...state.draft, ...patch } });
}

export function clearAdminEvent(): void {
  setAdminEvent(EMPTY);
}

export function useAdminEvent(): AdminEventState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => state,
    () => state
  );
}
