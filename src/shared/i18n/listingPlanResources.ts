/** Textos do plano "Use Guide Verificado" por estabelecimento (D11). pt-BR é a fonte. */
export interface ListingPlanTranslation {
  chip: {
    active: string;
    trial: string;
    admin: string;
    suspended: string;
    pendingSeal: string;
    none: string;
  };
  planNames: {
    trial: string;
    monthly: string;
    'semi-annual': string;
    annual: string;
    admin: string;
  };
  dialog: {
    title: string;
    close: string;
    loading: string;
    retry: string;
  };
  status: {
    activeUntil: string;
    adminGranted: string;
    none: string;
    sealOn: string;
    sealPendingVerification: string;
    sealSuspended: string;
  };
  benefits: {
    title: string;
    seal: string;
    metrics: string;
    featured: string;
    reviews: string;
  };
  verificationRequired: string;
  verifyAction: string;
  options: {
    title: string;
    trialName: string;
    trialHint: string;
    free: string;
    perMonth: string;
    empty: string;
  };
  actions: {
    activateTrial: string;
    continue: string;
    processing: string;
  };
  trialActivated: string;
  checkoutName: string;
  admin: {
    grant: string;
    revoke: string;
    grantLabel: string;
    revokeLabel: string;
    confirmGrant: string;
    confirmRevoke: string;
    granted: string;
    grantedPendingVerification: string;
    revoked: string;
    noPlan: string;
  };
  errors: {
    VALIDATION_ERROR: string;
    FORBIDDEN: string;
    NOT_FOUND: string;
    LISTING_PENDING_VERIFICATION: string;
    TRIAL_ALREADY_USED: string;
    PLAN_ALREADY_ACTIVE: string;
    PARTNER_SUSPENDED: string;
    INTERNAL_ERROR: string;
  };
}

export const listingPlanPtBR: ListingPlanTranslation = {
  chip: {
    active: 'Selo até {{date}}',
    trial: 'Teste grátis até {{date}}',
    admin: 'Selo da equipe',
    suspended: 'Selo suspenso',
    pendingSeal: 'Plano ativo, selo após a verificação',
    none: 'Ativar selo',
  },
  planNames: {
    trial: 'Teste grátis',
    monthly: 'Mensal',
    'semi-annual': 'Semestral',
    annual: 'Anual',
    admin: 'Concedido pela equipe',
  },
  dialog: {
    title: 'Use Guide Verificado',
    close: 'Fechar',
    loading: 'Carregando o plano…',
    retry: 'Tentar de novo',
  },
  status: {
    activeUntil: 'Plano {{plan}} em vigor até {{date}}.',
    adminGranted: 'Selo concedido pela equipe Use Guide.',
    none: 'Este estabelecimento ainda não tem plano.',
    sealOn: 'O selo aparece no estabelecimento e nos eventos dele.',
    sealPendingVerification:
      'O selo aparece depois que a equipe aprovar a verificação do estabelecimento.',
    sealSuspended: 'O selo foi retirado pela equipe Use Guide. O plano continua em vigor.',
  },
  benefits: {
    title: 'O plano inclui',
    seal: 'Selo "Use Guide Verificado" no estabelecimento e nos eventos dele',
    metrics: 'Métricas de visualizações e cliques',
    featured: 'Rodízio diário nas vagas "Destaque" do topo da lista',
    reviews: 'Avaliações e respostas continuam liberadas, com ou sem plano',
  },
  verificationRequired:
    'Para ativar um plano, envie a verificação deste estabelecimento e aguarde a aprovação da equipe.',
  verifyAction: 'Verificar estabelecimento',
  options: {
    title: 'Escolha o período',
    trialName: 'Teste grátis de 7 dias',
    trialHint: 'Uma vez por conta, no estabelecimento que você escolher.',
    free: 'Grátis',
    perMonth: '{{amount}}/mês',
    empty: 'Nenhum plano disponível no momento.',
  },
  actions: {
    activateTrial: 'Ativar 7 dias grátis',
    continue: 'Seguir para o pagamento',
    processing: 'Processando…',
  },
  trialActivated: 'Teste grátis ativado até {{date}}.',
  checkoutName: 'Use Guide Verificado · {{plan}} · {{name}}',
  admin: {
    grant: 'Conceder selo',
    revoke: 'Retirar selo',
    grantLabel: 'Conceder selo a {{name}}',
    revokeLabel: 'Retirar selo de {{name}}',
    confirmGrant: 'Conceder o selo a {{name}}? Um plano pago em vigor não é alterado.',
    confirmRevoke:
      'Retirar o selo de {{name}}? Um plano pago em vigor é mantido; só o selo deixa de aparecer.',
    granted: 'Selo concedido.',
    grantedPendingVerification:
      'Selo concedido. Ele aparece quando a verificação do estabelecimento for aprovada.',
    revoked: 'Selo retirado.',
    noPlan: 'Sem plano',
  },
  errors: {
    VALIDATION_ERROR: 'Dados inválidos. Revise e tente novamente.',
    FORBIDDEN: 'Este estabelecimento não é da sua conta.',
    NOT_FOUND: 'Estabelecimento não encontrado.',
    LISTING_PENDING_VERIFICATION:
      'O estabelecimento precisa ser verificado pela equipe antes do plano.',
    TRIAL_ALREADY_USED: 'O teste grátis já foi usado nesta conta.',
    PLAN_ALREADY_ACTIVE: 'Este estabelecimento já tem um plano em vigor.',
    PARTNER_SUSPENDED: 'Sua conta está suspensa.',
    INTERNAL_ERROR: 'Não foi possível concluir agora. Tente novamente em instantes.',
  },
};
