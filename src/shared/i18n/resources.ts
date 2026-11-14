import { type AccountTranslation, accountPtBR } from './accountResources';
import { type AdminFinanceTranslation, adminFinancePtBR } from './adminFinanceResources';
import { type AdminPanelTranslation, adminPanelPtBR } from './adminPanelResources';
import { type AppAboutTranslation, appAboutPtBR } from './appAboutResources';
import { type ArrivalNoticeTranslation, arrivalNoticePtBR } from './arrivalNoticeResources';
import { type BookingsTranslation, bookingsPtBR } from './bookingsResources';
import { type CourtesyTranslation, courtesyPtBR } from './courtesyResources';
import {
  type EmailVerificationTranslation,
  emailVerificationPtBR,
} from './emailVerificationResources';
import { type EventSessionsTranslation, eventSessionsPtBR } from './eventSessionsResources';
import { type GateStaffTranslation, gateStaffPtBR } from './gateStaffResources';
import { type TicketLotsTranslation, ticketLotsPtBR } from './ticketLotsResources';
import { type GateModeTranslation, gateModePtBR } from './gateModeResources';
import { type HelpTranslation, helpPtBR } from './helpResources';
import { type InsightsTranslation, insightsPtBR } from './insightsResources';
import { type LegalTranslation, legalPtBR } from './legalResources';
import { type ListingDetailTranslation, listingDetailPtBR } from './listingDetailResources';
import { type ListingPlanTranslation, listingPlanPtBR } from './listingPlanResources';
import { type NotifyTranslation, notifyPtBR } from './notifyResources';
import {
  type PartnerAddSegmentTranslation,
  partnerAddSegmentPtBR,
} from './partnerAddSegmentResources';
import { type PartnerAgoraTranslation, partnerAgoraPtBR } from './partnerAgoraResources';
import { type PartnerCatalogTranslation, partnerCatalogPtBR } from './partnerCatalogResources';
import { type PartnerEarningsTranslation, partnerEarningsPtBR } from './partnerEarningsResources';
import {
  type PartnerFirstStepsTranslation,
  partnerFirstStepsPtBR,
} from './partnerFirstStepsResources';
import { type PartnerPanelTranslation, partnerPanelPtBR } from './partnerPanelResources';
import { type PartnerSignupTranslation, partnerSignupPtBR } from './partnerSignupResources';
import { type PartnersTranslation, partnersPtBR } from './partnersResources';
import { type PartnerTourTranslation, partnerTourPtBR } from './partnerTourResources';
import { type PaymentAccountsTranslation, paymentAccountsPtBR } from './paymentAccountsResources';
import { type PlaceTimeTranslation, placeTimePtBR } from './placeTimeResources';
import {
  type MyReviewsTranslation,
  myReviewsPtBR,
  type ProfileTranslation,
  profilePtBR,
} from './profileResources';
import { type PromoCodeTranslation, promoCodePtBR } from './promoCodeResources';
import { type PromoterTranslation, promoterPtBR } from './promoterResources';
import { type PurchasesTranslation, purchasesPtBR } from './purchasesResources';
import { type ReceivablesTranslation, receivablesPtBR } from './receivablesResources';
import { type ReviewReportsTranslation, reviewReportsPtBR } from './reviewReportsResources';
import { type ReviewsUiTranslation, reviewsUiPtBR } from './reviewsUiResources';
import { type SaleClaimsTranslation, saleClaimsPtBR } from './saleClaimsResources';
import { type SalesPolicyTranslation, salesPolicyPtBR } from './salesPolicyResources';
import { type ServiceProofTranslation, serviceProofPtBR } from './serviceProofResources';
import { type TicketCheckoutTranslation, ticketCheckoutPtBR } from './ticketCheckoutResources';
import { type TicketGateTranslation, ticketGatePtBR } from './ticketGateResources';
import { type TicketSessionsTranslation, ticketSessionsPtBR } from './ticketSessionsResources';
import { type TicketWalletTranslation, ticketWalletPtBR } from './ticketWalletResources';
import { type UsernameTranslation, usernamePtBR } from './usernameResources';
import { type VerificationTranslation, verificationPtBR } from './verificationResources';

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
  account: AccountTranslation;
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
  appAbout: AppAboutTranslation;
  notify: NotifyTranslation;
  help: HelpTranslation;
  eventSessions: EventSessionsTranslation;
  gateStaff: GateStaffTranslation;
  ticketLots: TicketLotsTranslation;
  placeTime: PlaceTimeTranslation;
  gateMode: GateModeTranslation;
  partnerPanel: PartnerPanelTranslation;
  partnerCatalog: PartnerCatalogTranslation;
  partnerEarnings: PartnerEarningsTranslation;
  partnerFirstSteps: PartnerFirstStepsTranslation;
  partnerAddSegment: PartnerAddSegmentTranslation;
  listingDetail: ListingDetailTranslation;
  reviewsUi: ReviewsUiTranslation;
  partnerSignup: PartnerSignupTranslation;
  partnerAgora: PartnerAgoraTranslation;
  courtesy: CourtesyTranslation;
  promoters: PromoterTranslation;
  promoCodes: PromoCodeTranslation;
  partnerTour: PartnerTourTranslation;
  arrivalNotice: ArrivalNoticeTranslation;
  legal: LegalTranslation;
  verification: VerificationTranslation;
  emailVerification: EmailVerificationTranslation;
  common: {
    language: string;
    loading: string;
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
    /** Título da primeira tela da folha do perfil (D33). */
    profileTitle: string;
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
    itemUnavailable: string;
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
    back: string;
    appearance: string;
    language: string;
    support: string;
    about: string;
    theme: { light: string; dark: string; system: string };
    themeDescription: { light: string; dark: string; system: string };
  };
  favorites: {
    title: string;
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
  account: accountPtBR,
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
  appAbout: appAboutPtBR,
  notify: notifyPtBR,
  help: helpPtBR,
  eventSessions: eventSessionsPtBR,
  gateStaff: gateStaffPtBR,
  ticketLots: ticketLotsPtBR,
  placeTime: placeTimePtBR,
  gateMode: gateModePtBR,
  partnerPanel: partnerPanelPtBR,
  partnerCatalog: partnerCatalogPtBR,
  partnerEarnings: partnerEarningsPtBR,
  partnerFirstSteps: partnerFirstStepsPtBR,
  partnerAddSegment: partnerAddSegmentPtBR,
  listingDetail: listingDetailPtBR,
  reviewsUi: reviewsUiPtBR,
  partnerSignup: partnerSignupPtBR,
  partnerAgora: partnerAgoraPtBR,
  courtesy: courtesyPtBR,
  promoters: promoterPtBR,
  promoCodes: promoCodePtBR,
  partnerTour: partnerTourPtBR,
  arrivalNotice: arrivalNoticePtBR,
  legal: legalPtBR,
  verification: verificationPtBR,
  emailVerification: emailVerificationPtBR,
  common: {
    language: 'Idioma',
    loading: 'Carregando…',
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
    profileTitle: 'Perfil',
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
    itemUnavailable: 'Este item não está mais disponível.',
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
    back: 'Voltar',
    appearance: 'Aparência',
    language: 'Idioma do Guide',
    support: 'Suporte',
    about: 'Sobre o app',
    theme: { light: 'Claro', dark: 'Escuro', system: 'Sistema' },
    themeDescription: {
      light: 'Tema com tonalidade clara',
      dark: 'Tema escuro, o padrão do app',
      system: 'Acompanha a preferência do dispositivo',
    },
  },
  favorites: {
    title: 'Meus favoritos',
    emptyTitle: 'Nenhum favorito salvo',
    emptyDescription:
      'Você ainda não favoritou nenhum item. Explore o guia e toque no coração para guardar o que gostou.',
    removeItem: 'Remover {{name}} dos favoritos',
  },
};
/** pt-BR vai no arquivo inicial; en e fr são baixados só para quem usa (AGENTS.md §12.2, DESIGN.md P11). */
export { ptBR };
