/** Sessão de um evento em edição (data, horário e capacidade). `id` existe nas sessões já salvas. */
export interface EventSessionDraft {
  id?: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  /** Fim das vendas pelo app (D21): sugerido 2 h antes do início. */
  salesEndsAt?: string;
}

export type EventSessionsLoadState = 'idle' | 'loading' | 'ready' | 'error';

/** Quem grava as sessões: cada um usa as rotas da própria área. */
export type EventSessionsScope = 'admin' | 'partner';
