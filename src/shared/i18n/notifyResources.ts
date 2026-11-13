import { type NotificationTypeTexts, notifyTypesPtBR } from './notifyTypesResources';

/** Textos das notificações (central e Configurações › Notificações, D25). pt-BR é a fonte. */
export interface NotifyTranslation {
  settingsTitle: string;
  device: {
    defaultTitle: string;
    default: string;
    enable: string;
    granted: string;
    grantedHint: string;
    denied: string;
    install: string;
    unsupported: string;
  };
  always: {
    title: string;
    on: string;
    purchases: { label: string; hint: string };
    trips: { label: string; hint: string };
    account: { label: string; hint: string };
    partnerClaims: { label: string; hint: string };
    partnerMoney: { label: string; hint: string };
    note: string;
  };
  choices: {
    title: string;
    reviewRequests: string;
    reviewRequestsHint: string;
    news: string;
    newsHint: string;
    nightNote: string;
  };
  sales: {
    title: string;
    each: string;
    eachHint: string;
    daily: string;
    dailyHint: string;
    note: string;
  };
  loadError: string;
  saveError: string;
  retry: string;
  types: NotificationTypeTexts;
  center: {
    title: string;
    open: string;
    openUnread_one: string;
    openUnread_other: string;
    markAll: string;
    more: string;
    filterUnread: string;
    filterAll: string;
    upToDate: string;
    upToDateHint: string;
    settings: string;
    today: string;
    earlier: string;
    empty: string;
    emptyHint: string;
    unread: string;
    loadError: string;
  };
}

export const notifyPtBR: NotifyTranslation = {
  types: notifyTypesPtBR,
  settingsTitle: 'Notificações',
  device: {
    defaultTitle: 'Ative as notificações',
    default:
      'Saiba na hora quando a compra for confirmada, o passeio mudar de horário ou o guia chegar.',
    enable: 'Ativar',
    granted: 'Notificações ativadas',
    grantedHint: 'Para desligar, use os ajustes do celular ou do navegador.',
    denied:
      'As notificações do Use Guide estão desligadas aqui. Para receber, permita nos ajustes do navegador.',
    install:
      'No iPhone, as notificações só chegam com o Use Guide na tela inicial. Toque em Compartilhar, depois em “Adicionar à Tela de Início”, e abra o app por lá.',
    unsupported:
      'Este navegador não mostra notificações. Você continua vendo tudo no sininho, no alto da tela.',
  },
  always: {
    title: 'Sempre avisamos você',
    on: 'Sempre',
    purchases: {
      label: 'Compras e pagamentos',
      hint: 'Pagamento confirmado, Pix pendente e reembolsos',
    },
    trips: { label: 'Ingressos e reservas', hint: 'Confirmação, lembretes e mudanças de horário' },
    account: { label: 'Sua conta', hint: 'Acesso novo e troca de e-mail ou senha' },
    partnerClaims: {
      label: 'Cancelamentos e reclamações',
      hint: 'Também as avaliações dos seus clientes',
    },
    partnerMoney: {
      label: 'Repasses e cadastro',
      hint: 'Pagamento das vendas e verificação do seu negócio',
    },
    note: 'São avisos importantes, por isso não dá para desligar.',
  },
  choices: {
    title: 'Você decide',
    reviewRequests: 'Pedidos de avaliação',
    reviewRequestsHint: 'Depois de um passeio, evento ou estadia, pedimos sua opinião.',
    news: 'Novidades e ofertas',
    newsHint: 'Eventos novos e dicas para aproveitar a viagem.',
    nightNote: 'Esses avisos nunca chegam entre 23h30 e 5h30.',
  },
  sales: {
    title: 'Avisos de venda',
    each: 'A cada venda',
    eachHint: 'Um aviso para cada venda ou reserva.',
    daily: 'Resumo no fim do dia',
    dailyHint: 'Um único aviso com as vendas do dia.',
    note: 'Cancelamentos e reclamações chegam na hora, sempre.',
  },
  loadError: 'Não conseguimos carregar suas escolhas.',
  saveError: 'Não conseguimos salvar. Tente de novo.',
  retry: 'Tentar de novo',
  center: {
    title: 'Notificações',
    open: 'Abrir notificações',
    openUnread_one: 'Abrir notificações, {{count}} não lida',
    openUnread_other: 'Abrir notificações, {{count}} não lidas',
    markAll: 'Marcar todas como lidas',
    more: 'Mais opções',
    filterUnread: 'Não lidas',
    filterAll: 'Tudo',
    upToDate: 'Você está em dia',
    upToDateHint: 'Quando chegar algo novo, aparece aqui.',
    settings: 'Configurações',
    today: 'Hoje',
    earlier: 'Anteriores',
    empty: 'Nenhuma notificação',
    emptyHint: 'Quando sua compra for confirmada ou algo mudar, você fica sabendo aqui.',
    unread: 'Não lida',
    loadError: 'Não conseguimos carregar as notificações.',
  },
};
