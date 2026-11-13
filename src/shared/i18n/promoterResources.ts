/** Divulgadores: organizador (p16, p17) e usuário (p26, p27); D27. */
export interface PromoterTranslation {
  tab: string;
  soldBy: string;
  soldTickets_one: string;
  soldTickets_other: string;
  owed: string;
  owedHint: string;
  listTitle: string;
  add: string;
  empty: string;
  loadError: string;
  noSales: string;
  rowSales_one: string;
  rowSales_other: string;
  status: { invited: string; ended: string };
  earning: { commission: string; perTicket: string; flatFee: string };
  sheet: {
    title: string;
    description: string;
    searchLabel: string;
    searchPlaceholder: string;
    earningLegend: string;
    commission: string;
    commissionHint: string;
    perTicket: string;
    perTicketHint: string;
    flatFee: string;
    flatFeeHint: string;
    percentLabel: string;
    amountLabel: string;
    rule: string;
    send: string;
    sent: string;
  };
  row: {
    earning: string;
    sold: string;
    owed: string;
    end: string;
    endTitle: string;
    endMessage: string;
    endConfirm: string;
    keep: string;
    ended: string;
  };
  user: {
    title: string;
    back: string;
    owedTitle: string;
    owedHint_one: string;
    owedHint_other: string;
    events: string;
    empty: string;
    loadError: string;
    invited: string;
    active: string;
    ended: string;
    accept: string;
    decline: string;
    copy: string;
    copied: string;
    share: string;
    shareText: string;
    menu: string;
  };
  invite: {
    title: string;
    description: string;
    event: string;
    earns: string;
    payer: string;
    payerValue: string;
    rule: string;
    accept: string;
    decline: string;
    accepted: string;
    declined: string;
  };
  errors: {
    PROMOTER_ALREADY_INVITED: string;
    PROMOTER_SELF: string;
    PROMOTER_INVALID_EARNING: string;
    PROMOTER_EVENT_CLOSED: string;
    PROMOTER_NOT_FOUND: string;
    PROMOTER_WRONG_STATUS: string;
    USERNAME_NOT_FOUND: string;
    RATE_LIMITED: string;
    failed: string;
  };
}

export const promoterPtBR: PromoterTranslation = {
  tab: 'Divulgadores',
  soldBy: 'Vendido por divulgadores',
  soldTickets_one: '{{count}} ingresso',
  soldTickets_other: '{{count}} ingressos',
  owed: 'A pagar aos divulgadores',
  owedHint: 'depois do evento',
  listTitle: 'Divulgadores',
  add: 'Adicionar',
  empty: 'Nenhum divulgador ainda.',
  loadError: 'Não foi possível carregar os divulgadores.',
  noSales: 'Ainda sem vendas',
  rowSales_one: '{{count}} ingresso · {{amount}}',
  rowSales_other: '{{count}} ingressos · {{amount}}',
  status: { invited: 'Convite enviado', ended: 'Encerrado' },
  earning: {
    commission: 'Comissão de {{percent}}%',
    perTicket: '{{amount}} por ingresso',
    flatFee: 'Cachê de {{amount}}',
  },
  sheet: {
    title: 'Adicionar divulgador',
    description: 'A pessoa recebe um link só dela para vender este evento.',
    searchLabel: 'Usuário do divulgador',
    searchPlaceholder: 'Buscar usuário',
    earningLegend: 'Quanto ganha',
    commission: 'Comissão',
    commissionHint: 'Uma porcentagem do valor de cada ingresso vendido.',
    perTicket: 'Valor por ingresso',
    perTicketHint: 'Um valor fixo por ingresso vendido pelo link.',
    flatFee: 'Cachê fixo pelo evento',
    flatFeeHint: 'Um valor combinado, que não depende das vendas.',
    percentLabel: 'Porcentagem',
    amountLabel: 'Valor',
    rule: 'Conta só venda que não foi reembolsada. Você paga o divulgador direto, depois do evento; o Use Guide mostra quanto é.',
    send: 'Enviar convite',
    sent: 'Convite enviado para @{{username}}.',
  },
  row: {
    earning: 'Quanto ganha',
    sold: 'Vendido pelo link',
    owed: 'A pagar',
    end: 'Encerrar divulgação',
    endTitle: 'Encerrar a divulgação?',
    endMessage:
      'O link para de valer. As vendas feitas até agora continuam contando. Para mudar o combinado, convide de novo.',
    endConfirm: 'Encerrar',
    keep: 'Manter',
    ended: 'Divulgação encerrada.',
  },
  user: {
    title: 'Divulgação',
    back: 'Voltar',
    owedTitle: 'A receber dos organizadores',
    owedHint_one: '{{count}} ingresso vendido pelos seus links',
    owedHint_other: '{{count}} ingressos vendidos pelos seus links',
    events: 'Seus eventos',
    empty: 'Você ainda não divulga nenhum evento.',
    loadError: 'Não foi possível carregar a sua divulgação.',
    invited: 'Convite para divulgar · {{earning}}',
    active: '{{earning}} · {{count}} vendidos · {{amount}}',
    ended: 'Encerrado · {{count}} vendidos · {{amount}}',
    accept: 'Aceitar',
    decline: 'Recusar',
    copy: 'Copiar link',
    copied: 'Link copiado.',
    share: 'Compartilhar link',
    shareText: 'Garanta seu ingresso para {{event}}:',
    menu: 'Divulgação',
  },
  invite: {
    title: 'Convite para divulgar',
    description: '{{business}} quer que você divulgue {{event}}.',
    event: 'Evento',
    earns: 'Você ganha',
    payer: 'Quem paga',
    payerValue: '{{business}}, direto a você',
    rule: 'Conta só venda feita pelo seu link e não reembolsada. Compra feita por você mesmo não conta. O pagamento é combinado com o organizador, depois do evento.',
    accept: 'Aceitar e pegar meu link',
    decline: 'Recusar',
    accepted: 'Pronto! Seu link já está na lista.',
    declined: 'Convite recusado.',
  },
  errors: {
    PROMOTER_ALREADY_INVITED: 'Esta pessoa já divulga ou foi convidada para este evento.',
    PROMOTER_SELF: 'Você não pode ser divulgador do próprio evento.',
    PROMOTER_INVALID_EARNING: 'Confira o valor de quanto a pessoa ganha.',
    PROMOTER_EVENT_CLOSED: 'Só eventos publicados têm divulgadores.',
    PROMOTER_NOT_FOUND: 'Convite não encontrado.',
    PROMOTER_WRONG_STATUS: 'Este convite já foi respondido ou encerrado.',
    USERNAME_NOT_FOUND: 'Não achamos ninguém com esse usuário.',
    RATE_LIMITED: 'Muitas tentativas. Tente de novo em alguns minutos.',
    failed: 'Não foi possível concluir. Tente de novo.',
  },
};
