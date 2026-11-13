/** Textos de Configurações › Compras: o histórico de tudo que a pessoa comprou. pt-BR é a fonte. */
export interface PurchasesTranslation {
  settingsItem: string;
  title: string;
  back: string;
  tabsLabel: string;
  tabs: { done: string; pending: string; pendingCount: string; canceled: string };
  empty: { done: string; pending: string; canceled: string };
  loading: string;
  service: { event: string; tour: string; private_entry: string };
  status: {
    paid: string;
    partiallyRefunded: string;
    awaitingPayment: string;
    awaitingPaymentNoTime: string;
    processing: string;
    disputed: string;
    noShow: string;
    refundPending: string;
    refunded: string;
    refundedAmount: string;
    notCompleted: string;
    canceledByPartner: string;
  };
  pay: string;
  receipt: {
    boughtAt: string;
    serviceAt: string;
    tickets_one: string;
    tickets_other: string;
    participants_one: string;
    participants_other: string;
    discount: string;
    serviceFee: string;
    total: string;
    refund: string;
    finalAmount: string;
    policy: string;
    viewTickets: string;
    viewBooking: string;
    cancel: string;
    cancelEndedTickets: string;
    cancelEndedBooking: string;
  };
  confirm: {
    title: string;
    refundLabel: string;
    withdrawal: string;
    withdrawalWithFee: string;
    reschedule: string;
    rescheduleWithFee: string;
    policy: string;
    policyKeepsFee: string;
    note: string;
    confirm: string;
    keep: string;
  };
  feedback: { canceled: string };
  errors: { cancel: string };
}

export const purchasesPtBR: PurchasesTranslation = {
  settingsItem: 'Compras',
  title: 'Compras',
  back: 'Voltar',
  tabsLabel: 'Compras',
  tabs: {
    done: 'Finalizadas',
    pending: 'Pendentes',
    pendingCount: 'Pendentes ({{count}})',
    canceled: 'Canceladas',
  },
  empty: {
    done: 'Nenhuma compra finalizada.',
    pending: 'Nenhuma compra esperando pagamento.',
    canceled: 'Nenhuma compra cancelada.',
  },
  loading: 'Carregando suas compras…',
  service: {
    event: 'Evento em {{date}}',
    tour: 'Passeio em {{date}}',
    private_entry: 'Entrada em {{date}}',
  },
  status: {
    paid: 'Pago',
    partiallyRefunded: 'Pago · reembolso parcial',
    awaitingPayment: 'Aguardando pagamento · até {{time}}',
    awaitingPaymentNoTime: 'Aguardando pagamento',
    processing: 'Pagamento em confirmação',
    disputed: 'Em análise',
    noShow: 'Não compareceu',
    refundPending: 'Reembolso em andamento',
    refunded: 'Reembolsado',
    refundedAmount: 'Reembolsado {{amount}}',
    notCompleted: 'Pagamento não concluído',
    canceledByPartner: 'Cancelado pelo organizador',
  },
  pay: 'Pagar',
  receipt: {
    boughtAt: '#{{code}} · comprado em {{date}}',
    serviceAt: '{{place}} · {{date}}',
    tickets_one: '{{count}} ingresso',
    tickets_other: '{{count}} ingressos',
    participants_one: '{{count}} participante',
    participants_other: '{{count}} participantes',
    discount: 'Desconto',
    serviceFee: 'Taxa de serviço',
    total: 'Total pago',
    refund: 'Reembolso',
    finalAmount: 'Valor final',
    policy: 'Política de cancelamento: {{title}}. {{description}}',
    viewTickets: 'Ver ingressos',
    viewBooking: 'Ver reserva',
    cancel: 'Cancelar compra',
    cancelEndedTickets:
      'O prazo para cancelar com reembolso terminou. Seus ingressos continuam valendo.',
    cancelEndedBooking:
      'O prazo para cancelar com reembolso terminou. Sua reserva continua valendo.',
  },
  confirm: {
    title: 'Cancelar compra?',
    refundLabel: 'Reembolso',
    withdrawal: 'Você está no prazo de arrependimento e recebe tudo de volta. Vale até {{date}}.',
    withdrawalWithFee:
      'Você está no prazo de arrependimento: recebe tudo de volta, inclusive a taxa de serviço. Vale até {{date}}.',
    reschedule: 'A data mudou e você recebe tudo de volta. Vale até {{date}}.',
    rescheduleWithFee:
      'A data mudou: você recebe tudo de volta, inclusive a taxa de serviço. Vale até {{date}}.',
    policy: 'Pela política {{policy}}, você recebe {{percent}}% do valor. Vale até {{date}}.',
    policyKeepsFee:
      'Pela política {{policy}}, você recebe {{percent}}% dos ingressos. A taxa de serviço não volta. Vale até {{date}}.',
    note: 'O valor volta para o mesmo meio de pagamento.',
    confirm: 'Cancelar compra',
    keep: 'Manter compra',
  },
  feedback: {
    canceled: 'Compra cancelada. O reembolso volta para o mesmo meio de pagamento.',
  },
  errors: { cancel: 'Não foi possível cancelar a compra.' },
};
