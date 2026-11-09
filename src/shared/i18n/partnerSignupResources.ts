// Apresentação e cadastro de parceiro (V1/V2, aprovados em 2026-11-09). Tom neutro: taxas, prazos e
// planos ficam nos termos do parceiro.
import {
  type PartnerSignupDetailsTranslation,
  partnerSignupDetailsEn,
  partnerSignupDetailsFr,
  partnerSignupDetailsPtBR,
} from './partnerSignupDetailsResources';
import {
  type PartnerSignupErrorsTranslation,
  partnerSignupErrorsEn,
  partnerSignupErrorsFr,
  partnerSignupErrorsPtBR,
} from './partnerSignupErrorResources';

export interface PartnerSignupTranslation {
  details: PartnerSignupDetailsTranslation;
  errors: PartnerSignupErrorsTranslation;
  processing: { title: string; text: string };
  editor: {
    newTitle: string;
    editTitle: string;
    contactTitle: string;
    save: string;
    saving: string;
    saved: string;
    saveFailed: string;
    delete: string;
    deleteTitle: string;
    deleteText: string;
    deleted: string;
    deleteFailed: string;
  };
  yes: string;
  no: string;
  detailsTitle: string;
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
  step5: {
    title: string;
    edit: string;
    business: string;
    contact: string;
    details: string;
    detailsHint: string;
    extras: string;
    extrasHint: string;
    photos: string;
    photosHint: string;
    addPhoto: string;
    removePhoto: string;
    photoAlt: string;
    photosRequired: string;
    tooManyPhotos: string;
    photoTooBig: string;
    account: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordHint: string;
    confirmPassword: string;
    showPassword: string;
    hidePassword: string;
    passwordMismatch: string;
    rules: { length: string; upper: string; lower: string; number: string };
    terms: string;
    termsHint: string;
  };
  success: { title: string; text: string; openPanel: string; later: string };
  step2: {
    phone: string;
    instagram: string;
    instagramPlaceholder: string;
    website: string;
    booking: string;
    bookingPlaceholder: string;
    maps: string;
    mapsPlaceholder: string;
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
  details: partnerSignupDetailsPtBR,
  errors: partnerSignupErrorsPtBR,
  editor: {
    newTitle: 'Novo cadastro',
    editTitle: 'Editar cadastro',
    contactTitle: 'Contato e local',
    save: 'Salvar',
    saving: 'Salvando…',
    saved: 'Cadastro salvo.',
    saveFailed: 'Não foi possível salvar. Tente de novo.',
    delete: 'Excluir cadastro',
    deleteTitle: 'Excluir {{name}}?',
    deleteText: 'O cadastro sai do guia e não pode ser recuperado.',
    deleted: 'Cadastro excluído.',
    deleteFailed: 'Não foi possível excluir. Tente de novo.',
  },
  processing: {
    title: 'Enviando seu cadastro',
    text: 'Estamos guardando as informações e as fotos. Isso leva alguns segundos.',
  },
  yes: 'Sim',
  no: 'Não',
  detailsTitle: 'Detalhes',
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
  step2: {
    phone: 'Telefone ou WhatsApp',
    instagram: 'Instagram',
    instagramPlaceholder: '@seunegocio',
    website: 'Site',
    booking: 'Link de reserva',
    bookingPlaceholder: 'Seu anúncio em sites de reserva',
    maps: 'Localização no Google Maps',
    mapsPlaceholder: 'Cole o link do Google Maps',
  },
  success: {
    title: 'Cadastro enviado',
    text: '{{name}} já está no seu painel. Lá você vê os próximos passos para começar a vender.',
    openPanel: 'Abrir meu painel',
    later: 'Agora não',
  },
  step5: {
    title: 'Revisar e enviar',
    edit: 'Editar',
    business: 'Seu negócio',
    contact: 'Contato e local',
    details: 'Detalhes',
    detailsHint: 'Horários, estrutura e o que está incluído',
    extras: 'Informações extras',
    extrasHint: 'Idiomas e serviços',
    photos: 'Fotos',
    photosHint: 'Até 5 fotos de até 3 MB.',
    addPhoto: 'Adicionar foto',
    removePhoto: 'Remover foto',
    photoAlt: 'Foto {{index}}',
    photosRequired: 'Adicione ao menos 1 foto para enviar.',
    tooManyPhotos: 'Você pode escolher no máximo 5 fotos.',
    photoTooBig: 'A foto {{name}} passa de 3 MB.',
    account: 'Sua conta',
    firstName: 'Nome',
    lastName: 'Sobrenome',
    email: 'E-mail',
    password: 'Senha',
    passwordHint: '8 a 20 caracteres, com maiúscula, minúscula e número.',
    confirmPassword: 'Confirme a senha',
    showPassword: 'Mostrar senha',
    hidePassword: 'Esconder senha',
    passwordMismatch: 'As senhas não são iguais.',
    rules: {
      length: '8 a 20 caracteres',
      upper: 'Letra maiúscula',
      lower: 'Letra minúscula',
      number: 'Número',
    },
    terms: 'Li e aceito os Termos do parceiro.',
    termsHint: 'Confirmo que as informações são verdadeiras.',
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
  details: partnerSignupDetailsEn,
  errors: partnerSignupErrorsEn,
  editor: {
    newTitle: 'New listing',
    editTitle: 'Edit listing',
    contactTitle: 'Contact and location',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Listing saved.',
    saveFailed: "Couldn't save. Try again.",
    delete: 'Delete listing',
    deleteTitle: 'Delete {{name}}?',
    deleteText: "The listing leaves the guide and can't be restored.",
    deleted: 'Listing deleted.',
    deleteFailed: "Couldn't delete. Try again.",
  },
  processing: {
    title: 'Sending your sign-up',
    text: 'We are saving your details and photos. This takes a few seconds.',
  },
  yes: 'Yes',
  no: 'No',
  detailsTitle: 'Details',
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
  step2: {
    phone: 'Phone or WhatsApp',
    instagram: 'Instagram',
    instagramPlaceholder: '@yourbusiness',
    website: 'Website',
    booking: 'Booking link',
    bookingPlaceholder: 'Your listing on booking sites',
    maps: 'Location on Google Maps',
    mapsPlaceholder: 'Paste the Google Maps link',
  },
  success: {
    title: 'Sign-up sent',
    text: '{{name}} is now in your dashboard, where you will see the next steps to start selling.',
    openPanel: 'Open my dashboard',
    later: 'Not now',
  },
  step5: {
    title: 'Review and send',
    edit: 'Edit',
    business: 'Your business',
    contact: 'Contact and location',
    details: 'Details',
    detailsHint: 'Hours, facilities and what is included',
    extras: 'Extra information',
    extrasHint: 'Languages and services',
    photos: 'Photos',
    photosHint: 'Up to 5 photos of up to 3 MB.',
    addPhoto: 'Add photo',
    removePhoto: 'Remove photo',
    photoAlt: 'Photo {{index}}',
    photosRequired: 'Add at least 1 photo to send.',
    tooManyPhotos: 'You can choose up to 5 photos.',
    photoTooBig: 'Photo {{name}} is over 3 MB.',
    account: 'Your account',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    password: 'Password',
    passwordHint: '8 to 20 characters, with uppercase, lowercase and a number.',
    confirmPassword: 'Confirm password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    passwordMismatch: 'The passwords do not match.',
    rules: {
      length: '8 to 20 characters',
      upper: 'Uppercase letter',
      lower: 'Lowercase letter',
      number: 'Number',
    },
    terms: 'I have read and accept the Partner terms.',
    termsHint: 'I confirm the information is true.',
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
  details: partnerSignupDetailsFr,
  errors: partnerSignupErrorsFr,
  editor: {
    newTitle: 'Nouvelle fiche',
    editTitle: 'Modifier la fiche',
    contactTitle: 'Contact et lieu',
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    saved: 'Fiche enregistrée.',
    saveFailed: "Impossible d'enregistrer. Réessayez.",
    delete: 'Supprimer la fiche',
    deleteTitle: 'Supprimer {{name}} ?',
    deleteText: 'La fiche quitte le guide et ne peut pas être restaurée.',
    deleted: 'Fiche supprimée.',
    deleteFailed: 'Impossible de supprimer. Réessayez.',
  },
  processing: {
    title: 'Envoi de votre inscription',
    text: 'Nous enregistrons vos informations et vos photos. Cela prend quelques secondes.',
  },
  yes: 'Oui',
  no: 'Non',
  detailsTitle: 'Détails',
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
  step2: {
    phone: 'Téléphone ou WhatsApp',
    instagram: 'Instagram',
    instagramPlaceholder: '@votreactivite',
    website: 'Site',
    booking: 'Lien de réservation',
    bookingPlaceholder: 'Votre annonce sur les sites de réservation',
    maps: 'Emplacement sur Google Maps',
    mapsPlaceholder: 'Collez le lien Google Maps',
  },
  success: {
    title: 'Inscription envoyée',
    text: '{{name}} est dans votre tableau de bord, avec les prochaines étapes pour commencer à vendre.',
    openPanel: 'Ouvrir mon tableau de bord',
    later: 'Plus tard',
  },
  step5: {
    title: 'Vérifier et envoyer',
    edit: 'Modifier',
    business: 'Votre activité',
    contact: 'Contact et lieu',
    details: 'Détails',
    detailsHint: 'Horaires, équipements et ce qui est inclus',
    extras: 'Informations supplémentaires',
    extrasHint: 'Langues et services',
    photos: 'Photos',
    photosHint: 'Jusqu’à 5 photos de 3 Mo maximum.',
    addPhoto: 'Ajouter une photo',
    removePhoto: 'Retirer la photo',
    photoAlt: 'Photo {{index}}',
    photosRequired: 'Ajoutez au moins 1 photo pour envoyer.',
    tooManyPhotos: 'Vous pouvez choisir 5 photos au maximum.',
    photoTooBig: 'La photo {{name}} dépasse 3 Mo.',
    account: 'Votre compte',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'E-mail',
    password: 'Mot de passe',
    passwordHint: '8 à 20 caractères, avec majuscule, minuscule et chiffre.',
    confirmPassword: 'Confirmez le mot de passe',
    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',
    passwordMismatch: 'Les mots de passe ne sont pas identiques.',
    rules: {
      length: '8 à 20 caractères',
      upper: 'Majuscule',
      lower: 'Minuscule',
      number: 'Chiffre',
    },
    terms: 'J’ai lu et j’accepte les Conditions partenaire.',
    termsHint: 'Je confirme que les informations sont exactes.',
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
