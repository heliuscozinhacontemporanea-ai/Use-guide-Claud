/** Catálogo do painel do parceiro (p09) e página do estabelecimento (p19). */
export interface PartnerCatalogTranslation {
  create: string;
  emptyPlaces: string;
  emptyEvents: string;
  loadError: string;
  sessions_one: string;
  sessions_other: string;
  next: string;
  endedOn: string;
  status: {
    published: string;
    verified: string;
    draft: string;
    paused: string;
    ended: string;
    pending: string;
  };
  sold_one: string;
  sold_other: string;
  missing: { cover: string; sessions: string };
  establishment: {
    edit: string;
    planActive: string;
    noPlan: string;
    seePlans: string;
    pause: string;
    resume: string;
    rating: string;
    noRating: string;
    reviews_one: string;
    reviews_other: string;
    offers: string;
    reviewsTitle: string;
  };
}

export const partnerCatalogPtBR: PartnerCatalogTranslation = {
  create: 'Criar',
  emptyPlaces: 'Nenhum estabelecimento ainda.',
  emptyEvents: 'Nenhum evento ainda.',
  loadError: 'Não foi possível carregar os eventos.',
  sessions_one: '{{count}} sessão',
  sessions_other: '{{count}} sessões',
  next: 'próxima {{date}}',
  endedOn: 'Encerrado em {{date}}',
  status: {
    published: 'Publicado',
    verified: 'verificado',
    draft: 'Rascunho',
    paused: 'Pausado',
    ended: 'Encerrado',
    pending: 'verificação em análise',
  },
  sold_one: '{{count}} vendido',
  sold_other: '{{count}} vendidos',
  missing: { cover: 'falta a foto de capa', sessions: 'falta a data' },
  establishment: {
    edit: 'Editar',
    planActive: 'Plano {{plan}} até {{date}} · selo ativo',
    noPlan: 'Sem plano ativo',
    seePlans: 'Ver planos',
    pause: 'Pausar no guia',
    resume: 'Publicar no guia',
    rating: 'Avaliação',
    noRating: 'Sem nota ainda',
    reviews_one: '{{count}} avaliação',
    reviews_other: '{{count}} avaliações',
    offers: 'Passeios e aluguéis',
    reviewsTitle: 'Avaliações',
  },
};

export const partnerCatalogEn: PartnerCatalogTranslation = {
  create: 'Create',
  emptyPlaces: 'No businesses yet.',
  emptyEvents: 'No events yet.',
  loadError: "Couldn't load the events.",
  sessions_one: '{{count}} session',
  sessions_other: '{{count}} sessions',
  next: 'next {{date}}',
  endedOn: 'Ended on {{date}}',
  status: {
    published: 'Published',
    verified: 'verified',
    draft: 'Draft',
    paused: 'Paused',
    ended: 'Ended',
    pending: 'verification under review',
  },
  sold_one: '{{count}} sold',
  sold_other: '{{count}} sold',
  missing: { cover: 'cover photo missing', sessions: 'date missing' },
  establishment: {
    edit: 'Edit',
    planActive: '{{plan}} plan until {{date}} · badge active',
    noPlan: 'No active plan',
    seePlans: 'See plans',
    pause: 'Pause in the guide',
    resume: 'Publish in the guide',
    rating: 'Rating',
    noRating: 'No rating yet',
    reviews_one: '{{count}} review',
    reviews_other: '{{count}} reviews',
    offers: 'Tours and rentals',
    reviewsTitle: 'Reviews',
  },
};

export const partnerCatalogFr: PartnerCatalogTranslation = {
  create: 'Créer',
  emptyPlaces: 'Aucun établissement pour le moment.',
  emptyEvents: 'Aucun événement pour le moment.',
  loadError: 'Impossible de charger les événements.',
  sessions_one: '{{count}} séance',
  sessions_other: '{{count}} séances',
  next: 'prochaine {{date}}',
  endedOn: 'Terminé le {{date}}',
  status: {
    published: 'Publié',
    verified: 'vérifié',
    draft: 'Brouillon',
    paused: 'En pause',
    ended: 'Terminé',
    pending: 'vérification en cours',
  },
  sold_one: '{{count}} vendu',
  sold_other: '{{count}} vendus',
  missing: { cover: 'photo de couverture manquante', sessions: 'date manquante' },
  establishment: {
    edit: 'Modifier',
    planActive: "Formule {{plan}} jusqu'au {{date}} · badge actif",
    noPlan: 'Aucune formule active',
    seePlans: 'Voir les formules',
    pause: 'Mettre en pause dans le guide',
    resume: 'Publier dans le guide',
    rating: 'Note',
    noRating: 'Pas encore de note',
    reviews_one: '{{count}} avis',
    reviews_other: '{{count}} avis',
    offers: 'Excursions et locations',
    reviewsTitle: 'Avis',
  },
};
