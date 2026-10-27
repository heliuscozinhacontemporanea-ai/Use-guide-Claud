/** Textos do perfil (menu lateral com login) e de Minhas avaliações. pt-BR é a fonte. */
export interface ProfileTranslation {
  memberSince: string;
  next: string;
  nextTickets_one: string;
  nextTickets_other: string;
  nextParticipants_one: string;
  nextParticipants_other: string;
  tiles: { tickets: string; bookings: string; favorites: string; reviews: string };
  ticketsHint_one: string;
  ticketsHint_other: string;
  bookingsHint_one: string;
  bookingsHint_other: string;
  favoritesHint_one: string;
  favoritesHint_other: string;
  reviewsHint_one: string;
  reviewsHint_other: string;
  account: string;
  partnerProgram: string;
  logout: string;
}

export interface MyReviewsTranslation {
  title: string;
  back: string;
  loading: string;
  empty: string;
  loadMore: string;
  verified: string;
  stars: string;
  rateWith_one: string;
  rateWith_other: string;
  partnerResponse: string;
  unknownPlace: string;
  moreOptions: string;
  edit: string;
  delete: string;
  deleteConfirm: string;
  deleted: string;
  editTitle: string;
  ratingLabel: string;
  commentLabel: string;
  commentRequired: string;
  commentTooLong: string;
  ratingRequired: string;
  save: string;
  saving: string;
  saved: string;
  errors: { load: string; delete: string; save: string };
}

export const profilePtBR: ProfileTranslation = {
  memberSince: 'No Use Guide desde {{date}}',
  next: 'Próximo',
  nextTickets_one: '{{count}} ingresso',
  nextTickets_other: '{{count}} ingressos',
  nextParticipants_one: '{{count}} participante',
  nextParticipants_other: '{{count}} participantes',
  tiles: {
    tickets: 'Ingressos',
    bookings: 'Reservas',
    favorites: 'Favoritos',
    reviews: 'Avaliações',
  },
  ticketsHint_one: 'próximo',
  ticketsHint_other: 'próximos',
  bookingsHint_one: 'próxima',
  bookingsHint_other: 'próximas',
  favoritesHint_one: 'salvo',
  favoritesHint_other: 'salvos',
  reviewsHint_one: 'feita',
  reviewsHint_other: 'feitas',
  account: 'Minha conta',
  partnerProgram: 'Seja parceiro',
  logout: 'Sair da conta',
};

export const profileEn: ProfileTranslation = {
  memberSince: 'On Use Guide since {{date}}',
  next: 'Up next',
  nextTickets_one: '{{count}} ticket',
  nextTickets_other: '{{count}} tickets',
  nextParticipants_one: '{{count}} participant',
  nextParticipants_other: '{{count}} participants',
  tiles: { tickets: 'Tickets', bookings: 'Bookings', favorites: 'Favorites', reviews: 'Reviews' },
  ticketsHint_one: 'upcoming',
  ticketsHint_other: 'upcoming',
  bookingsHint_one: 'upcoming',
  bookingsHint_other: 'upcoming',
  favoritesHint_one: 'saved',
  favoritesHint_other: 'saved',
  reviewsHint_one: 'written',
  reviewsHint_other: 'written',
  account: 'My account',
  partnerProgram: 'Become a partner',
  logout: 'Sign out',
};

export const profileFr: ProfileTranslation = {
  memberSince: 'Sur Use Guide depuis {{date}}',
  next: 'À venir',
  nextTickets_one: '{{count}} billet',
  nextTickets_other: '{{count}} billets',
  nextParticipants_one: '{{count}} participant',
  nextParticipants_other: '{{count}} participants',
  tiles: { tickets: 'Billets', bookings: 'Réservations', favorites: 'Favoris', reviews: 'Avis' },
  ticketsHint_one: 'à venir',
  ticketsHint_other: 'à venir',
  bookingsHint_one: 'à venir',
  bookingsHint_other: 'à venir',
  favoritesHint_one: 'enregistré',
  favoritesHint_other: 'enregistrés',
  reviewsHint_one: 'publié',
  reviewsHint_other: 'publiés',
  account: 'Mon compte',
  partnerProgram: 'Devenir partenaire',
  logout: 'Se déconnecter',
};

export const myReviewsPtBR: MyReviewsTranslation = {
  title: 'Minhas avaliações',
  back: 'Voltar',
  loading: 'Carregando suas avaliações…',
  empty: 'Você ainda não avaliou nenhum lugar.',
  loadMore: 'Ver mais',
  verified: 'Experiência verificada · {{date}}',
  stars: '{{value}} de 5 estrelas',
  rateWith_one: 'Dar {{count}} estrela',
  rateWith_other: 'Dar {{count}} estrelas',
  partnerResponse: 'Resposta do estabelecimento',
  unknownPlace: 'Lugar fora do guia',
  moreOptions: 'Mais opções',
  edit: 'Editar',
  delete: 'Excluir',
  deleteConfirm: 'Excluir esta avaliação? Ela sai da página do lugar e não pode ser recuperada.',
  deleted: 'Avaliação excluída.',
  editTitle: 'Editar avaliação',
  ratingLabel: 'Sua nota',
  commentLabel: 'Comentário',
  commentRequired: 'Escreva um comentário sobre sua experiência.',
  commentTooLong: 'O comentário pode ter no máximo 500 caracteres.',
  ratingRequired: 'Escolha uma nota.',
  save: 'Salvar',
  saving: 'Salvando…',
  saved: 'Avaliação atualizada.',
  errors: {
    load: 'Não foi possível carregar suas avaliações.',
    delete: 'Não foi possível excluir a avaliação.',
    save: 'Não foi possível salvar a avaliação.',
  },
};

export const myReviewsEn: MyReviewsTranslation = {
  title: 'My reviews',
  back: 'Back',
  loading: 'Loading your reviews…',
  empty: 'You have not reviewed any place yet.',
  loadMore: 'Show more',
  verified: 'Verified experience · {{date}}',
  stars: '{{value}} out of 5 stars',
  rateWith_one: 'Give {{count}} star',
  rateWith_other: 'Give {{count}} stars',
  partnerResponse: 'Response from the business',
  unknownPlace: 'Place no longer in the guide',
  moreOptions: 'More options',
  edit: 'Edit',
  delete: 'Delete',
  deleteConfirm: 'Delete this review? It leaves the place page and cannot be recovered.',
  deleted: 'Review deleted.',
  editTitle: 'Edit review',
  ratingLabel: 'Your rating',
  commentLabel: 'Comment',
  commentRequired: 'Write a comment about your experience.',
  commentTooLong: 'The comment can have at most 500 characters.',
  ratingRequired: 'Choose a rating.',
  save: 'Save',
  saving: 'Saving…',
  saved: 'Review updated.',
  errors: {
    load: 'Could not load your reviews.',
    delete: 'Could not delete the review.',
    save: 'Could not save the review.',
  },
};

export const myReviewsFr: MyReviewsTranslation = {
  title: 'Mes avis',
  back: 'Retour',
  loading: 'Chargement de vos avis…',
  empty: 'Vous n’avez encore évalué aucun lieu.',
  loadMore: 'Voir plus',
  verified: 'Expérience vérifiée · {{date}}',
  stars: '{{value}} sur 5 étoiles',
  rateWith_one: 'Donner {{count}} étoile',
  rateWith_other: 'Donner {{count}} étoiles',
  partnerResponse: 'Réponse de l’établissement',
  unknownPlace: 'Lieu absent du guide',
  moreOptions: 'Plus d’options',
  edit: 'Modifier',
  delete: 'Supprimer',
  deleteConfirm:
    'Supprimer cet avis ? Il disparaît de la page du lieu et ne peut pas être récupéré.',
  deleted: 'Avis supprimé.',
  editTitle: 'Modifier l’avis',
  ratingLabel: 'Votre note',
  commentLabel: 'Commentaire',
  commentRequired: 'Écrivez un commentaire sur votre expérience.',
  commentTooLong: 'Le commentaire peut contenir au maximum 500 caractères.',
  ratingRequired: 'Choisissez une note.',
  save: 'Enregistrer',
  saving: 'Enregistrement…',
  saved: 'Avis mis à jour.',
  errors: {
    load: 'Impossible de charger vos avis.',
    delete: 'Impossible de supprimer l’avis.',
    save: 'Impossible d’enregistrer l’avis.',
  },
};
