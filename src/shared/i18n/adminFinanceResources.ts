/** Textos das filas financeiras do admin (D16). pt-BR é a fonte. */
export interface AdminFinanceTranslation {
  title: string;
  tabsLabel: string;
  tabs: {
    claims: string;
    forceMajeure: string;
    debts: string;
  };
  loading: string;
  loadMore: string;
  sending: string;
  unknownSeller: string;
  claims: {
    hint: string;
    empty: string;
    refundPending: string;
    fallbackTitle: {
      ticket_order: string;
      booking: string;
    };
    decideBy: string;
    meta: string;
    metaEnd: string;
    decide: string;
    decideTitle: string;
    decideDescription: string;
    outcomeLabel: string;
    outcomeRequired: string;
    outcome: {
      release: string;
      refund_full: string;
      refund_partial: string;
    };
    outcomeHint: {
      release: string;
      refund_full: string;
      refund_partial: string;
    };
    partialLabel: string;
    partialInvalid: string;
    penaltyLabel: string;
    penaltyHint: string;
    submit: string;
    decided: {
      release: string;
      refund_full: string;
      refund_partial: string;
    };
  };
  forceMajeure: {
    hint: string;
    empty: string;
    declaredAt: string;
    meta: string;
    openProof: string;
    approve: string;
    reject: string;
    approveConfirm: string;
    rejectConfirm: string;
    approved: string;
    rejected: string;
  };
  debts: {
    hint: string;
    empty: string;
    dueOn: string;
    overdueSince: string;
    waive: string;
    waiveShort: string;
    reason: {
      cancellation_penalty: string;
      dispute_lost: string;
      post_release_refund: string;
    };
    waiveConfirm: string;
    waived: string;
  };
  errors: {
    NOT_FOUND: string;
    FORBIDDEN: string;
    CLAIM_ALREADY_DECIDED: string;
    CLAIM_REFUND_FAILED: string;
    INVALID_REFUND_AMOUNT: string;
    PENALTY_NOT_ALLOWED: string;
    FORCE_MAJEURE_NOT_PENDING: string;
    DEBT_ALREADY_SETTLED: string;
    UNAVAILABLE: string;
  };
}

export const adminFinancePtBR: AdminFinanceTranslation = {
  title: 'Financeiro',
  tabsLabel: 'Filas financeiras',
  tabs: {
    claims: 'Reclamações',
    forceMajeure: 'Força maior',
    debts: 'Dívidas',
  },
  loading: 'Carregando…',
  loadMore: 'Carregar mais',
  sending: 'Enviando…',
  unknownSeller: 'Vendedor não identificado',
  claims: {
    hint: 'Compras com problema relatado pelo comprador. O repasse fica retido até a decisão; sem decisão no prazo, é liberado.',
    empty: 'Nenhuma reclamação para decidir.',
    refundPending: 'Reembolso em andamento',
    fallbackTitle: {
      ticket_order: 'Pedido de ingresso',
      booking: 'Reserva',
    },
    decideBy: 'Decidir até {{date}}',
    meta: 'Relatado {{opened}} · pago {{paid}}',
    metaEnd: 'serviço terminou {{date}}',
    decide: 'Decidir',
    decideTitle: 'Decidir reclamação',
    decideDescription:
      'A decisão é final. O reembolso sai do saldo da plataforma antes do repasse.',
    outcomeLabel: 'Decisão',
    outcomeRequired: 'Escolha a decisão.',
    outcome: {
      release: 'Liberar o repasse',
      refund_full: 'Reembolso total · {{amount}}',
      refund_partial: 'Reembolso parcial',
    },
    outcomeHint: {
      release: 'O parceiro recebe normalmente.',
      refund_full: 'Inclui a taxa de serviço.',
      refund_partial: 'Até {{max}}, sem a taxa de serviço.',
    },
    partialLabel: 'Valor do reembolso',
    partialInvalid: 'Informe um valor de até {{max}}.',
    penaltyLabel: 'Multa de 20% ao parceiro',
    penaltyHint: 'Serviço que não aconteceu; 24 h para pagar.',
    submit: 'Confirmar decisão',
    decided: {
      release: 'Repasse liberado.',
      refund_full: 'Reembolso integral pedido ao meio de pagamento.',
      refund_partial: 'Reembolso parcial pedido ao meio de pagamento.',
    },
  },
  forceMajeure: {
    hint: 'Multas de cancelamento com força maior declarada. Enquanto em análise, a multa fica suspensa.',
    empty: 'Nenhuma declaração para analisar.',
    declaredAt: 'Declarada em {{date}}',
    meta: 'Declarada {{date}} · multa de {{amount}}',
    openProof: 'Abrir comprovante',
    approve: 'Aprovar',
    reject: 'Recusar',
    approveConfirm: 'Aprovar a força maior? A multa é perdoada.',
    rejectConfirm: 'Recusar a força maior? A multa volta a valer, com 24 h para pagar.',
    approved: 'Força maior aprovada. Multa perdoada.',
    rejected: 'Força maior recusada. A multa volta a valer.',
  },
  debts: {
    hint: 'Dívidas em aberto dos CNPJs. Vencida, a dívida pausa as vendas do CNPJ e é descontada dos repasses.',
    empty: 'Nenhuma dívida em aberto.',
    dueOn: 'Vence em {{date}}',
    overdueSince: 'Vencida desde {{date}} · vendas pausadas',
    waive: 'Perdoar dívida',
    waiveShort: 'Perdoar',
    reason: {
      cancellation_penalty: 'Multa de cancelamento',
      dispute_lost: 'Contestação perdida',
      post_release_refund: 'Reembolso após o repasse',
    },
    waiveConfirm:
      'Perdoar {{amount}}? A dívida deixa de ser cobrada e as vendas do CNPJ voltam se não houver outra vencida.',
    waived: 'Dívida perdoada.',
  },
  errors: {
    NOT_FOUND: 'Registro não encontrado. Atualize a lista.',
    FORBIDDEN: 'Acesso restrito ao admin.',
    CLAIM_ALREADY_DECIDED: 'Esta reclamação já foi decidida.',
    CLAIM_REFUND_FAILED: 'O meio de pagamento recusou o reembolso. Tente de novo.',
    INVALID_REFUND_AMOUNT: 'Valor fora do que ainda pode voltar ao comprador.',
    PENALTY_NOT_ALLOWED: 'A multa vale só para serviço que não aconteceu, com reembolso integral.',
    FORCE_MAJEURE_NOT_PENDING: 'Esta declaração já foi analisada.',
    DEBT_ALREADY_SETTLED: 'Esta dívida já foi quitada.',
    UNAVAILABLE: 'Não foi possível concluir agora. Tente de novo.',
  },
};

export const adminFinanceEn: AdminFinanceTranslation = {
  title: 'Finance',
  tabsLabel: 'Finance queues',
  tabs: {
    claims: 'Claims',
    forceMajeure: 'Force majeure',
    debts: 'Debts',
  },
  loading: 'Loading…',
  loadMore: 'Load more',
  sending: 'Sending…',
  unknownSeller: 'Seller not identified',
  claims: {
    hint: 'Purchases with a problem reported by the buyer. The payout is held until the decision; with no decision in time, it is released.',
    empty: 'No claims to decide.',
    refundPending: 'Refund in progress',
    fallbackTitle: {
      ticket_order: 'Ticket order',
      booking: 'Booking',
    },
    decideBy: 'Decide by {{date}}',
    meta: 'Reported {{opened}} · paid {{paid}}',
    metaEnd: 'service ended {{date}}',
    decide: 'Decide',
    decideTitle: 'Decide claim',
    decideDescription:
      'The decision is final. The refund comes from the platform balance before the payout.',
    outcomeLabel: 'Decision',
    outcomeRequired: 'Choose the decision.',
    outcome: {
      release: 'Release the payout',
      refund_full: 'Full refund · {{amount}}',
      refund_partial: 'Partial refund',
    },
    outcomeHint: {
      release: 'The partner is paid as usual.',
      refund_full: 'Service fee included.',
      refund_partial: 'Up to {{max}}, without the service fee.',
    },
    partialLabel: 'Refund amount',
    partialInvalid: 'Enter an amount up to {{max}}.',
    penaltyLabel: '20% penalty for the partner',
    penaltyHint: 'Service that didn’t happen; 24 h to pay.',
    submit: 'Confirm decision',
    decided: {
      release: 'Payout released.',
      refund_full: 'Full refund requested from the payment method.',
      refund_partial: 'Partial refund requested from the payment method.',
    },
  },
  forceMajeure: {
    hint: 'Cancellation penalties with declared force majeure. While under review, the penalty is suspended.',
    empty: 'No declarations to review.',
    declaredAt: 'Declared on {{date}}',
    meta: 'Declared {{date}} · penalty of {{amount}}',
    openProof: 'Open proof',
    approve: 'Approve',
    reject: 'Reject',
    approveConfirm: 'Approve the force majeure? The penalty is waived.',
    rejectConfirm: 'Reject the force majeure? The penalty applies again, with 24 h to pay.',
    approved: 'Force majeure approved. Penalty waived.',
    rejected: 'Force majeure rejected. The penalty applies again.',
  },
  debts: {
    hint: 'Open debts of each CNPJ. Once overdue, the debt pauses the CNPJ’s sales and is deducted from payouts.',
    empty: 'No open debts.',
    dueOn: 'Due on {{date}}',
    overdueSince: 'Overdue since {{date}} · sales paused',
    waive: 'Waive debt',
    waiveShort: 'Waive',
    reason: {
      cancellation_penalty: 'Cancellation penalty',
      dispute_lost: 'Lost dispute',
      post_release_refund: 'Refund after payout',
    },
    waiveConfirm:
      'Waive {{amount}}? The debt is no longer charged and the CNPJ’s sales resume if no other is overdue.',
    waived: 'Debt waived.',
  },
  errors: {
    NOT_FOUND: 'Record not found. Refresh the list.',
    FORBIDDEN: 'Admin access only.',
    CLAIM_ALREADY_DECIDED: 'This claim was already decided.',
    CLAIM_REFUND_FAILED: 'The payment method declined the refund. Try again.',
    INVALID_REFUND_AMOUNT: 'Amount outside what can still go back to the buyer.',
    PENALTY_NOT_ALLOWED:
      'The penalty only applies to a service that didn’t happen, with a full refund.',
    FORCE_MAJEURE_NOT_PENDING: 'This declaration was already reviewed.',
    DEBT_ALREADY_SETTLED: 'This debt is already settled.',
    UNAVAILABLE: 'Couldn’t finish now. Try again.',
  },
};

export const adminFinanceFr: AdminFinanceTranslation = {
  title: 'Finances',
  tabsLabel: 'Files financières',
  tabs: {
    claims: 'Réclamations',
    forceMajeure: 'Force majeure',
    debts: 'Dettes',
  },
  loading: 'Chargement…',
  loadMore: 'Charger plus',
  sending: 'Envoi…',
  unknownSeller: 'Vendeur non identifié',
  claims: {
    hint: 'Achats avec un problème signalé par l’acheteur. Le versement est retenu jusqu’à la décision ; sans décision dans le délai, il est libéré.',
    empty: 'Aucune réclamation à traiter.',
    refundPending: 'Remboursement en cours',
    fallbackTitle: {
      ticket_order: 'Commande de billets',
      booking: 'Réservation',
    },
    decideBy: 'Décider avant le {{date}}',
    meta: 'Signalé le {{opened}} · payé {{paid}}',
    metaEnd: 'service terminé le {{date}}',
    decide: 'Décider',
    decideTitle: 'Traiter la réclamation',
    decideDescription:
      'La décision est définitive. Le remboursement est prélevé sur le solde de la plateforme avant le versement.',
    outcomeLabel: 'Décision',
    outcomeRequired: 'Choisissez la décision.',
    outcome: {
      release: 'Libérer le versement',
      refund_full: 'Remboursement intégral · {{amount}}',
      refund_partial: 'Remboursement partiel',
    },
    outcomeHint: {
      release: 'Le partenaire est payé normalement.',
      refund_full: 'Frais de service compris.',
      refund_partial: 'Jusqu’à {{max}}, sans les frais de service.',
    },
    partialLabel: 'Montant du remboursement',
    partialInvalid: 'Indiquez un montant jusqu’à {{max}}.',
    penaltyLabel: 'Pénalité de 20 % au partenaire',
    penaltyHint: 'Service qui n’a pas eu lieu ; 24 h pour payer.',
    submit: 'Confirmer la décision',
    decided: {
      release: 'Versement libéré.',
      refund_full: 'Remboursement intégral demandé au moyen de paiement.',
      refund_partial: 'Remboursement partiel demandé au moyen de paiement.',
    },
  },
  forceMajeure: {
    hint: 'Pénalités d’annulation avec force majeure déclarée. Pendant l’examen, la pénalité est suspendue.',
    empty: 'Aucune déclaration à examiner.',
    declaredAt: 'Déclarée le {{date}}',
    meta: 'Déclarée le {{date}} · pénalité de {{amount}}',
    openProof: 'Ouvrir le justificatif',
    approve: 'Approuver',
    reject: 'Refuser',
    approveConfirm: 'Approuver la force majeure ? La pénalité est annulée.',
    rejectConfirm:
      'Refuser la force majeure ? La pénalité s’applique à nouveau, avec 24 h pour payer.',
    approved: 'Force majeure approuvée. Pénalité annulée.',
    rejected: 'Force majeure refusée. La pénalité s’applique à nouveau.',
  },
  debts: {
    hint: 'Dettes ouvertes des CNPJ. Échue, la dette suspend les ventes du CNPJ et est déduite des versements.',
    empty: 'Aucune dette ouverte.',
    dueOn: 'Échéance le {{date}}',
    overdueSince: 'Échue depuis le {{date}} · ventes suspendues',
    waive: 'Annuler la dette',
    waiveShort: 'Annuler',
    reason: {
      cancellation_penalty: 'Pénalité d’annulation',
      dispute_lost: 'Litige perdu',
      post_release_refund: 'Remboursement après versement',
    },
    waiveConfirm:
      'Annuler {{amount}} ? La dette n’est plus réclamée et les ventes du CNPJ reprennent s’il n’y en a pas d’autre échue.',
    waived: 'Dette annulée.',
  },
  errors: {
    NOT_FOUND: 'Enregistrement introuvable. Actualisez la liste.',
    FORBIDDEN: 'Accès réservé à l’admin.',
    CLAIM_ALREADY_DECIDED: 'Cette réclamation a déjà été traitée.',
    CLAIM_REFUND_FAILED: 'Le moyen de paiement a refusé le remboursement. Réessayez.',
    INVALID_REFUND_AMOUNT: 'Montant hors de ce qui peut encore revenir à l’acheteur.',
    PENALTY_NOT_ALLOWED:
      'La pénalité ne s’applique qu’à un service qui n’a pas eu lieu, avec remboursement intégral.',
    FORCE_MAJEURE_NOT_PENDING: 'Cette déclaration a déjà été examinée.',
    DEBT_ALREADY_SETTLED: 'Cette dette est déjà réglée.',
    UNAVAILABLE: 'Impossible de terminer maintenant. Réessayez.',
  },
};
