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
    planRequiredTitle: string;
    planRequired: string;
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
  monthVisits: {
    label: string;
    versus: string;
    firstMonth: string;
    withPlan: string;
    unavailable: string;
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
    planRequiredTitle: 'Métricas do plano Use Guide Verificado',
    planRequired:
      'As métricas deste cadastro fazem parte do plano do estabelecimento. Ative o plano em Meus Itens. As avaliações continuam liberadas.',
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
  monthVisits: {
    label: 'Visitas no mês',
    versus: '{{percent}} que {{month}}',
    firstMonth: 'Sem visitas em {{month}}',
    withPlan: 'Disponível com o plano',
    unavailable: 'Não carregou agora',
  },
};
