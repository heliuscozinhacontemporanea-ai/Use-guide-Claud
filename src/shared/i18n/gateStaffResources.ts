/** Textos da equipe da portaria (C1): dono, pessoa convidada e erros. pt-BR é a fonte. */
export interface GateStaffTranslation {
  owner: {
    title: string;
    entryHint: string;
    intro: string;
    back: string;
    eventGroup: string;
    active: string;
    invited: string;
    noName: string;
    invite: string;
    empty: string;
    noEvents: string;
    loadError: string;
    invitedNotice: string;
    removedNotice: string;
  };
  sheet: {
    title: string;
    where: string;
    eventHint: string;
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
    active: 'Ativa',
    invited: 'Convite enviado',
    noName: 'Sem nome',
    invite: 'Convidar pessoa',
    empty: 'Ninguém na equipe ainda. Convide quem vai ajudar na portaria.',
    noEvents: 'Crie um evento para montar a equipe da portaria.',
    loadError: 'Não foi possível carregar a equipe.',
    invitedNotice: 'Convite enviado. A pessoa entra na equipe quando aceitar.',
    removedNotice: 'Pessoa removida da equipe.',
  },
  sheet: {
    title: 'Convidar para a portaria',
    where: 'Onde',
    eventHint: 'Evento · todas as sessões',
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
    intro: 'Eventos em que você faz parte da equipe.',
    empty: 'Você não está na equipe de nenhum evento.',
    loadError: 'Não foi possível carregar as portarias.',
    sessionAt: '{{business}}{{when}}',
    opensAt: 'A portaria abre às {{time}}.',
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
    inviteWhen: 'A portaria abre 2 h antes de cada sessão, aqui no app, em Portaria.',
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

export const gateStaffEn: GateStaffTranslation = {
  owner: {
    title: 'Gate team',
    entryHint: 'Who can check guests in at your events',
    intro: 'People who can check guests in for you. They do not see sales or amounts.',
    back: 'Back',
    eventGroup: '{{title}} · event',
    active: 'Active',
    invited: 'Invite sent',
    noName: 'No name',
    invite: 'Invite someone',
    empty: 'No one on the team yet. Invite whoever will help at the gate.',
    noEvents: 'Create an event to set up the gate team.',
    loadError: 'Could not load the team.',
    invitedNotice: 'Invite sent. The person joins the team once they accept.',
    removedNotice: 'Person removed from the team.',
  },
  sheet: {
    title: 'Invite to the gate',
    where: 'Where',
    eventHint: 'Event · all sessions',
    who: 'Who',
    searchPlaceholder: 'Username',
    canScan: 'Scan the QR code and enter the ticket code',
    canDownload: 'Download the list to use offline',
    canCount: 'See how many people are in',
    cannotSee: 'Cannot see sales, amounts, orders or guests',
    cannotEdit: 'Cannot edit the event or refund',
    send: 'Send invite',
    sending: 'Sending…',
  },
  member: {
    status: 'Status',
    joined: 'Joined the team',
    entries: 'Entries checked in',
    lastEntry: 'Last entry',
    removeHint:
      'Once removed, the person loses access right away. Entries they already checked in remain valid.',
    cancelHint:
      'The person has not answered yet. Canceling the invite removes access before they accept.',
    remove: 'Remove from team',
    cancelInvite: 'Cancel invite',
    removing: 'Removing…',
  },
  mine: {
    title: 'Gate',
    intro: 'Events where you are on the team.',
    empty: 'You are not on any event team.',
    loadError: 'Could not load your gates.',
    sessionAt: '{{business}}{{when}}',
    opensAt: 'The gate opens at {{time}}.',
    opensOn: 'The gate opens on {{date}}.',
    entered: '{{entered}} of {{total}} checked in',
    open: 'Open gate',
    leave: 'Leave the team',
    leaveConfirm: 'Leave the team of {{event}}? You lose access to the gate.',
    left: 'You left the team.',
    inviteTitle: 'Invitation to the gate',
    inviteFrom: '{{business}} invited you to check people in at {{event}}.',
    inviteGeneric: 'You were invited to check people in at {{event}}.',
    inviteScan: 'You will scan the QR code or enter the ticket code.',
    inviteWhen: 'The gate opens 2 h before each session, here in the app, under Gate.',
    inviteLog: 'Every entry you check in is logged with your @.',
    sessions_one: '{{first}}',
    sessions_other: '{{first}} and {{count}} more',
    accept: 'Accept',
    decline: 'Decline',
    seeInvite: 'See invite',
    accepted: 'You joined the team.',
    declined: 'Invite declined.',
    gateTitle: 'Gate',
  },
  errors: {
    GATE_STAFF_ALREADY_INVITED: 'This person is already on the team or was invited.',
    GATE_STAFF_SELF: 'You already run your own gate.',
    GATE_STAFF_LIMIT: 'The team is already at the limit of 20 people.',
    GATE_STAFF_NOT_FOUND: 'Invite not found.',
    GATE_STAFF_WRONG_STATUS: 'This invite was already answered or closed.',
    USERNAME_NOT_FOUND: 'We could not find this username.',
    generic: 'Could not finish. Try again.',
  },
  entries: {
    releasedBy: 'checked in by @{{username}}',
    releasedByYou: 'checked in by you',
    releasedByTeam: 'checked in by the team',
  },
  menu: {
    label: 'Gate',
  },
};

export const gateStaffFr: GateStaffTranslation = {
  owner: {
    title: 'Équipe d’accueil',
    entryHint: 'Qui peut valider les entrées de vos événements',
    intro:
      'Des personnes qui valident les entrées à votre place. Elles ne voient ni ventes ni montants.',
    back: 'Retour',
    eventGroup: '{{title}} · événement',
    active: 'Active',
    invited: 'Invitation envoyée',
    noName: 'Sans nom',
    invite: 'Inviter une personne',
    empty: 'Personne dans l’équipe pour l’instant. Invitez les personnes qui aideront à l’accueil.',
    noEvents: 'Créez un événement pour constituer l’équipe d’accueil.',
    loadError: 'Impossible de charger l’équipe.',
    invitedNotice: 'Invitation envoyée. La personne rejoint l’équipe quand elle accepte.',
    removedNotice: 'Personne retirée de l’équipe.',
  },
  sheet: {
    title: 'Inviter à l’accueil',
    where: 'Où',
    eventHint: 'Événement · toutes les séances',
    who: 'Qui',
    searchPlaceholder: 'Nom d’utilisateur',
    canScan: 'Scanner le QR code et saisir le code du billet',
    canDownload: 'Télécharger la liste pour l’utiliser hors ligne',
    canCount: 'Voir combien de personnes sont entrées',
    cannotSee: 'Ne voit ni ventes, ni montants, ni commandes, ni invités',
    cannotEdit: 'Ne modifie pas l’événement et ne rembourse pas',
    send: 'Envoyer l’invitation',
    sending: 'Envoi…',
  },
  member: {
    status: 'Statut',
    joined: 'A rejoint l’équipe',
    entries: 'Entrées validées',
    lastEntry: 'Dernière entrée',
    removeHint:
      'Une fois retirée, la personne perd l’accès immédiatement. Les entrées déjà validées restent valables.',
    cancelHint:
      'La personne n’a pas encore répondu. Annuler l’invitation retire l’accès avant son acceptation.',
    remove: 'Retirer de l’équipe',
    cancelInvite: 'Annuler l’invitation',
    removing: 'Retrait…',
  },
  mine: {
    title: 'Accueil',
    intro: 'Événements où vous faites partie de l’équipe.',
    empty: 'Vous ne faites partie d’aucune équipe.',
    loadError: 'Impossible de charger vos accueils.',
    sessionAt: '{{business}}{{when}}',
    opensAt: 'L’accueil ouvre à {{time}}.',
    opensOn: 'L’accueil ouvre le {{date}}.',
    entered: '{{entered}} sur {{total}} sont entrés',
    open: 'Ouvrir l’accueil',
    leave: 'Quitter l’équipe',
    leaveConfirm: 'Quitter l’équipe de {{event}} ? Vous perdez l’accès à l’accueil.',
    left: 'Vous avez quitté l’équipe.',
    inviteTitle: 'Invitation à l’accueil',
    inviteFrom: '{{business}} vous invite à valider les entrées de {{event}}.',
    inviteGeneric: 'Vous êtes invité à valider les entrées de {{event}}.',
    inviteScan: 'Vous scannerez le QR code ou saisirez le code des billets.',
    inviteWhen: 'L’accueil ouvre 2 h avant chaque séance, ici dans l’app, dans Accueil.',
    inviteLog: 'Chaque entrée que vous validez est enregistrée avec votre @.',
    sessions_one: '{{first}}',
    sessions_other: '{{first}} et {{count}} de plus',
    accept: 'Accepter',
    decline: 'Refuser',
    seeInvite: 'Voir l’invitation',
    accepted: 'Vous avez rejoint l’équipe.',
    declined: 'Invitation refusée.',
    gateTitle: 'Accueil',
  },
  errors: {
    GATE_STAFF_ALREADY_INVITED: 'Cette personne est déjà dans l’équipe ou a été invitée.',
    GATE_STAFF_SELF: 'Vous gérez déjà votre propre accueil.',
    GATE_STAFF_LIMIT: 'L’équipe a déjà atteint la limite de 20 personnes.',
    GATE_STAFF_NOT_FOUND: 'Invitation introuvable.',
    GATE_STAFF_WRONG_STATUS: 'Cette invitation a déjà reçu une réponse ou est close.',
    USERNAME_NOT_FOUND: 'Nous n’avons pas trouvé ce nom d’utilisateur.',
    generic: 'Impossible de terminer. Réessayez.',
  },
  entries: {
    releasedBy: 'validé par @{{username}}',
    releasedByYou: 'validé par vous',
    releasedByTeam: 'validé par l’équipe',
  },
  menu: {
    label: 'Accueil',
  },
};
