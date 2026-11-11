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

export const partnerCatalogEn: PartnerCatalogTranslation = {
  create: 'Create',
  emptyPlaces: 'No businesses yet.',
  emptyEvents: 'No events yet.',
  loadError: "Couldn't load the events.",
  sessions_one: '{{count}} session',
  sessions_other: '{{count}} sessions',
  next: 'next {{date}}',
  endedOn: 'Ended on {{date}}',
  status: {
    published: 'Published',
    verified: 'verified',
    draft: 'Draft',
    paused: 'Paused',
    ended: 'Ended',
    pending: 'verification under review',
  },
  sold_one: '{{count}} sold',
  sold_other: '{{count}} sold',
  missing: { cover: 'cover photo missing', sessions: 'date missing' },
  establishment: {
    edit: 'Edit',
    planActive: '{{plan}} plan until {{date}} · badge active',
    noPlan: 'No active plan',
    seePlans: 'See plans',
    pause: 'Pause in the guide',
    resume: 'Publish in the guide',
    rating: 'Rating',
    noRating: 'No rating yet',
    reviews_one: '{{count}} review',
    reviews_other: '{{count}} reviews',
    offers: 'Tours and rentals',
    reviewsTitle: 'Reviews',
  },
  receive: {
    title: 'How we got to this amount',
    tickets: 'Tickets',
    discounts: 'Discount codes',
    refunds: 'Refunds',
    fee: 'Use Guide fee ({{percent}})',
    feeNoPercent: 'Use Guide fee',
    adjustments: 'Penalties and adjustments',
    noteServiceFee: 'Service fee paid by buyers: {{amount}}. It does not come out of your amount.',
    noteProcessing: 'Card and Pix processing fees: covered by Use Guide.',
    notePayout: 'Each session is paid out 2 days after it ends.',
    notePayoutTo:
      'Each session is paid out 2 days after it ends, to the account of CNPJ {{document}}.',
    openEarnings: 'See payouts in Earnings',
  },
  event: {
    sessions_one: '{{count}} session',
    sessions_other: '{{count}} sessions',
    edit: 'Edit',
    sold: 'Sold',
    tickets_one: '{{count}} ticket',
    tickets_other: '{{count}} tickets',
    receive: 'You receive',
    receiveHint: '2 days after the event',
    sessionsTitle: 'Sessions',
    sessionSold: '{{sold}} of {{capacity}}',
    ordersTitle: 'Orders',
    ordersEmpty: 'No orders yet.',
    ordersSearch: 'Search by name or order no.',
    ordersClear: 'Clear search',
    ordersFilter: 'Show orders',
    ordersAll: 'All',
    ordersRefunds: 'With refund',
    ordersNoResults: 'No orders found.',
    ordersNoRefunds: 'No orders with a refund.',
    ordersFound_one: '{{count}} order',
    ordersFound_other: '{{count}} orders',
    ordersMore_one: 'Show {{count}} more order',
    ordersMore_other: 'Show {{count}} more orders',
    ordersLoading: 'Loading…',
    ordersError: "Couldn't load the orders.",
    viaPromoter: "through @{{username}}'s link",
    coupons: 'Promo codes',
    couponsHint: 'Discounts valid for this event',
    loadError: "Couldn't load the sales.",
    today: 'today, {{time}}',
    yesterday: 'yesterday, {{time}}',
    buyer: 'Buyer',
    status: {
      paid: 'Paid',
      refund_requested: 'Refund requested',
      partially_refunded: 'Partially refunded',
      refunded: 'Refunded',
      disputed: 'In dispute',
    },
  },
  order: {
    bought: '#{{code}} · bought on {{date}}',
    ticket: 'Ticket',
    serviceFee: 'Service fee',
    paidWith: 'Paid with',
    method: { card: 'Card', pix: 'Pix', other: 'Other method' },
    session: 'Session',
    refund: {
      in_progress: 'Refund of {{amount}} in progress. It goes back to the same payment method.',
      in_progress_full:
        'Full refund of {{amount}}, service fee included, in progress. It goes back to the same payment method.',
      done: 'Refund of {{amount}} completed on {{date}}.',
      done_full: 'Full refund of {{amount}}, service fee included, completed on {{date}}.',
      failed: "The refund of {{amount}} wasn't completed. Contact support.",
      rejected: 'The refund request was declined.',
    },
  },
  editor: {
    titleEdit: 'Edit event',
    titleNew: 'New event',
    info: 'Details',
    infoHint: 'Name, description, category and business',
    sessions: 'Dates and sessions',
    noSessions: 'No sessions',
    location: 'Venue',
    locationHint: 'Address, area and map',
    tickets: 'Tickets and batches',
    paid: 'Paid entry',
    free: 'Free entry',
    saveFirst: 'Save the event to create tickets and batches.',
    policy: 'Sales rules',
    photos: 'Photos',
    photos_one: '{{count}} photo',
    photos_other: '{{count}} photos',
    noPhotos: 'No photos',
    contact: 'Contact',
    noContact: 'No contact',
    site: 'Website',
    save: 'Save',
    delete: 'Delete event',
    deleteTitle: 'Delete {{name}}?',
    deleteMessage: "This can't be undone.",
    deleteHasSales:
      "This event has sales and can't be deleted. To cancel, open each session on the event page (with refunds and a penalty).",
    accountTitle: 'Paid into the account of',
    accountHint: 'To change it, edit the business or go to Earnings › Accounts.',
  },
};

export const partnerCatalogFr: PartnerCatalogTranslation = {
  create: 'Créer',
  emptyPlaces: 'Aucun établissement pour le moment.',
  emptyEvents: 'Aucun événement pour le moment.',
  loadError: 'Impossible de charger les événements.',
  sessions_one: '{{count}} séance',
  sessions_other: '{{count}} séances',
  next: 'prochaine {{date}}',
  endedOn: 'Terminé le {{date}}',
  status: {
    published: 'Publié',
    verified: 'vérifié',
    draft: 'Brouillon',
    paused: 'En pause',
    ended: 'Terminé',
    pending: 'vérification en cours',
  },
  sold_one: '{{count}} vendu',
  sold_other: '{{count}} vendus',
  missing: { cover: 'photo de couverture manquante', sessions: 'date manquante' },
  establishment: {
    edit: 'Modifier',
    planActive: "Formule {{plan}} jusqu'au {{date}} · badge actif",
    noPlan: 'Aucune formule active',
    seePlans: 'Voir les formules',
    pause: 'Mettre en pause dans le guide',
    resume: 'Publier dans le guide',
    rating: 'Note',
    noRating: 'Pas encore de note',
    reviews_one: '{{count}} avis',
    reviews_other: '{{count}} avis',
    offers: 'Excursions et locations',
    reviewsTitle: 'Avis',
  },
  receive: {
    title: 'Comment ce montant est calculé',
    tickets: 'Billets',
    discounts: 'Codes de réduction',
    refunds: 'Remboursements',
    fee: 'Commission Use Guide ({{percent}})',
    feeNoPercent: 'Commission Use Guide',
    adjustments: 'Pénalités et ajustements',
    noteServiceFee:
      'Frais de service payés par les acheteurs : {{amount}}. Ils ne sont pas déduits de votre montant.',
    noteProcessing: 'Frais de carte et de Pix : à la charge de Use Guide.',
    notePayout: 'Chaque séance est versée 2 jours après sa fin.',
    notePayoutTo:
      'Chaque séance est versée 2 jours après sa fin, sur le compte du CNPJ {{document}}.',
    openEarnings: 'Voir les versements dans Revenus',
  },
  event: {
    sessions_one: '{{count}} séance',
    sessions_other: '{{count}} séances',
    edit: 'Modifier',
    sold: 'Vendu',
    tickets_one: '{{count}} billet',
    tickets_other: '{{count}} billets',
    receive: 'Vous recevez',
    receiveHint: "2 jours après l'événement",
    sessionsTitle: 'Séances',
    sessionSold: '{{sold}} sur {{capacity}}',
    ordersTitle: 'Commandes',
    ordersEmpty: 'Aucune commande pour le moment.',
    ordersSearch: 'Nom ou nº de commande',
    ordersClear: 'Effacer la recherche',
    ordersFilter: 'Afficher les commandes',
    ordersAll: 'Toutes',
    ordersRefunds: 'Avec remboursement',
    ordersNoResults: 'Aucune commande trouvée.',
    ordersNoRefunds: 'Aucune commande avec remboursement.',
    ordersFound_one: '{{count}} commande',
    ordersFound_other: '{{count}} commandes',
    ordersMore_one: 'Voir {{count}} commande de plus',
    ordersMore_other: 'Voir {{count}} commandes de plus',
    ordersLoading: 'Chargement…',
    ordersError: 'Impossible de charger les commandes.',
    viaPromoter: 'via le lien de @{{username}}',
    coupons: 'Codes promo',
    couponsHint: 'Réductions valables pour cet événement',
    loadError: 'Impossible de charger les ventes.',
    today: "aujourd'hui, {{time}}",
    yesterday: 'hier, {{time}}',
    buyer: 'Acheteur',
    status: {
      paid: 'Payé',
      refund_requested: 'Remboursement demandé',
      partially_refunded: 'Remboursement partiel',
      refunded: 'Remboursé',
      disputed: 'En litige',
    },
  },
  order: {
    bought: '#{{code}} · acheté le {{date}}',
    ticket: 'Billet',
    serviceFee: 'Frais de service',
    paidWith: 'Payé par',
    method: { card: 'Carte', pix: 'Pix', other: 'Autre moyen' },
    session: 'Séance',
    refund: {
      in_progress:
        'Remboursement de {{amount}} en cours. Il revient sur le même moyen de paiement.',
      in_progress_full:
        'Remboursement intégral de {{amount}}, frais de service compris, en cours. Il revient sur le même moyen de paiement.',
      done: 'Remboursement de {{amount}} effectué le {{date}}.',
      done_full:
        'Remboursement intégral de {{amount}}, frais de service compris, effectué le {{date}}.',
      failed: "Le remboursement de {{amount}} n'a pas abouti. Contactez l'assistance.",
      rejected: 'La demande de remboursement a été refusée.',
    },
  },
  editor: {
    titleEdit: "Modifier l'événement",
    titleNew: 'Nouvel événement',
    info: 'Informations',
    infoHint: 'Nom, description, catégorie et établissement',
    sessions: 'Dates et séances',
    noSessions: 'Aucune séance',
    location: 'Lieu',
    locationHint: 'Adresse, quartier et carte',
    tickets: 'Billets et lots',
    paid: 'Entrée payante',
    free: 'Entrée gratuite',
    saveFirst: "Enregistrez l'événement pour créer les billets et les lots.",
    policy: 'Règles de vente',
    photos: 'Photos',
    photos_one: '{{count}} photo',
    photos_other: '{{count}} photos',
    noPhotos: 'Aucune photo',
    contact: 'Contact',
    noContact: 'Aucun contact',
    site: 'Site',
    save: 'Enregistrer',
    delete: "Supprimer l'événement",
    deleteTitle: 'Supprimer {{name}} ?',
    deleteMessage: 'Cette action est irréversible.',
    deleteHasSales:
      "Cet événement a des ventes et ne peut pas être supprimé. Pour l'annuler, ouvrez chaque séance sur la page de l'événement (avec remboursement et pénalité).",
    accountTitle: 'Versé sur le compte de',
    accountHint: "Pour changer, modifiez l'établissement ou allez dans Gains › Comptes.",
  },
};
