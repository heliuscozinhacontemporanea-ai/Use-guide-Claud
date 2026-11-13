/** Textos de "Relatar problema" do comprador (D16, 2A). pt-BR é a fonte. */
type ClaimReasons = {
  did_not_happen: string;
  not_as_described: string;
  changed_without_notice: string;
  safety_issue: string;
  other: string;
};
type ClaimStatuses = {
  open: string;
  refund_pending: string;
  refunded: string;
  released: string;
  expired: string;
};

export interface SaleClaimsTranslation {
  action: string;
  actionShort: string;
  prompt: string;
  dialog: {
    title: string;
    description: string;
    reasonLabel: string;
    reasonRequired: string;
    detailsLabel: string;
    detailsHint: string;
    submit: string;
    sending: string;
  };
  reason: ClaimReasons;
  line: ClaimStatuses;
  errors: {
    NOT_FOUND: string;
    CLAIM_NOT_ALLOWED: string;
    CLAIM_TOO_EARLY: string;
    CLAIM_WINDOW_CLOSED: string;
    CLAIM_ALREADY_EXISTS: string;
    UNAVAILABLE: string;
  };
}

export const saleClaimsPtBR: SaleClaimsTranslation = {
  action: 'Relatar problema',
  actionShort: 'Relatar',
  prompt: 'Algo deu errado? Até {{date}}',
  dialog: {
    title: 'Relatar problema',
    description:
      'Conte o que aconteceu. O pagamento ao organizador fica retido até a nossa análise, em até 5 dias.',
    reasonLabel: 'O que aconteceu?',
    reasonRequired: 'Escolha o que aconteceu.',
    detailsLabel: 'Detalhes (opcional)',
    detailsHint: 'Até {{max}} caracteres. Não inclua documentos nem dados de cartão.',
    submit: 'Enviar relato',
    sending: 'Enviando…',
  },
  reason: {
    did_not_happen: 'Não aconteceu',
    not_as_described: 'Diferente do anunciado',
    changed_without_notice: 'Mudou sem aviso',
    safety_issue: 'Problema de segurança',
    other: 'Outro motivo',
  },
  line: {
    open: 'Problema em análise · resposta até {{date}}',
    refund_pending: 'Reembolso em andamento',
    refunded: 'Reembolsado {{amount}}',
    released: 'Análise concluída, sem reembolso',
    expired: 'Análise encerrada, sem reembolso',
  },
  errors: {
    NOT_FOUND: 'Compra não encontrada.',
    CLAIM_NOT_ALLOWED: 'Esta compra não tem valor a reclamar.',
    CLAIM_TOO_EARLY: 'Antes do início, use o cancelamento da compra.',
    CLAIM_WINDOW_CLOSED: 'O prazo para relatar um problema era de 48 h depois do fim.',
    CLAIM_ALREADY_EXISTS: 'Você já relatou um problema nesta compra.',
    UNAVAILABLE: 'Não foi possível enviar agora. Tente de novo.',
  },
};
