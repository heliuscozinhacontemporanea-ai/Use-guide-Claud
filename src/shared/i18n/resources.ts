import {
  type BookingsTranslation,
  bookingsEn,
  bookingsFr,
  bookingsPtBR,
} from './bookingsResources';
import {
  type InsightsTranslation,
  insightsEn,
  insightsFr,
  insightsPtBR,
} from './insightsResources';
import {
  type ListingPlanTranslation,
  listingPlanEn,
  listingPlanFr,
  listingPlanPtBR,
} from './listingPlanResources';
import {
  type PaymentAccountsTranslation,
  paymentAccountsEn,
  paymentAccountsFr,
  paymentAccountsPtBR,
} from './paymentAccountsResources';
import {
  type ReceivablesTranslation,
  receivablesEn,
  receivablesFr,
  receivablesPtBR,
} from './receivablesResources';
import {
  type AdminFinanceTranslation,
  adminFinanceEn,
  adminFinanceFr,
  adminFinancePtBR,
} from './adminFinanceResources';
import {
  saleClaimsEn,
  saleClaimsFr,
  saleClaimsPtBR,
  type SaleClaimsTranslation,
} from './saleClaimsResources';
import {
  type PurchasesTranslation,
  purchasesEn,
  purchasesFr,
  purchasesPtBR,
} from './purchasesResources';
import {
  type MyReviewsTranslation,
  myReviewsEn,
  myReviewsFr,
  myReviewsPtBR,
  type ProfileTranslation,
  profileEn,
  profileFr,
  profilePtBR,
} from './profileResources';
import {
  type ReviewReportsTranslation,
  reviewReportsEn,
  reviewReportsFr,
  reviewReportsPtBR,
} from './reviewReportsResources';
import {
  type AdminPanelTranslation,
  adminPanelEn,
  adminPanelFr,
  adminPanelPtBR,
} from './adminPanelResources';
import {
  type ServiceProofTranslation,
  serviceProofEn,
  serviceProofFr,
  serviceProofPtBR,
} from './serviceProofResources';
import {
  type TicketSessionsTranslation,
  ticketSessionsEn,
  ticketSessionsFr,
  ticketSessionsPtBR,
} from './ticketSessionsResources';
import {
  type PartnersTranslation,
  partnersEn,
  partnersFr,
  partnersPtBR,
} from './partnersResources';
import {
  type SalesPolicyTranslation,
  salesPolicyEn,
  salesPolicyFr,
  salesPolicyPtBR,
} from './salesPolicyResources';
import {
  type TicketCheckoutTranslation,
  ticketCheckoutEn,
  ticketCheckoutFr,
  ticketCheckoutPtBR,
} from './ticketCheckoutResources';
import {
  type TicketWalletTranslation,
  ticketWalletEn,
  ticketWalletFr,
  ticketWalletPtBR,
} from './ticketWalletResources';
import {
  type TicketGateTranslation,
  ticketGateEn,
  ticketGateFr,
  ticketGatePtBR,
} from './ticketGateResources';
import {
  type UsernameTranslation,
  usernameEn,
  usernameFr,
  usernamePtBR,
} from './usernameResources';
import {
  type EventSessionsTranslation,
  eventSessionsEn,
  eventSessionsFr,
  eventSessionsPtBR,
} from './eventSessionsResources';
import { type LegalTranslation, legalEn, legalFr, legalPtBR } from './legalResources';
import {
  type VerificationTranslation,
  verificationEn,
  verificationFr,
  verificationPtBR,
} from './verificationResources';

export interface TranslationResource {
  bookings: BookingsTranslation;
  insights: InsightsTranslation;
  listingPlan: ListingPlanTranslation;
  partners: PartnersTranslation;
  paymentAccounts: PaymentAccountsTranslation;
  receivables: ReceivablesTranslation;
  saleClaims: SaleClaimsTranslation;
  purchases: PurchasesTranslation;
  profile: ProfileTranslation;
  myReviews: MyReviewsTranslation;
  reviewReports: ReviewReportsTranslation;
  adminPanel: AdminPanelTranslation;
  serviceProof: ServiceProofTranslation;
  adminFinance: AdminFinanceTranslation;
  ticketSessions: TicketSessionsTranslation;
  salesPolicy: SalesPolicyTranslation;
  ticketCheckout: TicketCheckoutTranslation;
  ticketWallet: TicketWalletTranslation;
  ticketGate: TicketGateTranslation;
  username: UsernameTranslation;
  eventSessions: EventSessionsTranslation;
  legal: LegalTranslation;
  verification: VerificationTranslation;
  common: {
    language: string;
    cancel: string;
    confirm: string;
    close: string;
    retry: string;
    /** Selo "Use Guide Verificado" explicado ao toque (D11). */
    seal: {
      label: string;
      title: string;
      explanation: string;
    };
    /** Vaga paga identificada como tal (D11, CDC art. 36). */
    featured: string;
    locales: {
      ptBR: string;
      en: string;
      fr: string;
    };
  };
  header: {
    openMenu: string;
    closeMenu: string;
    profileAlt: string;
    openSearch: string;
    managementPanel: string;
    myPanel: string;
    openManagementPanel: string;
    openMyPanel: string;
    pageTitles: {
      events: string;
      tours: string;
      transfers: string;
      rentals: string;
      accommodations: string;
      restaurants: string;
      attractions: string;
      practicalGuide: string;
    };
  };
  menu: {
    closeMenu: string;
    changeProfilePhoto: string;
    userFallback: string;
    signInOrRegister: string;
    emailPassword: string;
    orUse: string;
    continueGoogle: string;
    managementPanel: string;
    myPanel: string;
    authErrors: { popupBlocked: string; unauthorizedDomain: string; generic: string };
  };
  navigation: {
    explore: string;
    events: string;
    tours: string;
    transfers: string;
    rentals: string;
    accommodations: string;
    restaurants: string;
    attractions: string;
    tips: string;
  };
  errors: {
    appCheck: { APP_CHECK_REQUIRED: string; APP_CHECK_INVALID: string };
    media: {
      IMAGE_TOO_LARGE: string;
      INVALID_IMAGE: string;
      UPLOAD_FAILED: string;
      STORAGE_UNAVAILABLE: string;
    };
    payment: {
      SUBSCRIPTION_ALREADY_ACTIVE: string;
      SUBSCRIPTION_NOT_FOUND: string;
      PLAN_INACTIVE: string;
      VALIDATION_ERROR: string;
      FORBIDDEN: string;
      BILLING_UNAVAILABLE: string;
      PAYMENT_FAILED: string;
      NOT_FOUND: string;
      LISTING_PENDING_VERIFICATION: string;
      PLAN_ALREADY_ACTIVE: string;
      PARTNER_SUSPENDED: string;
      SUBSCRIPTION_PAST_DUE: string;
    };
  };
  payment: {
    checkout: {
      title: string;
      close: string;
      totalLabel: string;
      retry: string;
      preparing: string;
      processingTitle: string;
      processingDescription: string;
      secureFooter: string;
      methodLegend: string;
      methodSubscription: string;
      methodSubscriptionHint: string;
      methodOneTime: string;
      methodOneTimeHint: string;
      continue: string;
      subscribeButton: string;
      payButton: string;
      trialNotice: string;
      activatingTitle: string;
      activatingDescription: string;
      activationDelayed: string;
      successTitle: string;
      successDescription: string;
    };
    period: {
      monthly: string;
      'semi-annual': string;
      annual: string;
    };
    element: {
      unavailable: string;
      processing: string;
      payNow: string;
      saveCard: string;
      paymentFailed: string;
      confirmFailed: string;
    };
    subscription: {
      title: string;
      loading: string;
      statusActive: string;
      statusTrialing: string;
      statusCancelScheduled: string;
      statusPastDue: string;
      statusCanceled: string;
      statusIncomplete: string;
      manageCard: string;
      cancelRenewal: string;
      resumeRenewal: string;
      confirmCancel: string;
      actionFailed: string;
      loadFailed: string;
      retry: string;
      changePeriod: string;
      changeTitle: string;
      changeHint: string;
      changeConfirm: string;
      changeBack: string;
      currentPeriod: string;
      pendingChange: string;
      keepCurrent: string;
    };
  };
  seo: {
    routes: {
      explore: { title: string; description: string };
      events: { title: string; description: string };
      tours: { title: string; description: string };
      transfers: { title: string; description: string };
      rentals: { title: string; description: string };
      stays: { title: string; description: string };
      restaurants: { title: string; description: string };
      attractions: { title: string; description: string };
      guide: { title: string; description: string };
    };
  };
  pages: {
    notFoundTitle: string;
    notFoundDescription: string;
    backHome: string;
    checkoutResultMissing: string;
    planPaymentTitle: string;
    planPaymentDescription: string;
    debtPaymentTitle: string;
    debtPaymentDescription: string;
    openPartnerArea: string;
    partnerAreaTitle: string;
    partnerLoginRequired: string;
    signIn: string;
    partnerOnly: string;
    partnerProfileNotFound: string;
    partnerProfileLoadError: string;
    partnerSuspendedTitle: string;
    partnerSuspended: string;
  };
  localeSuggestion: {
    label: string;
    message: string;
    switch: string;
    keep: string;
  };
  settings: {
    title: string;
    subtitle: string;
    back: string;
    appearance: string;
    appearanceSubtitle: string;
    language: string;
    languageSubtitle: string;
    support: string;
    about: string;
    theme: { light: string; dark: string; system: string };
    themeDescription: { light: string; dark: string; system: string };
  };
  favorites: {
    title: string;
    subtitle: string;
    back: string;
    emptyTitle: string;
    emptyDescription: string;
    removeItem: string;
  };
}
const ptBR: TranslationResource = {
  bookings: bookingsPtBR,
  insights: insightsPtBR,
  listingPlan: listingPlanPtBR,
  partners: partnersPtBR,
  paymentAccounts: paymentAccountsPtBR,
  receivables: receivablesPtBR,
  saleClaims: saleClaimsPtBR,
  purchases: purchasesPtBR,
  profile: profilePtBR,
  myReviews: myReviewsPtBR,
  reviewReports: reviewReportsPtBR,
  adminPanel: adminPanelPtBR,
  serviceProof: serviceProofPtBR,
  adminFinance: adminFinancePtBR,
  ticketSessions: ticketSessionsPtBR,
  salesPolicy: salesPolicyPtBR,
  ticketCheckout: ticketCheckoutPtBR,
  ticketWallet: ticketWalletPtBR,
  ticketGate: ticketGatePtBR,
  username: usernamePtBR,
  eventSessions: eventSessionsPtBR,
  legal: legalPtBR,
  verification: verificationPtBR,
  common: {
    language: 'Idioma',
    cancel: 'Cancelar',
    retry: 'Tentar novamente',
    confirm: 'Confirmar',
    close: 'Fechar',
    seal: {
      label: 'Ver o que significa o selo Use Guide Verificado',
      title: 'Use Guide Verificado',
      explanation:
        'Responsável verificado pelo Use Guide · assinante do plano Use Guide Verificado.',
    },
    featured: 'Destaque',
    locales: {
      ptBR: 'Português (Brasil)',
      en: 'English',
      fr: 'Français',
    },
  },
  header: {
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    profileAlt: 'Perfil',
    openSearch: 'Abrir busca',
    managementPanel: 'Painel de Gestão',
    myPanel: 'Meu Painel',
    openManagementPanel: 'Abrir painel de gestão',
    openMyPanel: 'Abrir meu painel',
    pageTitles: {
      events: 'Eventos & Experiências',
      tours: 'Aventura & Passeios',
      transfers: 'Translados',
      rentals: 'Aluguéis',
      accommodations: 'Melhores Hospedagens',
      restaurants: 'Sabores Locais',
      attractions: 'Atrações',
      practicalGuide: 'Guia Prático',
    },
  },
  menu: {
    closeMenu: 'Fechar menu',
    changeProfilePhoto: 'Alterar foto de perfil',
    userFallback: 'Usuário',
    signInOrRegister: 'Entrar ou cadastrar',
    emailPassword: 'E-mail e senha',
    orUse: 'ou',
    continueGoogle: 'Continuar com Google',
    managementPanel: 'Painel de gestão',
    myPanel: 'Meu painel',
    authErrors: {
      popupBlocked: 'O navegador bloqueou a janela de login. Libere pop-ups e tente de novo.',
      unauthorizedDomain:
        'Este endereço não está autorizado para login. Recarregue a página e tente de novo.',
      generic: 'Não foi possível entrar com o Google.',
    },
  },
  navigation: {
    explore: 'Explorar',
    events: 'Eventos',
    tours: 'Passeios',
    transfers: 'Translados',
    rentals: 'Aluguéis',
    accommodations: 'Hospedagens',
    restaurants: 'Restaurantes',
    attractions: 'Atrações',
    tips: 'Dicas',
  },
  errors: {
    appCheck: {
      APP_CHECK_REQUIRED:
        'O servidor recusou o acesso porque este aparelho não foi validado pelo App Check. Recarregue a página; se continuar, o App Check precisa ser configurado.',
      APP_CHECK_INVALID: 'A validação do App Check falhou. Recarregue a página e tente de novo.',
    },
    media: {
      IMAGE_TOO_LARGE: 'A imagem passa de 6 MB. Escolha uma imagem menor.',
      INVALID_IMAGE: 'Formato não suportado. Envie uma imagem JPEG, PNG ou WebP.',
      UPLOAD_FAILED: 'Não foi possível enviar a imagem. Tente novamente.',
      STORAGE_UNAVAILABLE:
        'O armazenamento está indisponível no momento. Tente novamente em instantes.',
    },
    payment: {
      SUBSCRIPTION_ALREADY_ACTIVE: 'Você já tem uma assinatura ativa.',
      SUBSCRIPTION_NOT_FOUND: 'Nenhuma assinatura ativa encontrada.',
      PLAN_INACTIVE: 'Este plano não está disponível no momento.',
      VALIDATION_ERROR: 'Dados inválidos. Revise e tente novamente.',
      FORBIDDEN: 'Conclua seu cadastro de parceiro antes de assinar.',
      BILLING_UNAVAILABLE: 'Pagamentos indisponíveis no momento. Tente novamente em instantes.',
      PAYMENT_FAILED: 'O pagamento não foi aprovado.',
      NOT_FOUND: 'Estabelecimento não encontrado.',
      LISTING_PENDING_VERIFICATION:
        'O estabelecimento precisa ser verificado pela equipe antes do plano.',
      PLAN_ALREADY_ACTIVE: 'Este estabelecimento já tem um plano em vigor.',
      PARTNER_SUSPENDED: 'Sua conta está suspensa.',
      SUBSCRIPTION_PAST_DUE: 'Atualize a forma de pagamento antes de trocar o período.',
    },
  },
  payment: {
    checkout: {
      title: 'Checkout seguro',
      close: 'Fechar checkout',
      totalLabel: 'Total',
      retry: 'Tentar novamente',
      preparing: 'Preparando o ambiente seguro do Stripe…',
      processingTitle: 'Pagamento em processamento',
      processingDescription: 'Estamos aguardando a confirmação do Stripe para liberar seu plano.',
      secureFooter:
        'Pagamento processado pelo Stripe. Os dados do cartão não passam pelo Use Guide.',
      methodLegend: 'Forma de pagamento',
      methodSubscription: 'Cartão — renovação automática',
      methodSubscriptionHint:
        'Cobrança recorrente no cartão. Cancele quando quiser; o plano vale até o fim do período pago.',
      methodOneTime: 'Pagamento único — Pix ou cartão',
      methodOneTimeHint:
        'Sem renovação automática. Para continuar com o selo, pague de novo ao fim do período.',
      continue: 'Continuar',
      subscribeButton: 'Assinar por {{amount}} {{period}}',
      payButton: 'Pagar {{amount}}',
      trialNotice:
        'Seu período atual já está pago. Salve o cartão agora; a primeira cobrança acontece quando esse período terminar.',
      activatingTitle: 'Confirmando sua assinatura',
      activatingDescription: 'O Stripe está confirmando o pagamento. Isso leva alguns segundos.',
      activationDelayed:
        'A confirmação está demorando mais que o normal. Seu plano será ativado assim que o Stripe confirmar; você pode fechar esta janela.',
      successTitle: 'Assinatura ativa',
      successDescription: 'Seu plano {{plan}} está ativo e renova automaticamente.',
    },
    period: {
      monthly: 'por mês',
      'semi-annual': 'a cada 6 meses',
      annual: 'por ano',
    },
    element: {
      unavailable: 'Pagamentos online indisponíveis no momento.',
      processing: 'Processando…',
      payNow: 'Pagar agora',
      saveCard: 'Salvar cartão',
      paymentFailed: 'Não foi possível processar o pagamento.',
      confirmFailed: 'Não foi possível confirmar o pagamento.',
    },
    subscription: {
      title: 'Assinatura do plano',
      loading: 'Carregando assinatura…',
      statusActive: 'Ativa. Próxima cobrança em {{date}}.',
      statusTrialing: 'Ativa. Primeira cobrança em {{date}}.',
      statusCancelScheduled: 'Renovação cancelada. O plano vale até {{date}}.',
      statusPastDue:
        'Não conseguimos cobrar seu cartão. Atualize a forma de pagamento para manter o selo.',
      statusCanceled: 'Assinatura encerrada.',
      statusIncomplete: 'Pagamento da assinatura pendente.',
      manageCard: 'Gerenciar cartão e faturas',
      cancelRenewal: 'Cancelar renovação',
      resumeRenewal: 'Retomar renovação',
      confirmCancel: 'Cancelar a renovação automática? O plano continua ativo até {{date}}.',
      actionFailed: 'Não foi possível concluir a ação. Tente novamente.',
      loadFailed: 'Não foi possível carregar a assinatura.',
      retry: 'Tentar novamente',
      changePeriod: 'Trocar período',
      changeTitle: 'Novo período a partir da próxima renovação',
      changeHint:
        'O período atual segue até {{date}}. Os benefícios são os mesmos; muda só o ciclo e o valor da cobrança.',
      changeConfirm: 'Trocar na próxima renovação ({{date}})',
      changeBack: 'Voltar',
      currentPeriod: 'Atual',
      pendingChange: 'A partir de {{date}}, o plano passa para {{plan}} ({{amount}}).',
      keepCurrent: 'Manter o período atual',
    },
  },
  seo: {
    routes: {
      explore: {
        title: 'Use Guide | Guia de Jericoacoara, Preá e Barrinha',
        description:
          'Descubra as melhores experiências, pousadas, restaurantes, passeios e condições de vento em tempo real em Jericoacoara, Preá e Barrinha.',
      },
      events: {
        title: 'Eventos & Experiências | Use Guide',
        description:
          'Fique por dentro das festas, sunsets, campeonatos de kitesurf e eventos culturais em Jericoacoara e região.',
      },
      tours: {
        title: 'Aventura & Passeios | Use Guide',
        description:
          'Passeios de buggy, quadriciclo, lagoas cristalinas e roteiros imperdíveis no litoral leste e oeste de Jericoacoara.',
      },
      transfers: {
        title: 'Translados em Jericoacoara | Use Guide',
        description:
          'Transfers entre Fortaleza, Jijoca, Jericoacoara, Preá e Barrinha: veículos, capacidade e reserva.',
      },
      rentals: {
        title: 'Aluguéis em Jericoacoara | Use Guide',
        description:
          'Aluguel de quadriciclos, buggies, bicicletas e equipamentos em Jericoacoara e região.',
      },
      stays: {
        title: 'Melhores Hospedagens & Pousadas | Use Guide',
        description:
          'Seleção curada das melhores pousadas, hotéis boutique e resorts à beira-mar em Jeri, Preá e Barrinha.',
      },
      restaurants: {
        title: 'Sabores Locais & Gastronomia | Use Guide',
        description:
          'Descubra os melhores restaurantes, bares de praia, frutos do mar frescos e alta gastronomia de Jeri e Preá.',
      },
      attractions: {
        title: 'Atrações & Pontos Turísticos | Use Guide',
        description:
          'Pedra Furada, Duna do Pôr do Sol, Lagoas e os cartões-postais mais famosos do Parque Nacional de Jericoacoara.',
      },
      guide: {
        title: 'Guia Prático & Dicas Úteis | Use Guide',
        description:
          'Tudo o que você precisa saber: taxa de turismo, como chegar, melhor época, traslados e dicas essenciais.',
      },
    },
  },
  pages: {
    notFoundTitle: 'Página não encontrada',
    notFoundDescription: 'O endereço que você abriu não existe ou foi alterado.',
    backHome: 'Voltar ao início',
    checkoutResultMissing: 'Não encontramos o pedido deste pagamento.',
    planPaymentTitle: 'Pagamento do plano em processamento',
    planPaymentDescription: 'Assim que o Stripe confirmar, o selo aparece na sua área de parceiro.',
    debtPaymentTitle: 'Pagamento da dívida em processamento',
    debtPaymentDescription:
      'Assim que o Stripe confirmar, a dívida aparece como paga em Recebimentos e as vendas voltam.',
    openPartnerArea: 'Abrir área do parceiro',
    partnerAreaTitle: 'Área do parceiro',
    partnerLoginRequired: 'Entre na sua conta de parceiro para abrir o painel.',
    signIn: 'Entrar',
    partnerOnly: 'Este painel é exclusivo para parceiros cadastrados.',
    partnerProfileNotFound: 'Não encontramos o seu cadastro de parceiro.',
    partnerProfileLoadError: 'Não foi possível carregar o seu cadastro de parceiro.',
    partnerSuspendedTitle: 'Conta de parceiro suspensa',
    partnerSuspended:
      'Seu acesso ao painel foi suspenso pela equipe do Use Guide. Fale com o suporte para saber como reativar.',
  },
  localeSuggestion: {
    label: 'Sugestão de idioma',
    message: 'Esta página também está disponível em português.',
    switch: 'Ver em português',
    keep: 'Continuar em português',
  },
  settings: {
    title: 'Configurações',
    subtitle: 'Preferências do app',
    back: 'Voltar',
    appearance: 'Aparência',
    appearanceSubtitle: 'Selecione o modo',
    language: 'Idioma do Guide',
    languageSubtitle: 'Selecione o idioma',
    support: 'Suporte',
    about: 'Sobre o app',
    theme: { light: 'Claro', dark: 'Escuro', system: 'Sistema' },
    themeDescription: {
      light: 'Tema com tonalidade clara',
      dark: 'Tema escuro padrão com efeito glassmorphism',
      system: 'Acompanha a preferência do dispositivo',
    },
  },
  favorites: {
    title: 'Meus Favoritos',
    subtitle: 'Seus itens salvos',
    back: 'Voltar para o menu principal',
    emptyTitle: 'Nenhum favorito salvo',
    emptyDescription:
      'Você ainda não favoritou nenhum item. Explore o guia e toque no coração para guardar o que gostou.',
    removeItem: 'Remover {{name}} dos favoritos',
  },
};
const en: TranslationResource = {
  bookings: bookingsEn,
  insights: insightsEn,
  listingPlan: listingPlanEn,
  partners: partnersEn,
  paymentAccounts: paymentAccountsEn,
  receivables: receivablesEn,
  saleClaims: saleClaimsEn,
  purchases: purchasesEn,
  profile: profileEn,
  myReviews: myReviewsEn,
  reviewReports: reviewReportsEn,
  adminPanel: adminPanelEn,
  serviceProof: serviceProofEn,
  adminFinance: adminFinanceEn,
  ticketSessions: ticketSessionsEn,
  salesPolicy: salesPolicyEn,
  ticketCheckout: ticketCheckoutEn,
  ticketWallet: ticketWalletEn,
  ticketGate: ticketGateEn,
  username: usernameEn,
  eventSessions: eventSessionsEn,
  legal: legalEn,
  verification: verificationEn,
  common: {
    language: 'Language',
    cancel: 'Cancel',
    retry: 'Try again',
    confirm: 'Confirm',
    close: 'Close',
    seal: {
      label: 'See what the Use Guide Verified badge means',
      title: 'Use Guide Verified',
      explanation: 'Owner verified by Use Guide · subscriber of the Use Guide Verified plan.',
    },
    featured: 'Featured',
    locales: {
      ptBR: 'Português (Brasil)',
      en: 'English',
      fr: 'Français',
    },
  },
  header: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    profileAlt: 'Profile',
    openSearch: 'Open search',
    managementPanel: 'Management Panel',
    myPanel: 'My Panel',
    openManagementPanel: 'Open management panel',
    openMyPanel: 'Open my panel',
    pageTitles: {
      events: 'Events & Experiences',
      tours: 'Adventure & Tours',
      transfers: 'Transfers',
      rentals: 'Rentals',
      accommodations: 'Best Accommodations',
      restaurants: 'Local Flavors',
      attractions: 'Attractions',
      practicalGuide: 'Practical Guide',
    },
  },
  menu: {
    closeMenu: 'Close menu',
    changeProfilePhoto: 'Change profile photo',
    userFallback: 'User',
    signInOrRegister: 'Sign in or sign up',
    emailPassword: 'Email and password',
    orUse: 'or',
    continueGoogle: 'Continue with Google',
    managementPanel: 'Management panel',
    myPanel: 'My panel',
    authErrors: {
      popupBlocked: 'The browser blocked the sign-in window. Allow pop-ups and try again.',
      unauthorizedDomain:
        'This address is not authorized for sign-in. Reload the page and try again.',
      generic: 'Could not sign in with Google.',
    },
  },
  navigation: {
    explore: 'Explore',
    events: 'Events',
    tours: 'Tours',
    transfers: 'Transfers',
    rentals: 'Rentals',
    accommodations: 'Accommodations',
    restaurants: 'Restaurants',
    attractions: 'Attractions',
    tips: 'Tips',
  },
  errors: {
    appCheck: {
      APP_CHECK_REQUIRED:
        'The server refused access because this device was not validated by App Check. Reload the page; if it continues, App Check needs to be configured.',
      APP_CHECK_INVALID: 'App Check validation failed. Reload the page and try again.',
    },
    media: {
      IMAGE_TOO_LARGE: 'The image is larger than 6 MB. Choose a smaller image.',
      INVALID_IMAGE: 'Unsupported format. Upload a JPEG, PNG or WebP image.',
      UPLOAD_FAILED: 'The image could not be uploaded. Please try again.',
      STORAGE_UNAVAILABLE: 'Storage is unavailable right now. Please try again shortly.',
    },
    payment: {
      SUBSCRIPTION_ALREADY_ACTIVE: 'You already have an active subscription.',
      SUBSCRIPTION_NOT_FOUND: 'No active subscription found.',
      PLAN_INACTIVE: 'This plan is not available right now.',
      VALIDATION_ERROR: 'Invalid data. Please review and try again.',
      FORBIDDEN: 'Complete your partner registration before subscribing.',
      BILLING_UNAVAILABLE: 'Payments are unavailable right now. Please try again shortly.',
      PAYMENT_FAILED: 'The payment was not approved.',
      NOT_FOUND: 'Business not found.',
      LISTING_PENDING_VERIFICATION: 'The team must verify the business before a plan.',
      PLAN_ALREADY_ACTIVE: 'This business already has an active plan.',
      PARTNER_SUSPENDED: 'Your account is suspended.',
      SUBSCRIPTION_PAST_DUE: 'Update your payment method before changing the period.',
    },
  },
  payment: {
    checkout: {
      title: 'Secure checkout',
      close: 'Close checkout',
      totalLabel: 'Total',
      retry: 'Try again',
      preparing: 'Preparing Stripe secure checkout…',
      processingTitle: 'Payment processing',
      processingDescription:
        'We are waiting for Stripe to confirm the payment before activating your plan.',
      secureFooter: 'Payment processed by Stripe. Card details never go through Use Guide.',
      methodLegend: 'Payment method',
      methodSubscription: 'Card — automatic renewal',
      methodSubscriptionHint:
        'Recurring card charge. Cancel anytime; the plan stays active until the end of the paid period.',
      methodOneTime: 'One-time payment — Pix or card',
      methodOneTimeHint: 'No automatic renewal. To keep the badge, pay again when the period ends.',
      continue: 'Continue',
      subscribeButton: 'Subscribe for {{amount}} {{period}}',
      payButton: 'Pay {{amount}}',
      trialNotice:
        'Your current period is already paid. Save your card now; the first charge happens when that period ends.',
      activatingTitle: 'Confirming your subscription',
      activatingDescription: 'Stripe is confirming the payment. This takes a few seconds.',
      activationDelayed:
        'Confirmation is taking longer than usual. Your plan will be activated as soon as Stripe confirms; you can close this window.',
      successTitle: 'Subscription active',
      successDescription: 'Your {{plan}} plan is active and renews automatically.',
    },
    period: {
      monthly: 'per month',
      'semi-annual': 'every 6 months',
      annual: 'per year',
    },
    element: {
      unavailable: 'Online payments are unavailable right now.',
      processing: 'Processing…',
      payNow: 'Pay now',
      saveCard: 'Save card',
      paymentFailed: 'The payment could not be processed.',
      confirmFailed: 'The payment could not be confirmed.',
    },
    subscription: {
      title: 'Plan subscription',
      loading: 'Loading subscription…',
      statusActive: 'Active. Next charge on {{date}}.',
      statusTrialing: 'Active. First charge on {{date}}.',
      statusCancelScheduled: 'Renewal canceled. The plan is valid until {{date}}.',
      statusPastDue: 'We could not charge your card. Update your payment method to keep the badge.',
      statusCanceled: 'Subscription ended.',
      statusIncomplete: 'Subscription payment pending.',
      manageCard: 'Manage card and invoices',
      cancelRenewal: 'Cancel renewal',
      resumeRenewal: 'Resume renewal',
      confirmCancel: 'Cancel automatic renewal? The plan stays active until {{date}}.',
      actionFailed: 'The action could not be completed. Please try again.',
      loadFailed: 'The subscription could not be loaded.',
      retry: 'Try again',
      changePeriod: 'Change period',
      changeTitle: 'New period from the next renewal',
      changeHint:
        'The current period runs until {{date}}. The benefits are the same; only the billing cycle and amount change.',
      changeConfirm: 'Change at the next renewal ({{date}})',
      changeBack: 'Back',
      currentPeriod: 'Current',
      pendingChange: 'From {{date}}, the plan switches to {{plan}} ({{amount}}).',
      keepCurrent: 'Keep the current period',
    },
  },
  seo: {
    routes: {
      explore: {
        title: 'Use Guide | Jericoacoara, Preá & Barrinha Travel Guide',
        description:
          'Discover the best experiences, inns, restaurants, tours and real-time wind conditions in Jericoacoara, Preá and Barrinha.',
      },
      events: {
        title: 'Events & Experiences | Use Guide',
        description:
          'Parties, sunsets, kitesurf competitions and cultural events in Jericoacoara and the region.',
      },
      tours: {
        title: 'Adventure & Tours | Use Guide',
        description:
          'Buggy and quad bike tours, crystal-clear lagoons and must-do routes around Jericoacoara.',
      },
      transfers: {
        title: 'Transfers to Jericoacoara | Use Guide',
        description:
          'Transfers between Fortaleza, Jijoca, Jericoacoara, Preá and Barrinha: vehicles, capacity and booking.',
      },
      rentals: {
        title: 'Rentals in Jericoacoara | Use Guide',
        description: 'Rent ATVs, buggies, bikes and gear in Jericoacoara and the region.',
      },
      stays: {
        title: 'Best Stays & Inns | Use Guide',
        description:
          'A curated selection of the best inns, boutique hotels and beachfront resorts in Jeri, Preá and Barrinha.',
      },
      restaurants: {
        title: 'Local Flavors & Dining | Use Guide',
        description:
          'The best restaurants, beach bars, fresh seafood and fine dining in Jeri and Preá.',
      },
      attractions: {
        title: 'Attractions & Landmarks | Use Guide',
        description:
          'Pedra Furada, Sunset Dune, the lagoons and the most famous postcards of Jericoacoara National Park.',
      },
      guide: {
        title: 'Practical Guide & Tips | Use Guide',
        description:
          'Everything you need to know: tourism fee, how to get there, best season, transfers and essential tips.',
      },
    },
  },
  pages: {
    notFoundTitle: 'Page not found',
    notFoundDescription: 'The address you opened does not exist or has changed.',
    backHome: 'Back to home',
    checkoutResultMissing: 'We could not find the order for this payment.',
    planPaymentTitle: 'Plan payment processing',
    planPaymentDescription: 'As soon as Stripe confirms, the badge appears in your partner area.',
    debtPaymentTitle: 'Debt payment processing',
    debtPaymentDescription:
      'As soon as Stripe confirms, the debt shows as paid under Payouts and sales resume.',
    openPartnerArea: 'Open partner area',
    partnerAreaTitle: 'Partner area',
    partnerLoginRequired: 'Sign in to your partner account to open the dashboard.',
    signIn: 'Sign in',
    partnerOnly: 'This dashboard is only for registered partners.',
    partnerProfileNotFound: 'We couldn’t find your partner registration.',
    partnerProfileLoadError: 'We couldn’t load your partner registration.',
    partnerSuspendedTitle: 'Partner account suspended',
    partnerSuspended:
      'Your dashboard access was suspended by the Use Guide team. Contact support to find out how to reactivate it.',
  },
  localeSuggestion: {
    label: 'Language suggestion',
    message: 'This page is also available in English.',
    switch: 'View in English',
    keep: 'Continue in Portuguese',
  },
  settings: {
    title: 'Settings',
    subtitle: 'App preferences',
    back: 'Back',
    appearance: 'Appearance',
    appearanceSubtitle: 'Choose a mode',
    language: 'Guide language',
    languageSubtitle: 'Choose a language',
    support: 'Support',
    about: 'About the app',
    theme: { light: 'Light', dark: 'Dark', system: 'System' },
    themeDescription: {
      light: 'Light-toned theme',
      dark: 'Default dark theme with glass effect',
      system: 'Follows your device setting',
    },
  },
  favorites: {
    title: 'My Favorites',
    subtitle: 'Your saved items',
    back: 'Back to the main menu',
    emptyTitle: 'No saved favorites',
    emptyDescription:
      "You haven't saved anything yet. Explore the guide and tap the heart to keep what you like.",
    removeItem: 'Remove {{name}} from favorites',
  },
};
const fr: TranslationResource = {
  bookings: bookingsFr,
  insights: insightsFr,
  listingPlan: listingPlanFr,
  partners: partnersFr,
  paymentAccounts: paymentAccountsFr,
  receivables: receivablesFr,
  saleClaims: saleClaimsFr,
  purchases: purchasesFr,
  profile: profileFr,
  myReviews: myReviewsFr,
  reviewReports: reviewReportsFr,
  adminPanel: adminPanelFr,
  serviceProof: serviceProofFr,
  adminFinance: adminFinanceFr,
  ticketSessions: ticketSessionsFr,
  salesPolicy: salesPolicyFr,
  ticketCheckout: ticketCheckoutFr,
  ticketWallet: ticketWalletFr,
  ticketGate: ticketGateFr,
  username: usernameFr,
  eventSessions: eventSessionsFr,
  legal: legalFr,
  verification: verificationFr,
  common: {
    language: 'Langue',
    cancel: 'Annuler',
    retry: 'Réessayer',
    confirm: 'Confirmer',
    close: 'Fermer',
    seal: {
      label: 'Voir ce que signifie le badge Use Guide Vérifié',
      title: 'Use Guide Vérifié',
      explanation: "Responsable vérifié par Use Guide · abonné à l'offre Use Guide Vérifié.",
    },
    featured: 'À la une',
    locales: {
      ptBR: 'Português (Brasil)',
      en: 'English',
      fr: 'Français',
    },
  },
  header: {
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    profileAlt: 'Profil',
    openSearch: 'Ouvrir la recherche',
    managementPanel: 'Panneau de gestion',
    myPanel: 'Mon espace',
    openManagementPanel: 'Ouvrir le panneau de gestion',
    openMyPanel: 'Ouvrir mon espace',
    pageTitles: {
      events: 'Événements & Expériences',
      tours: 'Aventure & Excursions',
      transfers: 'Transferts',
      rentals: 'Locations',
      accommodations: 'Meilleurs Hébergements',
      restaurants: 'Saveurs Locales',
      attractions: 'Attractions',
      practicalGuide: 'Guide Pratique',
    },
  },
  menu: {
    closeMenu: 'Fermer le menu',
    changeProfilePhoto: 'Changer la photo de profil',
    userFallback: 'Utilisateur',
    signInOrRegister: 'Se connecter ou s’inscrire',
    emailPassword: 'E-mail et mot de passe',
    orUse: 'ou',
    continueGoogle: 'Continuer avec Google',
    managementPanel: 'Panneau de gestion',
    myPanel: 'Mon panneau',
    authErrors: {
      popupBlocked:
        'Le navigateur a bloqué la fenêtre de connexion. Autorisez les pop-ups et réessayez.',
      unauthorizedDomain:
        'Cette adresse n’est pas autorisée pour la connexion. Rechargez la page et réessayez.',
      generic: 'Impossible de se connecter avec Google.',
    },
  },
  navigation: {
    explore: 'Explorer',
    events: 'Événements',
    tours: 'Excursions',
    transfers: 'Transferts',
    rentals: 'Locations',
    accommodations: 'Hébergements',
    restaurants: 'Restaurants',
    attractions: 'Attractions',
    tips: 'Conseils',
  },
  errors: {
    appCheck: {
      APP_CHECK_REQUIRED:
        'Le serveur a refusé l’accès car cet appareil n’a pas été validé par App Check. Rechargez la page ; si cela continue, App Check doit être configuré.',
      APP_CHECK_INVALID: 'La validation App Check a échoué. Rechargez la page et réessayez.',
    },
    media: {
      IMAGE_TOO_LARGE: "L'image dépasse 6 Mo. Choisissez une image plus légère.",
      INVALID_IMAGE: 'Format non pris en charge. Envoyez une image JPEG, PNG ou WebP.',
      UPLOAD_FAILED: "Impossible d'envoyer l'image. Veuillez réessayer.",
      STORAGE_UNAVAILABLE:
        'Le stockage est indisponible pour le moment. Réessayez dans un instant.',
    },
    payment: {
      SUBSCRIPTION_ALREADY_ACTIVE: 'Vous avez déjà un abonnement actif.',
      SUBSCRIPTION_NOT_FOUND: 'Aucun abonnement actif trouvé.',
      PLAN_INACTIVE: 'Ce forfait n’est pas disponible pour le moment.',
      VALIDATION_ERROR: 'Données invalides. Vérifiez et réessayez.',
      FORBIDDEN: 'Terminez votre inscription de partenaire avant de vous abonner.',
      BILLING_UNAVAILABLE:
        'Les paiements sont indisponibles pour le moment. Réessayez dans un instant.',
      PAYMENT_FAILED: 'Le paiement n’a pas été approuvé.',
      NOT_FOUND: 'Établissement introuvable.',
      LISTING_PENDING_VERIFICATION: "L'équipe doit vérifier l'établissement avant l'offre.",
      PLAN_ALREADY_ACTIVE: 'Cet établissement a déjà une offre active.',
      PARTNER_SUSPENDED: 'Votre compte est suspendu.',
      SUBSCRIPTION_PAST_DUE: 'Mettez à jour votre moyen de paiement avant de changer de période.',
    },
  },
  payment: {
    checkout: {
      title: 'Paiement sécurisé',
      close: 'Fermer le paiement',
      totalLabel: 'Total',
      retry: 'Réessayer',
      preparing: 'Préparation du paiement sécurisé Stripe…',
      processingTitle: 'Paiement en cours',
      processingDescription: 'Nous attendons la confirmation de Stripe pour activer votre forfait.',
      secureFooter:
        'Paiement traité par Stripe. Les données de carte ne passent jamais par Use Guide.',
      methodLegend: 'Moyen de paiement',
      methodSubscription: 'Carte — renouvellement automatique',
      methodSubscriptionHint:
        'Prélèvement récurrent sur la carte. Résiliable à tout moment ; le forfait reste actif jusqu’à la fin de la période payée.',
      methodOneTime: 'Paiement unique — Pix ou carte',
      methodOneTimeHint:
        'Sans renouvellement automatique. Pour garder le badge, payez à nouveau à la fin de la période.',
      continue: 'Continuer',
      subscribeButton: 'S’abonner pour {{amount}} {{period}}',
      payButton: 'Payer {{amount}}',
      trialNotice:
        'Votre période actuelle est déjà payée. Enregistrez votre carte maintenant ; le premier prélèvement aura lieu à la fin de cette période.',
      activatingTitle: 'Confirmation de votre abonnement',
      activatingDescription: 'Stripe confirme le paiement. Cela prend quelques secondes.',
      activationDelayed:
        'La confirmation prend plus de temps que d’habitude. Votre forfait sera activé dès que Stripe confirmera ; vous pouvez fermer cette fenêtre.',
      successTitle: 'Abonnement actif',
      successDescription: 'Votre forfait {{plan}} est actif et se renouvelle automatiquement.',
    },
    period: {
      monthly: 'par mois',
      'semi-annual': 'tous les 6 mois',
      annual: 'par an',
    },
    element: {
      unavailable: 'Les paiements en ligne sont indisponibles pour le moment.',
      processing: 'Traitement…',
      payNow: 'Payer maintenant',
      saveCard: 'Enregistrer la carte',
      paymentFailed: 'Le paiement n’a pas pu être traité.',
      confirmFailed: 'Le paiement n’a pas pu être confirmé.',
    },
    subscription: {
      title: 'Abonnement au forfait',
      loading: 'Chargement de l’abonnement…',
      statusActive: 'Actif. Prochain prélèvement le {{date}}.',
      statusTrialing: 'Actif. Premier prélèvement le {{date}}.',
      statusCancelScheduled: 'Renouvellement annulé. Le forfait est valable jusqu’au {{date}}.',
      statusPastDue:
        'Nous n’avons pas pu débiter votre carte. Mettez à jour votre moyen de paiement pour garder le badge.',
      statusCanceled: 'Abonnement terminé.',
      statusIncomplete: 'Paiement de l’abonnement en attente.',
      manageCard: 'Gérer la carte et les factures',
      cancelRenewal: 'Annuler le renouvellement',
      resumeRenewal: 'Reprendre le renouvellement',
      confirmCancel:
        'Annuler le renouvellement automatique ? Le forfait reste actif jusqu’au {{date}}.',
      actionFailed: 'L’action n’a pas pu aboutir. Veuillez réessayer.',
      loadFailed: 'Impossible de charger l’abonnement.',
      retry: 'Réessayer',
      changePeriod: 'Changer de période',
      changeTitle: 'Nouvelle période à partir du prochain renouvellement',
      changeHint:
        "La période actuelle court jusqu'au {{date}}. Les avantages sont les mêmes ; seuls le cycle et le montant de la facturation changent.",
      changeConfirm: 'Changer au prochain renouvellement ({{date}})',
      changeBack: 'Retour',
      currentPeriod: 'Actuelle',
      pendingChange: 'À partir du {{date}}, le forfait passe à {{plan}} ({{amount}}).',
      keepCurrent: 'Garder la période actuelle',
    },
  },
  seo: {
    routes: {
      explore: {
        title: 'Use Guide | Guide de Jericoacoara, Preá et Barrinha',
        description:
          'Découvrez les meilleures expériences, pousadas, restaurants, excursions et le vent en temps réel à Jericoacoara, Preá et Barrinha.',
      },
      events: {
        title: 'Événements & Expériences | Use Guide',
        description:
          'Fêtes, couchers de soleil, compétitions de kitesurf et événements culturels à Jericoacoara et dans la région.',
      },
      tours: {
        title: 'Aventure & Excursions | Use Guide',
        description:
          'Excursions en buggy et en quad, lagunes cristallines et itinéraires incontournables autour de Jericoacoara.',
      },
      transfers: {
        title: 'Transferts à Jericoacoara | Use Guide',
        description:
          'Transferts entre Fortaleza, Jijoca, Jericoacoara, Preá et Barrinha : véhicules, capacité et réservation.',
      },
      rentals: {
        title: 'Locations à Jericoacoara | Use Guide',
        description:
          'Location de quads, buggys, vélos et équipements à Jericoacoara et dans la région.',
      },
      stays: {
        title: 'Meilleurs Hébergements | Use Guide',
        description:
          'Une sélection des meilleures pousadas, hôtels boutique et resorts en bord de mer à Jeri, Preá et Barrinha.',
      },
      restaurants: {
        title: 'Saveurs Locales & Gastronomie | Use Guide',
        description:
          'Les meilleurs restaurants, bars de plage, fruits de mer frais et la haute gastronomie de Jeri et Preá.',
      },
      attractions: {
        title: 'Attractions & Sites Touristiques | Use Guide',
        description:
          'Pedra Furada, la Dune du Coucher de Soleil, les lagunes et les cartes postales du Parc National de Jericoacoara.',
      },
      guide: {
        title: 'Guide Pratique & Conseils | Use Guide',
        description:
          "Tout ce qu'il faut savoir : taxe touristique, comment venir, meilleure saison, transferts et conseils essentiels.",
      },
    },
  },
  pages: {
    notFoundTitle: 'Page introuvable',
    notFoundDescription: 'L’adresse que vous avez ouverte n’existe pas ou a changé.',
    backHome: 'Retour à l’accueil',
    checkoutResultMissing: 'Nous n’avons pas trouvé la commande de ce paiement.',
    planPaymentTitle: 'Paiement du forfait en cours',
    planPaymentDescription:
      'Dès que Stripe confirme, le badge apparaît dans votre espace partenaire.',
    openPartnerArea: 'Ouvrir l’espace partenaire',
    debtPaymentTitle: 'Paiement de la dette en cours',
    debtPaymentDescription:
      'Dès que Stripe confirme, la dette apparaît comme payée dans Versements et les ventes reprennent.',
    partnerAreaTitle: 'Espace partenaire',
    partnerLoginRequired:
      'Connectez-vous à votre compte partenaire pour ouvrir le tableau de bord.',
    signIn: 'Se connecter',
    partnerOnly: 'Ce tableau de bord est réservé aux partenaires inscrits.',
    partnerProfileNotFound: 'Nous n’avons pas trouvé votre inscription de partenaire.',
    partnerProfileLoadError: 'Impossible de charger votre inscription de partenaire.',
    partnerSuspendedTitle: 'Compte partenaire suspendu',
    partnerSuspended:
      'Votre accès au tableau de bord a été suspendu par l’équipe Use Guide. Contactez le support pour savoir comment le réactiver.',
  },
  localeSuggestion: {
    label: 'Suggestion de langue',
    message: 'Cette page est aussi disponible en français.',
    switch: 'Voir en français',
    keep: 'Continuer en portugais',
  },
  settings: {
    title: 'Paramètres',
    subtitle: 'Préférences de l’app',
    back: 'Retour',
    appearance: 'Apparence',
    appearanceSubtitle: 'Choisissez un mode',
    language: 'Langue du guide',
    languageSubtitle: 'Choisissez une langue',
    support: 'Assistance',
    about: 'À propos de l’app',
    theme: { light: 'Clair', dark: 'Sombre', system: 'Système' },
    themeDescription: {
      light: 'Thème aux tons clairs',
      dark: 'Thème sombre par défaut avec effet verre',
      system: 'Suit le réglage de votre appareil',
    },
  },
  favorites: {
    title: 'Mes favoris',
    subtitle: 'Vos éléments enregistrés',
    back: 'Retour au menu principal',
    emptyTitle: 'Aucun favori enregistré',
    emptyDescription:
      'Vous n’avez encore rien enregistré. Explorez le guide et touchez le cœur pour garder ce qui vous plaît.',
    removeItem: 'Retirer {{name}} des favoris',
  },
};
export const resources = {
  'pt-BR': {
    translation: ptBR,
  },
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
} as const;
