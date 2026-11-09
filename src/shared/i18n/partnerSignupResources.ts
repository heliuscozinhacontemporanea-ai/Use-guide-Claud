// Apresentação e cadastro de parceiro (V1/V2, aprovados em 2026-11-09). Tom neutro: taxas, prazos e
// planos ficam nos termos do parceiro.
export interface PartnerSignupTranslation {
  presentation: {
    title: string;
    subtitle: string;
    visibilityTitle: string;
    visibilityText: string;
    paymentTitle: string;
    paymentText: string;
    panelTitle: string;
    panelText: string;
    trustTitle: string;
    trustText: string;
    start: string;
    footnote: string;
  };
  form: {
    title: string;
    step: string;
    back: string;
    next: string;
    submit: string;
    sending: string;
  };
  categories: {
    hotel: string;
    restaurant: string;
    sight: string;
    tour: string;
    transfer: string;
    rental: string;
    producer: string;
  };
  step1: {
    question: string;
    lockedCategory: string;
    nameLabel: string;
    nameLabelProducer: string;
    namePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    chooseFirst: string;
  };
}

export const partnerSignupPtBR: PartnerSignupTranslation = {
  presentation: {
    title: 'Seu negócio no Use Guide',
    subtitle:
      'Um guia feito para quem viaja, com espaço para você mostrar o que tem de melhor e atender bem do começo ao fim.',
    visibilityTitle: 'Visto por quem está viajando',
    visibilityText: 'Seu negócio no guia, na busca e no mapa, em português, inglês e francês.',
    paymentTitle: 'Vendas com pagamento seguro',
    paymentText: 'Pix ou cartão pelo app, com confirmação automática para você e para o cliente.',
    panelTitle: 'Tudo num só painel',
    panelText: 'Agenda, portaria, avaliações e relatórios, no celular.',
    trustTitle: 'Confiança para quem compra',
    trustText: 'Estabelecimentos verificados mostram ao viajante que podem contar com você.',
    start: 'Começar cadastro',
    footnote: 'O cadastro é rápido, e o painel mostra cada passo até você começar a vender.',
  },
  form: {
    title: 'Cadastro de parceiro',
    step: '{{current}} de {{total}}',
    back: 'Voltar',
    next: 'Continuar',
    submit: 'Enviar cadastro',
    sending: 'Enviando…',
  },
  categories: {
    hotel: 'Hospedagem',
    restaurant: 'Restaurante',
    sight: 'Atração',
    tour: 'Passeios',
    transfer: 'Translados',
    rental: 'Aluguéis',
    producer: 'Eventos',
  },
  step1: {
    question: 'O que você oferece?',
    lockedCategory: 'A categoria não muda depois do cadastro.',
    nameLabel: 'Nome do negócio',
    nameLabelProducer: 'Nome do produtor',
    namePlaceholder: 'Ex.: Pousada Mar Azul',
    descriptionLabel: 'Descrição',
    descriptionPlaceholder: 'Conte o que torna seu negócio especial.',
    chooseFirst: 'Escolha uma opção acima para continuar.',
  },
};

export const partnerSignupEn: PartnerSignupTranslation = {
  presentation: {
    title: 'Your business on Use Guide',
    subtitle:
      'A guide made for travelers, with room for you to show your best and serve them well from start to finish.',
    visibilityTitle: 'Seen by people on the road',
    visibilityText:
      'Your business in the guide, search and map, in Portuguese, English and French.',
    paymentTitle: 'Sales with secure payment',
    paymentText: 'Pix or card in the app, with automatic confirmation for you and the customer.',
    panelTitle: 'Everything in one dashboard',
    panelText: 'Schedule, check-in, reviews and reports, on your phone.',
    trustTitle: 'Trust for buyers',
    trustText: 'Verified businesses show travelers they can count on you.',
    start: 'Start sign-up',
    footnote: 'Sign-up is quick, and the dashboard shows every step until you start selling.',
  },
  form: {
    title: 'Partner sign-up',
    step: '{{current}} of {{total}}',
    back: 'Back',
    next: 'Continue',
    submit: 'Send sign-up',
    sending: 'Sending…',
  },
  categories: {
    hotel: 'Lodging',
    restaurant: 'Restaurant',
    sight: 'Attraction',
    tour: 'Tours',
    transfer: 'Transfers',
    rental: 'Rentals',
    producer: 'Events',
  },
  step1: {
    question: 'What do you offer?',
    lockedCategory: 'The category cannot change after sign-up.',
    nameLabel: 'Business name',
    nameLabelProducer: 'Producer name',
    namePlaceholder: 'E.g. Pousada Mar Azul',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Tell what makes your business special.',
    chooseFirst: 'Choose an option above to continue.',
  },
};

export const partnerSignupFr: PartnerSignupTranslation = {
  presentation: {
    title: 'Votre activité sur Use Guide',
    subtitle:
      'Un guide fait pour les voyageurs, avec de la place pour montrer le meilleur de vous et bien les accueillir du début à la fin.',
    visibilityTitle: 'Vu par ceux qui voyagent',
    visibilityText:
      'Votre activité dans le guide, la recherche et la carte, en portugais, anglais et français.',
    paymentTitle: 'Ventes avec paiement sécurisé',
    paymentText: 'Pix ou carte dans l’app, avec confirmation automatique pour vous et le client.',
    panelTitle: 'Tout dans un seul tableau de bord',
    panelText: 'Agenda, contrôle des entrées, avis et rapports, sur le téléphone.',
    trustTitle: 'De la confiance pour les acheteurs',
    trustText:
      'Les établissements vérifiés montrent aux voyageurs qu’ils peuvent compter sur vous.',
    start: 'Commencer l’inscription',
    footnote:
      'L’inscription est rapide, et le tableau de bord montre chaque étape jusqu’à vos premières ventes.',
  },
  form: {
    title: 'Inscription partenaire',
    step: '{{current}} sur {{total}}',
    back: 'Retour',
    next: 'Continuer',
    submit: 'Envoyer l’inscription',
    sending: 'Envoi…',
  },
  categories: {
    hotel: 'Hébergement',
    restaurant: 'Restaurant',
    sight: 'Attraction',
    tour: 'Excursions',
    transfer: 'Transferts',
    rental: 'Locations',
    producer: 'Événements',
  },
  step1: {
    question: 'Que proposez-vous ?',
    lockedCategory: 'La catégorie ne change plus après l’inscription.',
    nameLabel: 'Nom de l’activité',
    nameLabelProducer: 'Nom du producteur',
    namePlaceholder: 'Ex. : Pousada Mar Azul',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Dites ce qui rend votre activité spéciale.',
    chooseFirst: 'Choisissez une option ci-dessus pour continuer.',
  },
};
