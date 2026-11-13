/** Textos do extrato e das dívidas do parceiro (D14, D16). pt-BR é a fonte. */
export interface ReceivablesTranslation {
  tabs: { label: string; accounts: string; statement: string; debts: string };
  blockedBanner: string;
  notice: { open: string };
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
      service_proof: string;
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
  notice: { open: 'Configurar recebimentos' },
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
      service_proof: 'Retido: aguardando o check-in ou a confirmação do comprador',
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
