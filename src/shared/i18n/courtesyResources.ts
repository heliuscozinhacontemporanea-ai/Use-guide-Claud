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
