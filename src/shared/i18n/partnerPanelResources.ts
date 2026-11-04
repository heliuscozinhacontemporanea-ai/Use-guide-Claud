/** Textos da casca do painel do parceiro (D27): atalhos, filtro, Início e Mais. pt-BR é a fonte. */
type AttentionTexts = { title: string; detail: string };

export interface PartnerPanelTranslation {
  shortcuts: string;
  backToGuide: string;
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
  };
  attention: {
    provider_absence: AttentionTexts;
    sale_claim: AttentionTexts;
    debt: AttentionTexts;
    payment_account: AttentionTexts;
    verification_rejected: AttentionTexts;
    plan_expiring: AttentionTexts;
  };
  agenda: { title: string; today: string };
  catalog: { title: string; places: string; events: string; offers: string };
  more: {
    title: string;
    reports: string;
    reportsHint: string;
    plans: string;
    plansHint: string;
    accounts: string;
    accountsHint: string;
    backHint: string;
  };
}

export const partnerPanelPtBR: PartnerPanelTranslation = {
  shortcuts: 'Atalhos do painel',
  backToGuide: 'Voltar ao guia',
  tabs: { home: 'Início', agenda: 'Agenda', catalog: 'Catálogo', earnings: 'Ganhos', more: 'Mais' },
  filter: {
    all: 'Todos os estabelecimentos',
    open: 'Escolher o que mostrar no painel',
    title: 'Mostrar no painel',
    description: 'Prazos de "Resolva agora" e a portaria do dia aparecem sempre, de todos.',
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
  },
  attention: {
    provider_absence: {
      title: 'Cliente diz que você não foi',
      detail: 'Responda até {{time}}',
    },
    sale_claim: { title: 'Reclamação aberta', detail: 'Repasse retido até a decisão' },
    debt: { title: 'Multa ou dívida a pagar', detail: 'Pague até {{date}}' },
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
  agenda: { title: 'Agenda', today: 'Hoje' },
  catalog: { title: 'Catálogo', places: 'Lugares', events: 'Eventos', offers: 'Passeios' },
  more: {
    title: 'Mais',
    reports: 'Relatórios',
    reportsHint: 'Visitas e vendas por item',
    plans: 'Planos e selo',
    plansHint: 'Plano de cada estabelecimento',
    accounts: 'Contas de recebimento',
    accountsHint: 'Uma por CNPJ, em Ganhos',
    backHint: 'Ver o app como visitante',
  },
};

export const partnerPanelEn: PartnerPanelTranslation = {
  shortcuts: 'Panel shortcuts',
  backToGuide: 'Back to the guide',
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
    description: '"Act now" deadlines and today\'s entrance always show, for all businesses.',
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
  },
  attention: {
    provider_absence: {
      title: 'Customer says you did not show up',
      detail: 'Reply by {{time}}',
    },
    sale_claim: { title: 'Open claim', detail: 'Payout on hold until the decision' },
    debt: { title: 'Fee or debt to pay', detail: 'Pay by {{date}}' },
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
  agenda: { title: 'Schedule', today: 'Today' },
  catalog: { title: 'Catalog', places: 'Places', events: 'Events', offers: 'Tours' },
  more: {
    title: 'More',
    reports: 'Reports',
    reportsHint: 'Visits and sales per listing',
    plans: 'Plans and badge',
    plansHint: 'Plan for each business',
    accounts: 'Payout accounts',
    accountsHint: 'One per CNPJ, in Earnings',
    backHint: 'See the app as a visitor',
  },
};

export const partnerPanelFr: PartnerPanelTranslation = {
  shortcuts: 'Raccourcis du tableau de bord',
  backToGuide: 'Retour au guide',
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
    description:
      'Les échéances « À régler » et l’accueil du jour s’affichent toujours, pour tous les établissements.',
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
  },
  attention: {
    provider_absence: {
      title: 'Le client dit que vous n’êtes pas venu',
      detail: 'Répondez avant {{time}}',
    },
    sale_claim: { title: 'Réclamation ouverte', detail: 'Versement bloqué jusqu’à la décision' },
    debt: { title: 'Pénalité ou dette à payer', detail: 'Payez avant le {{date}}' },
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
  agenda: { title: 'Agenda', today: 'Aujourd’hui' },
  catalog: { title: 'Catalogue', places: 'Lieux', events: 'Événements', offers: 'Excursions' },
  more: {
    title: 'Plus',
    reports: 'Rapports',
    reportsHint: 'Visites et ventes par fiche',
    plans: 'Formules et badge',
    plansHint: 'Formule de chaque établissement',
    accounts: 'Comptes de versement',
    accountsHint: 'Un par CNPJ, dans Gains',
    backHint: 'Voir l’app comme un visiteur',
  },
};
