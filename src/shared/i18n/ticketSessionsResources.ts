/** Textos das ações de sessão do evento no painel do parceiro (D14, D16). pt-BR é a fonte. */
export interface TicketSessionsTranslation {
  postpone: string;
  cancel: string;
  statusPostponed: string;
  statusCanceled: string;
  accountNotice: string;
  postponeDialog: {
    title: string;
    description: string;
    newStart: string;
    durationKept: string;
    reason: string;
    reasonHint: string;
    submit: string;
    invalid: string;
    done_one: string;
    done_other: string;
  };
  cancelDialog: {
    title: string;
    noSales: string;
    withSales_one: string;
    withSales_other: string;
    penalty: string;
    forceMajeure: string;
    reason: string;
    reasonHint: string;
    postponeInstead: string;
    confirm: string;
    back: string;
    invalid: string;
    done: string;
  };
  failed: string;
}

export const ticketSessionsPtBR: TicketSessionsTranslation = {
  postpone: 'Adiar sessão',
  cancel: 'Cancelar sessão',
  statusPostponed: 'Sessão adiada',
  statusCanceled: 'Sessão cancelada',
  accountNotice:
    'Venda de ingressos pagos indisponível: conclua a configuração financeira do CNPJ do estabelecimento deste evento. Inscrições gratuitas funcionam normalmente.',
  postponeDialog: {
    title: 'Adiar sessão',
    description:
      'Os ingressos valem na nova data, sem multa para você. Cada comprador é avisado e tem 7 dias para pedir reembolso integral, com a taxa de serviço.',
    newStart: 'Nova data e hora de início',
    durationKept: 'A duração da sessão continua a mesma. Horário de Fortaleza (UTC−3).',
    reason: 'Motivo',
    reasonHint: 'Aparece no aviso aos compradores. De 3 a 300 caracteres.',
    submit: 'Adiar sessão',
    invalid: 'Informe uma data futura e o motivo.',
    done_one: 'Sessão adiada. {{count}} pedido vale na nova data.',
    done_other: 'Sessão adiada. {{count}} pedidos valem na nova data.',
  },
  cancelDialog: {
    title: 'Cancelar sessão',
    noSales: 'Esta sessão não tem ingressos pagos. Cancelar encerra as vendas dela.',
    withSales_one:
      'Esta sessão tem {{count}} pedido pago. Ele será reembolsado por inteiro, com a taxa de serviço.',
    withSales_other:
      'Esta sessão tem {{count}} pedidos pagos. Todos serão reembolsados por inteiro, com a taxa de serviço.',
    penalty:
      'Seu CNPJ paga multa de 20% do valor vendido, com 24 h para pagar em Recebimentos › Dívidas. Depois disso, a multa é descontada dos repasses e as vendas do CNPJ ficam pausadas.',
    forceMajeure:
      'Foi por força maior (ex.: vento ou interdição pelas autoridades)? Declare em Recebimentos › Dívidas antes do vencimento: a multa fica suspensa até a análise.',
    reason: 'Motivo do cancelamento',
    reasonHint: 'Aparece no aviso aos compradores. De 3 a 300 caracteres.',
    postponeInstead: 'Adiar em vez de cancelar',
    confirm: 'Cancelar sessão',
    back: 'Voltar',
    invalid: 'Informe o motivo do cancelamento.',
    done: 'Sessão cancelada. Os reembolsos foram iniciados.',
  },
  failed: 'Não foi possível concluir agora. Tente de novo.',
};

export const ticketSessionsEn: TicketSessionsTranslation = {
  postpone: 'Postpone session',
  cancel: 'Cancel session',
  statusPostponed: 'Session postponed',
  statusCanceled: 'Session canceled',
  accountNotice:
    'Paid ticket sales unavailable: finish the payment setup for the CNPJ of this event’s place. Free registrations work normally.',
  postponeDialog: {
    title: 'Postpone session',
    description:
      'Tickets stay valid on the new date, with no penalty for you. Each buyer is notified and has 7 days to ask for a full refund, service fee included.',
    newStart: 'New start date and time',
    durationKept: 'The session keeps the same duration. Fortaleza time (UTC−3).',
    reason: 'Reason',
    reasonHint: 'Shown in the notice to buyers. 3 to 300 characters.',
    submit: 'Postpone session',
    invalid: 'Enter a future date and the reason.',
    done_one: 'Session postponed. {{count}} order stays valid on the new date.',
    done_other: 'Session postponed. {{count}} orders stay valid on the new date.',
  },
  cancelDialog: {
    title: 'Cancel session',
    noSales: 'This session has no paid tickets. Canceling ends its sales.',
    withSales_one:
      'This session has {{count}} paid order. It will be fully refunded, service fee included.',
    withSales_other:
      'This session has {{count}} paid orders. All of them will be fully refunded, service fee included.',
    penalty:
      'Your CNPJ pays a penalty of 20% of the amount sold, with 24 h to pay under Payouts › Debts. After that, the penalty is deducted from payouts and the CNPJ’s sales are paused.',
    forceMajeure:
      'Was it force majeure (e.g. wind or closure by the authorities)? Declare it under Payouts › Debts before the due date: the penalty is suspended until the review.',
    reason: 'Cancellation reason',
    reasonHint: 'Shown in the notice to buyers. 3 to 300 characters.',
    postponeInstead: 'Postpone instead',
    confirm: 'Cancel session',
    back: 'Back',
    invalid: 'Enter the cancellation reason.',
    done: 'Session canceled. Refunds have started.',
  },
  failed: 'Could not complete this now. Please try again.',
};

export const ticketSessionsFr: TicketSessionsTranslation = {
  postpone: 'Reporter la séance',
  cancel: 'Annuler la séance',
  statusPostponed: 'Séance reportée',
  statusCanceled: 'Séance annulée',
  accountNotice:
    'Vente de billets payants indisponible : terminez la configuration financière du CNPJ de l’établissement de cet événement. Les inscriptions gratuites fonctionnent normalement.',
  postponeDialog: {
    title: 'Reporter la séance',
    description:
      'Les billets restent valables à la nouvelle date, sans pénalité pour vous. Chaque acheteur est prévenu et a 7 jours pour demander un remboursement intégral, frais de service compris.',
    newStart: 'Nouvelle date et heure de début',
    durationKept: 'La séance garde la même durée. Heure de Fortaleza (UTC−3).',
    reason: 'Motif',
    reasonHint: 'Visible dans l’avis aux acheteurs. De 3 à 300 caractères.',
    submit: 'Reporter la séance',
    invalid: 'Indiquez une date future et le motif.',
    done_one: 'Séance reportée. {{count}} commande reste valable à la nouvelle date.',
    done_other: 'Séance reportée. {{count}} commandes restent valables à la nouvelle date.',
  },
  cancelDialog: {
    title: 'Annuler la séance',
    noSales: 'Cette séance n’a aucun billet payé. L’annuler met fin à ses ventes.',
    withSales_one:
      'Cette séance a {{count}} commande payée. Elle sera remboursée intégralement, frais de service compris.',
    withSales_other:
      'Cette séance a {{count}} commandes payées. Toutes seront remboursées intégralement, frais de service compris.',
    penalty:
      'Votre CNPJ paie une pénalité de 20 % du montant vendu, avec 24 h pour payer dans Versements › Dettes. Ensuite, la pénalité est déduite des versements et les ventes du CNPJ sont suspendues.',
    forceMajeure:
      'C’était un cas de force majeure (ex. : vent ou fermeture par les autorités) ? Déclarez-le dans Versements › Dettes avant l’échéance : la pénalité est suspendue jusqu’à l’examen.',
    reason: 'Motif de l’annulation',
    reasonHint: 'Visible dans l’avis aux acheteurs. De 3 à 300 caractères.',
    postponeInstead: 'Reporter plutôt',
    confirm: 'Annuler la séance',
    back: 'Retour',
    invalid: 'Indiquez le motif de l’annulation.',
    done: 'Séance annulée. Les remboursements ont commencé.',
  },
  failed: 'Impossible de terminer maintenant. Réessayez.',
};
