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
  deleteTitle: string;
  deleteMessage: string;
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

export const myReviewsPtBR: MyReviewsTranslation = {
  title: 'Minhas avaliações',
  loading: 'Carregando suas avaliações…',
  empty: 'Você ainda não avaliou nenhum lugar.',
  loadMore: 'Ver mais',
  verified: 'Experiência verificada',
  stars: '{{value}} de 5 estrelas',
  rateWith_one: 'Dar {{count}} estrela',
  rateWith_other: 'Dar {{count}} estrelas',
  partnerResponse: 'Resposta do estabelecimento',
  unknownPlace: 'Lugar fora do guia',
  moreOptions: 'Mais opções',
  edit: 'Editar',
  delete: 'Excluir',
  deleteTitle: 'Excluir esta avaliação?',
  deleteMessage: 'A ação é definitiva e não poderá ser recuperada.',
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
