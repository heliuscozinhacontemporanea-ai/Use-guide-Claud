/** Textos do domínio insights (pt-BR é a fonte; en e fr têm as mesmas chaves, garantidas pelo tipo). */
export interface InsightsTranslation {
  reports: {
    empty: string;
    pickTitle: string;
    typeItem: string;
    typeEvent: string;
    typeBusiness: string;
    seeAll: string;
    seeAllLabel: string;
    title: string;
    loading: string;
    loadError: string;
  };
  stats: {
    views: string;
    whatsapp: string;
    favorites: string;
    shares: string;
  };
  audience: {
    title: string;
    signedIn: string;
    anonymous: string;
    noViews: string;
  };
  chart: {
    title: string;
    subtitle: string;
    series: string;
  };
  reviews: {
    title: string;
    waiting_one: string;
    waiting_other: string;
    showAll: string;
    showLess: string;
    rating: string;
    replyPlaceholder: string;
    replyLabel: string;
    send: string;
    cancel: string;
    reply: string;
    none: string;
    replyError: string;
  };
}

export const insightsPtBR: InsightsTranslation = {
  reports: {
    empty: 'Nenhum registro encontrado para relatório',
    pickTitle: 'Selecione um item ou evento para ver o relatório',
    typeItem: 'Item',
    typeEvent: 'Evento',
    typeBusiness: 'Estabelecimento',
    seeAll: 'Ver todos',
    seeAllLabel: 'Ver todos os itens e eventos',
    title: 'Relatório de insights',
    loading: 'Carregando o relatório...',
    loadError: 'Não foi possível carregar o relatório deste item.',
  },
  stats: {
    views: 'Visualizações',
    whatsapp: 'Cliques no WhatsApp',
    favorites: 'Favoritados',
    shares: 'Compartilhados',
  },
  audience: {
    title: 'Quem visualizou',
    signedIn: 'Com conta no Use Guide',
    anonymous: 'Visitantes',
    noViews: 'Ainda sem visualizações.',
  },
  chart: {
    title: 'Fluxo de visitas',
    subtitle: 'Últimos 7 dias',
    series: 'Visualizações',
  },
  reviews: {
    title: 'Avaliações pendentes',
    waiting_one: '{{count}} aguardando resposta',
    waiting_other: '{{count}} aguardando resposta',
    showAll: 'Ver todas',
    showLess: 'Mostrar menos',
    rating: '{{rating}} de 5 estrelas',
    replyPlaceholder: 'Escreva sua resposta...',
    replyLabel: 'Resposta à avaliação de {{name}}',
    send: 'Enviar resposta',
    cancel: 'Cancelar',
    reply: 'Responder avaliação',
    none: 'Nenhuma avaliação pendente',
    replyError: 'Erro ao enviar resposta.',
  },
};

export const insightsEn: InsightsTranslation = {
  reports: {
    empty: 'No records found for reports',
    pickTitle: 'Select an item or event to see its report',
    typeItem: 'Item',
    typeEvent: 'Event',
    typeBusiness: 'Business',
    seeAll: 'See all',
    seeAllLabel: 'See all items and events',
    title: 'Insights report',
    loading: 'Loading the report...',
    loadError: 'We could not load the report for this item.',
  },
  stats: {
    views: 'Views',
    whatsapp: 'WhatsApp clicks',
    favorites: 'Favorited',
    shares: 'Shared',
  },
  audience: {
    title: 'Who viewed',
    signedIn: 'With a Use Guide account',
    anonymous: 'Visitors',
    noViews: 'No views yet.',
  },
  chart: {
    title: 'Visit flow',
    subtitle: 'Last 7 days',
    series: 'Views',
  },
  reviews: {
    title: 'Pending reviews',
    waiting_one: '{{count}} awaiting reply',
    waiting_other: '{{count}} awaiting reply',
    showAll: 'See all',
    showLess: 'Show less',
    rating: '{{rating}} out of 5 stars',
    replyPlaceholder: 'Write your reply...',
    replyLabel: 'Reply to the review by {{name}}',
    send: 'Send reply',
    cancel: 'Cancel',
    reply: 'Reply to review',
    none: 'No pending reviews',
    replyError: 'Could not send the reply.',
  },
};

export const insightsFr: InsightsTranslation = {
  reports: {
    empty: 'Aucun enregistrement trouvé pour les rapports',
    pickTitle: 'Sélectionnez un élément ou un événement pour voir son rapport',
    typeItem: 'Élément',
    typeEvent: 'Événement',
    typeBusiness: 'Établissement',
    seeAll: 'Tout voir',
    seeAllLabel: 'Voir tous les éléments et événements',
    title: 'Rapport de statistiques',
    loading: 'Chargement du rapport...',
    loadError: 'Impossible de charger le rapport de cet élément.',
  },
  stats: {
    views: 'Vues',
    whatsapp: 'Clics WhatsApp',
    favorites: 'Mis en favori',
    shares: 'Partagés',
  },
  audience: {
    title: 'Qui a consulté',
    signedIn: 'Avec un compte Use Guide',
    anonymous: 'Visiteurs',
    noViews: 'Pas encore de vues.',
  },
  chart: {
    title: 'Flux de visites',
    subtitle: '7 derniers jours',
    series: 'Vues',
  },
  reviews: {
    title: 'Avis en attente',
    waiting_one: '{{count}} en attente de réponse',
    waiting_other: '{{count}} en attente de réponse',
    showAll: 'Tout voir',
    showLess: 'Voir moins',
    rating: '{{rating}} sur 5 étoiles',
    replyPlaceholder: 'Écrivez votre réponse...',
    replyLabel: "Réponse à l'avis de {{name}}",
    send: 'Envoyer la réponse',
    cancel: 'Annuler',
    reply: "Répondre à l'avis",
    none: 'Aucun avis en attente',
    replyError: "Impossible d'envoyer la réponse.",
  },
};
