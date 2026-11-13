/** Textos da equipe da portaria (C1): dono, pessoa convidada e erros. pt-BR é a fonte. */
export interface GateStaffTranslation {
  owner: {
    title: string;
    entryHint: string;
    intro: string;
    back: string;
    eventGroup: string;
    placeGroup: string;
    active: string;
    invited: string;
    noName: string;
    invite: string;
    empty: string;
    noEvents: string;
    placeEntries: string;
    loadError: string;
    invitedNotice: string;
    removedNotice: string;
  };
  sheet: {
    title: string;
    where: string;
    eventHint: string;
    placeHint: string;
    who: string;
    searchPlaceholder: string;
    canScan: string;
    canDownload: string;
    canCount: string;
    cannotSee: string;
    cannotEdit: string;
    send: string;
    sending: string;
  };
  member: {
    status: string;
    joined: string;
    entries: string;
    lastEntry: string;
    removeHint: string;
    cancelHint: string;
    remove: string;
    cancelInvite: string;
    removing: string;
  };
  mine: {
    title: string;
    intro: string;
    empty: string;
    loadError: string;
    sessionAt: string;
    opensAt: string;
    opensOn: string;
    placeAllTimes: string;
    noSlots: string;
    entered: string;
    open: string;
    leave: string;
    leaveConfirm: string;
    left: string;
    inviteTitle: string;
    inviteFrom: string;
    inviteGeneric: string;
    inviteScan: string;
    inviteWhen: string;
    inviteLog: string;
    sessions_one: string;
    sessions_other: string;
    accept: string;
    decline: string;
    seeInvite: string;
    accepted: string;
    declined: string;
    gateTitle: string;
  };
  errors: {
    GATE_STAFF_ALREADY_INVITED: string;
    GATE_STAFF_SELF: string;
    GATE_STAFF_LIMIT: string;
    GATE_STAFF_NOT_FOUND: string;
    GATE_STAFF_WRONG_STATUS: string;
    USERNAME_NOT_FOUND: string;
    generic: string;
  };
  entries: {
    releasedBy: string;
    releasedByYou: string;
    releasedByTeam: string;
  };
  menu: {
    label: string;
  };
}

export const gateStaffPtBR: GateStaffTranslation = {
  owner: {
    title: 'Equipe da portaria',
    entryHint: 'Quem pode liberar entradas nos seus eventos',
    intro: 'Pessoas que podem liberar entradas no seu lugar. Elas não veem vendas nem valores.',
    back: 'Voltar',
    eventGroup: '{{title}} · evento',
    placeGroup: '{{title}} · atração',
    active: 'Ativa',
    invited: 'Convite enviado',
    noName: 'Sem nome',
    invite: 'Convidar pessoa',
    empty: 'Ninguém na equipe ainda. Convide quem vai ajudar na portaria.',
    noEvents: 'Crie um evento ou uma atração com entrada para montar a equipe da portaria.',
    placeEntries: 'Entradas',
    loadError: 'Não foi possível carregar a equipe.',
    invitedNotice: 'Convite enviado. A pessoa entra na equipe quando aceitar.',
    removedNotice: 'Pessoa removida da equipe.',
  },
  sheet: {
    title: 'Convidar para a portaria',
    where: 'Onde',
    eventHint: 'Evento · todas as sessões',
    placeHint: 'Atração · todos os horários de entrada',
    who: 'Quem',
    searchPlaceholder: 'Nome de usuário',
    canScan: 'Ler o QR Code e inserir o código do ingresso',
    canDownload: 'Baixar a lista para usar sem internet',
    canCount: 'Ver quantos entraram',
    cannotSee: 'Não vê vendas, valores, pedidos nem convidados',
    cannotEdit: 'Não edita o evento nem reembolsa',
    send: 'Enviar convite',
    sending: 'Enviando…',
  },
  member: {
    status: 'Situação',
    joined: 'Entrou na equipe',
    entries: 'Entradas liberadas',
    lastEntry: 'Última entrada',
    removeHint:
      'Ao remover, a pessoa perde o acesso na hora. As entradas que ela já liberou continuam valendo.',
    cancelHint:
      'A pessoa ainda não respondeu. Cancelar o convite tira o acesso antes de ela aceitar.',
    remove: 'Remover da equipe',
    cancelInvite: 'Cancelar convite',
    removing: 'Removendo…',
  },
  mine: {
    title: 'Portaria',
    intro: 'Eventos e lugares em que você faz parte da equipe.',
    empty: 'Você não está na equipe de nenhum evento.',
    loadError: 'Não foi possível carregar as portarias.',
    sessionAt: '{{business}}{{when}}',
    opensAt: 'A portaria abre às {{time}}.',
    placeAllTimes: 'Entradas da atração, em todos os horários.',
    noSlots: 'Nenhum horário de entrada nos próximos 7 dias.',
    opensOn: 'A portaria abre em {{date}}.',
    entered: '{{entered}} de {{total}} entraram',
    open: 'Abrir portaria',
    leave: 'Sair da equipe',
    leaveConfirm: 'Sair da equipe de {{event}}? Você perde o acesso à portaria.',
    left: 'Você saiu da equipe.',
    inviteTitle: 'Convite para a portaria',
    inviteFrom: '{{business}} convidou você para liberar as entradas de {{event}}.',
    inviteGeneric: 'Você foi convidado para liberar as entradas de {{event}}.',
    inviteScan: 'Você vai ler o QR Code ou inserir o código dos ingressos.',
    inviteWhen: 'A portaria abre antes de cada sessão ou horário, aqui no app, em Portaria.',
    inviteLog: 'Cada entrada que você liberar fica registrada com o seu @.',
    sessions_one: '{{first}}',
    sessions_other: '{{first}} e mais {{count}}',
    accept: 'Aceitar',
    decline: 'Recusar',
    seeInvite: 'Ver convite',
    accepted: 'Você entrou na equipe.',
    declined: 'Convite recusado.',
    gateTitle: 'Portaria',
  },
  errors: {
    GATE_STAFF_ALREADY_INVITED: 'Esta pessoa já está na equipe ou foi convidada.',
    GATE_STAFF_SELF: 'Você já opera a sua própria portaria.',
    GATE_STAFF_LIMIT: 'A equipe já está no limite de 20 pessoas.',
    GATE_STAFF_NOT_FOUND: 'Convite não encontrado.',
    GATE_STAFF_WRONG_STATUS: 'Este convite já foi respondido ou encerrado.',
    USERNAME_NOT_FOUND: 'Não encontramos este nome de usuário.',
    generic: 'Não foi possível concluir. Tente de novo.',
  },
  entries: {
    releasedBy: 'liberado por @{{username}}',
    releasedByYou: 'liberado por você',
    releasedByTeam: 'liberado pela equipe',
  },
  menu: {
    label: 'Portaria',
  },
};
