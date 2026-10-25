/** Textos da compra de ingressos (painel do evento). pt-BR é a fonte. */
export interface TicketCheckoutTranslation {
  title: string;
  limit: string;
  loading: string;
  free: string;
  unavailable: string;
  decrease: string;
  increase: string;
  sessionsLabel: string;
  status: {
    soldOut: string;
    notStarted: string;
    ended: string;
    available_one: string;
    available_other: string;
  };
  buyer: { title: string; name: string; email: string };
  holders: { title: string; label: string; name: string; email: string };
  promoCode: string;
  policy: {
    title: string;
    appliedTitle: string;
    transferAllowed: string;
    transferDisabled: string;
  };
  ticketCount_one: string;
  ticketCount_other: string;
  plusServiceFee: string;
  registerFree: string;
  reserve: string;
  errors: {
    expired: string;
    loginRequired: string;
    selectSession: string;
    selectTicket: string;
    buyerRequired: string;
    createFailed: string;
    awaitingStripe: string;
  };
  issued: {
    freeTitle: string;
    paidTitle: string;
    order: string;
    qrAlt: string;
    defaultType: string;
    ticketId: string;
    buyMore: string;
  };
  payment: {
    reservation: string;
    total: string;
    expired: string;
    remaining: string;
    subtotal: string;
    discount: string;
    finalTotal: string;
    processing: string;
    pay: string;
    newReservation: string;
    loadingStripe: string;
    secure: string;
  };
}

export const ticketCheckoutPtBR: TicketCheckoutTranslation = {
  title: 'Ingressos e inscrições',
  limit: 'Até {{count}} por pessoa nesta sessão',
  loading: 'Carregando ingressos…',
  free: 'Gratuito',
  unavailable: 'Indisponível',
  decrease: 'Diminuir quantidade de {{name}}',
  increase: 'Aumentar quantidade de {{name}}',
  sessionsLabel: 'Sessões do evento',
  status: {
    soldOut: 'Esgotado',
    notStarted: 'Vendas em breve',
    ended: 'Vendas encerradas',
    available_one: '{{count}} disponível',
    available_other: '{{count}} disponíveis',
  },
  buyer: {
    title: 'Dados do comprador',
    name: 'Nome completo',
    email: 'E-mail para receber os ingressos',
  },
  holders: {
    title: 'Titulares dos ingressos ({{count}})',
    label: 'Titular {{number}} — {{ticket}}',
    name: 'Nome do titular',
    email: 'E-mail do titular',
  },
  promoCode: 'Cupom promocional (opcional)',
  policy: {
    title: 'Cancelamento e transferência',
    appliedTitle: 'Política aplicada a este pedido',
    transferAllowed: 'Transferência de titularidade permitida até {{hours}} h antes do início.',
    transferDisabled: 'Transferência de titularidade não habilitada para este evento.',
  },
  ticketCount_one: '{{count}} ingresso',
  ticketCount_other: '{{count}} ingressos',
  plusServiceFee: '+ taxa de serviço, mostrada antes do pagamento',
  registerFree: 'Inscrever-se gratuitamente',
  reserve: 'Reservar e pagar',
  errors: {
    expired: 'Sua reserva expirou. Selecione os ingressos novamente.',
    loginRequired: 'Entre na sua conta Use Guide para reservar ou comprar ingressos.',
    selectSession: 'Selecione uma sessão do evento.',
    selectTicket: 'Selecione ao menos 1 ingresso.',
    buyerRequired: 'Preencha o nome e o e-mail do comprador.',
    createFailed: 'Não foi possível criar o pedido de ingressos.',
    awaitingStripe: 'Pagamento enviado. Aguardando a confirmação final do Stripe.',
  },
  issued: {
    freeTitle: 'Inscrição confirmada!',
    paidTitle: 'Ingressos emitidos!',
    order: 'Pedido #{{id}} • {{event}}',
    qrAlt: 'QR Code do ingresso {{id}}',
    defaultType: 'Ingresso',
    ticketId: 'ID: {{id}} • QR v{{version}}',
    buyMore: 'Comprar mais ingressos',
  },
  payment: {
    reservation: 'Reserva #{{id}}',
    total: 'Total: {{amount}}',
    expired: 'Reserva expirada',
    remaining: 'Tempo restante: {{time}}',
    subtotal: 'Subtotal',
    discount: 'Desconto',
    finalTotal: 'Total',
    processing: 'Confirmando o pagamento e emitindo seus ingressos…',
    pay: 'Pagar {{amount}}',
    newReservation: 'Nova reserva',
    loadingStripe: 'Carregando o pagamento…',
    secure: 'Pagamento seguro pelo Stripe (cartão e Pix)',
  },
};

export const ticketCheckoutEn: TicketCheckoutTranslation = {
  title: 'Tickets and registration',
  limit: 'Up to {{count}} per person for this session',
  loading: 'Loading tickets…',
  free: 'Free',
  unavailable: 'Unavailable',
  decrease: 'Decrease quantity of {{name}}',
  increase: 'Increase quantity of {{name}}',
  sessionsLabel: 'Event sessions',
  status: {
    soldOut: 'Sold out',
    notStarted: 'Sales start soon',
    ended: 'Sales closed',
    available_one: '{{count}} available',
    available_other: '{{count}} available',
  },
  buyer: {
    title: 'Buyer details',
    name: 'Full name',
    email: 'Email to receive the tickets',
  },
  holders: {
    title: 'Ticket holders ({{count}})',
    label: 'Holder {{number}} — {{ticket}}',
    name: 'Holder name',
    email: 'Holder email',
  },
  promoCode: 'Promo code (optional)',
  policy: {
    title: 'Cancellation and transfer',
    appliedTitle: 'Policy applied to this order',
    transferAllowed: 'Ticket transfer allowed up to {{hours}} h before the start.',
    transferDisabled: 'Ticket transfer is not enabled for this event.',
  },
  ticketCount_one: '{{count}} ticket',
  ticketCount_other: '{{count}} tickets',
  plusServiceFee: '+ service fee, shown before payment',
  registerFree: 'Register for free',
  reserve: 'Reserve and pay',
  errors: {
    expired: 'Your reservation expired. Select the tickets again.',
    loginRequired: 'Sign in to your Use Guide account to reserve or buy tickets.',
    selectSession: 'Select an event session.',
    selectTicket: 'Select at least 1 ticket.',
    buyerRequired: 'Fill in the buyer name and email.',
    createFailed: 'Could not create the ticket order.',
    awaitingStripe: 'Payment sent. Waiting for Stripe’s final confirmation.',
  },
  issued: {
    freeTitle: 'Registration confirmed!',
    paidTitle: 'Tickets issued!',
    order: 'Order #{{id}} • {{event}}',
    qrAlt: 'QR code of ticket {{id}}',
    defaultType: 'Ticket',
    ticketId: 'ID: {{id}} • QR v{{version}}',
    buyMore: 'Buy more tickets',
  },
  payment: {
    reservation: 'Reservation #{{id}}',
    total: 'Total: {{amount}}',
    expired: 'Reservation expired',
    remaining: 'Time left: {{time}}',
    subtotal: 'Subtotal',
    discount: 'Discount',
    finalTotal: 'Total',
    processing: 'Confirming payment and issuing your tickets…',
    pay: 'Pay {{amount}}',
    newReservation: 'New reservation',
    loadingStripe: 'Loading payment…',
    secure: 'Secure payment by Stripe (card and Pix)',
  },
};

export const ticketCheckoutFr: TicketCheckoutTranslation = {
  title: 'Billets et inscriptions',
  limit: 'Jusqu’à {{count}} par personne pour cette séance',
  loading: 'Chargement des billets…',
  free: 'Gratuit',
  unavailable: 'Indisponible',
  decrease: 'Diminuer la quantité de {{name}}',
  increase: 'Augmenter la quantité de {{name}}',
  sessionsLabel: 'Séances de l’événement',
  status: {
    soldOut: 'Complet',
    notStarted: 'Ventes bientôt ouvertes',
    ended: 'Ventes terminées',
    available_one: '{{count}} disponible',
    available_other: '{{count}} disponibles',
  },
  buyer: {
    title: 'Coordonnées de l’acheteur',
    name: 'Nom complet',
    email: 'E-mail pour recevoir les billets',
  },
  holders: {
    title: 'Titulaires des billets ({{count}})',
    label: 'Titulaire {{number}} — {{ticket}}',
    name: 'Nom du titulaire',
    email: 'E-mail du titulaire',
  },
  promoCode: 'Code promo (facultatif)',
  policy: {
    title: 'Annulation et transfert',
    appliedTitle: 'Politique appliquée à cette commande',
    transferAllowed: 'Transfert du billet autorisé jusqu’à {{hours}} h avant le début.',
    transferDisabled: 'Le transfert de billet n’est pas activé pour cet événement.',
  },
  ticketCount_one: '{{count}} billet',
  ticketCount_other: '{{count}} billets',
  plusServiceFee: '+ frais de service, affichés avant le paiement',
  registerFree: 'S’inscrire gratuitement',
  reserve: 'Réserver et payer',
  errors: {
    expired: 'Votre réservation a expiré. Sélectionnez à nouveau les billets.',
    loginRequired: 'Connectez-vous à votre compte Use Guide pour réserver ou acheter des billets.',
    selectSession: 'Sélectionnez une séance de l’événement.',
    selectTicket: 'Sélectionnez au moins 1 billet.',
    buyerRequired: 'Renseignez le nom et l’e-mail de l’acheteur.',
    createFailed: 'Impossible de créer la commande de billets.',
    awaitingStripe: 'Paiement envoyé. En attente de la confirmation finale de Stripe.',
  },
  issued: {
    freeTitle: 'Inscription confirmée !',
    paidTitle: 'Billets émis !',
    order: 'Commande n° {{id}} • {{event}}',
    qrAlt: 'QR code du billet {{id}}',
    defaultType: 'Billet',
    ticketId: 'ID : {{id}} • QR v{{version}}',
    buyMore: 'Acheter d’autres billets',
  },
  payment: {
    reservation: 'Réservation n° {{id}}',
    total: 'Total : {{amount}}',
    expired: 'Réservation expirée',
    remaining: 'Temps restant : {{time}}',
    subtotal: 'Sous-total',
    discount: 'Réduction',
    finalTotal: 'Total',
    processing: 'Confirmation du paiement et émission de vos billets…',
    pay: 'Payer {{amount}}',
    newReservation: 'Nouvelle réservation',
    loadingStripe: 'Chargement du paiement…',
    secure: 'Paiement sécurisé par Stripe (carte et Pix)',
  },
};
