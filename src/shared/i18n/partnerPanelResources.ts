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
  /** Nome da aba do catálogo conforme os segmentos do parceiro. */
  catalogTab: {
    offers: string;
    place: string;
    tours: string;
    rentals: string;
    transfers: string;
    attraction: string;
    events: string;
    lodging: string;
    restaurant: string;
  };
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
    guests: CardTexts & { enteredOf: string; enteredNow: string; enteredAfter: string };
    promoters: CardTexts & { owed: string };
    plan_seal: CardTexts & { until: string; none: string };
    week_occupancy: CardTexts;
    month_sales: CardTexts & { compare: string; noCompare: string };
    promo_codes: CardTexts & {
      active_one: string;
      active_other: string;
      weekUses_one: string;
      weekUses_other: string;
      top: string;
      ending: string;
      runningOut: string;
    };
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
  catalog: {
    title: string;
    places: string;
    events: string;
    offers: string;
    offersBy: {
      tours: string;
      rentals: string;
      transfers: string;
      attraction: string;
      events: string;
      lodging: string;
      restaurant: string;
      services: string;
    };
  };
  more: {
    title: string;
    reports: string;
    reportsHint: string;
    groupBusiness: string;
    groupHelp: string;
    producer: string;
    producerHint: string;
    coupons: string;
    couponsHint: string;
    couponsBy: {
      tours: string;
      rentals: string;
      transfers: string;
      attraction: string;
      events: string;
    };
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
  catalogTab: {
    offers: 'Ofertas',
    // Hífen opcional (U+00AD): o atalho tem a largura de cinco lado a lado.
    place: 'Estabele\u00ADcimento',
    tours: 'Passeios',
    rentals: 'Aluguéis',
    transfers: 'Translados',
    attraction: 'Entradas',
    events: 'Eventos',
    lodging: 'Hospedagem',
    restaurant: 'Restaurante',
  },
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
      enteredOf: '{{entered}} de {{total}}',
      enteredNow: 'já entraram',
      enteredAfter: 'entraram · {{title}}',
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
      none: 'Sem plano · conheça os planos',
    },
    week_occupancy: { title: 'Ocupação da semana', description: 'Lugares vendidos por dia' },
    month_sales: {
      title: 'Vendas do mês',
      description: 'Total vendido e comparação com o mês passado',
      compare: '{{percent}}% que o mês passado',
      noCompare: 'Sem vendas no mês passado',
    },
    promo_codes: {
      title: 'Cupons',
      description: 'Cupons ativos e usos na semana',
      active_one: '{{count}} ativo',
      active_other: '{{count}} ativos',
      weekUses_one: '{{count}} uso em 7 dias',
      weekUses_other: '{{count}} usos em 7 dias',
      top: 'Mais usado: {{code}} · {{count}}',
      ending: '{{code}} acaba {{when}}',
      runningOut: '{{code}} esgotando ({{used}} de {{max}})',
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
  catalog: {
    title: 'Catálogo',
    places: 'Lugares',
    events: 'Eventos',
    offers: 'Passeios',
    offersBy: {
      tours: 'Passeios',
      rentals: 'Aluguéis',
      transfers: 'Translados',
      attraction: 'Entradas',
      events: 'Eventos',
      lodging: 'Hospedagem',
      restaurant: 'Restaurante',
      services: 'Serviços',
    },
  },
  more: {
    title: 'Mais',
    reports: 'Relatórios',
    reportsHint: 'Vendas por item e por mês',
    groupBusiness: 'Seu negócio',
    groupHelp: 'Ajuda e conta',
    producer: 'Perfil de produtor',
    producerHint: 'Nome, foto e descrição que o público vê',
    coupons: 'Cupons',
    couponsHint: 'Descontos para seus anúncios',
    couponsBy: {
      tours: 'Cupons dos seus passeios',
      rentals: 'Cupons dos seus aluguéis',
      transfers: 'Cupons dos seus translados',
      attraction: 'Cupons das suas entradas',
      events: 'Cupons dos seus eventos',
    },
    establishments: 'Estabelecimentos',
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
