/** Textos do domínio bookings (pt-BR é a fonte; en e fr têm as mesmas chaves, garantidas pelo tipo). */
export interface BookingsTranslation {
  contact: {
    partnerButton: string;
    partnerHint: string;
    buyerHint: string;
    bookingRef: string;
    situation: string;
    paid: string;
    buyerButton: string;
    buyerAria: string;
    noPhone: string;
    toBuyer: string;
    toBuyerNoName: string;
    toPartner: string;
    arrived: string;
    arrivedNoName: string;
    afterBooking: string;
  };
  buyer: {
    panelTitle: string;
    loading: string;
    loadError: string;
    retry: string;
    duration: string;
    choose: string;
    today: string;
    tomorrow: string;
    reserve: string;
    perGroup: string;
    perPersonRange: string;
    perPerson: string;
    cancellationTitle: string;
    durationHours: string;
    durationMinutes: string;
    meetingPoint: string;
    rescheduledNotice: string;
    tabsLabel: string;
    upcomingTab: string;
    pastTab: string;
    emptyUpcoming: string;
    emptyPast: string;
    refundedAmount: string;
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
    promoCode: string;
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
    detail: {
      bookingTitle: string;
      whenLabel: string;
      bookingLabel: string;
      meetingLabel: string;
      today: string;
      inProgress: string;
      inProgressSince: string;
      openDetails: string;
    };
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
    coupons: string;
    confirmArchive: string;
    actionFailed: string;
    stripeRequired: string;
    publishNeedsStripe: string;
    stripeRequiredSome: string;
    accountStatusError: string;
    fromPrice: string;
    /** Catálogo do painel (p09, p19): linha da oferta e folha de ações. */
    perPerson: string;
    perGroup: string;
    fromPerPerson: string;
    fromPerGroup: string;
    emptyCatalog: string;
    pickItem: string;
    sheetActions: string;
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
  slotSheet: {
    when: string;
    meetingPoint: string;
    bookings: string;
    people: string;
    peopleOf: string;
    arrived: string;
    statusArrived: string;
    checkedInAt: string;
    startedAt: string;
    withCode: string;
    statusWaiting: string;
    noName: string;
    units_one: string;
    units_other: string;
    confirmCode: string;
    reschedule: string;
    cancel: string;
    error: string;
    empty: string;
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
    canceled_one: string;
    canceled_other: string;
    statusClosed: string;
    statusCanceled: string;
    reschedule: string;
    rescheduleTitle: string;
    rescheduleDescription: string;
    newDateTime: string;
    rescheduleReason: string;
    rescheduleReasonHint: string;
    rescheduleSubmit: string;
    rescheduled_one: string;
    rescheduled_other: string;
    rescheduleInvalid: string;
    cancelTitle: string;
    cancelNoSales: string;
    cancelWithSales_one: string;
    cancelWithSales_other: string;
    cancelPenalty: string;
    cancelForceMajeure: string;
    rescheduleInstead: string;
    cancelAnyway: string;
    back: string;
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
    CHECK_IN_NOT_APPLICABLE: string;
    CHECK_IN_WINDOW_CLOSED: string;
    INVALID_CHECK_IN_CODE: string;
    CHECK_IN_LOCKED: string;
    NO_SHOW_TOO_EARLY: string;
    ABSENCE_REPORT_NOT_ALLOWED: string;
    NOTHING_TO_ANSWER: string;
    INVALID_ENTRY_PASS: string;
    NAME_CHANGE_NOT_ALLOWED: string;
    CLAIM_ALREADY_EXISTS: string;
    CONTACT_UNAVAILABLE: string;
    CONTACT_IN_TEXT: string;
    INTERNAL_ERROR: string;
    PROMO_INVALID: string;
    PROMO_NOT_STARTED: string;
    PROMO_EXPIRED: string;
    PROMO_EXHAUSTED: string;
    PROMO_ALREADY_USED: string;
  };
}

export const bookingsPtBR: BookingsTranslation = {
  contact: {
    partnerButton: 'Falar com o parceiro',
    partnerHint:
      'Abre o WhatsApp com uma mensagem pronta com o número da reserva. Disponível até o fim do serviço.',
    buyerHint:
      'Mensagem pronta com o número da reserva, para avisar mudança de ponto, atraso ou clima. Fica registrado; some depois do serviço.',
    bookingRef: 'Reserva',
    situation: 'Situação',
    paid: 'Pago',
    buyerButton: 'WhatsApp do cliente',
    buyerAria: 'WhatsApp de {{name}}',
    noPhone: 'Não há telefone para esta reserva.',
    toBuyer:
      'Olá, {{name}}! Aqui é do {{title}}, sobre a sua reserva {{code}} no Use Guide para {{when}}.',
    toBuyerNoName:
      'Olá! Aqui é do {{title}}, sobre a sua reserva {{code}} no Use Guide para {{when}}.',
    toPartner: 'Olá! Tenho a reserva {{code}} no Use Guide: {{title}}, {{when}}.',
    arrived: 'Olá, {{name}}! Já cheguei ao ponto de encontro. Reserva {{code}} no Use Guide.',
    arrivedNoName: 'Olá! Já cheguei ao ponto de encontro. Reserva {{code}} no Use Guide.',
    afterBooking: 'Depois da reserva, você fala com o parceiro pelo seu pedido.',
  },
  buyer: {
    panelTitle: 'Reservar',
    loading: 'Carregando disponibilidade…',
    loadError: 'Não foi possível carregar a disponibilidade.',
    retry: 'Tentar novamente',
    duration: 'Duração: {{minutes}} min',
    choose: 'Escolha',
    today: 'Hoje',
    tomorrow: 'Amanhã',
    reserve: 'Reservar',
    perGroup: 'por grupo, até {{count}} pessoas',
    perPersonRange: 'de {{min}} a {{max}} pessoas',
    perPerson: 'por pessoa',
    cancellationTitle: 'Cancelamento',
    durationHours: '{{hours}} h',
    durationMinutes: '{{minutes}} min',
    meetingPoint: 'Ponto de encontro: {{address}}',
    rescheduledNotice: 'Nova data. Cancelamento com reembolso total até {{date}}',
    tabsLabel: 'Reservas',
    upcomingTab: 'Próximas ({{count}})',
    pastTab: 'Anteriores ({{count}})',
    emptyUpcoming: 'Nenhuma reserva por vir.',
    emptyPast: 'Nenhuma reserva anterior.',
    refundedAmount: 'Reembolsado {{amount}}',
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
    promoCode: 'Cupom de desconto (opcional)',
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
    detail: {
      bookingTitle: 'Minha reserva',
      whenLabel: 'Quando',
      bookingLabel: 'Reserva',
      meetingLabel: 'Ponto de encontro',
      today: 'hoje',
      inProgress: 'Em andamento',
      inProgressSince: 'Em andamento · começou às {{time}}',
      openDetails: 'Abrir a reserva {{title}}',
    },
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
    coupons: 'Cupons',
    confirmArchive: 'Arquivar esta oferta? Ela sai do site e não pode ser reaberta.',
    actionFailed: 'Não foi possível concluir a ação.',
    stripeRequired: 'Para vender reservas, conclua a configuração financeira da sua conta.',
    publishNeedsStripe:
      'Conclua a configuração financeira do CNPJ deste estabelecimento para publicar.',
    stripeRequiredSome:
      'Alguns estabelecimentos ainda não podem vender: conclua a configuração financeira do CNPJ de cada um em Recebimentos.',
    accountStatusError: 'Não foi possível verificar sua conta financeira agora.',
    fromPrice: 'a partir de {{amount}}',
    perPerson: '{{amount}} por pessoa',
    perGroup: '{{amount}} por grupo',
    fromPerPerson: 'a partir de {{amount}} por pessoa',
    fromPerGroup: 'a partir de {{amount}} por grupo',
    emptyCatalog: 'Nenhum passeio ou aluguel ainda.',
    pickItem: 'Em qual estabelecimento?',
    sheetActions: 'O que deseja fazer?',
  },
  status: {
    draft: 'Rascunho',
    published: 'À venda',
    paused: 'Pausado',
    archived: 'Arquivado',
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
    requireNamesLabel: 'Pedir o nome de cada pessoa',
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
  slotSheet: {
    when: '{{date}} · {{time}}',
    meetingPoint: 'ponto de encontro: {{place}}',
    bookings: 'Reservas',
    people: 'Pessoas',
    peopleOf: '{{sold}} de {{capacity}}',
    arrived: 'Chegaram',
    statusArrived: 'Chegou',
    checkedInAt: 'Check-in {{time}}',
    startedAt: 'Iniciado às {{time}}',
    withCode: '{{done}} de {{total}} com código',
    statusWaiting: 'Aguardando',
    noName: 'Cliente',
    units_one: '{{count}} pessoa',
    units_other: '{{count}} pessoas',
    confirmCode: 'Confirmar chegada com código',
    reschedule: 'Mudar horário',
    cancel: 'Cancelar horário',
    error: 'Não foi possível carregar as reservas do horário.',
    empty: 'Nenhuma reserva neste horário.',
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
    canceled_one: 'Horário cancelado. {{count}} reserva reembolsada.',
    canceled_other: 'Horário cancelado. {{count}} reservas reembolsadas.',
    statusClosed: 'Fechado',
    statusCanceled: 'Cancelado',
    reschedule: 'Remarcar',
    rescheduleTitle: 'Remarcar horário',
    rescheduleDescription:
      'As reservas valem na nova data, sem multa para você. Cada comprador é avisado e tem 7 dias para cancelar com reembolso integral.',
    newDateTime: 'Nova data e hora',
    rescheduleReason: 'Motivo',
    rescheduleReasonHint: 'Aparece para os compradores. De 3 a 300 caracteres.',
    rescheduleSubmit: 'Remarcar horário',
    rescheduled_one: 'Horário remarcado. {{count}} reserva vale na nova data.',
    rescheduled_other: 'Horário remarcado. {{count}} reservas valem na nova data.',
    rescheduleInvalid: 'Informe uma data futura e o motivo.',
    cancelTitle: 'Cancelar horário',
    cancelNoSales:
      'Este horário não tem reservas pagas. Cancelar fecha o horário para novas reservas.',
    cancelWithSales_one:
      'Este horário tem {{count}} vaga vendida. A reserva paga será reembolsada por inteiro.',
    cancelWithSales_other:
      'Este horário tem {{count}} vagas vendidas. As reservas pagas serão reembolsadas por inteiro.',
    cancelPenalty:
      'Seu CNPJ paga multa de 20% do valor vendido, com 24 h para pagar em Recebimentos › Dívidas. Depois disso, a multa é descontada dos repasses e as vendas do CNPJ ficam pausadas.',
    cancelForceMajeure:
      'Foi por força maior (ex.: vento ou mar acima do limite)? Declare em Recebimentos › Dívidas antes do vencimento: a multa fica suspensa até a análise.',
    rescheduleInstead: 'Remarcar em vez de cancelar',
    cancelAnyway: 'Cancelar horário',
    back: 'Voltar',
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
    CHECK_IN_NOT_APPLICABLE: 'Esta reserva não usa este tipo de check-in.',
    CHECK_IN_WINDOW_CLOSED: 'O check-in deste horário não está aberto agora.',
    INVALID_CHECK_IN_CODE: 'Código incorreto. Confira com o comprador.',
    CHECK_IN_LOCKED: 'Muitos códigos errados. Tente de novo em 15 minutos.',
    NO_SHOW_TOO_EARLY: 'Toque em "Cheguei" e espere 30 min antes de marcar a ausência.',
    ABSENCE_REPORT_NOT_ALLOWED:
      'Só é possível relatar 30 min depois do horário, se o check-in não foi feito.',
    NOTHING_TO_ANSWER: 'Não há nada para responder nesta reserva.',
    INVALID_ENTRY_PASS: 'QR Code inválido para este horário.',
    NAME_CHANGE_NOT_ALLOWED:
      'O nome desta entrada já foi trocado ou a troca fechou (até 24 h antes).',
    CLAIM_ALREADY_EXISTS: 'Já existe uma reclamação para esta compra.',
    CONTACT_UNAVAILABLE:
      'O contato fica disponível só com a reserva confirmada, até o fim do serviço.',
    CONTACT_IN_TEXT:
      'Tire telefone, e-mail, links, @ e chave Pix do texto. O contato com o cliente acontece depois da compra, pelo pedido.',
    INTERNAL_ERROR: 'Algo deu errado. Tente novamente em instantes.',
    PROMO_INVALID: 'Cupom inválido para esta oferta.',
    PROMO_NOT_STARTED: 'Este cupom ainda não está valendo.',
    PROMO_EXPIRED: 'Este cupom já encerrou.',
    PROMO_EXHAUSTED: 'Este cupom esgotou.',
    PROMO_ALREADY_USED: 'Você já usou este cupom.',
  },
};
