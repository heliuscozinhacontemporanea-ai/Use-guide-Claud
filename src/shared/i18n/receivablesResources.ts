/** Textos do extrato e das dívidas do parceiro (D14, D16). pt-BR é a fonte. */
export interface ReceivablesTranslation {
  tabs: { label: string; accounts: string; statement: string; debts: string };
  blockedBanner: string;
  statement: {
    title: string;
    hint: string;
    filterLabel: string;
    allAccounts: string;
    loading: string;
    empty: string;
    loadMore: string;
    fallbackTicket: string;
    fallbackBooking: string;
    serviceEnd: string;
    gross: string;
    serviceFee: string;
    refunded: string;
    platformFee: string;
    offset: string;
    toReceive: string;
    received: string;
    releaseOn: string;
    releasedOn: string;
    status: {
      pending: string;
      claim: string;
      dispute: string;
      released: string;
      fully_refunded: string;
      dispute_lost: string;
    };
  };
  debts: {
    title: string;
    hint: string;
    loading: string;
    empty: string;
    reason: {
      cancellation_penalty: string;
      dispute_lost: string;
      post_release_refund: string;
    };
    status: {
      open: string;
      overdue: string;
      suspended: string;
      paid: string;
      waived: string;
      rejected: string;
    };
    amount: string;
    remaining: string;
    dueOn: string;
    overdueExplain: string;
    pay: string;
    declare: string;
  };
  payDialog: {
    title: string;
    description: string;
    loading: string;
    submit: string;
    sent: string;
  };
  forceMajeure: {
    title: string;
    description: string;
    reasonLabel: string;
    reasonHint: string;
    proofLabel: string;
    proofHint: string;
    proofPick: string;
    submit: string;
    sending: string;
    sent: string;
    reasonTooShort: string;
    proofRequired: string;
  };
  errors: Record<
    | 'NOT_FOUND'
    | 'DEBT_ALREADY_SETTLED'
    | 'DEBT_SUSPENDED'
    | 'FORCE_MAJEURE_ALREADY_DECLARED'
    | 'FORCE_MAJEURE_TOO_LATE'
    | 'FORCE_MAJEURE_NOT_ALLOWED'
    | 'INVALID_PROOF_FILE'
    | 'IMAGE_TOO_LARGE'
    | 'INVALID_DOCUMENT_FILE'
    | 'UNAVAILABLE',
    string
  >;
}

export const receivablesPtBR: ReceivablesTranslation = {
  tabs: {
    label: 'Seções de recebimentos',
    accounts: 'Contas',
    statement: 'Extrato',
    debts: 'Dívidas',
  },
  blockedBanner:
    'Vendas pausadas: um CNPJ seu tem dívida vencida. Pague em Dívidas para voltar a vender; enquanto isso, os repasses pendentes quitam a dívida.',
  statement: {
    title: 'Extrato por venda',
    hint: 'O valor de cada venda é repassado 48 h depois do fim do serviço, se não houver reclamação.',
    filterLabel: 'CNPJ',
    allAccounts: 'Todos os CNPJs',
    loading: 'Carregando extrato…',
    empty: 'Nenhuma venda ainda.',
    loadMore: 'Carregar mais',
    fallbackTicket: 'Ingressos',
    fallbackBooking: 'Reserva',
    serviceEnd: 'Fim do serviço: {{date}}',
    gross: 'Venda',
    serviceFee: 'Taxa de serviço (paga pelo comprador)',
    refunded: 'Reembolsado',
    platformFee: 'Taxa da plataforma',
    offset: 'Descontado de dívidas',
    toReceive: 'A receber',
    received: 'Repassado',
    releaseOn: 'Previsão: {{date}}',
    releasedOn: 'Repassado em {{date}}',
    status: {
      pending: 'Aguardando liberação',
      claim: 'Retido: reclamação em análise',
      dispute: 'Retido: contestação no cartão',
      released: 'Repassado',
      fully_refunded: 'Reembolsado ao comprador',
      dispute_lost: 'Contestação perdida',
    },
  },
  debts: {
    title: 'Dívidas com a plataforma',
    hint: 'Pague no cartão ou Pix em até 24 h. Depois disso, a dívida é descontada dos repasses e as vendas do CNPJ ficam pausadas até quitar.',
    loading: 'Carregando dívidas…',
    empty: 'Nenhuma dívida. Tudo em dia.',
    reason: {
      cancellation_penalty: 'Multa de cancelamento (20% do vendido)',
      dispute_lost: 'Contestação perdida sem prova de uso',
      post_release_refund: 'Reembolso depois do repasse',
    },
    status: {
      open: 'Em aberto',
      overdue: 'Vencida',
      suspended: 'Força maior em análise',
      paid: 'Paga',
      waived: 'Perdoada',
      rejected: 'Força maior recusada',
    },
    amount: 'Valor',
    remaining: 'Falta pagar',
    dueOn: 'Vence em {{date}}',
    overdueExplain: 'Vencida: as vendas deste CNPJ estão pausadas.',
    pay: 'Pagar',
    declare: 'Declarar força maior',
  },
  payDialog: {
    title: 'Pagar dívida',
    description: 'Cartão ou Pix. A dívida é quitada assim que o Stripe confirmar o pagamento.',
    loading: 'Preparando o pagamento…',
    submit: 'Pagar {{amount}}',
    sent: 'Pagamento enviado. A dívida é quitada assim que o Stripe confirmar.',
  },
  forceMajeure: {
    title: 'Declarar força maior',
    description:
      'Use quando o cancelamento foi causado por algo fora do seu controle (ex.: vento acima do limite, interdição pelas autoridades). Até a análise, a multa fica suspensa. Aprovada, a multa é perdoada; recusada, volta a valer com 24 h para pagar.',
    reasonLabel: 'O que aconteceu',
    reasonHint: 'De 10 a 500 caracteres. Só a equipe da plataforma lê.',
    proofLabel: 'Prova',
    proofHint: 'PDF ou foto (JPEG, PNG ou WebP), até 6 MB. Fica numa pasta privada.',
    proofPick: 'Escolher arquivo',
    submit: 'Enviar para análise',
    sending: 'Enviando…',
    sent: 'Recebemos sua declaração. A multa fica suspensa até a análise.',
    reasonTooShort: 'Descreva o que aconteceu em pelo menos 10 caracteres.',
    proofRequired: 'Anexe uma prova.',
  },
  errors: {
    NOT_FOUND: 'Dívida não encontrada.',
    DEBT_ALREADY_SETTLED: 'Esta dívida já foi quitada.',
    DEBT_SUSPENDED: 'Esta multa está suspensa enquanto a força maior é analisada.',
    FORCE_MAJEURE_ALREADY_DECLARED: 'A força maior desta multa já foi declarada.',
    FORCE_MAJEURE_TOO_LATE: 'A força maior precisa ser declarada antes do vencimento da multa.',
    FORCE_MAJEURE_NOT_ALLOWED: 'Força maior vale só para a multa de cancelamento.',
    INVALID_PROOF_FILE: 'Arquivo de prova inválido. Envie de novo.',
    IMAGE_TOO_LARGE: 'Arquivo acima de 6 MB.',
    INVALID_DOCUMENT_FILE: 'Envie um PDF ou uma foto JPEG, PNG ou WebP.',
    UNAVAILABLE: 'Não foi possível concluir agora. Tente de novo.',
  },
};

export const receivablesEn: ReceivablesTranslation = {
  tabs: { label: 'Payout sections', accounts: 'Accounts', statement: 'Statement', debts: 'Debts' },
  blockedBanner:
    'Sales paused: one of your CNPJs has an overdue debt. Pay it under Debts to sell again; meanwhile, pending payouts settle the debt.',
  statement: {
    title: 'Statement by sale',
    hint: 'Each sale is paid out 48 h after the service ends, unless there is a complaint.',
    filterLabel: 'CNPJ',
    allAccounts: 'All CNPJs',
    loading: 'Loading statement…',
    empty: 'No sales yet.',
    loadMore: 'Load more',
    fallbackTicket: 'Tickets',
    fallbackBooking: 'Booking',
    serviceEnd: 'Service ends: {{date}}',
    gross: 'Sale',
    serviceFee: 'Service fee (paid by the buyer)',
    refunded: 'Refunded',
    platformFee: 'Platform fee',
    offset: 'Deducted for debts',
    toReceive: 'To receive',
    received: 'Paid out',
    releaseOn: 'Expected: {{date}}',
    releasedOn: 'Paid out on {{date}}',
    status: {
      pending: 'Awaiting release',
      claim: 'On hold: complaint under review',
      dispute: 'On hold: card dispute',
      released: 'Paid out',
      fully_refunded: 'Refunded to the buyer',
      dispute_lost: 'Dispute lost',
    },
  },
  debts: {
    title: 'Debts with the platform',
    hint: 'Pay by card or Pix within 24 h. After that, the debt is deducted from payouts and the CNPJ’s sales are paused until it is settled.',
    loading: 'Loading debts…',
    empty: 'No debts. All settled.',
    reason: {
      cancellation_penalty: 'Cancellation penalty (20% of sales)',
      dispute_lost: 'Dispute lost without proof of use',
      post_release_refund: 'Refund after payout',
    },
    status: {
      open: 'Open',
      overdue: 'Overdue',
      suspended: 'Force majeure under review',
      paid: 'Paid',
      waived: 'Waived',
      rejected: 'Force majeure rejected',
    },
    amount: 'Amount',
    remaining: 'Left to pay',
    dueOn: 'Due on {{date}}',
    overdueExplain: 'Overdue: sales for this CNPJ are paused.',
    pay: 'Pay',
    declare: 'Declare force majeure',
  },
  payDialog: {
    title: 'Pay debt',
    description: 'Card or Pix. The debt is settled as soon as Stripe confirms the payment.',
    loading: 'Preparing payment…',
    submit: 'Pay {{amount}}',
    sent: 'Payment sent. The debt is settled as soon as Stripe confirms.',
  },
  forceMajeure: {
    title: 'Declare force majeure',
    description:
      'Use it when the cancellation was caused by something beyond your control (e.g. wind above the limit, closure by the authorities). Until the review, the penalty is suspended. If approved, the penalty is waived; if rejected, it applies again with 24 h to pay.',
    reasonLabel: 'What happened',
    reasonHint: '10 to 500 characters. Only the platform team reads it.',
    proofLabel: 'Proof',
    proofHint: 'PDF or photo (JPEG, PNG or WebP), up to 6 MB. Kept in a private folder.',
    proofPick: 'Choose file',
    submit: 'Send for review',
    sending: 'Sending…',
    sent: 'We received your declaration. The penalty is suspended until the review.',
    reasonTooShort: 'Describe what happened in at least 10 characters.',
    proofRequired: 'Attach a proof.',
  },
  errors: {
    NOT_FOUND: 'Debt not found.',
    DEBT_ALREADY_SETTLED: 'This debt has already been settled.',
    DEBT_SUSPENDED: 'This penalty is suspended while the force majeure is reviewed.',
    FORCE_MAJEURE_ALREADY_DECLARED: 'Force majeure has already been declared for this penalty.',
    FORCE_MAJEURE_TOO_LATE: 'Force majeure must be declared before the penalty is due.',
    FORCE_MAJEURE_NOT_ALLOWED: 'Force majeure only applies to the cancellation penalty.',
    INVALID_PROOF_FILE: 'Invalid proof file. Please upload it again.',
    IMAGE_TOO_LARGE: 'File larger than 6 MB.',
    INVALID_DOCUMENT_FILE: 'Upload a PDF or a JPEG, PNG or WebP photo.',
    UNAVAILABLE: 'Could not complete this now. Please try again.',
  },
};

export const receivablesFr: ReceivablesTranslation = {
  tabs: {
    label: 'Sections des versements',
    accounts: 'Comptes',
    statement: 'Relevé',
    debts: 'Dettes',
  },
  blockedBanner:
    'Ventes suspendues : l’un de vos CNPJ a une dette échue. Payez-la dans Dettes pour vendre à nouveau ; en attendant, les versements en attente règlent la dette.',
  statement: {
    title: 'Relevé par vente',
    hint: 'Chaque vente est versée 48 h après la fin du service, sauf réclamation.',
    filterLabel: 'CNPJ',
    allAccounts: 'Tous les CNPJ',
    loading: 'Chargement du relevé…',
    empty: 'Aucune vente pour l’instant.',
    loadMore: 'Charger plus',
    fallbackTicket: 'Billets',
    fallbackBooking: 'Réservation',
    serviceEnd: 'Fin du service : {{date}}',
    gross: 'Vente',
    serviceFee: 'Frais de service (payés par l’acheteur)',
    refunded: 'Remboursé',
    platformFee: 'Commission de la plateforme',
    offset: 'Déduit pour dettes',
    toReceive: 'À recevoir',
    received: 'Versé',
    releaseOn: 'Prévu : {{date}}',
    releasedOn: 'Versé le {{date}}',
    status: {
      pending: 'En attente de déblocage',
      claim: 'Retenu : réclamation en cours',
      dispute: 'Retenu : contestation de carte',
      released: 'Versé',
      fully_refunded: 'Remboursé à l’acheteur',
      dispute_lost: 'Contestation perdue',
    },
  },
  debts: {
    title: 'Dettes envers la plateforme',
    hint: 'Payez par carte ou Pix sous 24 h. Ensuite, la dette est déduite des versements et les ventes du CNPJ sont suspendues jusqu’au règlement.',
    loading: 'Chargement des dettes…',
    empty: 'Aucune dette. Tout est réglé.',
    reason: {
      cancellation_penalty: 'Pénalité d’annulation (20 % des ventes)',
      dispute_lost: 'Contestation perdue sans preuve d’utilisation',
      post_release_refund: 'Remboursement après versement',
    },
    status: {
      open: 'Ouverte',
      overdue: 'Échue',
      suspended: 'Force majeure en cours d’examen',
      paid: 'Payée',
      waived: 'Annulée',
      rejected: 'Force majeure refusée',
    },
    amount: 'Montant',
    remaining: 'Reste à payer',
    dueOn: 'Échéance le {{date}}',
    overdueExplain: 'Échue : les ventes de ce CNPJ sont suspendues.',
    pay: 'Payer',
    declare: 'Déclarer une force majeure',
  },
  payDialog: {
    title: 'Payer la dette',
    description: 'Carte ou Pix. La dette est réglée dès que Stripe confirme le paiement.',
    loading: 'Préparation du paiement…',
    submit: 'Payer {{amount}}',
    sent: 'Paiement envoyé. La dette est réglée dès que Stripe confirme.',
  },
  forceMajeure: {
    title: 'Déclarer une force majeure',
    description:
      'À utiliser quand l’annulation est due à un événement hors de votre contrôle (ex. : vent au-dessus de la limite, fermeture par les autorités). Jusqu’à l’examen, la pénalité est suspendue. Acceptée, la pénalité est annulée ; refusée, elle s’applique à nouveau avec 24 h pour payer.',
    reasonLabel: 'Ce qui s’est passé',
    reasonHint: 'De 10 à 500 caractères. Seule l’équipe de la plateforme le lit.',
    proofLabel: 'Preuve',
    proofHint: 'PDF ou photo (JPEG, PNG ou WebP), jusqu’à 6 Mo. Conservée dans un dossier privé.',
    proofPick: 'Choisir un fichier',
    submit: 'Envoyer pour examen',
    sending: 'Envoi…',
    sent: 'Nous avons reçu votre déclaration. La pénalité est suspendue jusqu’à l’examen.',
    reasonTooShort: 'Décrivez ce qui s’est passé en au moins 10 caractères.',
    proofRequired: 'Joignez une preuve.',
  },
  errors: {
    NOT_FOUND: 'Dette introuvable.',
    DEBT_ALREADY_SETTLED: 'Cette dette a déjà été réglée.',
    DEBT_SUSPENDED: 'Cette pénalité est suspendue pendant l’examen de la force majeure.',
    FORCE_MAJEURE_ALREADY_DECLARED: 'La force majeure a déjà été déclarée pour cette pénalité.',
    FORCE_MAJEURE_TOO_LATE: 'La force majeure doit être déclarée avant l’échéance de la pénalité.',
    FORCE_MAJEURE_NOT_ALLOWED: 'La force majeure ne vaut que pour la pénalité d’annulation.',
    INVALID_PROOF_FILE: 'Fichier de preuve invalide. Renvoyez-le.',
    IMAGE_TOO_LARGE: 'Fichier de plus de 6 Mo.',
    INVALID_DOCUMENT_FILE: 'Envoyez un PDF ou une photo JPEG, PNG ou WebP.',
    UNAVAILABLE: 'Impossible de terminer maintenant. Réessayez.',
  },
};
