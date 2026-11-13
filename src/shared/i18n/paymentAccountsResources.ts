/** Textos das contas de recebimento por CNPJ (D14). pt-BR é a fonte. */
export interface PaymentAccountsTranslation {
  title: string;
  subtitle: string;
  loading: string;
  empty: string;
  refresh: string;
  retry: string;
  missingKey: string;
  page: { title: string; intro: string; items_one: string; items_other: string };
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
  page: {
    title: 'Contas de recebimento',
    intro:
      'Cada CNPJ recebe numa conta própria. Cada item do catálogo recebe na conta do CNPJ do seu estabelecimento.',
    items_one: '{{count}} item',
    items_other: '{{count}} itens',
  },
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
