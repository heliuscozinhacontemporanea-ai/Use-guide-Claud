/** Convidados (cortesias) do organizador e o link de convite (p13, p14, p15, p28; D27). */
export interface CourtesyTranslation {
  tabs: { sales: string; guests: string };
  header: string;
  summaryTitle_one: string;
  summaryTitle_other: string;
  summaryHint: string;
  invite: string;
  listTitle: string;
  empty: string;
  loadError: string;
  linkTitle: string;
  linkSentBy: string;
  sessionGuests_one: string;
  sessionGuests_other: string;
  status: {
    checked_in: string;
    in_wallet: string;
    link_pending: string;
    link_expired: string;
    canceled: string;
  };
  sheet: {
    title: string;
    description: string;
    session: string;
    searchLabel: string;
    searchPlaceholder: string;
    searching: string;
    results: string;
    rule: string;
    send: string;
    sent: string;
    noAccount: string;
    createLink: string;
  };
  linkSheet: {
    title: string;
    validUntil: string;
    copy: string;
    copied: string;
    hint: string;
    whatsapp: string;
    whatsappText: string;
    share: string;
  };
  row: {
    titleGuest: string;
    titleLink: string;
    session: string;
    invitedAt: string;
    cancel: string;
    cancelTitle: string;
    cancelMessage: string;
    cancelConfirm: string;
    keep: string;
    canceled: string;
    cannotCancel: string;
  };
  receiver: {
    title: string;
    invitedBy: string;
    invitedGeneric: string;
    login: string;
    accept: string;
    hint: string;
    accepted: string;
    seeTickets: string;
    close: string;
  };
  wallet: { label: string; personal: string };
  gate: { guest: string };
  errors: {
    COURTESY_ALREADY_GIVEN: string;
    COURTESY_GUEST_HAS_PURCHASE: string;
    COURTESY_SELF: string;
    COURTESY_SESSION_CLOSED: string;
    COURTESY_SOLD_OUT: string;
    COURTESY_LINK_INVALID: string;
    COURTESY_LINK_EXPIRED: string;
    COURTESY_ALREADY_USED: string;
    RECIPIENT_NOT_VERIFIED: string;
    USERNAME_NOT_FOUND: string;
    RATE_LIMITED: string;
    failed: string;
  };
}

export const courtesyPtBR: CourtesyTranslation = {
  tabs: { sales: 'Vendas', guests: 'Convidados' },
  header: '{{when}} · {{sold}} de {{capacity}} vendidos',
  summaryTitle_one: '{{count}} cortesia enviada',
  summaryTitle_other: '{{count}} cortesias enviadas',
  summaryHint: 'Uma por pessoa. Cada uma ocupa um lugar.',
  invite: 'Convidar',
  listTitle: 'Convidados',
  empty: 'Nenhuma cortesia enviada ainda.',
  loadError: 'Não foi possível carregar os convidados.',
  linkTitle: 'Link de convite',
  linkSentBy: 'Enviado por você',
  sessionGuests_one: '{{count}} convidado',
  sessionGuests_other: '{{count}} convidados',
  status: {
    checked_in: 'Entrou às {{time}}',
    in_wallet: 'Na carteira',
    link_pending: 'Aguardando a pessoa abrir · vale até {{date}}',
    link_expired: 'Link vencido',
    canceled: 'Cancelado por você',
  },
  sheet: {
    title: 'Convidar',
    description: 'O ingresso vai direto para a carteira da pessoa convidada, sem custos.',
    session: 'Sessão',
    searchLabel: '@ da pessoa',
    searchPlaceholder: 'Buscar usuário',
    searching: 'Procurando…',
    results: 'Contas encontradas',
    rule: 'Uma cortesia por pessoa. Não pode ser repassada nem vendida, e você pode cancelar até a pessoa entrar.',
    send: 'Enviar cortesia',
    sent: 'Cortesia enviada para @{{username}}.',
    noAccount: 'A pessoa não tem conta?',
    createLink: 'Criar link de convite',
  },
  linkSheet: {
    title: 'Link de convite criado',
    validUntil: 'Vale para uma pessoa, até {{date}}.',
    copy: 'Copiar link',
    copied: 'Link copiado.',
    hint: 'Quem abrir cria a conta e a cortesia fica presa a ela. Depois de usado, o link não vale de novo.',
    whatsapp: 'Enviar pelo WhatsApp',
    whatsappText: 'Você ganhou uma cortesia para {{event}}: {{url}}',
    share: 'Outras formas de enviar',
  },
  row: {
    titleGuest: 'Cortesia',
    titleLink: 'Link de convite',
    session: 'Sessão',
    invitedAt: 'Enviada em',
    cancel: 'Cancelar cortesia',
    cancelTitle: 'Cancelar a cortesia?',
    cancelMessage: 'O ingresso sai da carteira da pessoa e o lugar volta para a sessão.',
    cancelConfirm: 'Cancelar cortesia',
    keep: 'Manter',
    canceled: 'Cortesia cancelada.',
    cannotCancel: 'A pessoa já entrou; a cortesia não pode mais ser cancelada.',
  },
  receiver: {
    title: 'Você ganhou uma cortesia',
    invitedBy: '{{business}} convidou você para <strong>{{event}}</strong>.',
    invitedGeneric: 'Você foi convidado para <strong>{{event}}</strong>.',
    login: 'Entrar ou criar conta para receber',
    accept: 'Receber cortesia',
    hint: 'O ingresso fica na sua conta, em Ingressos. Ele é pessoal: não pode ser passado para outra pessoa. Este convite vale até o início do evento.',
    accepted: 'Pronto! O ingresso está na sua carteira.',
    seeTickets: 'Ver ingressos',
    close: 'Fechar',
  },
  wallet: { label: 'Cortesia', personal: 'Cortesia pessoal: não pode ser transferida.' },
  gate: { guest: 'Convidado' },
  errors: {
    COURTESY_ALREADY_GIVEN: 'Esta pessoa já tem cortesia neste evento.',
    COURTESY_GUEST_HAS_PURCHASE:
      'Quem comprou ingresso deste evento não pode receber cortesia dele.',
    COURTESY_SELF: 'Você não pode se convidar.',
    COURTESY_SESSION_CLOSED: 'Esta sessão não aceita mais cortesias.',
    COURTESY_SOLD_OUT: 'Não há mais lugares nesta sessão.',
    COURTESY_LINK_INVALID: 'Este convite já foi usado ou cancelado.',
    COURTESY_LINK_EXPIRED: 'Este convite venceu.',
    COURTESY_ALREADY_USED: 'A pessoa já entrou com esta cortesia.',
    RECIPIENT_NOT_VERIFIED: 'Esta conta ainda não confirmou o e-mail e não pode receber ingressos.',
    USERNAME_NOT_FOUND: 'Não achamos ninguém com esse @.',
    RATE_LIMITED: 'Muitas tentativas. Tente de novo em alguns minutos.',
    failed: 'Não foi possível concluir. Tente de novo.',
  },
};

export const courtesyEn: CourtesyTranslation = {
  tabs: { sales: 'Sales', guests: 'Guests' },
  header: '{{when}} · {{sold}} of {{capacity}} sold',
  summaryTitle_one: '{{count}} complimentary ticket sent',
  summaryTitle_other: '{{count}} complimentary tickets sent',
  summaryHint: 'One per person. Each one takes a spot.',
  invite: 'Invite',
  listTitle: 'Guests',
  empty: 'No complimentary tickets sent yet.',
  loadError: 'Could not load the guests.',
  linkTitle: 'Invite link',
  linkSentBy: 'Sent by you',
  sessionGuests_one: '{{count}} guest',
  sessionGuests_other: '{{count}} guests',
  status: {
    checked_in: 'Checked in at {{time}}',
    in_wallet: 'In wallet',
    link_pending: 'Waiting to be opened · valid until {{date}}',
    link_expired: 'Link expired',
    canceled: 'Canceled by you',
  },
  sheet: {
    title: 'Invite',
    description: "The ticket goes straight to the guest's wallet, free of charge.",
    session: 'Session',
    searchLabel: "Person's @",
    searchPlaceholder: 'Search username',
    searching: 'Searching…',
    results: 'Accounts found',
    rule: 'One complimentary ticket per person. It cannot be passed on or sold, and you can cancel it until the person checks in.',
    send: 'Send complimentary ticket',
    sent: 'Complimentary ticket sent to @{{username}}.',
    noAccount: "The person doesn't have an account?",
    createLink: 'Create invite link',
  },
  linkSheet: {
    title: 'Invite link created',
    validUntil: 'Valid for one person, until {{date}}.',
    copy: 'Copy link',
    copied: 'Link copied.',
    hint: 'Whoever opens it creates an account and the ticket is tied to it. Once used, the link no longer works.',
    whatsapp: 'Send on WhatsApp',
    whatsappText: 'You got a complimentary ticket for {{event}}: {{url}}',
    share: 'Other ways to send',
  },
  row: {
    titleGuest: 'Complimentary ticket',
    titleLink: 'Invite link',
    session: 'Session',
    invitedAt: 'Sent on',
    cancel: 'Cancel complimentary ticket',
    cancelTitle: 'Cancel the complimentary ticket?',
    cancelMessage: "The ticket leaves the person's wallet and the spot goes back to the session.",
    cancelConfirm: 'Cancel complimentary ticket',
    keep: 'Keep',
    canceled: 'Complimentary ticket canceled.',
    cannotCancel: 'The person has already checked in; it can no longer be canceled.',
  },
  receiver: {
    title: 'You got a complimentary ticket',
    invitedBy: '{{business}} invited you to <strong>{{event}}</strong>.',
    invitedGeneric: 'You were invited to <strong>{{event}}</strong>.',
    login: 'Sign in or create an account to receive it',
    accept: 'Receive complimentary ticket',
    hint: "The ticket stays in your account, under Tickets. It's personal: it can't be passed to someone else. This invite is valid until the event starts.",
    accepted: 'Done! The ticket is in your wallet.',
    seeTickets: 'See tickets',
    close: 'Close',
  },
  wallet: {
    label: 'Complimentary',
    personal: 'Personal complimentary ticket: it cannot be transferred.',
  },
  gate: { guest: 'Guest' },
  errors: {
    COURTESY_ALREADY_GIVEN: 'This person already has a complimentary ticket for this event.',
    COURTESY_GUEST_HAS_PURCHASE:
      'People who bought a ticket for this event cannot get a complimentary one.',
    COURTESY_SELF: "You can't invite yourself.",
    COURTESY_SESSION_CLOSED: 'This session no longer accepts complimentary tickets.',
    COURTESY_SOLD_OUT: 'There are no spots left in this session.',
    COURTESY_LINK_INVALID: 'This invite has already been used or canceled.',
    COURTESY_LINK_EXPIRED: 'This invite has expired.',
    COURTESY_ALREADY_USED: 'The person has already checked in with this ticket.',
    RECIPIENT_NOT_VERIFIED: "This account hasn't confirmed its email and can't receive tickets.",
    USERNAME_NOT_FOUND: "We couldn't find anyone with that @.",
    RATE_LIMITED: 'Too many attempts. Try again in a few minutes.',
    failed: 'Something went wrong. Try again.',
  },
};

export const courtesyFr: CourtesyTranslation = {
  tabs: { sales: 'Ventes', guests: 'Invités' },
  header: '{{when}} · {{sold}} sur {{capacity}} vendus',
  summaryTitle_one: '{{count}} billet offert envoyé',
  summaryTitle_other: '{{count}} billets offerts envoyés',
  summaryHint: 'Un par personne. Chacun occupe une place.',
  invite: 'Inviter',
  listTitle: 'Invités',
  empty: 'Aucun billet offert envoyé pour le moment.',
  loadError: 'Impossible de charger les invités.',
  linkTitle: "Lien d'invitation",
  linkSentBy: 'Envoyé par vous',
  sessionGuests_one: '{{count}} invité',
  sessionGuests_other: '{{count}} invités',
  status: {
    checked_in: 'Entré à {{time}}',
    in_wallet: 'Dans le portefeuille',
    link_pending: "En attente d'ouverture · valable jusqu'au {{date}}",
    link_expired: 'Lien expiré',
    canceled: 'Annulé par vous',
  },
  sheet: {
    title: 'Inviter',
    description: "Le billet arrive directement dans le portefeuille de l'invité, sans frais.",
    session: 'Séance',
    searchLabel: '@ de la personne',
    searchPlaceholder: 'Rechercher un utilisateur',
    searching: 'Recherche…',
    results: 'Comptes trouvés',
    rule: "Un billet offert par personne. Il ne peut être ni cédé ni vendu, et vous pouvez l'annuler jusqu'à l'entrée de la personne.",
    send: 'Envoyer le billet offert',
    sent: 'Billet offert envoyé à @{{username}}.',
    noAccount: "La personne n'a pas de compte ?",
    createLink: "Créer un lien d'invitation",
  },
  linkSheet: {
    title: "Lien d'invitation créé",
    validUntil: "Valable pour une personne, jusqu'au {{date}}.",
    copy: 'Copier le lien',
    copied: 'Lien copié.',
    hint: "La personne qui l'ouvre crée un compte et le billet y reste lié. Une fois utilisé, le lien ne fonctionne plus.",
    whatsapp: 'Envoyer par WhatsApp',
    whatsappText: 'Vous avez reçu un billet offert pour {{event}} : {{url}}',
    share: "Autres moyens d'envoi",
  },
  row: {
    titleGuest: 'Billet offert',
    titleLink: "Lien d'invitation",
    session: 'Séance',
    invitedAt: 'Envoyé le',
    cancel: 'Annuler le billet offert',
    cancelTitle: 'Annuler le billet offert ?',
    cancelMessage:
      'Le billet quitte le portefeuille de la personne et la place revient à la séance.',
    cancelConfirm: 'Annuler le billet offert',
    keep: 'Garder',
    canceled: 'Billet offert annulé.',
    cannotCancel: 'La personne est déjà entrée ; il ne peut plus être annulé.',
  },
  receiver: {
    title: 'Vous avez reçu un billet offert',
    invitedBy: '{{business}} vous a invité à <strong>{{event}}</strong>.',
    invitedGeneric: 'Vous avez été invité à <strong>{{event}}</strong>.',
    login: 'Se connecter ou créer un compte pour le recevoir',
    accept: 'Recevoir le billet offert',
    hint: "Le billet reste sur votre compte, dans Billets. Il est personnel : il ne peut pas être donné à quelqu'un d'autre. Cette invitation est valable jusqu'au début de l'événement.",
    accepted: 'C’est fait ! Le billet est dans votre portefeuille.',
    seeTickets: 'Voir les billets',
    close: 'Fermer',
  },
  wallet: { label: 'Offert', personal: 'Billet offert personnel : il ne peut pas être transféré.' },
  gate: { guest: 'Invité' },
  errors: {
    COURTESY_ALREADY_GIVEN: 'Cette personne a déjà un billet offert pour cet événement.',
    COURTESY_GUEST_HAS_PURCHASE:
      'Les personnes qui ont acheté un billet pour cet événement ne peuvent pas en recevoir un offert.',
    COURTESY_SELF: 'Vous ne pouvez pas vous inviter.',
    COURTESY_SESSION_CLOSED: "Cette séance n'accepte plus de billets offerts.",
    COURTESY_SOLD_OUT: "Il n'y a plus de places dans cette séance.",
    COURTESY_LINK_INVALID: 'Cette invitation a déjà été utilisée ou annulée.',
    COURTESY_LINK_EXPIRED: 'Cette invitation a expiré.',
    COURTESY_ALREADY_USED: 'La personne est déjà entrée avec ce billet.',
    RECIPIENT_NOT_VERIFIED:
      "Ce compte n'a pas encore confirmé son e-mail et ne peut pas recevoir de billets.",
    USERNAME_NOT_FOUND: "Nous n'avons trouvé personne avec ce @.",
    RATE_LIMITED: 'Trop de tentatives. Réessayez dans quelques minutes.',
    failed: 'Une erreur est survenue. Réessayez.',
  },
};
