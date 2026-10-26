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
    open: string;
    refundPending: string;
    refundPendingHint: string;
    fallbackTitle: {
      ticket_order: string;
      booking: string;
    };
    paid: string;
    refundable: string;
    serviceEnd: string;
    openedAt: string;
    decideBy: string;
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
    open: 'Para decidir',
    refundPending: 'Reembolso em andamento',
    refundPendingHint: 'O meio de pagamento ainda está processando o reembolso.',
    fallbackTitle: {
      ticket_order: 'Pedido de ingresso',
      booking: 'Reserva',
    },
    paid: 'Pago pelo comprador',
    refundable: 'Ainda pode voltar',
    serviceEnd: 'Fim do serviço',
    openedAt: 'Relatado em',
    decideBy: 'Decidir até {{date}}',
    decide: 'Decidir',
    decideTitle: 'Decidir reclamação',
    decideDescription:
      'A decisão é final. O reembolso sai do saldo da plataforma antes do repasse.',
    outcomeLabel: 'Decisão',
    outcomeRequired: 'Escolha a decisão.',
    outcome: {
      release: 'Liberar o repasse',
      refund_full: 'Reembolso integral ({{amount}})',
      refund_partial: 'Reembolso parcial',
    },
    outcomeHint: {
      release: 'O problema não procede. O parceiro recebe normalmente.',
      refund_full: 'Devolve tudo o que resta, inclusive a taxa de serviço.',
      refund_partial: 'Até {{max}}, sem a taxa de serviço. Sai do valor do parceiro.',
    },
    partialLabel: 'Valor do reembolso',
    partialInvalid: 'Informe um valor de até {{max}}.',
    penaltyLabel: 'Cobrar multa de 20% do parceiro',
    penaltyHint:
      'O serviço não aconteceu: vale como cancelamento pelo proprietário, com 24 h para pagar.',
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
    overdueSince: 'Vencida desde {{date}}. Vendas do CNPJ pausadas.',
    waive: 'Perdoar dívida',
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
    open: 'To decide',
    refundPending: 'Refund in progress',
    refundPendingHint: 'The payment method is still processing the refund.',
    fallbackTitle: {
      ticket_order: 'Ticket order',
      booking: 'Booking',
    },
    paid: 'Paid by the buyer',
    refundable: 'Still refundable',
    serviceEnd: 'Service end',
    openedAt: 'Reported on',
    decideBy: 'Decide by {{date}}',
    decide: 'Decide',
    decideTitle: 'Decide claim',
    decideDescription:
      'The decision is final. The refund comes from the platform balance before the payout.',
    outcomeLabel: 'Decision',
    outcomeRequired: 'Choose the decision.',
    outcome: {
      release: 'Release the payout',
      refund_full: 'Full refund ({{amount}})',
      refund_partial: 'Partial refund',
    },
    outcomeHint: {
      release: 'The problem is not upheld. The partner is paid as usual.',
      refund_full: 'Returns everything left, service fee included.',
      refund_partial: 'Up to {{max}}, without the service fee. Comes from the partner’s amount.',
    },
    partialLabel: 'Refund amount',
    partialInvalid: 'Enter an amount up to {{max}}.',
    penaltyLabel: 'Charge the partner a 20% penalty',
    penaltyHint:
      'The service didn’t happen: it counts as a cancellation by the owner, with 24 h to pay.',
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
    overdueSince: 'Overdue since {{date}}. The CNPJ’s sales are paused.',
    waive: 'Waive debt',
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
    open: 'À traiter',
    refundPending: 'Remboursement en cours',
    refundPendingHint: 'Le moyen de paiement traite encore le remboursement.',
    fallbackTitle: {
      ticket_order: 'Commande de billets',
      booking: 'Réservation',
    },
    paid: 'Payé par l’acheteur',
    refundable: 'Encore remboursable',
    serviceEnd: 'Fin du service',
    openedAt: 'Signalé le',
    decideBy: 'Décider avant le {{date}}',
    decide: 'Décider',
    decideTitle: 'Traiter la réclamation',
    decideDescription:
      'La décision est définitive. Le remboursement est prélevé sur le solde de la plateforme avant le versement.',
    outcomeLabel: 'Décision',
    outcomeRequired: 'Choisissez la décision.',
    outcome: {
      release: 'Libérer le versement',
      refund_full: 'Remboursement intégral ({{amount}})',
      refund_partial: 'Remboursement partiel',
    },
    outcomeHint: {
      release: 'Le problème n’est pas retenu. Le partenaire est payé normalement.',
      refund_full: 'Rembourse tout ce qui reste, frais de service compris.',
      refund_partial:
        'Jusqu’à {{max}}, sans les frais de service. Prélevé sur le montant du partenaire.',
    },
    partialLabel: 'Montant du remboursement',
    partialInvalid: 'Indiquez un montant jusqu’à {{max}}.',
    penaltyLabel: 'Facturer une pénalité de 20 % au partenaire',
    penaltyHint:
      'Le service n’a pas eu lieu : cela compte comme une annulation par le propriétaire, avec 24 h pour payer.',
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
    overdueSince: 'Échue depuis le {{date}}. Ventes du CNPJ suspendues.',
    waive: 'Annuler la dette',
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
