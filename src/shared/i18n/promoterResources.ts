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

export const promoterEn: PromoterTranslation = {
  tab: 'Promoters',
  soldBy: 'Sold by promoters',
  soldTickets_one: '{{count}} ticket',
  soldTickets_other: '{{count}} tickets',
  owed: 'To pay promoters',
  owedHint: 'after the event',
  listTitle: 'Promoters',
  add: 'Add',
  empty: 'No promoters yet.',
  loadError: 'Could not load the promoters.',
  noSales: 'No sales yet',
  rowSales_one: '{{count}} ticket · {{amount}}',
  rowSales_other: '{{count}} tickets · {{amount}}',
  status: { invited: 'Invitation sent', ended: 'Ended' },
  earning: {
    commission: '{{percent}}% commission',
    perTicket: '{{amount}} per ticket',
    flatFee: '{{amount}} flat fee',
  },
  sheet: {
    title: 'Add promoter',
    description: 'The person gets a link of their own to sell this event.',
    searchLabel: "Promoter's username",
    searchPlaceholder: 'Search username',
    earningLegend: 'How much they earn',
    commission: 'Commission',
    commissionHint: 'A percentage of each ticket sold.',
    perTicket: 'Amount per ticket',
    perTicketHint: 'A fixed amount for each ticket sold through the link.',
    flatFee: 'Flat fee for the event',
    flatFeeHint: "An agreed amount that doesn't depend on sales.",
    percentLabel: 'Percentage',
    amountLabel: 'Amount',
    rule: "Only sales that weren't refunded count. You pay the promoter directly after the event; Use Guide shows how much.",
    send: 'Send invitation',
    sent: 'Invitation sent to @{{username}}.',
  },
  row: {
    earning: 'How much they earn',
    sold: 'Sold through the link',
    owed: 'To pay',
    end: 'End promotion',
    endTitle: 'End the promotion?',
    endMessage:
      'The link stops working. Sales made so far still count. To change the deal, invite them again.',
    endConfirm: 'End',
    keep: 'Keep',
    ended: 'Promotion ended.',
  },
  user: {
    title: 'Promotion',
    back: 'Back',
    owedTitle: 'To receive from organizers',
    owedHint_one: '{{count}} ticket sold through your links',
    owedHint_other: '{{count}} tickets sold through your links',
    events: 'Your events',
    empty: "You don't promote any event yet.",
    loadError: 'Could not load your promotions.',
    invited: 'Invitation to promote · {{earning}}',
    active: '{{earning}} · {{count}} sold · {{amount}}',
    ended: 'Ended · {{count}} sold · {{amount}}',
    accept: 'Accept',
    decline: 'Decline',
    copy: 'Copy link',
    copied: 'Link copied.',
    share: 'Share link',
    shareText: 'Get your ticket for {{event}}:',
    menu: 'Promotion',
  },
  invite: {
    title: 'Invitation to promote',
    description: '{{business}} wants you to promote {{event}}.',
    event: 'Event',
    earns: 'You earn',
    payer: 'Who pays',
    payerValue: '{{business}}, directly to you',
    rule: "Only sales made through your link and not refunded count. Your own purchases don't count. Payment is arranged with the organizer after the event.",
    accept: 'Accept and get my link',
    decline: 'Decline',
    accepted: 'Done! Your link is on the list.',
    declined: 'Invitation declined.',
  },
  errors: {
    PROMOTER_ALREADY_INVITED: 'This person already promotes or was invited to this event.',
    PROMOTER_SELF: "You can't promote your own event.",
    PROMOTER_INVALID_EARNING: 'Check how much the person earns.',
    PROMOTER_EVENT_CLOSED: 'Only published events have promoters.',
    PROMOTER_NOT_FOUND: 'Invitation not found.',
    PROMOTER_WRONG_STATUS: 'This invitation was already answered or ended.',
    USERNAME_NOT_FOUND: "We couldn't find anyone with that username.",
    RATE_LIMITED: 'Too many attempts. Try again in a few minutes.',
    failed: 'Something went wrong. Try again.',
  },
};

export const promoterFr: PromoterTranslation = {
  tab: 'Promoteurs',
  soldBy: 'Vendu par les promoteurs',
  soldTickets_one: '{{count}} billet',
  soldTickets_other: '{{count}} billets',
  owed: 'À payer aux promoteurs',
  owedHint: "après l'événement",
  listTitle: 'Promoteurs',
  add: 'Ajouter',
  empty: 'Aucun promoteur pour le moment.',
  loadError: 'Impossible de charger les promoteurs.',
  noSales: 'Pas encore de ventes',
  rowSales_one: '{{count}} billet · {{amount}}',
  rowSales_other: '{{count}} billets · {{amount}}',
  status: { invited: 'Invitation envoyée', ended: 'Terminé' },
  earning: {
    commission: 'Commission de {{percent}} %',
    perTicket: '{{amount}} par billet',
    flatFee: 'Forfait de {{amount}}',
  },
  sheet: {
    title: 'Ajouter un promoteur',
    description: 'La personne reçoit un lien à elle pour vendre cet événement.',
    searchLabel: 'Utilisateur du promoteur',
    searchPlaceholder: 'Rechercher un utilisateur',
    earningLegend: 'Ce qu’il gagne',
    commission: 'Commission',
    commissionHint: 'Un pourcentage de chaque billet vendu.',
    perTicket: 'Montant par billet',
    perTicketHint: 'Un montant fixe par billet vendu via le lien.',
    flatFee: "Forfait pour l'événement",
    flatFeeHint: 'Un montant convenu, qui ne dépend pas des ventes.',
    percentLabel: 'Pourcentage',
    amountLabel: 'Montant',
    rule: "Seules les ventes non remboursées comptent. Vous payez le promoteur directement après l'événement ; Use Guide indique combien.",
    send: "Envoyer l'invitation",
    sent: 'Invitation envoyée à @{{username}}.',
  },
  row: {
    earning: 'Ce qu’il gagne',
    sold: 'Vendu via le lien',
    owed: 'À payer',
    end: 'Terminer la promotion',
    endTitle: 'Terminer la promotion ?',
    endMessage:
      "Le lien ne fonctionne plus. Les ventes faites jusqu'ici comptent toujours. Pour changer l'accord, invitez de nouveau.",
    endConfirm: 'Terminer',
    keep: 'Garder',
    ended: 'Promotion terminée.',
  },
  user: {
    title: 'Promotion',
    back: 'Retour',
    owedTitle: 'À recevoir des organisateurs',
    owedHint_one: '{{count}} billet vendu via vos liens',
    owedHint_other: '{{count}} billets vendus via vos liens',
    events: 'Vos événements',
    empty: "Vous ne faites la promotion d'aucun événement pour le moment.",
    loadError: 'Impossible de charger vos promotions.',
    invited: 'Invitation à promouvoir · {{earning}}',
    active: '{{earning}} · {{count}} vendus · {{amount}}',
    ended: 'Terminé · {{count}} vendus · {{amount}}',
    accept: 'Accepter',
    decline: 'Refuser',
    copy: 'Copier le lien',
    copied: 'Lien copié.',
    share: 'Partager le lien',
    shareText: 'Prenez votre billet pour {{event}} :',
    menu: 'Promotion',
  },
  invite: {
    title: 'Invitation à promouvoir',
    description: '{{business}} veut que vous fassiez la promotion de {{event}}.',
    event: 'Événement',
    earns: 'Vous gagnez',
    payer: 'Qui paie',
    payerValue: '{{business}}, directement à vous',
    rule: "Seules les ventes faites via votre lien et non remboursées comptent. Vos propres achats ne comptent pas. Le paiement est convenu avec l'organisateur, après l'événement.",
    accept: 'Accepter et obtenir mon lien',
    decline: 'Refuser',
    accepted: "C'est fait ! Votre lien est dans la liste.",
    declined: 'Invitation refusée.',
  },
  errors: {
    PROMOTER_ALREADY_INVITED:
      'Cette personne fait déjà la promotion ou a été invitée pour cet événement.',
    PROMOTER_SELF: 'Vous ne pouvez pas promouvoir votre propre événement.',
    PROMOTER_INVALID_EARNING: 'Vérifiez combien la personne gagne.',
    PROMOTER_EVENT_CLOSED: 'Seuls les événements publiés ont des promoteurs.',
    PROMOTER_NOT_FOUND: 'Invitation introuvable.',
    PROMOTER_WRONG_STATUS: 'Cette invitation a déjà reçu une réponse ou est terminée.',
    USERNAME_NOT_FOUND: "Nous n'avons trouvé personne avec cet utilisateur.",
    RATE_LIMITED: 'Trop de tentatives. Réessayez dans quelques minutes.',
    failed: 'Une erreur est survenue. Réessayez.',
  },
};
