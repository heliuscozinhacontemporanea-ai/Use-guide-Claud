/** Textos da casca do painel do parceiro (D27): atalhos, filtro, Início e Mais. pt-BR é a fonte. */
type AttentionTexts = { title: string; detail: string };
type CardTexts = { title: string; description: string };

export interface PartnerPanelTranslation {
  shortcuts: string;
  backToGuide: string;
  category: Record<
    'restaurant' | 'sight' | 'tour' | 'tips' | 'hotel' | 'transfer' | 'rental' | 'producer',
    string
  >;
  tabs: { home: string; agenda: string; catalog: string; earnings: string; more: string };
  filter: {
    all: string;
    open: string;
    title: string;
    description: string;
    create: string;
    pending_one: string;
    pending_other: string;
    current: string;
  };
  home: {
    attentionTitle: string;
    attentionEmpty: string;
    todayTitle: string;
    todayEmpty: string;
    salesToday: string;
    salesCount_one: string;
    salesCount_other: string;
    nextPayout: string;
    nextPayoutOn: string;
    noPayout: string;
    allEstablishments: string;
    error: string;
    retry: string;
    sold: string;
    checkedIn: string;
    arrivedAt: string;
    session: string;
    gate: string;
    arrived: string;
    people_one: string;
    people_other: string;
  };
  attention: {
    provider_absence: AttentionTexts;
    sale_claim: AttentionTexts;
    debt: AttentionTexts;
    payment_account: AttentionTexts;
    verification_rejected: AttentionTexts;
    plan_expiring: AttentionTexts;
    partner_terms: AttentionTexts;
  };
  cards: {
    label: string;
    customize: string;
    editHint: string;
    cancel: string;
    done: string;
    add: string;
    addTitle: string;
    addDescription: string;
    galleryEmpty: string;
    remove: string;
    move: string;
    saveError: string;
    size: { small: string; large: string };
    today: CardTexts;
    sales_today: CardTexts & { inEstablishments_one: string; inEstablishments_other: string };
    next_payout: CardTexts & {
      titleMany: string;
      inAccounts_one: string;
      inAccounts_other: string;
    };
    next_event: CardTexts & { sold: string };
    reviews: CardTexts & {
      count_one: string;
      count_other: string;
      unanswered_one: string;
      unanswered_other: string;
    };
    week_bookings: CardTexts & { occupancy: string };
    guests: CardTexts;
    promoters: CardTexts & { owed: string };
    plan_seal: CardTexts & { until: string };
    week_occupancy: CardTexts;
    month_sales: CardTexts & { compare: string; noCompare: string };
  };
  agenda: {
    title: string;
    today: string;
    previousWeek: string;
    nextWeek: string;
    openMonth: string;
    previousMonth: string;
    nextMonth: string;
    dayEmpty: string;
    arrived_one: string;
    arrived_other: string;
    free_one: string;
    free_other: string;
    ongoing: string;
    error: string;
  };
  catalog: { title: string; places: string; events: string; offers: string };
  more: {
    title: string;
    reports: string;
    reportsHint: string;
    producer: string;
    producerHint: string;
    coupons: string;
    couponsHint: string;
    establishments: string;
    documents_one: string;
    documents_other: string;
    pendingVerifications_one: string;
    pendingVerifications_other: string;
    plans: string;
    plansHint: string;
    withoutPlan_one: string;
    withoutPlan_other: string;
    accounts: string;
    accountsHint: string;
    notifications: string;
    terms: string;
    help: string;
  };
}

export const partnerPanelPtBR: PartnerPanelTranslation = {
  shortcuts: 'Atalhos do painel',
  backToGuide: 'Voltar ao guia',
  category: {
    restaurant: 'Restaurante',
    sight: 'Atração',
    tour: 'Passeio',
    tips: 'Dica',
    hotel: 'Hospedagem',
    transfer: 'Translado',
    rental: 'Aluguel',
    producer: 'Produtor de eventos',
  },
  tabs: { home: 'Início', agenda: 'Agenda', catalog: 'Catálogo', earnings: 'Ganhos', more: 'Mais' },
  filter: {
    all: 'Todos os estabelecimentos',
    open: 'Escolher o que mostrar no painel',
    title: 'Mostrar no painel',
    description: '"Agora" e "Resolva agora" permanecem na tela em qualquer filtro.',
    create: 'Criar estabelecimento',
    pending_one: '{{count}} pendência',
    pending_other: '{{count}} pendências',
    current: 'Selecionado',
  },
  home: {
    attentionTitle: 'Resolva agora',
    attentionEmpty: 'Nada pendente. Tudo em dia.',
    todayTitle: 'Hoje',
    todayEmpty: 'Nada marcado para hoje.',
    salesToday: 'Vendas de hoje',
    salesCount_one: '{{count}} venda',
    salesCount_other: '{{count}} vendas',
    nextPayout: 'Próximo repasse',
    nextPayoutOn: 'em {{date}}',
    noPayout: 'Nenhum programado',
    allEstablishments: 'de todos os estabelecimentos',
    error: 'Não foi possível carregar o início.',
    retry: 'Tentar de novo',
    sold: '{{sold}} de {{capacity}}',
    checkedIn: '{{count}} com código',
    arrivedAt: 'Você chegou às {{time}}',
    session: 'Evento',
    gate: 'Portaria',
    arrived: '{{checkedIn}} de {{sold}}',
    people_one: '{{count}} pessoa',
    people_other: '{{count}} pessoas',
  },
  attention: {
    provider_absence: {
      title: 'Cliente diz que você não foi',
      detail: 'Responda até {{time}}',
    },
    sale_claim: { title: 'Reclamação aberta', detail: 'Repasse retido até a decisão' },
    debt: { title: 'Multa ou dívida a pagar', detail: 'Pague até {{date}}' },
    partner_terms: {
      title: 'Novos termos do parceiro',
      detail: 'Leia e aceite a versão nova',
    },
    payment_account: {
      title: 'Conta de recebimento pendente',
      detail: 'Complete o cadastro para vender',
    },
    verification_rejected: {
      title: 'Verificação recusada',
      detail: 'Envie os documentos de novo',
    },
    plan_expiring: { title: 'Plano vence em breve', detail: 'Renove até {{date}}' },
  },
  cards: {
    label: 'Cartões do início',
    customize: 'Personalizar início',
    editHint:
      'Arraste para mudar a ordem. Toque no − para tirar. "Resolva agora" fica sempre no topo.',
    cancel: 'Cancelar',
    done: 'Concluir',
    add: 'Adicionar cartão',
    addTitle: 'Adicionar cartão',
    addDescription: 'Escolha o que você quer ver no início.',
    galleryEmpty: 'Todos os cartões disponíveis já estão no início.',
    remove: 'Tirar {{name}}',
    move: 'Mover {{name}}. Use as setas para cima e para baixo',
    saveError: 'Não foi possível salvar o início.',
    size: { small: 'Pequeno', large: 'Grande' },
    today: { title: 'Hoje', description: 'Horários e sessões de hoje' },
    sales_today: {
      title: 'Vendas de hoje',
      description: 'Total vendido hoje',
      inEstablishments_one: 'em {{count}} estabelecimento',
      inEstablishments_other: 'nos {{count}} estabelecimentos',
    },
    next_payout: {
      title: 'Próximo repasse',
      description: 'Quanto cai e quando',
      titleMany: 'Próximos repasses',
      inAccounts_one: 'em {{count}} conta',
      inAccounts_other: 'em {{count}} contas',
    },
    next_event: {
      title: 'Próximo evento',
      description: 'Ingressos vendidos da próxima sessão',
      sold: '{{sold}} de {{capacity}} vendidos',
    },
    reviews: {
      title: 'Avaliações',
      description: 'Nota média dos estabelecimentos',
      count_one: '{{count}} avaliação',
      count_other: '{{count}} avaliações',
      unanswered_one: '{{count}} nova para responder',
      unanswered_other: '{{count}} novas para responder',
    },
    week_bookings: {
      title: 'Reservas da semana',
      description: 'Lugares vendidos nos próximos 7 dias',
      occupancy: '{{percent}}% dos lugares',
    },
    guests: {
      title: 'Convidados',
      description: 'Cortesias enviadas para o próximo evento',
    },
    promoters: {
      title: 'Divulgadores',
      description: 'Quem mais vendeu e quanto você deve',
      owed: '{{amount}} a pagar · {{event}}',
    },
    plan_seal: {
      title: 'Plano e selo',
      description: 'Quando vence o plano de cada estabelecimento',
      until: 'Plano até {{date}}',
    },
    week_occupancy: { title: 'Ocupação da semana', description: 'Lugares vendidos por dia' },
    month_sales: {
      title: 'Vendas do mês',
      description: 'Total vendido e comparação com o mês passado',
      compare: '{{percent}}% que o mês passado',
      noCompare: 'Sem vendas no mês passado',
    },
  },
  agenda: {
    title: 'Agenda',
    today: 'Hoje',
    previousWeek: 'Semana anterior',
    nextWeek: 'Próxima semana',
    openMonth: 'Abrir o calendário do mês',
    previousMonth: 'Mês anterior',
    nextMonth: 'Próximo mês',
    dayEmpty: 'Nada marcado para este dia.',
    arrived_one: '{{count}} chegou',
    arrived_other: '{{count}} chegaram',
    free_one: '{{count}} vaga livre',
    free_other: '{{count}} vagas livres',
    ongoing: 'Em andamento',
    error: 'Não foi possível carregar a agenda.',
  },
  catalog: { title: 'Catálogo', places: 'Lugares', events: 'Eventos', offers: 'Passeios' },
  more: {
    title: 'Mais',
    reports: 'Relatórios',
    reportsHint: 'Vendas por item e por mês',
    producer: 'Perfil de produtor',
    producerHint: 'Nome, foto e descrição que o público vê',
    coupons: 'Cupons',
    couponsHint: 'Descontos para seus anúncios',
    establishments: 'Estabelecimentos e documentos',
    documents_one: '{{count}} CNPJ',
    documents_other: '{{count}} CNPJs',
    pendingVerifications_one: '{{count}} verificação pendente',
    pendingVerifications_other: '{{count}} verificações pendentes',
    plans: 'Planos e selo',
    plansHint: 'Plano de cada estabelecimento',
    withoutPlan_one: '{{count}} estabelecimento sem plano',
    withoutPlan_other: '{{count}} estabelecimentos sem plano',
    accounts: 'Contas de recebimento',
    accountsHint: 'Também em Ganhos',
    notifications: 'Notificações',
    terms: 'Termos do parceiro',
    help: 'Ajuda para parceiros',
  },
};

export const partnerPanelEn: PartnerPanelTranslation = {
  shortcuts: 'Panel shortcuts',
  backToGuide: 'Back to the guide',
  category: {
    restaurant: 'Restaurant',
    sight: 'Attraction',
    tour: 'Tour',
    tips: 'Tip',
    hotel: 'Lodging',
    transfer: 'Transfer',
    rental: 'Rental',
    producer: 'Event producer',
  },
  tabs: {
    home: 'Home',
    agenda: 'Schedule',
    catalog: 'Catalog',
    earnings: 'Earnings',
    more: 'More',
  },
  filter: {
    all: 'All businesses',
    open: 'Choose what the panel shows',
    title: 'Show in the panel',
    description: '"Now" and "Act now" stay on screen with any filter.',
    create: 'Create business',
    pending_one: '{{count}} pending item',
    pending_other: '{{count}} pending items',
    current: 'Selected',
  },
  home: {
    attentionTitle: 'Act now',
    attentionEmpty: 'Nothing pending. All up to date.',
    todayTitle: 'Today',
    todayEmpty: 'Nothing scheduled for today.',
    salesToday: 'Sales today',
    salesCount_one: '{{count}} sale',
    salesCount_other: '{{count}} sales',
    nextPayout: 'Next payout',
    nextPayoutOn: 'on {{date}}',
    noPayout: 'None scheduled',
    allEstablishments: 'across all businesses',
    error: 'The home screen could not be loaded.',
    retry: 'Try again',
    sold: '{{sold}} of {{capacity}}',
    checkedIn: '{{count}} with code',
    arrivedAt: 'You arrived at {{time}}',
    session: 'Event',
    gate: 'Entrance',
    arrived: '{{checkedIn}} of {{sold}}',
    people_one: '{{count}} person',
    people_other: '{{count}} people',
  },
  attention: {
    provider_absence: {
      title: 'Customer says you did not show up',
      detail: 'Reply by {{time}}',
    },
    sale_claim: { title: 'Open claim', detail: 'Payout on hold until the decision' },
    debt: { title: 'Fee or debt to pay', detail: 'Pay by {{date}}' },
    partner_terms: {
      title: 'New partner terms',
      detail: 'Read and accept the new version',
    },
    payment_account: {
      title: 'Payout account pending',
      detail: 'Finish the setup to sell',
    },
    verification_rejected: {
      title: 'Verification refused',
      detail: 'Send the documents again',
    },
    plan_expiring: { title: 'Plan ending soon', detail: 'Renew by {{date}}' },
  },
  cards: {
    label: 'Home cards',
    customize: 'Customize home',
    editHint: 'Drag to change the order. Tap − to remove. "Act now" always stays on top.',
    cancel: 'Cancel',
    done: 'Done',
    add: 'Add card',
    addTitle: 'Add card',
    addDescription: 'Choose what you want to see on the home screen.',
    galleryEmpty: 'All available cards are already on the home screen.',
    remove: 'Remove {{name}}',
    move: 'Move {{name}}. Use the up and down arrows',
    saveError: 'The home screen could not be saved.',
    size: { small: 'Small', large: 'Large' },
    today: { title: 'Today', description: "Today's time slots and sessions" },
    sales_today: {
      title: 'Sales today',
      description: 'Total sold today',
      inEstablishments_one: 'in {{count}} business',
      inEstablishments_other: 'across {{count}} businesses',
    },
    next_payout: {
      title: 'Next payout',
      description: 'How much and when',
      titleMany: 'Next payouts',
      inAccounts_one: 'to {{count}} account',
      inAccounts_other: 'to {{count}} accounts',
    },
    next_event: {
      title: 'Next event',
      description: 'Tickets sold for the next session',
      sold: '{{sold}} of {{capacity}} sold',
    },
    reviews: {
      title: 'Reviews',
      description: 'Average rating of your businesses',
      count_one: '{{count}} review',
      count_other: '{{count}} reviews',
      unanswered_one: '{{count}} new to reply to',
      unanswered_other: '{{count}} new to reply to',
    },
    week_bookings: {
      title: 'Bookings this week',
      description: 'Spots sold in the next 7 days',
      occupancy: '{{percent}}% of spots',
    },
    guests: {
      title: 'Guests',
      description: 'Complimentary tickets sent for the next event',
    },
    promoters: {
      title: 'Promoters',
      description: 'Who sold the most and how much you owe',
      owed: '{{amount}} to pay · {{event}}',
    },
    plan_seal: {
      title: 'Plan and badge',
      description: "When each business's plan ends",
      until: 'Plan until {{date}}',
    },
    week_occupancy: { title: 'Weekly occupancy', description: 'Spots sold per day' },
    month_sales: {
      title: 'Sales this month',
      description: 'Total sold compared with last month',
      compare: '{{percent}}% vs. last month',
      noCompare: 'No sales last month',
    },
  },
  agenda: {
    title: 'Schedule',
    today: 'Today',
    previousWeek: 'Previous week',
    nextWeek: 'Next week',
    openMonth: 'Open the month calendar',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    dayEmpty: 'Nothing scheduled for this day.',
    arrived_one: '{{count}} arrived',
    arrived_other: '{{count}} arrived',
    free_one: '{{count}} spot left',
    free_other: '{{count}} spots left',
    ongoing: 'In progress',
    error: 'The schedule could not be loaded.',
  },
  catalog: { title: 'Catalog', places: 'Places', events: 'Events', offers: 'Tours' },
  more: {
    title: 'More',
    reports: 'Reports',
    reportsHint: 'Sales per listing and per month',
    producer: 'Producer profile',
    producerHint: 'Name, photo and description the public sees',
    coupons: 'Promo codes',
    couponsHint: 'Discounts for your listings',
    establishments: 'Businesses and documents',
    documents_one: '{{count}} CNPJ',
    documents_other: '{{count}} CNPJs',
    pendingVerifications_one: '{{count}} verification pending',
    pendingVerifications_other: '{{count}} verifications pending',
    plans: 'Plans and badge',
    plansHint: 'Plan for each business',
    withoutPlan_one: '{{count}} business without a plan',
    withoutPlan_other: '{{count}} businesses without a plan',
    accounts: 'Payout accounts',
    accountsHint: 'Also in Earnings',
    notifications: 'Notifications',
    terms: 'Partner terms',
    help: 'Help for partners',
  },
};

export const partnerPanelFr: PartnerPanelTranslation = {
  shortcuts: 'Raccourcis du tableau de bord',
  backToGuide: 'Retour au guide',
  category: {
    restaurant: 'Restaurant',
    sight: 'Attraction',
    tour: 'Excursion',
    tips: 'Conseil',
    hotel: 'Hébergement',
    transfer: 'Transfert',
    rental: 'Location',
    producer: 'Organisateur d’événements',
  },
  tabs: {
    home: 'Accueil',
    agenda: 'Agenda',
    catalog: 'Catalogue',
    earnings: 'Gains',
    more: 'Plus',
  },
  filter: {
    all: 'Tous les établissements',
    open: 'Choisir ce que le tableau de bord affiche',
    title: 'Afficher dans le tableau de bord',
    description: '« Maintenant » et « À régler » restent à l’écran quel que soit le filtre.',
    create: 'Créer un établissement',
    pending_one: '{{count}} point en attente',
    pending_other: '{{count}} points en attente',
    current: 'Sélectionné',
  },
  home: {
    attentionTitle: 'À régler',
    attentionEmpty: 'Rien en attente. Tout est à jour.',
    todayTitle: 'Aujourd’hui',
    todayEmpty: 'Rien de prévu aujourd’hui.',
    salesToday: 'Ventes du jour',
    salesCount_one: '{{count}} vente',
    salesCount_other: '{{count}} ventes',
    nextPayout: 'Prochain versement',
    nextPayoutOn: 'le {{date}}',
    noPayout: 'Aucun prévu',
    allEstablishments: 'de tous les établissements',
    error: 'Impossible de charger l’accueil.',
    retry: 'Réessayer',
    sold: '{{sold}} sur {{capacity}}',
    checkedIn: '{{count}} avec code',
    arrivedAt: 'Vous êtes arrivé à {{time}}',
    session: 'Événement',
    gate: 'Entrée',
    arrived: '{{checkedIn}} sur {{sold}}',
    people_one: '{{count}} personne',
    people_other: '{{count}} personnes',
  },
  attention: {
    provider_absence: {
      title: 'Le client dit que vous n’êtes pas venu',
      detail: 'Répondez avant {{time}}',
    },
    sale_claim: { title: 'Réclamation ouverte', detail: 'Versement bloqué jusqu’à la décision' },
    debt: { title: 'Pénalité ou dette à payer', detail: 'Payez avant le {{date}}' },
    partner_terms: {
      title: 'Nouvelles conditions du partenaire',
      detail: 'Lisez et acceptez la nouvelle version',
    },
    payment_account: {
      title: 'Compte de versement incomplet',
      detail: 'Terminez l’inscription pour vendre',
    },
    verification_rejected: {
      title: 'Vérification refusée',
      detail: 'Renvoyez les documents',
    },
    plan_expiring: { title: 'Formule bientôt expirée', detail: 'Renouvelez avant le {{date}}' },
  },
  cards: {
    label: 'Cartes de l’accueil',
    customize: 'Personnaliser l’accueil',
    editHint:
      'Faites glisser pour changer l’ordre. Touchez − pour retirer. « À régler » reste toujours en haut.',
    cancel: 'Annuler',
    done: 'Terminer',
    add: 'Ajouter une carte',
    addTitle: 'Ajouter une carte',
    addDescription: 'Choisissez ce que vous voulez voir sur l’accueil.',
    galleryEmpty: 'Toutes les cartes disponibles sont déjà sur l’accueil.',
    remove: 'Retirer {{name}}',
    move: 'Déplacer {{name}}. Utilisez les flèches haut et bas',
    saveError: 'Impossible d’enregistrer l’accueil.',
    size: { small: 'Petite', large: 'Grande' },
    today: { title: 'Aujourd’hui', description: 'Créneaux et séances du jour' },
    sales_today: {
      title: 'Ventes du jour',
      description: 'Total vendu aujourd’hui',
      inEstablishments_one: 'dans {{count}} établissement',
      inEstablishments_other: 'dans {{count}} établissements',
    },
    next_payout: {
      title: 'Prochain versement',
      description: 'Combien et quand',
      titleMany: 'Prochains versements',
      inAccounts_one: 'sur {{count}} compte',
      inAccounts_other: 'sur {{count}} comptes',
    },
    next_event: {
      title: 'Prochain événement',
      description: 'Billets vendus pour la prochaine séance',
      sold: '{{sold}} sur {{capacity}} vendus',
    },
    reviews: {
      title: 'Avis',
      description: 'Note moyenne de vos établissements',
      count_one: '{{count}} avis',
      count_other: '{{count}} avis',
      unanswered_one: '{{count}} nouvel avis à traiter',
      unanswered_other: '{{count}} nouveaux avis à traiter',
    },
    week_bookings: {
      title: 'Réservations de la semaine',
      description: 'Places vendues dans les 7 prochains jours',
      occupancy: '{{percent}} % des places',
    },
    guests: {
      title: 'Invités',
      description: 'Billets offerts envoyés pour le prochain événement',
    },
    promoters: {
      title: 'Promoteurs',
      description: 'Qui a le plus vendu et combien vous devez',
      owed: '{{amount}} à payer · {{event}}',
    },
    plan_seal: {
      title: 'Formule et badge',
      description: 'Quand la formule de chaque établissement expire',
      until: 'Formule jusqu’au {{date}}',
    },
    week_occupancy: { title: 'Occupation de la semaine', description: 'Places vendues par jour' },
    month_sales: {
      title: 'Ventes du mois',
      description: 'Total vendu comparé au mois dernier',
      compare: '{{percent}} % par rapport au mois dernier',
      noCompare: 'Aucune vente le mois dernier',
    },
  },
  agenda: {
    title: 'Agenda',
    today: 'Aujourd’hui',
    previousWeek: 'Semaine précédente',
    nextWeek: 'Semaine suivante',
    openMonth: 'Ouvrir le calendrier du mois',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant',
    dayEmpty: 'Rien de prévu ce jour-là.',
    arrived_one: '{{count}} arrivé',
    arrived_other: '{{count}} arrivés',
    free_one: '{{count}} place libre',
    free_other: '{{count}} places libres',
    ongoing: 'En cours',
    error: 'Impossible de charger l’agenda.',
  },
  catalog: { title: 'Catalogue', places: 'Lieux', events: 'Événements', offers: 'Excursions' },
  more: {
    title: 'Plus',
    reports: 'Rapports',
    reportsHint: 'Ventes par fiche et par mois',
    producer: 'Profil d’organisateur',
    producerHint: 'Nom, photo et description visibles par le public',
    coupons: 'Codes promo',
    couponsHint: 'Réductions pour vos annonces',
    establishments: 'Établissements et documents',
    documents_one: '{{count}} CNPJ',
    documents_other: '{{count}} CNPJ',
    pendingVerifications_one: '{{count}} vérification en attente',
    pendingVerifications_other: '{{count}} vérifications en attente',
    plans: 'Formules et badge',
    plansHint: 'Formule de chaque établissement',
    withoutPlan_one: '{{count}} établissement sans formule',
    withoutPlan_other: '{{count}} établissements sans formule',
    accounts: 'Comptes de versement',
    accountsHint: 'Aussi dans Gains',
    notifications: 'Notifications',
    terms: 'Conditions partenaire',
    help: 'Aide aux partenaires',
  },
};
