// Seja parceiro em uma tela e guia de passos do anúncio no Início do painel (D34, F1).
export interface PartnerGuideTranslation {
  noneOfThese: string;
  draft: string;
  fields: { whatToBring: string; whatToBringPlaceholder: string };
  languages: { other: string; search: string; noResults: string; remove: string };
  join: {
    title: string;
    offer: string;
    name: string;
    nameProducer: string;
    namePlaceholder: string;
    namePlaceholderProducer: string;
    place: string;
    state: string;
    city: string;
    placeHint: string;
    phone: string;
    phoneHintSells: string;
    phoneHintShowcase: string;
    termsBefore: string;
    termsLink: string;
    later: string;
    create: string;
    creating: string;
    ready: string;
    accountTitle: string;
    accountLead: string;
    usernameTitle: string;
    verifyTitle: string;
    verifyLead: string;
    waiting: string;
    kept: string;
    resend: string;
    resent: string;
    resendIn: string;
    errors: { name: string; city: string; phone: string; terms: string; failed: string };
  };
  editor: {
    title: string;
    published: string;
    draft: string;
    paused: string;
    name: string;
    phone: string;
    delete: string;
    deleteTitle: string;
    deleteMessage: string;
    deleted: string;
    deleteFailed: string;
    hasBookings: string;
    hasEvents: string;
    photos_one: string;
    photos_other: string;
    noPhotos: string;
    empty: string;
    sellsNote: string;
    newTitle: string;
    createDraft: string;
    creatingDraft: string;
    draftCreated: string;
    newLater: string;
    phoneInvalid: string;
    done: string;
    missingCount_one: string;
    missingCount_other: string;
  };
  card: {
    listing: string;
    complete: string;
    toGuide: string;
    toSell: string;
    seal: string;
    continue: string;
    done: string;
    publish: string;
    publishLocked: string;
    published: string;
    publishedHint: string;
    slots: { title: string; hint: string; locked: string; done: string };
  };
  steps: {
    name: string;
    nameProducer: string;
    photos: string;
    about: string;
    where: string;
    details: string;
    details_hotel: string;
    details_restaurant: string;
    details_sight: string;
    details_tour: string;
    details_transfer: string;
    details_rental: string;
    contacts: string;
    contactsHint: string;
  };
  /** Páginas de oferta abertas pelo guia do Início (F3). */
  offer: {
    newTitle: string;
    slots: string;
    saved: string;
    /** Bloco Detalhes: o que saiu do anúncio e ficou na oferta (F3). */
    tourInOffer: string;
    sightPriceInOffer: string;
    rentalInOffer: string;
    transferInOffer: string;
  };
  page: {
    progress: string;
    next: string;
    nextPublish: string;
    save: string;
    create: string;
    open: string;
    saving: string;
    saved: string;
    missing: string;
    failed: string;
    lost: string;
    contactInText: string;
  };
  photos: { hint: string; add: string; cover: string; remove: string; uploading: string };
  about: { description: string; descriptionHint: string };
  where: { maps: string; mapsPlaceholder: string; mapsHint: string; transferHint: string };
  contacts: {
    instagram: string;
    site: string;
    noInstagram: string;
    noSite: string;
    noMenu: string;
  };
  publish: {
    title: string;
    preview: string;
    button: string;
    publishing: string;
    done: string;
    editLater: string;
    failed: string;
    incomplete: string;
  };
  missing: {
    name: string;
    state: string;
    city: string;
    images: string;
    description: string;
    languages: string;
    address: string;
    googleMapsLink: string;
    region: string;
    instagram: string;
    website: string;
    breakfast: string;
    amenities: string;
    checkIn: string;
    checkOut: string;
    children: string;
    pets: string;
    bookingLink: string;
    cuisine: string;
    meals: string;
    services: string;
    hours: string;
    menu: string;
    access: string;
    activities: string;
    itinerary: string;
    luggage: string;
    rentalItems: string;
    routes: string;
    vehicles: string;
  };
}

export const partnerGuidePtBR: PartnerGuideTranslation = {
  noneOfThese: 'Nenhuma destas',
  draft: 'Rascunho',
  fields: {
    whatToBring: 'O que levar',
    whatToBringPlaceholder: 'Ex.: protetor solar, roupa de banho e água',
  },
  languages: {
    other: 'Outro',
    search: 'Buscar idioma',
    noResults: 'Nenhum idioma com esse nome.',
    remove: 'Tirar {{language}}',
  },
  join: {
    title: 'Seu negócio',
    offer: 'O que você oferece',
    name: 'Nome do negócio',
    nameProducer: 'Nome do produtor',
    namePlaceholder: 'Ex.: Buggy Vento Leste',
    namePlaceholderProducer: 'Ex.: Luau Produções',
    place: 'Onde fica',
    state: 'Estado',
    city: 'Cidade',
    placeHint: 'Os horários dos seus serviços seguem o fuso desta cidade.',
    phone: 'Telefone ou WhatsApp do negócio',
    phoneHintSells: 'Fica só com a plataforma: o cliente recebe depois da compra, pelo pedido.',
    phoneHintShowcase: 'Aparece no anúncio, para quem quiser falar com você.',
    termsBefore: 'Li e aceito os',
    termsLink: 'Termos do parceiro',
    later: 'Fotos, detalhes e preços você completa depois no painel, com um guia passo a passo.',
    create: 'Criar meu painel',
    creating: 'Criando seu painel…',
    ready: 'Seu painel está pronto',
    accountTitle: 'Crie sua conta',
    accountLead:
      'Falta só a sua conta. O painel fica nela, e você entra com ela no celular ou no computador.',
    usernameTitle: 'Nome de usuário',
    verifyTitle: 'Confirme seu e-mail',
    verifyLead: 'Enviamos um link para {{email}}. Assim que você confirmar, seguimos daqui.',
    waiting: 'Esperando a confirmação',
    kept: 'Seus dados do negócio ficam guardados.',
    resend: 'Reenviar o e-mail',
    resent: 'E-mail reenviado. Confira também a caixa de spam.',
    resendIn: 'Reenviar em {{seconds}} s',
    errors: {
      name: 'Escreva o nome.',
      city: 'Escolha o estado e escreva a cidade.',
      phone: 'Escreva um telefone válido, com DDD.',
      terms: 'Para continuar, aceite os Termos do parceiro.',
      failed: 'Não foi possível criar o painel agora. Tente de novo.',
    },
  },
  editor: {
    title: 'Editar anúncio',
    published: 'Publicado no guia',
    draft: 'Rascunho: ainda fora do guia',
    paused: 'Pausado no guia',
    name: 'Nome e cidade',
    phone: 'WhatsApp do negócio',
    delete: 'Excluir anúncio',
    deleteTitle: 'Excluir "{{name}}"?',
    deleteMessage: 'O anúncio sai do guia e do painel. Isso não pode ser desfeito.',
    deleted: 'Anúncio excluído',
    deleteFailed: 'Não foi possível excluir agora. Tente de novo.',
    hasBookings:
      'Este anúncio tem reservas ativas e não pode ser excluído. Cancele os horários na agenda (com reembolso e multa) ou use Pausar no guia.',
    hasEvents:
      'Este anúncio tem eventos ligados e não pode ser excluído. Exclua ou mude os eventos, ou use Pausar no guia.',
    photos_one: '{{count}} foto',
    photos_other: '{{count}} fotos',
    noPhotos: 'Sem fotos',
    empty: 'Ainda não preenchido',
    sellsNote:
      'Quem vende pelo app não mostra Instagram nem site no anúncio: o contato é pelo app.',
    newTitle: 'Novo estabelecimento',
    createDraft: 'Criar rascunho',
    creatingDraft: 'Criando o rascunho…',
    draftCreated: 'Rascunho criado: siga o guia no Início',
    newLater: 'Fotos, detalhes e preços você completa no guia do Início.',
    phoneInvalid: 'Escreva um telefone válido, com DDD.',
    done: 'Completo',
    missingCount_one: 'Falta {{count}} item',
    missingCount_other: 'Faltam {{count}} itens',
  },
  card: {
    listing: 'Seu anúncio',
    complete: 'Complete seu anúncio',
    toGuide: 'Para aparecer no guia',
    toSell: 'Para vender',
    seal: 'Selo de verificado',
    continue: 'Continuar',
    done: '{{step}}, feito',
    publish: 'Publicar no guia',
    publishLocked: 'Depois dos passos acima',
    published: 'Publicado no guia',
    publishedHint: 'Quem viaja já encontra o seu anúncio.',
    slots: {
      title: 'Horários',
      hint: 'Abra as primeiras vagas na agenda.',
      locked: 'Depois da primeira oferta',
      done: 'Horários abertos',
    },
  },
  steps: {
    name: 'Nome e cidade',
    nameProducer: 'Nome do produtor e cidade',
    photos: 'Fotos',
    about: 'Sobre',
    where: 'Onde fica',
    details: 'Detalhes',
    details_hotel: 'Detalhes da hospedagem',
    details_restaurant: 'Detalhes do restaurante',
    details_sight: 'Detalhes da atração',
    details_tour: 'Detalhes do passeio',
    details_transfer: 'Detalhes do translado',
    details_rental: 'Detalhes do aluguel',
    contacts: 'Contatos e links',
    contactsHint: 'Instagram e site',
  },
  offer: {
    newTitle: 'Nova oferta',
    slots: 'Horários',
    saved: 'Oferta salva',
    tourInOffer:
      '<b>Duração, ponto de encontro, preço e vagas</b> ficam em cada oferta do passeio.',
    sightPriceInOffer:
      'Com acesso pago, <b>o preço da entrada</b> fica na oferta de entrada, que é o que o turista compra.',
    rentalInOffer: '<b>Preço, período e CNH</b> ficam em cada oferta: mudam por veículo.',
    transferInOffer:
      '<b>Preço, tipo (privativo ou compartilhado) e passageiros</b> ficam em cada oferta.',
  },
  page: {
    progress: 'Passo {{current}} de {{total}}',
    next: 'Próximo: {{step}}',
    nextPublish: 'Próximo: publicar no guia',
    save: 'Salvar',
    create: 'Criar',
    open: 'Abrir',
    saving: 'Salvando…',
    saved: 'Salvo',
    missing: 'Falta: {{fields}}',
    failed: 'Não foi possível salvar agora. Tente de novo.',
    lost: 'O anúncio está no guia: preencha {{fields}} antes de salvar.',
    contactInText: 'Tire telefone, e-mail, links, @ e chave Pix do texto: o contato é pelo app.',
  },
  photos: {
    hint: 'Pelo menos 1 foto. Com 5, o anúncio fica mais completo. A primeira é a capa.',
    add: 'Adicionar foto',
    cover: 'Capa',
    remove: 'Tirar a foto {{number}}',
    uploading: 'Enviando a foto…',
  },
  about: {
    description: 'Descrição',
    descriptionHint: 'Sem telefone ou Pix no texto: o contato é pelo app.',
  },
  where: {
    maps: 'Localização no Google Maps',
    mapsPlaceholder: 'Cole o link do Google Maps',
    mapsHint: 'No Google Maps, toque em Compartilhar e copie o link.',
    transferHint: 'Translado não precisa de endereço: escolha só a região onde você atende.',
  },
  contacts: {
    instagram: 'Instagram',
    site: 'Site',
    noInstagram: 'Não tenho Instagram',
    noSite: 'Não tenho site',
    noMenu: 'Não tenho cardápio online',
  },
  publish: {
    title: 'Publicar no guia',
    preview: 'Assim o seu anúncio aparece para quem viaja.',
    button: 'Publicar no guia',
    publishing: 'Publicando…',
    done: 'Publicado no guia',
    editLater: 'Você pode editar tudo depois, no Catálogo.',
    failed: 'Não foi possível publicar agora. Tente de novo.',
    incomplete: 'Ainda falta completar: {{steps}}.',
  },
  missing: {
    name: 'o nome',
    state: 'o estado',
    city: 'a cidade',
    images: 'uma foto',
    description: 'a descrição',
    languages: 'os idiomas',
    address: 'o endereço',
    googleMapsLink: 'o link do Google Maps',
    region: 'a região',
    instagram: 'o Instagram',
    website: 'o site',
    breakfast: 'o café da manhã',
    amenities: 'as comodidades',
    checkIn: 'o check-in',
    checkOut: 'o check-out',
    children: 'se aceita crianças',
    pets: 'a regra de pets',
    bookingLink: 'o link de reserva',
    cuisine: 'o tipo de cozinha',
    meals: 'as refeições',
    services: 'os serviços',
    hours: 'os horários de todos os dias',
    menu: 'o cardápio',
    access: 'o tipo de acesso',
    activities: 'as atividades',
    itinerary: 'o roteiro',
    luggage: 'o que levar ou a bagagem',
    rentalItems: 'o que você aluga',
    routes: 'uma rota',
    vehicles: 'os veículos',
  },
};
