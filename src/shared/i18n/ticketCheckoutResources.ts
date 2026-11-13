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
  };
  ticketCount_one: string;
  ticketCount_other: string;
  registerFree: string;
  reserve: string;
  errors: {
    expired: string;
    loginRequired: string;
    emailNotVerified: string;
    selectSession: string;
    selectTicket: string;
    buyerRequired: string;
    createFailed: string;
    awaitingStripe: string;
    promo: {
      PROMO_INVALID: string;
      PROMO_NOT_STARTED: string;
      PROMO_EXPIRED: string;
      PROMO_EXHAUSTED: string;
      PROMO_ALREADY_USED: string;
    };
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
    title: 'Política {{name}}',
    appliedTitle: 'Política deste pedido ({{name}})',
  },
  ticketCount_one: '{{count}} ingresso',
  ticketCount_other: '{{count}} ingressos',
  registerFree: 'Inscrever-se gratuitamente',
  reserve: 'Reservar e pagar',
  errors: {
    expired: 'Sua reserva expirou. Selecione os ingressos novamente.',
    loginRequired: 'Entre na sua conta Use Guide para reservar ou comprar ingressos.',
    emailNotVerified: 'Confirme seu e-mail para comprar ingressos.',
    selectSession: 'Selecione uma sessão do evento.',
    selectTicket: 'Selecione ao menos 1 ingresso.',
    buyerRequired: 'Preencha o nome e o e-mail do comprador.',
    createFailed: 'Não foi possível criar o pedido de ingressos.',
    awaitingStripe: 'Pagamento enviado. Aguardando a confirmação final do Stripe.',
    promo: {
      PROMO_INVALID: 'Cupom inválido para este evento.',
      PROMO_NOT_STARTED: 'Este cupom ainda não está valendo.',
      PROMO_EXPIRED: 'Este cupom já encerrou.',
      PROMO_EXHAUSTED: 'Este cupom esgotou.',
      PROMO_ALREADY_USED: 'Você já usou este cupom.',
    },
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
