/** Textos do cabeçalho e das abas do painel admin. pt-BR é a fonte. */
type Tabs = {
  reports: string;
  partners: string;
  items: string;
  events: string;
  plans: string;
  notifications: string;
};

/** Aba "Guia local": anúncios e dicas no editor do parceiro (escolhas da F4). */
type Guide = {
  newTip: string;
  newListing: string;
  filtersLabel: string;
  filters: { all: string; useguide: string; partners: string; tips: string };
  tags: { draft: string; useguide: string; partner: string; tip: string; paused: string };
  empty: string;
  loading: string;
  loadError: string;
  retry: string;
  newTitle: string;
  editorTitle: string;
  newLater: string;
  created: string;
  phoneTitle: string;
  ownerUseGuide: string;
  ownerPartner: string;
  unknownName: string;
  adminOnly: string;
  seal: string;
  publish: string;
  publishHint: string;
  editLater: string;
  pause: string;
  resume: string;
  paused: string;
  resumed: string;
  pauseFailed: string;
  listingError: string;
};

type Tip = {
  newTitle: string;
  editTitle: string;
  title: string;
  titlePlaceholder: string;
  text: string;
  textPlaceholder: string;
  region: string;
  photos: string;
  note: string;
  publish: string;
  save: string;
  published: string;
  saved: string;
  failed: string;
  invalid: string;
  delete: string;
  deleteTitle: string;
  deleteMessage: string;
  deleted: string;
  deleteFailed: string;
};

export interface AdminPanelTranslation {
  title: string;
  back: string;
  tabsLabel: string;
  save: string;
  tabs: Tabs;
  guide: Guide;
  tip: Tip;
}

export const adminPanelPtBR: AdminPanelTranslation = {
  title: 'Painel admin',
  back: 'Voltar para o início',
  tabsLabel: 'Seções do painel admin',
  save: 'Salvar',
  tabs: {
    reports: 'Relatórios',
    partners: 'Parceiros',
    items: 'Guia local',
    events: 'Agenda',
    plans: 'Planos',
    notifications: 'Avisos',
  },
  guide: {
    newTip: 'Nova dica',
    newListing: 'Novo anúncio',
    filtersLabel: 'Filtrar o guia',
    filters: { all: 'Todos', useguide: 'Do Use Guide', partners: 'De parceiros', tips: 'Dicas' },
    tags: {
      draft: 'Rascunho',
      useguide: 'Use Guide',
      partner: 'Parceiro',
      tip: 'Dica',
      paused: 'Pausado',
    },
    empty: 'Nada nesta lista.',
    loading: 'Carregando o guia…',
    loadError: 'Não foi possível carregar o guia.',
    retry: 'Tentar de novo',
    newTitle: 'Novo anúncio',
    editorTitle: 'Editar anúncio',
    newLater:
      'O anúncio fica com o Use Guide e nasce como rascunho. O resto você completa nos blocos.',
    created: 'Rascunho criado. Complete os blocos e publique.',
    phoneTitle: 'WhatsApp do lugar',
    ownerUseGuide: 'Dono: <b>Use Guide</b>. Não vende pelo app.',
    ownerPartner:
      'Anúncio de parceiro: <b>{{name}}</b>. As mudanças do admin ficam no registro de auditoria.',
    unknownName: 'conta sem nome',
    adminOnly: 'Só o admin',
    seal: 'Selo de verificado',
    publish: 'Publicar no guia',
    editLater: 'Você pode editar tudo depois, no Guia local.',
    publishHint: 'Para publicar: nome, cidade, região e 1 foto.',
    pause: 'Pausar no guia',
    resume: 'Voltar ao guia',
    paused: 'Anúncio pausado no guia.',
    resumed: 'Anúncio de volta ao guia.',
    pauseFailed: 'Não foi possível mudar agora. Tente de novo.',
    listingError: 'Não foi possível abrir o anúncio.',
  },
  tip: {
    newTitle: 'Nova dica',
    editTitle: 'Editar dica',
    title: 'Título',
    titlePlaceholder: 'Ex.: Pôr do sol na Duna',
    text: 'Texto',
    textPlaceholder: 'O que vale saber antes de ir',
    region: 'Região',
    photos: 'Fotos',
    note: 'Dica não tem dono: é conteúdo do Use Guide e vai para o guia ao salvar.',
    publish: 'Publicar',
    save: 'Salvar',
    published: 'Dica publicada.',
    saved: 'Dica salva.',
    failed: 'Não foi possível salvar a dica. Tente de novo.',
    invalid: 'Preencha o título, o texto e pelo menos 1 foto.',
    delete: 'Excluir dica',
    deleteTitle: 'Excluir {{name}}?',
    deleteMessage: 'A dica sai do guia e não pode ser recuperada.',
    deleted: 'Dica excluída.',
    deleteFailed: 'Não foi possível excluir a dica. Tente de novo.',
  },
};
