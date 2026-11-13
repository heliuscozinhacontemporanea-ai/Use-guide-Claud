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
