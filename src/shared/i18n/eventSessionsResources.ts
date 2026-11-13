/** Textos do campo de sessões do evento (parceiro e admin). pt-BR é a fonte. */
export interface EventSessionsTranslation {
  loading: string;
  loadError: string;
  title: string;
  add: string;
  session: string;
  remove: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  salesEndsAt: string;
  salesEndsHint: string;
  lotDates: {
    button: string;
    buttonAria: string;
    title: string;
    hint: string;
    startsAt: string;
    endsAt: string;
    clear: string;
    save: string;
    saving: string;
    saved: string;
    orderError: string;
    saveError: string;
    summary: string;
    fromNow: string;
    untilSession: string;
  };
}

export const eventSessionsPtBR: EventSessionsTranslation = {
  loading: 'Carregando as sessões do evento…',
  loadError:
    'Não foi possível carregar as sessões deste evento. Feche e abra o editor de novo antes de salvar.',
  title: 'Sessões do evento',
  add: 'Adicionar data',
  session: 'Sessão {{n}}',
  remove: 'Remover {{session}}',
  startsAt: 'Início',
  endsAt: 'Término',
  capacity: 'Capacidade máxima',
  salesEndsAt: 'Vendas pelo app até',
  salesEndsHint:
    'Sugerimos 2 h antes do início. Depois desse horário, a lista da portaria sem internet pode ser preparada.',
  lotDates: {
    button: 'Datas de venda',
    buttonAria: 'Datas de venda do lote {{name}}',
    title: 'Datas de venda · {{name}}',
    hint: 'Hora do local do evento. Sem início, o lote vende desde já; sem fim, vende até o encerramento das vendas da sessão.',
    startsAt: 'Início das vendas',
    endsAt: 'Fim das vendas',
    clear: 'Limpar',
    save: 'Salvar datas',
    saving: 'Salvando…',
    saved: 'Datas de venda do lote atualizadas.',
    orderError: 'O fim das vendas precisa ser depois do início.',
    saveError: 'Não foi possível salvar as datas. Tente de novo.',
    summary: 'Vendas: {{from}} até {{to}}',
    fromNow: 'desde já',
    untilSession: 'o fim das vendas da sessão',
  },
};
