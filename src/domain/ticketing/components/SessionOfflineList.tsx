import type { ReactNode } from 'react';
import { useOfflineTicketSession } from '../hooks/useOfflineTicketSession';

/** Situação da lista sem internet de uma sessão neste aparelho (C5), em termos neutros. */
export interface SessionOfflineListState {
  status: 'missing' | 'ready' | 'no_connection';
  /** Ingressos na lista guardada. */
  count: number | null;
  /** Última vez em que a lista foi baixada ou atualizada neste aparelho. */
  updatedAt: string | null;
  online: boolean;
  busy: boolean;
  failed: boolean;
  download: () => void;
}

const noop = () => undefined;

/**
 * Lê do aparelho se a lista sem internet da sessão já foi baixada e oferece o download (C5). Com
 * internet, a lista guardada se atualiza sozinha (D21); quem monta o cartão decide a aparência.
 */
export function SessionOfflineList({
  occurrenceId,
  children,
}: {
  occurrenceId: string;
  children: (state: SessionOfflineListState) => ReactNode;
}) {
  const session = useOfflineTicketSession(occurrenceId, noop);
  const { bundle, isOnline } = session;
  return children({
    status: bundle ? 'ready' : isOnline ? 'missing' : 'no_connection',
    count: bundle ? bundle.tickets.length : null,
    updatedAt: bundle?.changesSince ?? null,
    online: isOnline,
    busy: session.preparing,
    failed: session.notice?.kind === 'error',
    download: () => void session.prepare(),
  });
}
