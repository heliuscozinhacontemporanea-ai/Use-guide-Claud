/** Catálogo do painel do parceiro (p09) e página do estabelecimento (p19). */
export interface PartnerCatalogTranslation {
  create: string;
  emptyPlaces: string;
  emptyEvents: string;
  loadError: string;
  sessions_one: string;
  sessions_other: string;
  next: string;
  endedOn: string;
  status: {
    published: string;
    verified: string;
    draft: string;
    paused: string;
    ended: string;
    pending: string;
  };
  sold_one: string;
  sold_other: string;
  missing: { cover: string; sessions: string };
  establishment: {
    edit: string;
    planActive: string;
    noPlan: string;
    seePlans: string;
    pause: string;
    resume: string;
    rating: string;
    noRating: string;
    reviews_one: string;
    reviews_other: string;
    offers: string;
    reviewsTitle: string;
  };
  lots: {
    title: string;
    filter: string;
    allSessions: string;
    allSessionsLower: string;
    emptySession: string;
    opensOn: string;
    opensNotice: string;
    status: {
      on_sale: string;
      sold_out: string;
      not_started: string;
      paused: string;
      ended: string;
    };
    couponsNote: string;
    statusLabel: string;
    price: string;
    soldLabel: string;
    salesUntil: string;
    perDay: string;
    windowTotal_one: string;
    windowTotal_other: string;
    range: string;
    older: string;
    newer: string;
    bestDay_one: string;
    bestDay_other: string;
    noSalesInWindow: string;
    edit: string;
  };
  receive: {
    title: string;
    tickets: string;
    discounts: string;
    refunds: string;
    fee: string;
    feeNoPercent: string;
    adjustments: string;
    noteServiceFee: string;
    noteProcessing: string;
    notePayout: string;
    notePayoutTo: string;
    openEarnings: string;
  };
  event: {
    sessions_one: string;
    sessions_other: string;
    edit: string;
    sold: string;
    tickets_one: string;
    tickets_other: string;
    receive: string;
    receiveHint: string;
    sessionsTitle: string;
    sessionSold: string;
    ordersTitle: string;
    ordersEmpty: string;
    ordersSearch: string;
    ordersClear: string;
    ordersFilter: string;
    ordersAll: string;
    ordersRefunds: string;
    ordersNoResults: string;
    ordersNoRefunds: string;
    ordersFound_one: string;
    ordersFound_other: string;
    ordersMore_one: string;
    ordersMore_other: string;
    ordersLoading: string;
    ordersError: string;
    viaPromoter: string;
    coupons: string;
    couponsHint: string;
    loadError: string;
    today: string;
    yesterday: string;
    buyer: string;
    status: {
      paid: string;
      refund_requested: string;
      partially_refunded: string;
      refunded: string;
      disputed: string;
    };
  };
  order: {
    bought: string;
    ticket: string;
    serviceFee: string;
    paidWith: string;
    method: { card: string; pix: string; other: string };
    session: string;
    refund: {
      in_progress: string;
      in_progress_full: string;
      done: string;
      done_full: string;
      failed: string;
      rejected: string;
    };
  };
  editor: {
    titleEdit: string;
    titleNew: string;
    info: string;
    infoHint: string;
    sessions: string;
    noSessions: string;
    location: string;
    locationHint: string;
    tickets: string;
    paid: string;
    free: string;
    saveFirst: string;
    policy: string;
    photos: string;
    photos_one: string;
    photos_other: string;
    noPhotos: string;
    contact: string;
    noContact: string;
    site: string;
    save: string;
    delete: string;
    deleteTitle: string;
    deleteMessage: string;
    deleteHasSales: string;
    accountTitle: string;
    accountHint: string;
  };
}

export const partnerCatalogPtBR: PartnerCatalogTranslation = {
  create: 'Criar',
  emptyPlaces: 'Nenhum estabelecimento ainda.',
  emptyEvents: 'Nenhum evento ainda.',
  loadError: 'Não foi possível carregar os eventos.',
  sessions_one: '{{count}} sessão',
  sessions_other: '{{count}} sessões',
  next: 'próxima {{date}}',
  endedOn: 'Encerrado em {{date}}',
  status: {
    published: 'Publicado',
    verified: 'verificado',
    draft: 'Rascunho',
    paused: 'Pausado',
    ended: 'Encerrado',
    pending: 'verificação em análise',
  },
  sold_one: '{{count}} vendido',
  sold_other: '{{count}} vendidos',
  missing: { cover: 'falta a foto de capa', sessions: 'falta a data' },
  establishment: {
    edit: 'Editar',
    planActive: 'Plano {{plan}} até {{date}} · selo ativo',
    noPlan: 'Sem plano ativo',
    seePlans: 'Ver planos',
    pause: 'Pausar no guia',
    resume: 'Publicar no guia',
    rating: 'Avaliação',
    noRating: 'Sem nota ainda',
    reviews_one: '{{count}} avaliação',
    reviews_other: '{{count}} avaliações',
    offers: 'Passeios e aluguéis',
    reviewsTitle: 'Avaliações',
  },
  lots: {
    title: 'Vendas por lote',
    filter: 'Sessão',
    allSessions: 'Todas',
    allSessionsLower: 'todas as sessões',
    emptySession: 'Esta sessão ainda não tem lotes.',
    opensOn: 'Abre em {{date}}',
    opensNotice: 'As vendas abrem em {{date}}. O gráfico aparece a partir da primeira venda.',
    status: {
      on_sale: 'À venda',
      sold_out: 'Esgotado',
      not_started: 'Ainda não abriu',
      paused: 'Pausado',
      ended: 'Encerrado',
    },
    couponsNote:
      'Cupons de desconto: − {{amount}}. O desconto é do pedido, por isso não aparece em cada lote.',
    statusLabel: 'Situação',
    price: 'Preço',
    soldLabel: 'Vendidos',
    salesUntil: 'Vendas até',
    perDay: 'Ingressos por dia',
    windowTotal_one: '{{count}} no período',
    windowTotal_other: '{{count}} no período',
    range: '{{from}} a {{to}}',
    older: '14 dias anteriores',
    newer: '14 dias seguintes',
    bestDay_one: 'Melhor dia: {{date}}, com {{count}} ingresso.',
    bestDay_other: 'Melhor dia: {{date}}, com {{count}} ingressos.',
    noSalesInWindow: 'Nenhum ingresso vendido neste período.',
    edit: 'Editar ingressos e lotes',
  },
  receive: {
    title: 'Como chegamos a esse valor',
    tickets: 'Ingressos',
    discounts: 'Cupons de desconto',
    refunds: 'Reembolsos',
    fee: 'Taxa Use Guide ({{percent}})',
    feeNoPercent: 'Taxa Use Guide',
    adjustments: 'Multas e ajustes',
    noteServiceFee: 'Taxa de serviço paga pelos compradores: {{amount}}. Não sai do seu valor.',
    noteProcessing: 'Tarifas do cartão e do Pix: por conta da Use Guide.',
    notePayout: 'Cada sessão é repassada 2 dias depois de acabar.',
    notePayoutTo: 'Cada sessão é repassada 2 dias depois de acabar, na conta do CNPJ {{document}}.',
    openEarnings: 'Ver repasses em Ganhos',
  },
  event: {
    sessions_one: '{{count}} sessão',
    sessions_other: '{{count}} sessões',
    edit: 'Editar',
    sold: 'Vendido',
    tickets_one: '{{count}} ingresso',
    tickets_other: '{{count}} ingressos',
    receive: 'Você recebe',
    receiveHint: '2 dias depois do evento',
    sessionsTitle: 'Sessões',
    sessionSold: '{{sold}} de {{capacity}}',
    ordersTitle: 'Pedidos',
    ordersEmpty: 'Nenhum pedido ainda.',
    ordersSearch: 'Buscar por nome ou nº do pedido',
    ordersClear: 'Limpar busca',
    ordersFilter: 'Mostrar pedidos',
    ordersAll: 'Todos',
    ordersRefunds: 'Com reembolso',
    ordersNoResults: 'Nenhum pedido encontrado.',
    ordersNoRefunds: 'Nenhum pedido com reembolso.',
    ordersFound_one: '{{count}} pedido',
    ordersFound_other: '{{count}} pedidos',
    ordersMore_one: 'Ver mais {{count}} pedido',
    ordersMore_other: 'Ver mais {{count}} pedidos',
    ordersLoading: 'Carregando…',
    ordersError: 'Não foi possível carregar os pedidos.',
    viaPromoter: 'pelo link de @{{username}}',
    coupons: 'Cupons',
    couponsHint: 'Descontos que valem para este evento',
    loadError: 'Não foi possível carregar as vendas.',
    today: 'hoje, {{time}}',
    yesterday: 'ontem, {{time}}',
    buyer: 'Comprador',
    status: {
      paid: 'Pago',
      refund_requested: 'Pediu reembolso',
      partially_refunded: 'Reembolso parcial',
      refunded: 'Reembolsado',
      disputed: 'Em disputa',
    },
  },
  order: {
    bought: '#{{code}} · comprado em {{date}}',
    ticket: 'Ingresso',
    serviceFee: 'Taxa de serviço',
    paidWith: 'Pago no',
    method: { card: 'Cartão', pix: 'Pix', other: 'Outro meio' },
    session: 'Sessão',
    refund: {
      in_progress:
        'Reembolso de {{amount}} em andamento. O valor volta pelo mesmo meio de pagamento.',
      in_progress_full:
        'Reembolso integral de {{amount}}, com a taxa de serviço, em andamento. O valor volta pelo mesmo meio de pagamento.',
      done: 'Reembolso de {{amount}} concluído em {{date}}.',
      done_full: 'Reembolso integral de {{amount}}, com a taxa de serviço, concluído em {{date}}.',
      failed: 'O reembolso de {{amount}} não foi concluído. Fale com o suporte.',
      rejected: 'O pedido de reembolso foi recusado.',
    },
  },
  editor: {
    titleEdit: 'Editar evento',
    titleNew: 'Novo evento',
    info: 'Informações',
    infoHint: 'Nome, descrição, categoria e estabelecimento',
    sessions: 'Datas e sessões',
    noSessions: 'Nenhuma sessão',
    location: 'Local',
    locationHint: 'Endereço, região e mapa',
    tickets: 'Ingressos e lotes',
    paid: 'Entrada paga',
    free: 'Entrada gratuita',
    saveFirst: 'Salve o evento para criar os ingressos e lotes.',
    policy: 'Regras de venda',
    photos: 'Fotos',
    photos_one: '{{count}} foto',
    photos_other: '{{count}} fotos',
    noPhotos: 'Nenhuma foto',
    contact: 'Contato',
    noContact: 'Nenhum contato',
    site: 'Site',
    save: 'Salvar',
    delete: 'Excluir evento',
    deleteTitle: 'Excluir {{name}}?',
    deleteMessage: 'Esta ação não pode ser desfeita.',
    deleteHasSales:
      'Este evento tem vendas e não pode ser excluído. Para cancelar, abra cada sessão na página do evento (com reembolso e multa).',
    accountTitle: 'Recebe na conta de',
    accountHint: 'Para mudar, edite o estabelecimento ou vá em Ganhos › Contas.',
  },
};
