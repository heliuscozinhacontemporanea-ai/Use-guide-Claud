// Apresentação e cadastro de parceiro (V1/V2, aprovados em 2026-11-09). Tom neutro: taxas, prazos e
// planos ficam nos termos do parceiro.
import {
  type PartnerSignupDetailsTranslation,
  partnerSignupDetailsPtBR,
} from './partnerSignupDetailsResources';
import {
  type PartnerSignupErrorsTranslation,
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
    phonePrivate: string;
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
    phonePrivate: 'Fica só com a plataforma: o cliente recebe depois da compra, pelo pedido.',
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
