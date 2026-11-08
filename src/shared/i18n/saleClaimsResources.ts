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

export const saleClaimsEn: SaleClaimsTranslation = {
  action: 'Report a problem',
  actionShort: 'Report',
  prompt: 'Something went wrong? Until {{date}}',
  dialog: {
    title: 'Report a problem',
    description:
      'Tell us what happened. The organizer’s payment is held until we review it, within 5 days.',
    reasonLabel: 'What happened?',
    reasonRequired: 'Choose what happened.',
    detailsLabel: 'Details (optional)',
    detailsHint: 'Up to {{max}} characters. Don’t include documents or card details.',
    submit: 'Send report',
    sending: 'Sending…',
  },
  reason: {
    did_not_happen: 'It didn’t happen',
    not_as_described: 'Not as described',
    changed_without_notice: 'Changed without notice',
    safety_issue: 'Safety issue',
    other: 'Other reason',
  },
  line: {
    open: 'Problem under review · reply by {{date}}',
    refund_pending: 'Refund in progress',
    refunded: 'Refunded {{amount}}',
    released: 'Review completed, no refund',
    expired: 'Review closed, no refund',
  },
  errors: {
    NOT_FOUND: 'Purchase not found.',
    CLAIM_NOT_ALLOWED: 'This purchase has no amount to claim.',
    CLAIM_TOO_EARLY: 'Before it starts, cancel the purchase instead.',
    CLAIM_WINDOW_CLOSED: 'Problems had to be reported within 48 h after the end.',
    CLAIM_ALREADY_EXISTS: 'You already reported a problem with this purchase.',
    UNAVAILABLE: 'Couldn’t send it now. Try again.',
  },
};

export const saleClaimsFr: SaleClaimsTranslation = {
  action: 'Signaler un problème',
  actionShort: 'Signaler',
  prompt: 'Un souci ? Jusqu’au {{date}}',
  dialog: {
    title: 'Signaler un problème',
    description:
      'Dites-nous ce qui s’est passé. Le paiement de l’organisateur est retenu jusqu’à notre examen, sous 5 jours.',
    reasonLabel: 'Que s’est-il passé ?',
    reasonRequired: 'Choisissez ce qui s’est passé.',
    detailsLabel: 'Détails (facultatif)',
    detailsHint: 'Jusqu’à {{max}} caractères. N’indiquez ni documents ni données de carte.',
    submit: 'Envoyer le signalement',
    sending: 'Envoi…',
  },
  reason: {
    did_not_happen: 'Cela n’a pas eu lieu',
    not_as_described: 'Différent de l’annonce',
    changed_without_notice: 'Modifié sans prévenir',
    safety_issue: 'Problème de sécurité',
    other: 'Autre motif',
  },
  line: {
    open: 'Problème en cours d’examen · réponse avant le {{date}}',
    refund_pending: 'Remboursement en cours',
    refunded: 'Remboursé {{amount}}',
    released: 'Examen terminé, sans remboursement',
    expired: 'Examen clos, sans remboursement',
  },
  errors: {
    NOT_FOUND: 'Achat introuvable.',
    CLAIM_NOT_ALLOWED: 'Cet achat n’a aucun montant à réclamer.',
    CLAIM_TOO_EARLY: 'Avant le début, annulez plutôt l’achat.',
    CLAIM_WINDOW_CLOSED: 'Le signalement devait être fait dans les 48 h après la fin.',
    CLAIM_ALREADY_EXISTS: 'Vous avez déjà signalé un problème pour cet achat.',
    UNAVAILABLE: 'Envoi impossible pour le moment. Réessayez.',
  },
};
