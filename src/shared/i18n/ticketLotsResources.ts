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

export const ticketLotsEn: TicketLotsTranslation = {
  newTitle: 'New tier',
  name: 'Tier name',
  namePlaceholder: 'E.g. Early bird, VIP',
  kind: 'Type',
  kindPaid: 'Paid ticket',
  kindFree: 'Free registration',
  price: 'Price (R$)',
  quantity: 'Total quantity',
  description: 'Description (optional)',
  descriptionPlaceholder: 'What this tier includes',
  visibility: 'Who can see it',
  visibilityPublic: 'Public',
  visibilityHidden: 'Hidden',
  visibilityRestricted: 'Restricted',
  minPerOrder: 'Minimum per order',
  maxPerOrder: 'Maximum per order',
  sortOrder: 'Position in the list',
  salesStartsAt: 'Sales start',
  salesEndsAt: 'Sales end',
  requiresEligibility: 'Requires proof for half-price entry',
  add: 'Add tier',
  adding: 'Adding…',
  free: 'Free',
  sold: 'Sold: {{sold}} of {{quantity}}',
  reserved: 'Reserved: {{count}}',
  perOrder: '{{min}} to {{max}} per order',
  pause: 'Pause',
  resume: 'Resume',
  remove: 'Remove tier {{name}}',
  empty: 'This session has no tiers yet.',
  loading: 'Loading tiers…',
  created: 'Tier created.',
  createError: 'Could not create the tier.',
  archived: 'Tier archived: it already has sales.',
  removed: 'Tier removed.',
  removeError: 'Could not remove the tier.',
  paused: 'Tier sales paused.',
  resumed: 'Tier back on sale.',
  updateError: 'Could not update the tier.',
  status: {
    draft: 'Draft',
    on_sale: 'On sale',
    paused: 'Paused',
    sold_out: 'Sold out',
    ended: 'Closed',
    archived: 'Archived',
  },
};

export const ticketLotsFr: TicketLotsTranslation = {
  newTitle: 'Nouveau lot',
  name: 'Nom du lot',
  namePlaceholder: 'Ex. : 1er lot, VIP',
  kind: 'Type',
  kindPaid: 'Billet payant',
  kindFree: 'Inscription gratuite',
  price: 'Prix (R$)',
  quantity: 'Quantité totale',
  description: 'Description (facultatif)',
  descriptionPlaceholder: 'Ce que ce lot comprend',
  visibility: 'Qui le voit',
  visibilityPublic: 'Public',
  visibilityHidden: 'Masqué',
  visibilityRestricted: 'Restreint',
  minPerOrder: 'Minimum par commande',
  maxPerOrder: 'Maximum par commande',
  sortOrder: 'Position dans la liste',
  salesStartsAt: 'Début des ventes',
  salesEndsAt: 'Fin des ventes',
  requiresEligibility: 'Justificatif de demi-tarif exigé',
  add: 'Ajouter le lot',
  adding: 'Ajout…',
  free: 'Gratuit',
  sold: 'Vendus : {{sold}} sur {{quantity}}',
  reserved: 'Réservés : {{count}}',
  perOrder: 'De {{min}} à {{max}} par commande',
  pause: 'Mettre en pause',
  resume: 'Réactiver',
  remove: 'Supprimer le lot {{name}}',
  empty: 'Cette séance n’a pas encore de lots.',
  loading: 'Chargement des lots…',
  created: 'Lot créé.',
  createError: 'Impossible de créer le lot.',
  archived: 'Lot archivé : il a déjà des ventes.',
  removed: 'Lot supprimé.',
  removeError: 'Impossible de supprimer le lot.',
  paused: 'Ventes du lot en pause.',
  resumed: 'Lot remis en vente.',
  updateError: 'Impossible de mettre à jour le lot.',
  status: {
    draft: 'Brouillon',
    on_sale: 'En vente',
    paused: 'En pause',
    sold_out: 'Épuisé',
    ended: 'Terminé',
    archived: 'Archivé',
  },
};
