/** Textos do plano "Use Guide Verificado" por estabelecimento (D11). pt-BR é a fonte. */
export interface ListingPlanTranslation {
  chip: {
    active: string;
    trial: string;
    admin: string;
    suspended: string;
    pendingSeal: string;
    none: string;
    label: string;
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
    label: 'Plano de {{name}}: {{status}}',
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

export const listingPlanEn: ListingPlanTranslation = {
  chip: {
    active: 'Badge until {{date}}',
    trial: 'Free trial until {{date}}',
    admin: 'Team badge',
    suspended: 'Badge suspended',
    pendingSeal: 'Plan active, badge after verification',
    none: 'Get the badge',
    label: 'Plan for {{name}}: {{status}}',
  },
  planNames: {
    trial: 'Free trial',
    monthly: 'Monthly',
    'semi-annual': 'Six-month',
    annual: 'Annual',
    admin: 'Granted by the team',
  },
  dialog: {
    title: 'Use Guide Verified',
    close: 'Close',
    loading: 'Loading the plan…',
    retry: 'Try again',
  },
  status: {
    activeUntil: '{{plan}} plan active until {{date}}.',
    adminGranted: 'Badge granted by the Use Guide team.',
    none: 'This business has no plan yet.',
    sealOn: 'The badge shows on the business and on its events.',
    sealPendingVerification: 'The badge shows once the team approves the business verification.',
    sealSuspended: 'The Use Guide team removed the badge. The plan is still active.',
  },
  benefits: {
    title: 'The plan includes',
    seal: '"Use Guide Verified" badge on the business and on its events',
    metrics: 'View and click metrics',
    featured: 'Daily rotation in the "Featured" spots at the top of the list',
    reviews: 'Reviews and replies stay available, with or without a plan',
  },
  verificationRequired:
    'To start a plan, submit this business for verification and wait for the team to approve it.',
  verifyAction: 'Verify business',
  options: {
    title: 'Choose the period',
    trialName: '7-day free trial',
    trialHint: 'Once per account, on the business you choose.',
    free: 'Free',
    perMonth: '{{amount}}/month',
    empty: 'No plans available right now.',
  },
  actions: {
    activateTrial: 'Start 7 free days',
    continue: 'Continue to payment',
    processing: 'Processing…',
  },
  trialActivated: 'Free trial active until {{date}}.',
  checkoutName: 'Use Guide Verified · {{plan}} · {{name}}',
  errors: {
    VALIDATION_ERROR: 'Invalid data. Please review and try again.',
    FORBIDDEN: 'This business does not belong to your account.',
    NOT_FOUND: 'Business not found.',
    LISTING_PENDING_VERIFICATION: 'The team must verify the business before a plan.',
    TRIAL_ALREADY_USED: 'This account has already used the free trial.',
    PLAN_ALREADY_ACTIVE: 'This business already has an active plan.',
    PARTNER_SUSPENDED: 'Your account is suspended.',
    INTERNAL_ERROR: 'Something went wrong. Please try again shortly.',
  },
};

export const listingPlanFr: ListingPlanTranslation = {
  chip: {
    active: "Badge jusqu'au {{date}}",
    trial: "Essai gratuit jusqu'au {{date}}",
    admin: "Badge de l'équipe",
    suspended: 'Badge suspendu',
    pendingSeal: 'Offre active, badge après la vérification',
    none: 'Obtenir le badge',
    label: 'Offre de {{name}} : {{status}}',
  },
  planNames: {
    trial: 'Essai gratuit',
    monthly: 'Mensuel',
    'semi-annual': 'Semestriel',
    annual: 'Annuel',
    admin: "Accordé par l'équipe",
  },
  dialog: {
    title: 'Use Guide Vérifié',
    close: 'Fermer',
    loading: "Chargement de l'offre…",
    retry: 'Réessayer',
  },
  status: {
    activeUntil: "Offre {{plan}} active jusqu'au {{date}}.",
    adminGranted: "Badge accordé par l'équipe Use Guide.",
    none: "Cet établissement n'a pas encore d'offre.",
    sealOn: "Le badge s'affiche sur l'établissement et sur ses événements.",
    sealPendingVerification:
      "Le badge s'affiche une fois la vérification de l'établissement approuvée par l'équipe.",
    sealSuspended: "L'équipe Use Guide a retiré le badge. L'offre reste active.",
  },
  benefits: {
    title: "L'offre comprend",
    seal: "Badge « Use Guide Vérifié » sur l'établissement et sur ses événements",
    metrics: 'Statistiques de vues et de clics',
    featured: 'Rotation quotidienne dans les places « À la une » en haut de la liste',
    reviews: 'Les avis et les réponses restent disponibles, avec ou sans offre',
  },
  verificationRequired:
    "Pour activer une offre, envoyez la vérification de cet établissement et attendez l'approbation de l'équipe.",
  verifyAction: "Vérifier l'établissement",
  options: {
    title: 'Choisissez la période',
    trialName: 'Essai gratuit de 7 jours',
    trialHint: "Une fois par compte, sur l'établissement de votre choix.",
    free: 'Gratuit',
    perMonth: '{{amount}}/mois',
    empty: 'Aucune offre disponible pour le moment.',
  },
  actions: {
    activateTrial: 'Activer 7 jours gratuits',
    continue: 'Passer au paiement',
    processing: 'Traitement…',
  },
  trialActivated: "Essai gratuit actif jusqu'au {{date}}.",
  checkoutName: 'Use Guide Vérifié · {{plan}} · {{name}}',
  errors: {
    VALIDATION_ERROR: 'Données invalides. Vérifiez et réessayez.',
    FORBIDDEN: "Cet établissement n'appartient pas à votre compte.",
    NOT_FOUND: 'Établissement introuvable.',
    LISTING_PENDING_VERIFICATION: "L'équipe doit vérifier l'établissement avant l'offre.",
    TRIAL_ALREADY_USED: "L'essai gratuit a déjà été utilisé sur ce compte.",
    PLAN_ALREADY_ACTIVE: 'Cet établissement a déjà une offre active.',
    PARTNER_SUSPENDED: 'Votre compte est suspendu.',
    INTERNAL_ERROR: 'Impossible de terminer pour le moment. Réessayez dans un instant.',
  },
};
