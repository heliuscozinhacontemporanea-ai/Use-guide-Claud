/** Textos da central de notificações e de Configurações › Notificações (D25). pt-BR é a fonte. */
type CategoryTexts = Record<
  | 'purchases'
  | 'tickets'
  | 'bookings'
  | 'reviews'
  | 'account'
  | 'news'
  | 'sales'
  | 'operations'
  | 'finance'
  | 'partnerReviews'
  | 'registration'
  | 'messages',
  { label: string; hint: string }
>;

export interface NotifyTranslation {
  settingsTitle: string;
  settingsIntro: string;
  device: {
    title: string;
    default: string;
    enable: string;
    granted: string;
    denied: string;
    install: string;
    unsupported: string;
  };
  userSection: string;
  partnerSection: string;
  alwaysInCenter: string;
  categories: CategoryTexts;
  quietHours: string;
  quietHoursHint: string;
  dailyDigest: string;
  dailyDigestHint: string;
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
  settingsIntro: 'Tudo fica na central de notificações. Escolha o que também chega neste aparelho.',
  device: {
    title: 'Neste aparelho',
    default: 'Receba avisos de compras, ingressos e reservas mesmo com o app fechado.',
    enable: 'Ativar notificações',
    granted: 'Notificações ativadas neste aparelho.',
    denied:
      'As notificações estão bloqueadas no navegador. Libere nas configurações do navegador e volte aqui.',
    install:
      'No iPhone e no iPad, adicione o Use Guide à Tela de Início (Compartilhar › Adicionar à Tela de Início) e abra por lá para ativar.',
    unsupported:
      'Este navegador não recebe notificações. Os avisos continuam na central de notificações.',
  },
  userSection: 'Avisos',
  partnerSection: 'Parceiro',
  alwaysInCenter: 'Sempre na central',
  categories: {
    purchases: {
      label: 'Compras e pagamentos',
      hint: 'Pagamento confirmado, Pix pendente e reembolsos.',
    },
    tickets: {
      label: 'Ingressos',
      hint: 'Ingressos recebidos, mudanças no evento e lembretes.',
    },
    bookings: {
      label: 'Reservas',
      hint: 'Confirmação, lembretes, chegada do prestador e mudanças de horário.',
    },
    reviews: {
      label: 'Avaliações',
      hint: 'Respostas às suas avaliações e convites para avaliar.',
    },
    account: { label: 'Conta e segurança', hint: 'E-mail, senha e nome de usuário.' },
    news: {
      label: 'Novidades',
      hint: 'Eventos novos em lugares favoritos e dicas da temporada.',
    },
    sales: { label: 'Vendas', hint: 'Nova venda, nova reserva e cancelamentos.' },
    operations: {
      label: 'Operação',
      hint: 'Reclamações, contestações e avisos com prazo para responder.',
    },
    finance: {
      label: 'Financeiro',
      hint: 'Repasses, multas, conta de recebimento e plano.',
    },
    partnerReviews: {
      label: 'Avaliações recebidas',
      hint: 'Novas avaliações e resultado de denúncias.',
    },
    registration: {
      label: 'Cadastro',
      hint: 'Verificação de estabelecimentos e pedidos de força maior.',
    },
    messages: { label: 'Mensagens do Use Guide', hint: 'Comunicados da equipe Use Guide.' },
  },
  quietHours: 'Silêncio noturno',
  quietHoursHint:
    'Das 22h às 8h (horário de Fortaleza), sem notificações no aparelho. Avisos com prazo chegam mesmo assim.',
  dailyDigest: 'Resumo diário de vendas',
  dailyDigestHint: 'Um aviso por dia com as vendas e reservas, em vez de um por venda.',
  loadError: 'Não foi possível carregar suas preferências.',
  saveError: 'Não foi possível salvar. Tente de novo.',
  retry: 'Tentar de novo',
  center: {
    title: 'Notificações',
    open: 'Abrir notificações',
    openUnread_one: 'Abrir notificações, {{count}} não lida',
    openUnread_other: 'Abrir notificações, {{count}} não lidas',
    markAll: 'Marcar todas como lidas',
    settings: 'Configurar notificações',
    today: 'Hoje',
    earlier: 'Antes',
    empty: 'Nada por aqui ainda',
    emptyHint: 'Avisos de compras, ingressos e reservas aparecem aqui.',
    unread: 'Não lida',
    loadError: 'Não foi possível carregar as notificações.',
  },
};

export const notifyEn: NotifyTranslation = {
  settingsTitle: 'Notifications',
  settingsIntro:
    'Everything stays in the notification center. Choose what also reaches this device.',
  device: {
    title: 'On this device',
    default: 'Get alerts about purchases, tickets and bookings even when the app is closed.',
    enable: 'Turn on notifications',
    granted: 'Notifications are on for this device.',
    denied:
      'Notifications are blocked in your browser. Allow them in the browser settings and come back.',
    install:
      'On iPhone and iPad, add Use Guide to your Home Screen (Share › Add to Home Screen) and open it from there to turn them on.',
    unsupported:
      'This browser can’t receive notifications. Alerts still show up in the notification center.',
  },
  userSection: 'Alerts',
  partnerSection: 'Partner',
  alwaysInCenter: 'Always in the center',
  categories: {
    purchases: {
      label: 'Purchases and payments',
      hint: 'Payment confirmed, pending Pix and refunds.',
    },
    tickets: { label: 'Tickets', hint: 'Tickets received, event changes and reminders.' },
    bookings: {
      label: 'Bookings',
      hint: 'Confirmation, reminders, provider arrival and schedule changes.',
    },
    reviews: { label: 'Reviews', hint: 'Replies to your reviews and invitations to review.' },
    account: { label: 'Account and security', hint: 'Email, password and username.' },
    news: { label: 'News', hint: 'New events at favorite places and seasonal tips.' },
    sales: { label: 'Sales', hint: 'New sale, new booking and cancellations.' },
    operations: {
      label: 'Operations',
      hint: 'Complaints, disputes and alerts with a response deadline.',
    },
    finance: { label: 'Finance', hint: 'Payouts, penalties, payout account and plan.' },
    partnerReviews: { label: 'Reviews received', hint: 'New reviews and report outcomes.' },
    registration: {
      label: 'Registration',
      hint: 'Business verification and force majeure requests.',
    },
    messages: { label: 'Messages from Use Guide', hint: 'Announcements from the Use Guide team.' },
  },
  quietHours: 'Quiet hours',
  quietHoursHint:
    'From 10 pm to 8 am (Fortaleza time), no notifications on the device. Alerts with a deadline still arrive.',
  dailyDigest: 'Daily sales summary',
  dailyDigestHint: 'One alert a day with sales and bookings, instead of one per sale.',
  loadError: 'We couldn’t load your preferences.',
  saveError: 'We couldn’t save. Try again.',
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
    empty: 'Nothing here yet',
    emptyHint: 'Alerts about purchases, tickets and bookings show up here.',
    unread: 'Unread',
    loadError: 'We couldn’t load the notifications.',
  },
};

export const notifyFr: NotifyTranslation = {
  settingsTitle: 'Notifications',
  settingsIntro:
    'Tout reste dans le centre de notifications. Choisissez ce qui arrive aussi sur cet appareil.',
  device: {
    title: 'Sur cet appareil',
    default: 'Recevez les alertes d’achats, de billets et de réservations même app fermée.',
    enable: 'Activer les notifications',
    granted: 'Notifications activées sur cet appareil.',
    denied:
      'Les notifications sont bloquées dans le navigateur. Autorisez-les dans ses réglages puis revenez ici.',
    install:
      'Sur iPhone et iPad, ajoutez Use Guide à l’écran d’accueil (Partager › Sur l’écran d’accueil) et ouvrez-le depuis là pour les activer.',
    unsupported:
      'Ce navigateur ne reçoit pas de notifications. Les alertes restent dans le centre de notifications.',
  },
  userSection: 'Alertes',
  partnerSection: 'Partenaire',
  alwaysInCenter: 'Toujours dans le centre',
  categories: {
    purchases: {
      label: 'Achats et paiements',
      hint: 'Paiement confirmé, Pix en attente et remboursements.',
    },
    tickets: { label: 'Billets', hint: 'Billets reçus, changements d’événement et rappels.' },
    bookings: {
      label: 'Réservations',
      hint: 'Confirmation, rappels, arrivée du prestataire et changements d’horaire.',
    },
    reviews: { label: 'Avis', hint: 'Réponses à vos avis et invitations à donner un avis.' },
    account: { label: 'Compte et sécurité', hint: 'E-mail, mot de passe et nom d’utilisateur.' },
    news: {
      label: 'Nouveautés',
      hint: 'Nouveaux événements dans vos lieux favoris et conseils de saison.',
    },
    sales: { label: 'Ventes', hint: 'Nouvelle vente, nouvelle réservation et annulations.' },
    operations: {
      label: 'Opérations',
      hint: 'Réclamations, contestations et alertes avec délai de réponse.',
    },
    finance: {
      label: 'Finances',
      hint: 'Versements, pénalités, compte de paiement et abonnement.',
    },
    partnerReviews: { label: 'Avis reçus', hint: 'Nouveaux avis et résultat des signalements.' },
    registration: {
      label: 'Inscription',
      hint: 'Vérification des établissements et demandes de force majeure.',
    },
    messages: { label: 'Messages de Use Guide', hint: 'Communications de l’équipe Use Guide.' },
  },
  quietHours: 'Mode nuit',
  quietHoursHint:
    'De 22 h à 8 h (heure de Fortaleza), aucune notification sur l’appareil. Les alertes avec délai arrivent quand même.',
  dailyDigest: 'Résumé quotidien des ventes',
  dailyDigestHint: 'Une alerte par jour avec les ventes et réservations, au lieu d’une par vente.',
  loadError: 'Impossible de charger vos préférences.',
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
    empty: 'Rien pour l’instant',
    emptyHint: 'Les alertes d’achats, de billets et de réservations apparaissent ici.',
    unread: 'Non lue',
    loadError: 'Impossible de charger les notifications.',
  },
};
