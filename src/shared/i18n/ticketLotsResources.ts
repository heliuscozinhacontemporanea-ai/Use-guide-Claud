/** Textos do editor de lotes do evento (parceiro e admin). pt-BR é a fonte. */
export interface TicketLotsTranslation {
  newTitle: string;
  name: string;
  namePlaceholder: string;
  kind: string;
  kindPaid: string;
  kindFree: string;
  price: string;
  quantity: string;
  description: string;
  descriptionPlaceholder: string;
  visibility: string;
  visibilityPublic: string;
  visibilityHidden: string;
  visibilityRestricted: string;
  minPerOrder: string;
  maxPerOrder: string;
  sortOrder: string;
  salesStartsAt: string;
  salesEndsAt: string;
  requiresEligibility: string;
  add: string;
  adding: string;
  free: string;
  sold: string;
  reserved: string;
  perOrder: string;
  pause: string;
  resume: string;
  remove: string;
  empty: string;
  loading: string;
  created: string;
  createError: string;
  archived: string;
  removed: string;
  removeError: string;
  paused: string;
  resumed: string;
  updateError: string;
  status: {
    draft: string;
    on_sale: string;
    paused: string;
    sold_out: string;
    ended: string;
    archived: string;
  };
}

export const ticketLotsPtBR: TicketLotsTranslation = {
  newTitle: 'Novo lote',
  name: 'Nome do lote',
  namePlaceholder: 'Ex.: 1º lote, VIP',
  kind: 'Tipo',
  kindPaid: 'Ingresso pago',
  kindFree: 'Inscrição gratuita',
  price: 'Preço (R$)',
  quantity: 'Quantidade total',
  description: 'Descrição (opcional)',
  descriptionPlaceholder: 'O que este lote inclui',
  visibility: 'Quem vê',
  visibilityPublic: 'Público',
  visibilityHidden: 'Oculto',
  visibilityRestricted: 'Restrito',
  minPerOrder: 'Mínimo por pedido',
  maxPerOrder: 'Máximo por pedido',
  sortOrder: 'Ordem na lista',
  salesStartsAt: 'Início das vendas',
  salesEndsAt: 'Fim das vendas',
  requiresEligibility: 'Exige comprovante de meia-entrada',
  add: 'Adicionar lote',
  adding: 'Adicionando…',
  free: 'Gratuito',
  sold: 'Vendidos: {{sold}} de {{quantity}}',
  reserved: 'Reservados: {{count}}',
  perOrder: 'De {{min}} a {{max}} por pedido',
  pause: 'Pausar',
  resume: 'Reativar',
  remove: 'Remover o lote {{name}}',
  empty: 'Esta sessão ainda não tem lotes.',
  loading: 'Carregando os lotes…',
  created: 'Lote criado.',
  createError: 'Não foi possível criar o lote.',
  archived: 'Lote arquivado: ele já tem vendas.',
  removed: 'Lote removido.',
  removeError: 'Não foi possível remover o lote.',
  paused: 'Vendas do lote pausadas.',
  resumed: 'Lote reativado para venda.',
  updateError: 'Não foi possível atualizar o lote.',
  status: {
    draft: 'Rascunho',
    on_sale: 'À venda',
    paused: 'Pausado',
    sold_out: 'Esgotado',
    ended: 'Encerrado',
    archived: 'Arquivado',
  },
};
