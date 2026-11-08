/** Área Cupons do parceiro (B1). */

export interface PromoCodeTranslation {
  title: string;
  subtitle: string;
  forEvent: string;
  showAll: string;
  create: string;
  loadError: string;
  noEvents: string;
  empty: string;
  emptyEvent: string;
  unknownTarget: string;
  targetsMore: string;
  allOptions: string;
  discount: { percentage: string; fixed: string };
  uses: {
    free_one: string;
    free_other: string;
    limited_one: string;
    limited_other: string;
  };
  status: { active: string; scheduled: string; paused: string; exhausted: string; ended: string };
  period: { between: string; from: string; until: string };
  sheet: {
    appliesTo: string;
    uses: string;
    limits: string;
    period: string;
    onePerAccount: string;
    maxTickets_one: string;
    maxTickets_other: string;
    lockedHint: string;
    edit: string;
    editLimits: string;
    pause: string;
    resume: string;
    delete: string;
    deleteTitle: string;
    deleteMessage: string;
  };
  form: {
    createTitle: string;
    editTitle: string;
    description: string;
    code: string;
    codePlaceholder: string;
    discount: string;
    percentage: string;
    fixed: string;
    percentLabel: string;
    valueLabel: string;
    percentHint: string;
    fixedHint: string;
    appliesTo: string;
    someOptions: string;
    limits: string;
    limitUses: string;
    limitUsesHint: string;
    maxUsesLabel: string;
    onePerAccount: string;
    onePerAccountHint: string;
    limitTickets: string;
    limitTicketsHint: string;
    maxTicketsLabel: string;
    startsAt: string;
    endsAt: string;
    periodHint: string;
    save: string;
    create: string;
    errors: {
      code: string;
      percent: string;
      value: string;
      targets: string;
      options: string;
      maxUses: string;
      maxTickets: string;
      period: string;
    };
  };
  errors: {
    PROMO_CODE_TAKEN: string;
    PROMO_LOCKED: string;
    PROMO_IN_USE: string;
    PROMO_TARGET_INVALID: string;
    VALIDATION_ERROR: string;
    failed: string;
  };
}

export const promoCodePtBR: PromoCodeTranslation = {
  title: 'Cupons',
  subtitle: 'Descontos que o comprador digita na compra.',
  forEvent: 'Cupons que valem para {{title}}.',
  showAll: 'Ver todos os cupons',
  create: 'Criar',
  loadError: 'Não foi possível carregar os cupons.',
  noEvents: 'Crie um evento para oferecer cupons de desconto.',
  empty: 'Nenhum cupom ainda.',
  emptyEvent: 'Nenhum cupom vale para este evento.',
  unknownTarget: 'Anúncio removido',
  targetsMore: '{{first}} e mais {{count}}',
  allOptions: 'Todos os lotes',
  discount: { percentage: '{{value}}% por ingresso', fixed: '{{value}} por compra' },
  uses: {
    free_one: '{{count}} uso',
    free_other: '{{count}} usos',
    limited_one: '{{count}} de {{max}} usos',
    limited_other: '{{count}} de {{max}} usos',
  },
  status: {
    active: 'Ativo',
    scheduled: 'Agendado',
    paused: 'Pausado',
    exhausted: 'Esgotado',
    ended: 'Encerrado',
  },
  period: {
    between: 'De {{start}} a {{end}}',
    from: 'A partir de {{start}}',
    until: 'Até {{end}}',
  },
  sheet: {
    appliesTo: 'Vale para',
    uses: 'Usos',
    limits: 'Regras',
    period: 'Período',
    onePerAccount: 'Um uso por conta',
    maxTickets_one: 'Desconto em {{count}} ingresso por compra',
    maxTickets_other: 'Desconto em até {{count}} ingressos por compra',
    lockedHint:
      'Este cupom já foi usado: só o limite de usos, o fim e a pausa podem mudar. Para mudar o desconto, pause e crie outro.',
    edit: 'Editar cupom',
    editLimits: 'Mudar limite ou fim',
    pause: 'Pausar',
    resume: 'Reativar',
    delete: 'Excluir cupom',
    deleteTitle: 'Excluir {{code}}?',
    deleteMessage: 'O cupom ainda não foi usado. Depois de excluído, o código para de funcionar.',
  },
  form: {
    createTitle: 'Criar cupom',
    editTitle: 'Editar cupom',
    description: 'O comprador digita o código na hora da compra.',
    code: 'Código',
    codePlaceholder: 'Ex.: VERAO10',
    discount: 'Desconto',
    percentage: 'Porcentagem',
    fixed: 'Valor fixo',
    percentLabel: 'Porcentagem de desconto',
    valueLabel: 'Valor do desconto',
    percentHint: 'Vale para cada ingresso com desconto. Máximo de {{max}}%.',
    fixedHint:
      'Desconto uma vez por compra, qualquer que seja a quantidade. Nunca passa de {{max}}% do valor.',
    appliesTo: 'Vale para',
    someOptions: 'Escolher lotes',
    limits: 'Regras',
    limitUses: 'Limitar usos',
    limitUsesHint: 'Cada compra com o cupom conta um uso.',
    maxUsesLabel: 'Número de usos',
    onePerAccount: 'Um uso por conta',
    onePerAccountHint: 'Cada pessoa usa o cupom uma vez.',
    limitTickets: 'Limitar ingressos com desconto',
    limitTicketsHint: 'Na compra, só os primeiros ingressos levam desconto.',
    maxTicketsLabel: 'Ingressos com desconto por compra',
    startsAt: 'Começa em',
    endsAt: 'Termina em',
    periodHint: 'Sem datas, vale enquanto houver ingressos.',
    save: 'Salvar',
    create: 'Criar cupom',
    errors: {
      code: 'Código: de 3 a 20 letras ou números, sem espaço.',
      percent: 'Desconto de 1% a 90%.',
      value: 'Informe o valor do desconto.',
      targets: 'Escolha pelo menos um evento.',
      options: 'Escolha pelo menos um lote ou marque "Todos os lotes".',
      maxUses: 'O limite de usos precisa ser maior que os usos que já existem.',
      maxTickets: 'Escolha de 1 a 50 ingressos com desconto.',
      period: 'O fim precisa ser depois do começo.',
    },
  },
  errors: {
    PROMO_CODE_TAKEN: 'Você já tem um cupom com este código.',
    PROMO_LOCKED: 'Este cupom já foi usado: só o limite, o fim e a pausa podem mudar.',
    PROMO_IN_USE: 'Cupom já usado não pode ser excluído. Pause ou encerre.',
    PROMO_TARGET_INVALID: 'Um dos eventos ou lotes não está mais disponível.',
    VALIDATION_ERROR: 'Confira os campos do cupom.',
    failed: 'Não foi possível salvar agora. Tente de novo.',
  },
};

export const promoCodeEn: PromoCodeTranslation = {
  title: 'Promo codes',
  subtitle: 'Discounts the buyer types in at checkout.',
  forEvent: 'Promo codes valid for {{title}}.',
  showAll: 'See all promo codes',
  create: 'Create',
  loadError: "Couldn't load the promo codes.",
  noEvents: 'Create an event to offer promo codes.',
  empty: 'No promo codes yet.',
  emptyEvent: 'No promo code is valid for this event.',
  unknownTarget: 'Removed listing',
  targetsMore: '{{first}} and {{count}} more',
  allOptions: 'All ticket types',
  discount: { percentage: '{{value}}% per ticket', fixed: '{{value}} per purchase' },
  uses: {
    free_one: '{{count}} use',
    free_other: '{{count}} uses',
    limited_one: '{{count}} of {{max}} uses',
    limited_other: '{{count}} of {{max}} uses',
  },
  status: {
    active: 'Active',
    scheduled: 'Scheduled',
    paused: 'Paused',
    exhausted: 'Used up',
    ended: 'Ended',
  },
  period: {
    between: 'From {{start}} to {{end}}',
    from: 'From {{start}}',
    until: 'Until {{end}}',
  },
  sheet: {
    appliesTo: 'Valid for',
    uses: 'Uses',
    limits: 'Rules',
    period: 'Period',
    onePerAccount: 'One use per account',
    maxTickets_one: 'Discount on {{count}} ticket per purchase',
    maxTickets_other: 'Discount on up to {{count}} tickets per purchase',
    lockedHint:
      'This code has been used: only the use limit, the end and pausing can change. To change the discount, pause it and create another.',
    edit: 'Edit promo code',
    editLimits: 'Change limit or end',
    pause: 'Pause',
    resume: 'Resume',
    delete: 'Delete promo code',
    deleteTitle: 'Delete {{code}}?',
    deleteMessage: 'The code has not been used yet. Once deleted, it stops working.',
  },
  form: {
    createTitle: 'Create promo code',
    editTitle: 'Edit promo code',
    description: 'The buyer types the code at checkout.',
    code: 'Code',
    codePlaceholder: 'E.g. SUMMER10',
    discount: 'Discount',
    percentage: 'Percentage',
    fixed: 'Fixed amount',
    percentLabel: 'Discount percentage',
    valueLabel: 'Discount amount',
    percentHint: 'Applies to each discounted ticket. Up to {{max}}%.',
    fixedHint:
      'Discount once per purchase, whatever the quantity. Never more than {{max}}% of the price.',
    appliesTo: 'Valid for',
    someOptions: 'Choose ticket types',
    limits: 'Rules',
    limitUses: 'Limit uses',
    limitUsesHint: 'Each purchase with the code counts as one use.',
    maxUsesLabel: 'Number of uses',
    onePerAccount: 'One use per account',
    onePerAccountHint: 'Each person can use the code once.',
    limitTickets: 'Limit discounted tickets',
    limitTicketsHint: 'In a purchase, only the first tickets get the discount.',
    maxTicketsLabel: 'Discounted tickets per purchase',
    startsAt: 'Starts on',
    endsAt: 'Ends on',
    periodHint: 'Without dates, it is valid while tickets are available.',
    save: 'Save',
    create: 'Create promo code',
    errors: {
      code: 'Code: 3 to 20 letters or numbers, no spaces.',
      percent: 'Discount from 1% to 90%.',
      value: 'Enter the discount amount.',
      targets: 'Choose at least one event.',
      options: 'Choose at least one ticket type or select "All ticket types".',
      maxUses: 'The use limit must be higher than the uses so far.',
      maxTickets: 'Choose 1 to 50 discounted tickets.',
      period: 'The end must be after the start.',
    },
  },
  errors: {
    PROMO_CODE_TAKEN: 'You already have a promo code with this code.',
    PROMO_LOCKED: 'This code has been used: only the limit, the end and pausing can change.',
    PROMO_IN_USE: "A used code can't be deleted. Pause or end it.",
    PROMO_TARGET_INVALID: 'One of the events or ticket types is no longer available.',
    VALIDATION_ERROR: 'Check the promo code fields.',
    failed: "Couldn't save right now. Try again.",
  },
};

export const promoCodeFr: PromoCodeTranslation = {
  title: 'Codes promo',
  subtitle: "Des réductions que l'acheteur saisit au paiement.",
  forEvent: 'Codes promo valables pour {{title}}.',
  showAll: 'Voir tous les codes promo',
  create: 'Créer',
  loadError: 'Impossible de charger les codes promo.',
  noEvents: 'Créez un événement pour proposer des codes promo.',
  empty: 'Aucun code promo pour le moment.',
  emptyEvent: "Aucun code promo n'est valable pour cet événement.",
  unknownTarget: 'Annonce supprimée',
  targetsMore: '{{first}} et {{count}} autres',
  allOptions: 'Tous les billets',
  discount: { percentage: '{{value}} % par billet', fixed: '{{value}} par achat' },
  uses: {
    free_one: '{{count}} utilisation',
    free_other: '{{count}} utilisations',
    limited_one: '{{count}} utilisation sur {{max}}',
    limited_other: '{{count}} utilisations sur {{max}}',
  },
  status: {
    active: 'Actif',
    scheduled: 'Programmé',
    paused: 'En pause',
    exhausted: 'Épuisé',
    ended: 'Terminé',
  },
  period: {
    between: 'Du {{start}} au {{end}}',
    from: 'À partir du {{start}}',
    until: "Jusqu'au {{end}}",
  },
  sheet: {
    appliesTo: 'Valable pour',
    uses: 'Utilisations',
    limits: 'Règles',
    period: 'Période',
    onePerAccount: 'Une utilisation par compte',
    maxTickets_one: 'Réduction sur {{count}} billet par achat',
    maxTickets_other: "Réduction sur jusqu'à {{count}} billets par achat",
    lockedHint:
      'Ce code a déjà été utilisé : seuls la limite, la fin et la pause peuvent changer. Pour changer la réduction, mettez-le en pause et créez-en un autre.',
    edit: 'Modifier le code promo',
    editLimits: 'Changer la limite ou la fin',
    pause: 'Mettre en pause',
    resume: 'Réactiver',
    delete: 'Supprimer le code promo',
    deleteTitle: 'Supprimer {{code}} ?',
    deleteMessage: "Le code n'a pas encore été utilisé. Une fois supprimé, il ne fonctionne plus.",
  },
  form: {
    createTitle: 'Créer un code promo',
    editTitle: 'Modifier le code promo',
    description: "L'acheteur saisit le code au moment du paiement.",
    code: 'Code',
    codePlaceholder: 'Ex. : ETE10',
    discount: 'Réduction',
    percentage: 'Pourcentage',
    fixed: 'Montant fixe',
    percentLabel: 'Pourcentage de réduction',
    valueLabel: 'Montant de la réduction',
    percentHint: "S'applique à chaque billet réduit. Jusqu'à {{max}} %.",
    fixedHint:
      'Réduction une fois par achat, quelle que soit la quantité. Jamais plus de {{max}} % du prix.',
    appliesTo: 'Valable pour',
    someOptions: 'Choisir les billets',
    limits: 'Règles',
    limitUses: 'Limiter les utilisations',
    limitUsesHint: 'Chaque achat avec le code compte pour une utilisation.',
    maxUsesLabel: "Nombre d'utilisations",
    onePerAccount: 'Une utilisation par compte',
    onePerAccountHint: 'Chaque personne utilise le code une fois.',
    limitTickets: 'Limiter les billets réduits',
    limitTicketsHint: 'Dans un achat, seuls les premiers billets ont la réduction.',
    maxTicketsLabel: 'Billets réduits par achat',
    startsAt: 'Commence le',
    endsAt: 'Se termine le',
    periodHint: 'Sans dates, valable tant qu’il reste des billets.',
    save: 'Enregistrer',
    create: 'Créer le code promo',
    errors: {
      code: 'Code : de 3 à 20 lettres ou chiffres, sans espace.',
      percent: 'Réduction de 1 % à 90 %.',
      value: 'Indiquez le montant de la réduction.',
      targets: 'Choisissez au moins un événement.',
      options: 'Choisissez au moins un billet ou cochez « Tous les billets ».',
      maxUses: 'La limite doit dépasser les utilisations déjà faites.',
      maxTickets: 'Choisissez de 1 à 50 billets réduits.',
      period: 'La fin doit être après le début.',
    },
  },
  errors: {
    PROMO_CODE_TAKEN: 'Vous avez déjà un code promo avec ce code.',
    PROMO_LOCKED:
      'Ce code a déjà été utilisé : seuls la limite, la fin et la pause peuvent changer.',
    PROMO_IN_USE:
      'Un code déjà utilisé ne peut pas être supprimé. Mettez-le en pause ou terminez-le.',
    PROMO_TARGET_INVALID: "Un des événements ou billets n'est plus disponible.",
    VALIDATION_ERROR: 'Vérifiez les champs du code promo.',
    failed: "Impossible d'enregistrer pour le moment. Réessayez.",
  },
};
