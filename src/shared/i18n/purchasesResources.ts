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

export const purchasesEn: PurchasesTranslation = {
  settingsItem: 'Purchases',
  title: 'Purchases',
  back: 'Back',
  tabsLabel: 'Purchases',
  tabs: {
    done: 'Completed',
    pending: 'Pending',
    pendingCount: 'Pending ({{count}})',
    canceled: 'Canceled',
  },
  empty: {
    done: 'No completed purchases.',
    pending: 'No purchases waiting for payment.',
    canceled: 'No canceled purchases.',
  },
  loading: 'Loading your purchases…',
  service: {
    event: 'Event on {{date}}',
    tour: 'Tour on {{date}}',
    private_entry: 'Entry on {{date}}',
  },
  status: {
    paid: 'Paid',
    partiallyRefunded: 'Paid · partially refunded',
    awaitingPayment: 'Awaiting payment · until {{time}}',
    awaitingPaymentNoTime: 'Awaiting payment',
    processing: 'Payment being confirmed',
    disputed: 'Under review',
    noShow: 'No-show',
    refundPending: 'Refund in progress',
    refunded: 'Refunded',
    refundedAmount: 'Refunded {{amount}}',
    notCompleted: 'Payment not completed',
    canceledByPartner: 'Canceled by the organizer',
  },
  pay: 'Pay',
  receipt: {
    boughtAt: '#{{code}} · purchased on {{date}}',
    serviceAt: '{{place}} · {{date}}',
    tickets_one: '{{count}} ticket',
    tickets_other: '{{count}} tickets',
    participants_one: '{{count}} participant',
    participants_other: '{{count}} participants',
    discount: 'Discount',
    serviceFee: 'Service fee',
    total: 'Total paid',
    refund: 'Refund',
    finalAmount: 'Final amount',
    policy: 'Cancellation policy: {{title}}. {{description}}',
    viewTickets: 'View tickets',
    viewBooking: 'View booking',
    cancel: 'Cancel purchase',
    cancelEndedTickets: 'The refund cancellation period has ended. Your tickets are still valid.',
    cancelEndedBooking: 'The refund cancellation period has ended. Your booking is still valid.',
  },
  confirm: {
    title: 'Cancel purchase?',
    refundLabel: 'Refund',
    withdrawal:
      'You are within the withdrawal period and get everything back. Valid until {{date}}.',
    withdrawalWithFee:
      'You are within the withdrawal period: you get everything back, including the service fee. Valid until {{date}}.',
    reschedule: 'The date changed and you get everything back. Valid until {{date}}.',
    rescheduleWithFee:
      'The date changed: you get everything back, including the service fee. Valid until {{date}}.',
    policy: 'Under the {{policy}} policy, you get {{percent}}% back. Valid until {{date}}.',
    policyKeepsFee:
      'Under the {{policy}} policy, you get {{percent}}% of the tickets back. The service fee is not refunded. Valid until {{date}}.',
    note: 'The amount goes back to the same payment method.',
    confirm: 'Cancel purchase',
    keep: 'Keep purchase',
  },
  feedback: {
    canceled: 'Purchase canceled. The refund goes back to the same payment method.',
  },
  errors: { cancel: 'Could not cancel the purchase.' },
};

export const purchasesFr: PurchasesTranslation = {
  settingsItem: 'Achats',
  title: 'Achats',
  back: 'Retour',
  tabsLabel: 'Achats',
  tabs: {
    done: 'Terminés',
    pending: 'En attente',
    pendingCount: 'En attente ({{count}})',
    canceled: 'Annulés',
  },
  empty: {
    done: 'Aucun achat terminé.',
    pending: 'Aucun achat en attente de paiement.',
    canceled: 'Aucun achat annulé.',
  },
  loading: 'Chargement de vos achats…',
  service: {
    event: 'Événement le {{date}}',
    tour: 'Excursion le {{date}}',
    private_entry: 'Entrée le {{date}}',
  },
  status: {
    paid: 'Payé',
    partiallyRefunded: 'Payé · remboursé en partie',
    awaitingPayment: 'En attente de paiement · jusqu’à {{time}}',
    awaitingPaymentNoTime: 'En attente de paiement',
    processing: 'Paiement en cours de confirmation',
    disputed: 'En cours d’examen',
    noShow: 'Absent',
    refundPending: 'Remboursement en cours',
    refunded: 'Remboursé',
    refundedAmount: 'Remboursé {{amount}}',
    notCompleted: 'Paiement non finalisé',
    canceledByPartner: 'Annulé par l’organisateur',
  },
  pay: 'Payer',
  receipt: {
    boughtAt: '#{{code}} · acheté le {{date}}',
    serviceAt: '{{place}} · {{date}}',
    tickets_one: '{{count}} billet',
    tickets_other: '{{count}} billets',
    participants_one: '{{count}} participant',
    participants_other: '{{count}} participants',
    discount: 'Réduction',
    serviceFee: 'Frais de service',
    total: 'Total payé',
    refund: 'Remboursement',
    finalAmount: 'Montant final',
    policy: 'Politique d’annulation : {{title}}. {{description}}',
    viewTickets: 'Voir les billets',
    viewBooking: 'Voir la réservation',
    cancel: 'Annuler l’achat',
    cancelEndedTickets:
      'Le délai d’annulation avec remboursement est terminé. Vos billets restent valables.',
    cancelEndedBooking:
      'Le délai d’annulation avec remboursement est terminé. Votre réservation reste valable.',
  },
  confirm: {
    title: 'Annuler l’achat ?',
    refundLabel: 'Remboursement',
    withdrawal:
      'Vous êtes dans le délai de rétractation et tout vous est remboursé. Valable jusqu’au {{date}}.',
    withdrawalWithFee:
      'Vous êtes dans le délai de rétractation : tout vous est remboursé, frais de service compris. Valable jusqu’au {{date}}.',
    reschedule: 'La date a changé et tout vous est remboursé. Valable jusqu’au {{date}}.',
    rescheduleWithFee:
      'La date a changé : tout vous est remboursé, frais de service compris. Valable jusqu’au {{date}}.',
    policy:
      'Selon la politique {{policy}}, vous récupérez {{percent}} % du montant. Valable jusqu’au {{date}}.',
    policyKeepsFee:
      'Selon la politique {{policy}}, vous récupérez {{percent}} % des billets. Les frais de service ne sont pas remboursés. Valable jusqu’au {{date}}.',
    note: 'Le montant revient sur le même moyen de paiement.',
    confirm: 'Annuler l’achat',
    keep: 'Garder l’achat',
  },
  feedback: {
    canceled: 'Achat annulé. Le remboursement revient sur le même moyen de paiement.',
  },
  errors: { cancel: 'Impossible d’annuler l’achat.' },
};
