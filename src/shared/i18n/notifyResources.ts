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
    purchases: string;
    trips: string;
    account: string;
    partnerClaims: string;
    partnerMoney: string;
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
  center: {
    title: string;
    open: string;
    openUnread_one: string;
    openUnread_other: string;
    markAll: string;
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
    purchases: 'Compras, pagamentos e reembolsos',
    trips: 'Ingressos e reservas: confirmação, lembretes e mudanças',
    account: 'Segurança da sua conta',
    partnerClaims: 'Cancelamentos, reclamações e avaliações dos clientes',
    partnerMoney: 'Repasses e cadastro do seu negócio',
    note: 'São avisos importantes, por isso não dá para desligar.',
  },
  choices: {
    title: 'Você decide',
    reviewRequests: 'Pedidos de avaliação',
    reviewRequestsHint: 'Depois de um passeio, evento ou estadia, pedimos sua opinião.',
    news: 'Novidades e ofertas',
    newsHint: 'Eventos novos e dicas para aproveitar a viagem.',
    nightNote: 'Esses avisos nunca chegam entre 21h e 9h.',
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
    settings: 'Ajustes de notificações',
    today: 'Hoje',
    earlier: 'Anteriores',
    empty: 'Nenhuma notificação',
    emptyHint: 'Quando sua compra for confirmada ou algo mudar, você fica sabendo aqui.',
    unread: 'Não lida',
    loadError: 'Não conseguimos carregar as notificações.',
  },
};

export const notifyEn: NotifyTranslation = {
  settingsTitle: 'Notifications',
  device: {
    defaultTitle: 'Turn on notifications',
    default:
      'Know right away when your purchase is confirmed, a tour changes time or your guide arrives.',
    enable: 'Turn on',
    granted: 'Notifications are on',
    grantedHint: 'To turn them off, use your phone or browser settings.',
    denied:
      'Use Guide notifications are off here. To get them, allow them in your browser settings.',
    install:
      'On iPhone, notifications only work with Use Guide on your Home Screen. Tap Share, then “Add to Home Screen”, and open the app from there.',
    unsupported:
      'This browser doesn’t show notifications. You can still see everything under the bell at the top of the screen.',
  },
  always: {
    title: 'We always let you know about',
    purchases: 'Purchases, payments and refunds',
    trips: 'Tickets and bookings: confirmation, reminders and changes',
    account: 'Your account’s security',
    partnerClaims: 'Cancellations, complaints and customer reviews',
    partnerMoney: 'Payouts and your business details',
    note: 'These are important, so they can’t be turned off.',
  },
  choices: {
    title: 'Your choice',
    reviewRequests: 'Review requests',
    reviewRequestsHint: 'After a tour, event or stay, we ask what you thought.',
    news: 'News and offers',
    newsHint: 'New events and tips to make the most of your trip.',
    nightNote: 'These never arrive between 9 pm and 9 am.',
  },
  sales: {
    title: 'Sale alerts',
    each: 'For every sale',
    eachHint: 'One alert for each sale or booking.',
    daily: 'End-of-day summary',
    dailyHint: 'A single alert with the day’s sales.',
    note: 'Cancellations and complaints always arrive right away.',
  },
  loadError: 'We couldn’t load your choices.',
  saveError: 'We couldn’t save. Please try again.',
  retry: 'Try again',
  center: {
    title: 'Notifications',
    open: 'Open notifications',
    openUnread_one: 'Open notifications, {{count}} unread',
    openUnread_other: 'Open notifications, {{count}} unread',
    markAll: 'Mark all as read',
    settings: 'Notification settings',
    today: 'Today',
    earlier: 'Earlier',
    empty: 'No notifications',
    emptyHint: 'When your purchase is confirmed or something changes, you’ll see it here.',
    unread: 'Unread',
    loadError: 'We couldn’t load your notifications.',
  },
};

export const notifyFr: NotifyTranslation = {
  settingsTitle: 'Notifications',
  device: {
    defaultTitle: 'Activez les notifications',
    default:
      'Sachez tout de suite quand votre achat est confirmé, qu’une excursion change d’horaire ou que votre guide arrive.',
    enable: 'Activer',
    granted: 'Notifications activées',
    grantedHint: 'Pour les désactiver, passez par les réglages du téléphone ou du navigateur.',
    denied:
      'Les notifications de Use Guide sont désactivées ici. Pour les recevoir, autorisez-les dans les réglages du navigateur.',
    install:
      'Sur iPhone, les notifications ne fonctionnent qu’avec Use Guide sur l’écran d’accueil. Touchez Partager, puis « Sur l’écran d’accueil », et ouvrez l’app depuis là.',
    unsupported:
      'Ce navigateur n’affiche pas les notifications. Vous voyez toujours tout sous la cloche, en haut de l’écran.',
  },
  always: {
    title: 'Nous vous prévenons toujours pour',
    purchases: 'Achats, paiements et remboursements',
    trips: 'Billets et réservations : confirmation, rappels et changements',
    account: 'La sécurité de votre compte',
    partnerClaims: 'Annulations, réclamations et avis des clients',
    partnerMoney: 'Versements et informations de votre établissement',
    note: 'Ce sont des messages importants, ils ne peuvent donc pas être désactivés.',
  },
  choices: {
    title: 'À vous de choisir',
    reviewRequests: 'Demandes d’avis',
    reviewRequestsHint:
      'Après une excursion, un événement ou un séjour, nous demandons votre avis.',
    news: 'Nouveautés et offres',
    newsHint: 'Nouveaux événements et conseils pour profiter du voyage.',
    nightNote: 'Ces messages n’arrivent jamais entre 21 h et 9 h.',
  },
  sales: {
    title: 'Alertes de vente',
    each: 'À chaque vente',
    eachHint: 'Une alerte pour chaque vente ou réservation.',
    daily: 'Résumé en fin de journée',
    dailyHint: 'Une seule alerte avec les ventes du jour.',
    note: 'Les annulations et réclamations arrivent toujours tout de suite.',
  },
  loadError: 'Impossible de charger vos choix.',
  saveError: 'Impossible d’enregistrer. Réessayez.',
  retry: 'Réessayer',
  center: {
    title: 'Notifications',
    open: 'Ouvrir les notifications',
    openUnread_one: 'Ouvrir les notifications, {{count}} non lue',
    openUnread_other: 'Ouvrir les notifications, {{count}} non lues',
    markAll: 'Tout marquer comme lu',
    settings: 'Réglages des notifications',
    today: 'Aujourd’hui',
    earlier: 'Plus tôt',
    empty: 'Aucune notification',
    emptyHint: 'Quand votre achat est confirmé ou que quelque chose change, vous le verrez ici.',
    unread: 'Non lue',
    loadError: 'Impossible de charger les notifications.',
  },
};
