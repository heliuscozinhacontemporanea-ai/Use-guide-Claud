/** Textos das contas de recebimento por CNPJ (D14). pt-BR é a fonte. */
export interface PaymentAccountsTranslation {
  title: string;
  subtitle: string;
  loading: string;
  empty: string;
  refresh: string;
  retry: string;
  missingKey: string;
  listings_one: string;
  listings_other: string;
  requirements_one: string;
  requirements_other: string;
  status: {
    ready: string;
    pending: string;
    restricted: string;
    disabled: string;
    notStarted: string;
  };
  actions: {
    start: string;
    continue: string;
    manage: string;
    back: string;
  };
  tabs: {
    label: string;
    onboarding: string;
    balances: string;
    payouts: string;
    payments: string;
    account: string;
  };
  errors: {
    NOT_FOUND: string;
    FORBIDDEN: string;
    VALIDATION_ERROR: string;
    PAYMENT_ACCOUNT_UNAVAILABLE: string;
  };
}

export const paymentAccountsPtBR: PaymentAccountsTranslation = {
  title: 'Recebimentos',
  subtitle:
    'Cada CNPJ verificado recebe na própria conta. As vendas de um estabelecimento caem na conta do CNPJ dele.',
  loading: 'Carregando contas de recebimento…',
  empty:
    'Nenhum CNPJ verificado ainda. Verifique um estabelecimento com CNPJ para receber pagamentos.',
  refresh: 'Atualizar contas de recebimento',
  retry: 'Tentar de novo',
  missingKey:
    'Pagamentos indisponíveis no momento: a chave pública do Stripe não está configurada.',
  listings_one: '{{count}} cadastro vende por este CNPJ',
  listings_other: '{{count}} cadastros vendem por este CNPJ',
  requirements_one: '{{count}} pendência no Stripe',
  requirements_other: '{{count}} pendências no Stripe',
  status: {
    ready: 'Pronta para receber',
    pending: 'Cadastro incompleto',
    restricted: 'Em análise no Stripe',
    disabled: 'Desativada pelo Stripe',
    notStarted: 'Cadastro não iniciado',
  },
  actions: {
    start: 'Configurar recebimentos',
    continue: 'Continuar cadastro',
    manage: 'Gerenciar',
    back: 'Voltar para as contas',
  },
  tabs: {
    label: 'Seções da conta',
    onboarding: 'Cadastro',
    balances: 'Saldos',
    payouts: 'Repasses',
    payments: 'Pagamentos',
    account: 'Dados da conta',
  },
  errors: {
    NOT_FOUND: 'Este CNPJ não está verificado na sua conta.',
    FORBIDDEN: 'Esta conta de recebimento pertence a outro parceiro.',
    VALIDATION_ERROR: 'Conta inválida. Atualize a página e tente de novo.',
    PAYMENT_ACCOUNT_UNAVAILABLE:
      'Não foi possível falar com o Stripe agora. Tente de novo em instantes.',
  },
};

export const paymentAccountsEn: PaymentAccountsTranslation = {
  title: 'Payouts',
  subtitle:
    'Each verified CNPJ gets paid into its own account. Sales from a listing go to the account of its CNPJ.',
  loading: 'Loading payout accounts…',
  empty: 'No verified CNPJ yet. Verify a listing with a CNPJ to receive payments.',
  refresh: 'Refresh payout accounts',
  retry: 'Try again',
  missingKey: 'Payments are unavailable right now: the Stripe publishable key is not set.',
  listings_one: '{{count}} listing sells under this CNPJ',
  listings_other: '{{count}} listings sell under this CNPJ',
  requirements_one: '{{count}} pending item on Stripe',
  requirements_other: '{{count}} pending items on Stripe',
  status: {
    ready: 'Ready to receive',
    pending: 'Setup incomplete',
    restricted: 'Under review by Stripe',
    disabled: 'Disabled by Stripe',
    notStarted: 'Setup not started',
  },
  actions: {
    start: 'Set up payouts',
    continue: 'Continue setup',
    manage: 'Manage',
    back: 'Back to accounts',
  },
  tabs: {
    label: 'Account sections',
    onboarding: 'Setup',
    balances: 'Balances',
    payouts: 'Payouts',
    payments: 'Payments',
    account: 'Account details',
  },
  errors: {
    NOT_FOUND: 'This CNPJ is not verified on your account.',
    FORBIDDEN: 'This payout account belongs to another partner.',
    VALIDATION_ERROR: 'Invalid account. Refresh the page and try again.',
    PAYMENT_ACCOUNT_UNAVAILABLE: "We couldn't reach Stripe right now. Try again in a moment.",
  },
};

export const paymentAccountsFr: PaymentAccountsTranslation = {
  title: 'Versements',
  subtitle:
    "Chaque CNPJ vérifié est payé sur son propre compte. Les ventes d'un établissement vont sur le compte de son CNPJ.",
  loading: 'Chargement des comptes de versement…',
  empty:
    "Aucun CNPJ vérifié pour l'instant. Faites vérifier un établissement avec un CNPJ pour recevoir des paiements.",
  refresh: 'Actualiser les comptes de versement',
  retry: 'Réessayer',
  missingKey:
    "Paiements indisponibles pour le moment : la clé publique Stripe n'est pas configurée.",
  listings_one: '{{count}} fiche vend avec ce CNPJ',
  listings_other: '{{count}} fiches vendent avec ce CNPJ',
  requirements_one: '{{count}} élément en attente sur Stripe',
  requirements_other: '{{count}} éléments en attente sur Stripe',
  status: {
    ready: 'Prêt à recevoir',
    pending: 'Inscription incomplète',
    restricted: 'En cours de vérification par Stripe',
    disabled: 'Désactivé par Stripe',
    notStarted: 'Inscription non commencée',
  },
  actions: {
    start: 'Configurer les versements',
    continue: "Continuer l'inscription",
    manage: 'Gérer',
    back: 'Retour aux comptes',
  },
  tabs: {
    label: 'Sections du compte',
    onboarding: 'Inscription',
    balances: 'Soldes',
    payouts: 'Versements',
    payments: 'Paiements',
    account: 'Données du compte',
  },
  errors: {
    NOT_FOUND: "Ce CNPJ n'est pas vérifié sur votre compte.",
    FORBIDDEN: 'Ce compte de versement appartient à un autre partenaire.',
    VALIDATION_ERROR: 'Compte invalide. Actualisez la page et réessayez.',
    PAYMENT_ACCOUNT_UNAVAILABLE:
      "Impossible de joindre Stripe pour l'instant. Réessayez dans un instant.",
  },
};
