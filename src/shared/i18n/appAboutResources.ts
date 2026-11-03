/** Textos de Sobre o app, Licenças e créditos e Notificações (Configurações). pt-BR é a fonte. */
export interface AppAboutTranslation {
  title: string;
  tagline: string;
  groupUseGuide: string;
  groupLegal: string;
  groupApp: string;
  company: string;
  companyParagraphs: string[];
  partners: string;
  contact: string;
  versionRow: string;
  build: string;
  licenses: string;
  rights: string;
  licensesTitle: string;
  licensesIntro: string;
  credits: string;
  hamsterWork: string;
  creditBy: string;
  libraries: string;
  project: string;
  loadError: string;
  retry: string;
  notifications: {
    title: string;
    intro: string;
    reviews: string;
    reviewsHint: string;
    plan: string;
    planHint: string;
    loadError: string;
    saveError: string;
  };
}

export const appAboutPtBR: AppAboutTranslation = {
  title: 'Sobre o app',
  tagline: 'Jericoacoara, Preá e Barrinha de Baixo num só app',
  groupUseGuide: 'Use Guide',
  groupLegal: 'Jurídico',
  groupApp: 'Aplicativo',
  company: 'Quem somos',
  companyParagraphs: [
    'O Use Guide reúne em um só lugar o que você precisa para aproveitar Jericoacoara, Preá e Barrinha de Baixo: onde ficar, onde comer, o que fazer e quando o vento está bom.',
    'Para quem visita: informações organizadas, avaliações de quem já esteve lá e compra de ingressos, passeios, aluguéis e traslados com pagamento seguro.',
    'Para quem trabalha na região: uma vitrine para pousadas, restaurantes, guias e organizadores de eventos, com venda direta pelo app e repasse depois do serviço.',
  ],
  partners: 'Seja um parceiro',
  contact: 'Fale com a gente',
  versionRow: 'Versão',
  build: 'build {{revision}}',
  licenses: 'Licenças e créditos',
  rights: '© {{year}} Use Guide. Todos os direitos reservados.',
  licensesTitle: 'Licenças e créditos',
  licensesIntro:
    'O Use Guide usa projetos de código aberto e trabalhos de outros autores. Agradecemos a quem os criou.',
  credits: 'Créditos',
  hamsterWork: 'Animação do hamster na página não encontrada',
  creditBy: 'por {{author}} · {{source}}',
  libraries: 'Bibliotecas de código aberto',
  project: 'Página do projeto',
  loadError: 'Não foi possível carregar as licenças.',
  retry: 'Tentar de novo',
  notifications: {
    title: 'Notificações',
    intro: 'Escolha os avisos que aparecem no seu painel de parceiro.',
    reviews: 'Avaliações recebidas',
    reviewsHint: 'Quando alguém avaliar um item ou evento seu.',
    plan: 'Vencimento do plano',
    planHint: 'Quando o plano de um estabelecimento estiver perto de vencer.',
    loadError: 'Não foi possível carregar suas notificações.',
    saveError: 'Não foi possível salvar. Tente de novo.',
  },
};

export const appAboutEn: AppAboutTranslation = {
  title: 'About the app',
  tagline: 'Jericoacoara, Preá and Barrinha de Baixo in one app',
  groupUseGuide: 'Use Guide',
  groupLegal: 'Legal',
  groupApp: 'App',
  company: 'Who we are',
  companyParagraphs: [
    'Use Guide brings together everything you need to enjoy Jericoacoara, Preá and Barrinha de Baixo: where to stay, where to eat, what to do and when the wind is good.',
    'For visitors: organized information, reviews from people who have been there and secure booking of tickets, tours, rentals and transfers.',
    'For local businesses: a showcase for guesthouses, restaurants, guides and event organizers, with direct sales in the app and payouts after the service.',
  ],
  partners: 'Become a partner',
  contact: 'Contact us',
  versionRow: 'Version',
  build: 'build {{revision}}',
  licenses: 'Licenses and credits',
  rights: '© {{year}} Use Guide. All rights reserved.',
  licensesTitle: 'Licenses and credits',
  licensesIntro:
    'Use Guide relies on open source projects and work by other authors. Thank you to everyone who made them.',
  credits: 'Credits',
  hamsterWork: 'Hamster animation on the page not found',
  creditBy: 'by {{author}} · {{source}}',
  libraries: 'Open source libraries',
  project: 'Project page',
  loadError: 'We couldn’t load the licenses.',
  retry: 'Try again',
  notifications: {
    title: 'Notifications',
    intro: 'Choose the alerts that show up in your partner panel.',
    reviews: 'Reviews received',
    reviewsHint: 'When someone reviews one of your items or events.',
    plan: 'Plan expiring',
    planHint: 'When a business plan is about to expire.',
    loadError: 'We couldn’t load your notifications.',
    saveError: 'We couldn’t save. Try again.',
  },
};

export const appAboutFr: AppAboutTranslation = {
  title: 'À propos de l’app',
  tagline: 'Jericoacoara, Preá et Barrinha de Baixo dans une seule app',
  groupUseGuide: 'Use Guide',
  groupLegal: 'Mentions légales',
  groupApp: 'Application',
  company: 'Qui sommes-nous',
  companyParagraphs: [
    'Use Guide réunit tout ce qu’il faut pour profiter de Jericoacoara, Preá et Barrinha de Baixo : où dormir, où manger, que faire et quand le vent est bon.',
    'Pour les visiteurs : des informations organisées, des avis de personnes qui y sont allées et l’achat sécurisé de billets, excursions, locations et transferts.',
    'Pour les professionnels de la région : une vitrine pour pousadas, restaurants, guides et organisateurs d’événements, avec vente directe dans l’app et versement après la prestation.',
  ],
  partners: 'Devenir partenaire',
  contact: 'Nous contacter',
  versionRow: 'Version',
  build: 'build {{revision}}',
  licenses: 'Licences et crédits',
  rights: '© {{year}} Use Guide. Tous droits réservés.',
  licensesTitle: 'Licences et crédits',
  licensesIntro:
    'Use Guide s’appuie sur des projets open source et le travail d’autres auteurs. Merci à celles et ceux qui les ont créés.',
  credits: 'Crédits',
  hamsterWork: 'Animation du hamster de la page introuvable',
  creditBy: 'par {{author}} · {{source}}',
  libraries: 'Bibliothèques open source',
  project: 'Page du projet',
  loadError: 'Impossible de charger les licences.',
  retry: 'Réessayer',
  notifications: {
    title: 'Notifications',
    intro: 'Choisissez les alertes affichées dans votre espace partenaire.',
    reviews: 'Avis reçus',
    reviewsHint: 'Quand quelqu’un évalue l’un de vos éléments ou événements.',
    plan: 'Expiration de l’abonnement',
    planHint: 'Quand l’abonnement d’un établissement arrive bientôt à échéance.',
    loadError: 'Impossible de charger vos notifications.',
    saveError: 'Impossible d’enregistrer. Réessayez.',
  },
};
