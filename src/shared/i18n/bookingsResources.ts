/** Textos do domínio bookings (pt-BR é a fonte; en e fr têm as mesmas chaves, garantidas pelo tipo). */
export interface BookingsTranslation {
  buyer: {
    panelTitle: string;
    loading: string;
    loadError: string;
    retry: string;
    duration: string;
    meetingPoint: string;
    chooseSlot: string;
    noSlots: string;
    spotsLeft_one: string;
    spotsLeft_other: string;
    soldOut: string;
    quantityLegend: string;
    increase: string;
    decrease: string;
    maxParticipants: string;
    totalLabel: string;
    participantsLegend: string;
    participantName: string;
    continue: string;
    back: string;
    loginRequired: string;
    login: string;
    payButton: string;
    expiresIn: string;
    expired: string;
    pendingTitle: string;
    pendingDescription: string;
    confirmedTitle: string;
    confirmedDescription: string;
    delayed: string;
    viewMyBookings: string;
    menuItem: string;
    myBookingsTitle: string;
    upcoming: string;
    past: string;
    emptyBookings: string;
    cancelBooking: string;
    confirmCancelRefund: string;
    confirmCancelNoRefund: string;
    canceledWithRefund: string;
    canceledNoRefund: string;
    loadMore: string;
    resultTitle: string;
    resultLoading: string;
  };
  partner: {
    sectionTitle: string;
    sectionDescription: string;
    noEligibleItems: string;
    newOffer: string;
    emptyOffers: string;
    loading: string;
    loadError: string;
    retry: string;
    publish: string;
    pause: string;
    archive: string;
    edit: string;
    manageSlots: string;
    viewBookings: string;
    confirmArchive: string;
    actionFailed: string;
    stripeRequired: string;
    publishNeedsStripe: string;
    accountStatusError: string;
    fromPrice: string;
  };
  status: {
    draft: string;
    published: string;
    paused: string;
    archived: string;
  };
  kind: {
    tour: string;
    private_entry: string;
  };
  editor: {
    titleNew: string;
    titleEdit: string;
    languageTabs: string;
    titleLabel: string;
    descriptionLabel: string;
    optionalTranslation: string;
    pricingLegend: string;
    priceLabel: string;
    priceAmount: string;
    addPriceOption: string;
    removePriceOption: string;
    durationLabel: string;
    meetingPointLabel: string;
    maxParticipantsLabel: string;
    requireNamesLabel: string;
    save: string;
    cancel: string;
    saveFailed: string;
  };
  validation: {
    required: string;
    tooLong: string;
    priceInvalid: string;
    integer: string;
    atLeastOnePrice: string;
  };
  slots: {
    title: string;
    previousWeek: string;
    nextWeek: string;
    emptyWeek: string;
    capacity: string;
    createTitle: string;
    modeRecurrence: string;
    modeSingle: string;
    startDate: string;
    endDate: string;
    weekdays: string;
    times: string;
    singleDateTime: string;
    capacityLabel: string;
    create: string;
    created_one: string;
    created_other: string;
    createFailed: string;
    cancelSlot: string;
    confirmCancelSlot: string;
    canceled_one: string;
    canceled_other: string;
    statusClosed: string;
    statusCanceled: string;
    timezoneNotice: string;
  };
  weekdays: {
    '0': string;
    '1': string;
    '2': string;
    '3': string;
    '4': string;
    '5': string;
    '6': string;
  };
  bookingsList: {
    title: string;
    empty: string;
    participants_one: string;
    participants_other: string;
    markNoShow: string;
    loadMore: string;
    loadError: string;
  };
  bookingStatus: {
    pending_payment: string;
    confirmed: string;
    completed: string;
    canceled: string;
    refunded: string;
    expired: string;
    no_show: string;
    disputed: string;
  };
  errors: {
    VALIDATION_ERROR: string;
    FORBIDDEN: string;
    EMAIL_NOT_VERIFIED: string;
    NOT_FOUND: string;
    SLOT_UNAVAILABLE: string;
    INSUFFICIENT_CAPACITY: string;
    INVALID_TRANSITION: string;
    LATE_PAYMENT_REJECTED: string;
    KIND_NOT_AVAILABLE: string;
    CANCELLATION_NOT_ALLOWED: string;
    TERMS_NOT_ACCEPTED: string;
    SELLER_ACCOUNT_NOT_ELIGIBLE: string;
    INTERNAL_ERROR: string;
  };
}

export const bookingsPtBR: BookingsTranslation = {
  buyer: {
    panelTitle: 'Reservar',
    loading: 'Carregando disponibilidade…',
    loadError: 'Não foi possível carregar a disponibilidade.',
    retry: 'Tentar novamente',
    duration: 'Duração: {{minutes}} min',
    meetingPoint: 'Ponto de encontro: {{address}}',
    chooseSlot: 'Escolha o horário',
    noSlots: 'Nenhum horário disponível nos próximos 30 dias.',
    spotsLeft_one: '{{count}} vaga',
    spotsLeft_other: '{{count}} vagas',
    soldOut: 'Esgotado',
    quantityLegend: 'Participantes',
    increase: 'Adicionar {{label}}',
    decrease: 'Remover {{label}}',
    maxParticipants: 'Máximo de {{count}} participantes por reserva.',
    totalLabel: 'Total',
    participantsLegend: 'Nome dos participantes',
    participantName: 'Participante {{index}}',
    continue: 'Continuar',
    back: 'Voltar',
    loginRequired: 'Entre na sua conta para reservar.',
    login: 'Entrar',
    payButton: 'Pagar {{amount}}',
    expiresIn: 'Vagas reservadas por {{time}}.',
    expired: 'O tempo para pagar acabou. Escolha o horário de novo.',
    pendingTitle: 'Aguardando confirmação do pagamento',
    pendingDescription:
      'No Pix, a confirmação pode levar alguns minutos depois que você pagar o QR Code.',
    confirmedTitle: 'Reserva confirmada',
    confirmedDescription: 'Você encontra os detalhes em Minhas reservas.',
    delayed:
      'A confirmação está demorando. Você pode fechar esta janela; a reserva aparece em Minhas reservas assim que o pagamento for confirmado.',
    viewMyBookings: 'Ver minhas reservas',
    menuItem: 'Minhas reservas',
    myBookingsTitle: 'Minhas reservas',
    upcoming: 'Próximas',
    past: 'Anteriores',
    emptyBookings: 'Você ainda não tem reservas.',
    cancelBooking: 'Cancelar reserva',
    confirmCancelRefund: 'Cancelar esta reserva? Você receberá {{amount}} de volta.',
    confirmCancelNoRefund:
      'Cancelar esta reserva? Pela política de cancelamento, não há reembolso.',
    canceledWithRefund: 'Reserva cancelada. O reembolso de {{amount}} foi solicitado.',
    canceledNoRefund: 'Reserva cancelada.',
    loadMore: 'Carregar mais',
    resultTitle: 'Pagamento da reserva',
    resultLoading: 'Verificando o pagamento…',
  },
  partner: {
    sectionTitle: 'Reservas e horários',
    sectionDescription: 'Venda horários dos seus passeios e entradas das suas atrações.',
    noEligibleItems: 'Cadastre um passeio ou uma atração para vender reservas.',
    newOffer: 'Nova oferta',
    emptyOffers: 'Nenhuma oferta para este item.',
    loading: 'Carregando ofertas…',
    loadError: 'Não foi possível carregar as ofertas.',
    retry: 'Tentar novamente',
    publish: 'Publicar',
    pause: 'Pausar',
    archive: 'Arquivar',
    edit: 'Editar',
    manageSlots: 'Horários',
    viewBookings: 'Reservas',
    confirmArchive: 'Arquivar esta oferta? Ela sai do site e não pode ser reaberta.',
    actionFailed: 'Não foi possível concluir a ação.',
    stripeRequired: 'Para vender reservas, conclua a configuração financeira da sua conta.',
    publishNeedsStripe: 'Conclua a configuração financeira para publicar.',
    accountStatusError: 'Não foi possível verificar sua conta financeira agora.',
    fromPrice: 'a partir de {{amount}}',
  },
  status: {
    draft: 'Rascunho',
    published: 'Publicada',
    paused: 'Pausada',
    archived: 'Arquivada',
  },
  kind: {
    tour: 'Passeio',
    private_entry: 'Entrada de atração',
  },
  editor: {
    titleNew: 'Nova oferta',
    titleEdit: 'Editar oferta',
    languageTabs: 'Idioma do texto',
    titleLabel: 'Título',
    descriptionLabel: 'Descrição',
    optionalTranslation: 'Tradução opcional',
    pricingLegend: 'Preços',
    priceLabel: 'Nome da opção',
    priceAmount: 'Valor (R$)',
    addPriceOption: 'Adicionar opção de preço',
    removePriceOption: 'Remover opção de preço',
    durationLabel: 'Duração (minutos)',
    meetingPointLabel: 'Ponto de encontro',
    maxParticipantsLabel: 'Máximo de participantes por reserva',
    requireNamesLabel: 'Pedir o nome de cada participante',
    save: 'Salvar',
    cancel: 'Cancelar',
    saveFailed: 'Não foi possível salvar a oferta.',
  },
  validation: {
    required: 'Campo obrigatório.',
    tooLong: 'Texto longo demais.',
    priceInvalid: 'Informe um valor maior que zero.',
    integer: 'Informe um número inteiro.',
    atLeastOnePrice: 'Informe ao menos uma opção de preço.',
  },
  slots: {
    title: 'Horários',
    previousWeek: 'Semana anterior',
    nextWeek: 'Próxima semana',
    emptyWeek: 'Nenhum horário nesta semana.',
    capacity: '{{sold}} vendidas · {{reserved}} reservadas · {{free}} livres',
    createTitle: 'Criar horários',
    modeRecurrence: 'Recorrente',
    modeSingle: 'Avulso',
    startDate: 'De',
    endDate: 'Até',
    weekdays: 'Dias da semana',
    times: 'Horários (HH:MM, separados por vírgula)',
    singleDateTime: 'Data e hora',
    capacityLabel: 'Vagas por horário',
    create: 'Criar horários',
    created_one: '{{count}} horário criado.',
    created_other: '{{count}} horários criados.',
    createFailed: 'Não foi possível criar os horários.',
    cancelSlot: 'Cancelar horário',
    confirmCancelSlot:
      'Cancelar este horário? Todas as reservas pagas serão reembolsadas integralmente.',
    canceled_one: 'Horário cancelado. {{count}} reserva reembolsada.',
    canceled_other: 'Horário cancelado. {{count}} reservas reembolsadas.',
    statusClosed: 'Fechado',
    statusCanceled: 'Cancelado',
    timezoneNotice: 'Horários no fuso de Fortaleza (UTC−3).',
  },
  weekdays: {
    '0': 'Dom',
    '1': 'Seg',
    '2': 'Ter',
    '3': 'Qua',
    '4': 'Qui',
    '5': 'Sex',
    '6': 'Sáb',
  },
  bookingsList: {
    title: 'Reservas',
    empty: 'Nenhuma reserva ainda.',
    participants_one: '{{count}} participante',
    participants_other: '{{count}} participantes',
    markNoShow: 'Marcar não comparecimento',
    loadMore: 'Carregar mais',
    loadError: 'Não foi possível carregar as reservas.',
  },
  bookingStatus: {
    pending_payment: 'Aguardando pagamento',
    confirmed: 'Confirmada',
    completed: 'Concluída',
    canceled: 'Cancelada',
    refunded: 'Reembolsada',
    expired: 'Expirada',
    no_show: 'Não compareceu',
    disputed: 'Em disputa',
  },
  errors: {
    VALIDATION_ERROR: 'Dados inválidos. Revise e tente novamente.',
    FORBIDDEN: 'Você não tem permissão para esta ação.',
    EMAIL_NOT_VERIFIED: 'Confirme seu e-mail antes de reservar.',
    NOT_FOUND: 'Não encontrado.',
    SLOT_UNAVAILABLE: 'Este horário não está mais disponível.',
    INSUFFICIENT_CAPACITY: 'Não há vagas suficientes neste horário.',
    INVALID_TRANSITION: 'Esta mudança não é permitida agora.',
    LATE_PAYMENT_REJECTED: 'O pagamento chegou depois do prazo e será devolvido.',
    KIND_NOT_AVAILABLE: 'Este tipo de oferta ainda não está disponível.',
    CANCELLATION_NOT_ALLOWED: 'Esta reserva não pode ser cancelada.',
    TERMS_NOT_ACCEPTED: 'Aceite os termos para continuar.',
    SELLER_ACCOUNT_NOT_ELIGIBLE: 'O parceiro ainda não pode receber pagamentos online.',
    INTERNAL_ERROR: 'Algo deu errado. Tente novamente em instantes.',
  },
};

export const bookingsEn: BookingsTranslation = {
  buyer: {
    panelTitle: 'Book',
    loading: 'Loading availability…',
    loadError: 'Availability could not be loaded.',
    retry: 'Try again',
    duration: 'Duration: {{minutes}} min',
    meetingPoint: 'Meeting point: {{address}}',
    chooseSlot: 'Choose a time',
    noSlots: 'No time slots available in the next 30 days.',
    spotsLeft_one: '{{count}} spot',
    spotsLeft_other: '{{count}} spots',
    soldOut: 'Sold out',
    quantityLegend: 'Participants',
    increase: 'Add {{label}}',
    decrease: 'Remove {{label}}',
    maxParticipants: 'Up to {{count}} participants per booking.',
    totalLabel: 'Total',
    participantsLegend: 'Participant names',
    participantName: 'Participant {{index}}',
    continue: 'Continue',
    back: 'Back',
    loginRequired: 'Sign in to book.',
    login: 'Sign in',
    payButton: 'Pay {{amount}}',
    expiresIn: 'Spots held for {{time}}.',
    expired: 'The payment time ran out. Choose the time slot again.',
    pendingTitle: 'Waiting for payment confirmation',
    pendingDescription: 'With Pix, confirmation can take a few minutes after you pay the QR code.',
    confirmedTitle: 'Booking confirmed',
    confirmedDescription: 'You can find the details in My bookings.',
    delayed:
      'Confirmation is taking a while. You can close this window; the booking shows up in My bookings as soon as the payment is confirmed.',
    viewMyBookings: 'View my bookings',
    menuItem: 'My bookings',
    myBookingsTitle: 'My bookings',
    upcoming: 'Upcoming',
    past: 'Past',
    emptyBookings: 'You have no bookings yet.',
    cancelBooking: 'Cancel booking',
    confirmCancelRefund: 'Cancel this booking? You will get {{amount}} back.',
    confirmCancelNoRefund: 'Cancel this booking? Under the cancellation policy there is no refund.',
    canceledWithRefund: 'Booking canceled. A refund of {{amount}} was requested.',
    canceledNoRefund: 'Booking canceled.',
    loadMore: 'Load more',
    resultTitle: 'Booking payment',
    resultLoading: 'Checking the payment…',
  },
  partner: {
    sectionTitle: 'Bookings and time slots',
    sectionDescription: 'Sell time slots for your tours and entries to your attractions.',
    noEligibleItems: 'Add a tour or an attraction to sell bookings.',
    newOffer: 'New offer',
    emptyOffers: 'No offers for this item.',
    loading: 'Loading offers…',
    loadError: 'The offers could not be loaded.',
    retry: 'Try again',
    publish: 'Publish',
    pause: 'Pause',
    archive: 'Archive',
    edit: 'Edit',
    manageSlots: 'Time slots',
    viewBookings: 'Bookings',
    confirmArchive: 'Archive this offer? It leaves the site and cannot be reopened.',
    actionFailed: 'The action could not be completed.',
    stripeRequired: 'To sell bookings, finish your account payment setup.',
    publishNeedsStripe: 'Finish your payment setup to publish.',
    accountStatusError: 'We couldn’t check your payment account right now.',
    fromPrice: 'from {{amount}}',
  },
  status: {
    draft: 'Draft',
    published: 'Published',
    paused: 'Paused',
    archived: 'Archived',
  },
  kind: {
    tour: 'Tour',
    private_entry: 'Attraction entry',
  },
  editor: {
    titleNew: 'New offer',
    titleEdit: 'Edit offer',
    languageTabs: 'Text language',
    titleLabel: 'Title',
    descriptionLabel: 'Description',
    optionalTranslation: 'Optional translation',
    pricingLegend: 'Prices',
    priceLabel: 'Option name',
    priceAmount: 'Price (R$)',
    addPriceOption: 'Add price option',
    removePriceOption: 'Remove price option',
    durationLabel: 'Duration (minutes)',
    meetingPointLabel: 'Meeting point',
    maxParticipantsLabel: 'Maximum participants per booking',
    requireNamesLabel: 'Ask for each participant’s name',
    save: 'Save',
    cancel: 'Cancel',
    saveFailed: 'The offer could not be saved.',
  },
  validation: {
    required: 'Required field.',
    tooLong: 'Text is too long.',
    priceInvalid: 'Enter an amount greater than zero.',
    integer: 'Enter a whole number.',
    atLeastOnePrice: 'Add at least one price option.',
  },
  slots: {
    title: 'Time slots',
    previousWeek: 'Previous week',
    nextWeek: 'Next week',
    emptyWeek: 'No time slots this week.',
    capacity: '{{sold}} sold · {{reserved}} reserved · {{free}} free',
    createTitle: 'Create time slots',
    modeRecurrence: 'Recurring',
    modeSingle: 'Single',
    startDate: 'From',
    endDate: 'To',
    weekdays: 'Weekdays',
    times: 'Times (HH:MM, comma separated)',
    singleDateTime: 'Date and time',
    capacityLabel: 'Spots per time slot',
    create: 'Create time slots',
    created_one: '{{count}} time slot created.',
    created_other: '{{count}} time slots created.',
    createFailed: 'The time slots could not be created.',
    cancelSlot: 'Cancel time slot',
    confirmCancelSlot: 'Cancel this time slot? Every paid booking will be fully refunded.',
    canceled_one: 'Time slot canceled. {{count}} booking refunded.',
    canceled_other: 'Time slot canceled. {{count}} bookings refunded.',
    statusClosed: 'Closed',
    statusCanceled: 'Canceled',
    timezoneNotice: 'Times in Fortaleza time (UTC−3).',
  },
  weekdays: {
    '0': 'Sun',
    '1': 'Mon',
    '2': 'Tue',
    '3': 'Wed',
    '4': 'Thu',
    '5': 'Fri',
    '6': 'Sat',
  },
  bookingsList: {
    title: 'Bookings',
    empty: 'No bookings yet.',
    participants_one: '{{count}} participant',
    participants_other: '{{count}} participants',
    markNoShow: 'Mark as no-show',
    loadMore: 'Load more',
    loadError: 'The bookings could not be loaded.',
  },
  bookingStatus: {
    pending_payment: 'Awaiting payment',
    confirmed: 'Confirmed',
    completed: 'Completed',
    canceled: 'Canceled',
    refunded: 'Refunded',
    expired: 'Expired',
    no_show: 'No-show',
    disputed: 'Disputed',
  },
  errors: {
    VALIDATION_ERROR: 'Invalid data. Please review and try again.',
    FORBIDDEN: 'You are not allowed to do this.',
    EMAIL_NOT_VERIFIED: 'Verify your email before booking.',
    NOT_FOUND: 'Not found.',
    SLOT_UNAVAILABLE: 'This time slot is no longer available.',
    INSUFFICIENT_CAPACITY: 'Not enough spots left for this time slot.',
    INVALID_TRANSITION: 'This change is not allowed right now.',
    LATE_PAYMENT_REJECTED: 'The payment arrived after the deadline and will be refunded.',
    KIND_NOT_AVAILABLE: 'This kind of offer is not available yet.',
    CANCELLATION_NOT_ALLOWED: 'This booking cannot be canceled.',
    TERMS_NOT_ACCEPTED: 'Accept the terms to continue.',
    SELLER_ACCOUNT_NOT_ELIGIBLE: 'This partner cannot receive online payments yet.',
    INTERNAL_ERROR: 'Something went wrong. Please try again shortly.',
  },
};

export const bookingsFr: BookingsTranslation = {
  buyer: {
    panelTitle: 'Réserver',
    loading: 'Chargement des disponibilités…',
    loadError: 'Impossible de charger les disponibilités.',
    retry: 'Réessayer',
    duration: 'Durée : {{minutes}} min',
    meetingPoint: 'Point de rendez-vous : {{address}}',
    chooseSlot: 'Choisissez un créneau',
    noSlots: 'Aucun créneau disponible dans les 30 prochains jours.',
    spotsLeft_one: '{{count}} place',
    spotsLeft_other: '{{count}} places',
    soldOut: 'Complet',
    quantityLegend: 'Participants',
    increase: 'Ajouter {{label}}',
    decrease: 'Retirer {{label}}',
    maxParticipants: 'Jusqu’à {{count}} participants par réservation.',
    totalLabel: 'Total',
    participantsLegend: 'Nom des participants',
    participantName: 'Participant {{index}}',
    continue: 'Continuer',
    back: 'Retour',
    loginRequired: 'Connectez-vous pour réserver.',
    login: 'Se connecter',
    payButton: 'Payer {{amount}}',
    expiresIn: 'Places bloquées pendant {{time}}.',
    expired: 'Le délai de paiement est écoulé. Choisissez à nouveau le créneau.',
    pendingTitle: 'En attente de la confirmation du paiement',
    pendingDescription:
      'Avec Pix, la confirmation peut prendre quelques minutes après le paiement du QR code.',
    confirmedTitle: 'Réservation confirmée',
    confirmedDescription: 'Retrouvez les détails dans Mes réservations.',
    delayed:
      'La confirmation prend du temps. Vous pouvez fermer cette fenêtre ; la réservation apparaîtra dans Mes réservations dès que le paiement sera confirmé.',
    viewMyBookings: 'Voir mes réservations',
    menuItem: 'Mes réservations',
    myBookingsTitle: 'Mes réservations',
    upcoming: 'À venir',
    past: 'Passées',
    emptyBookings: 'Vous n’avez pas encore de réservation.',
    cancelBooking: 'Annuler la réservation',
    confirmCancelRefund: 'Annuler cette réservation ? Vous serez remboursé de {{amount}}.',
    confirmCancelNoRefund:
      'Annuler cette réservation ? Selon la politique d’annulation, aucun remboursement n’est prévu.',
    canceledWithRefund: 'Réservation annulée. Le remboursement de {{amount}} a été demandé.',
    canceledNoRefund: 'Réservation annulée.',
    loadMore: 'Charger plus',
    resultTitle: 'Paiement de la réservation',
    resultLoading: 'Vérification du paiement…',
  },
  partner: {
    sectionTitle: 'Réservations et créneaux',
    sectionDescription:
      'Vendez des créneaux pour vos excursions et des entrées pour vos attractions.',
    noEligibleItems: 'Ajoutez une excursion ou une attraction pour vendre des réservations.',
    newOffer: 'Nouvelle offre',
    emptyOffers: 'Aucune offre pour cet élément.',
    loading: 'Chargement des offres…',
    loadError: 'Impossible de charger les offres.',
    retry: 'Réessayer',
    publish: 'Publier',
    pause: 'Mettre en pause',
    archive: 'Archiver',
    edit: 'Modifier',
    manageSlots: 'Créneaux',
    viewBookings: 'Réservations',
    confirmArchive: 'Archiver cette offre ? Elle quitte le site et ne pourra pas être rouverte.',
    actionFailed: 'L’action n’a pas pu aboutir.',
    stripeRequired:
      'Pour vendre des réservations, terminez la configuration financière de votre compte.',
    publishNeedsStripe: 'Terminez la configuration financière pour publier.',
    accountStatusError: 'Impossible de vérifier votre compte financier pour le moment.',
    fromPrice: 'à partir de {{amount}}',
  },
  status: {
    draft: 'Brouillon',
    published: 'Publiée',
    paused: 'En pause',
    archived: 'Archivée',
  },
  kind: {
    tour: 'Excursion',
    private_entry: 'Entrée d’attraction',
  },
  editor: {
    titleNew: 'Nouvelle offre',
    titleEdit: 'Modifier l’offre',
    languageTabs: 'Langue du texte',
    titleLabel: 'Titre',
    descriptionLabel: 'Description',
    optionalTranslation: 'Traduction facultative',
    pricingLegend: 'Tarifs',
    priceLabel: 'Nom de l’option',
    priceAmount: 'Prix (R$)',
    addPriceOption: 'Ajouter une option de tarif',
    removePriceOption: 'Retirer l’option de tarif',
    durationLabel: 'Durée (minutes)',
    meetingPointLabel: 'Point de rendez-vous',
    maxParticipantsLabel: 'Nombre maximum de participants par réservation',
    requireNamesLabel: 'Demander le nom de chaque participant',
    save: 'Enregistrer',
    cancel: 'Annuler',
    saveFailed: 'Impossible d’enregistrer l’offre.',
  },
  validation: {
    required: 'Champ obligatoire.',
    tooLong: 'Texte trop long.',
    priceInvalid: 'Indiquez un montant supérieur à zéro.',
    integer: 'Indiquez un nombre entier.',
    atLeastOnePrice: 'Ajoutez au moins une option de tarif.',
  },
  slots: {
    title: 'Créneaux',
    previousWeek: 'Semaine précédente',
    nextWeek: 'Semaine suivante',
    emptyWeek: 'Aucun créneau cette semaine.',
    capacity: '{{sold}} vendues · {{reserved}} réservées · {{free}} libres',
    createTitle: 'Créer des créneaux',
    modeRecurrence: 'Récurrent',
    modeSingle: 'Ponctuel',
    startDate: 'Du',
    endDate: 'Au',
    weekdays: 'Jours de la semaine',
    times: 'Horaires (HH:MM, séparés par des virgules)',
    singleDateTime: 'Date et heure',
    capacityLabel: 'Places par créneau',
    create: 'Créer les créneaux',
    created_one: '{{count}} créneau créé.',
    created_other: '{{count}} créneaux créés.',
    createFailed: 'Impossible de créer les créneaux.',
    cancelSlot: 'Annuler le créneau',
    confirmCancelSlot:
      'Annuler ce créneau ? Toutes les réservations payées seront intégralement remboursées.',
    canceled_one: 'Créneau annulé. {{count}} réservation remboursée.',
    canceled_other: 'Créneau annulé. {{count}} réservations remboursées.',
    statusClosed: 'Fermé',
    statusCanceled: 'Annulé',
    timezoneNotice: 'Horaires à l’heure de Fortaleza (UTC−3).',
  },
  weekdays: {
    '0': 'Dim',
    '1': 'Lun',
    '2': 'Mar',
    '3': 'Mer',
    '4': 'Jeu',
    '5': 'Ven',
    '6': 'Sam',
  },
  bookingsList: {
    title: 'Réservations',
    empty: 'Aucune réservation pour l’instant.',
    participants_one: '{{count}} participant',
    participants_other: '{{count}} participants',
    markNoShow: 'Marquer comme absent',
    loadMore: 'Charger plus',
    loadError: 'Impossible de charger les réservations.',
  },
  bookingStatus: {
    pending_payment: 'En attente de paiement',
    confirmed: 'Confirmée',
    completed: 'Terminée',
    canceled: 'Annulée',
    refunded: 'Remboursée',
    expired: 'Expirée',
    no_show: 'Absent',
    disputed: 'En litige',
  },
  errors: {
    VALIDATION_ERROR: 'Données invalides. Vérifiez et réessayez.',
    FORBIDDEN: 'Vous n’avez pas l’autorisation pour cette action.',
    EMAIL_NOT_VERIFIED: 'Confirmez votre e-mail avant de réserver.',
    NOT_FOUND: 'Introuvable.',
    SLOT_UNAVAILABLE: 'Ce créneau n’est plus disponible.',
    INSUFFICIENT_CAPACITY: 'Il ne reste pas assez de places pour ce créneau.',
    INVALID_TRANSITION: 'Ce changement n’est pas autorisé pour le moment.',
    LATE_PAYMENT_REJECTED: 'Le paiement est arrivé après le délai et sera remboursé.',
    KIND_NOT_AVAILABLE: 'Ce type d’offre n’est pas encore disponible.',
    CANCELLATION_NOT_ALLOWED: 'Cette réservation ne peut pas être annulée.',
    TERMS_NOT_ACCEPTED: 'Acceptez les conditions pour continuer.',
    SELLER_ACCOUNT_NOT_ELIGIBLE: 'Ce partenaire ne peut pas encore recevoir de paiements en ligne.',
    INTERNAL_ERROR: 'Un problème est survenu. Réessayez dans un instant.',
  },
};
