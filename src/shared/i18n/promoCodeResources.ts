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
  allPriceOptions: string;
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
    somePriceOptions: string;
    events: string;
    offers: string;
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
  noEvents: 'Crie um evento ou uma oferta para oferecer cupons de desconto.',
  empty: 'Nenhum cupom ainda.',
  emptyEvent: 'Nenhum cupom vale para este evento.',
  unknownTarget: 'Anúncio removido',
  targetsMore: '{{first}} e mais {{count}}',
  allOptions: 'Todos os lotes',
  allPriceOptions: 'Todas as opções de preço',
  discount: { percentage: '{{value}}% de desconto', fixed: '{{value}} por compra' },
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
    maxTickets_one: 'Desconto em {{count}} ingresso ou pessoa por compra',
    maxTickets_other: 'Desconto em até {{count}} ingressos ou pessoas por compra',
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
    percentHint: 'Vale para cada ingresso ou pessoa com desconto. Máximo de {{max}}%.',
    fixedHint:
      'Desconto uma vez por compra, qualquer que seja a quantidade. Nunca passa de {{max}}% do valor.',
    appliesTo: 'Vale para',
    someOptions: 'Escolher lotes',
    somePriceOptions: 'Escolher opções de preço',
    events: 'Eventos',
    offers: 'Passeios, aluguéis, translados e entradas',
    limits: 'Regras',
    limitUses: 'Limitar usos',
    limitUsesHint: 'Cada compra com o cupom conta um uso.',
    maxUsesLabel: 'Número de usos',
    onePerAccount: 'Um uso por conta',
    onePerAccountHint: 'Cada pessoa usa o cupom uma vez.',
    limitTickets: 'Limitar ingressos ou pessoas com desconto',
    limitTicketsHint: 'Na compra, só os primeiros ingressos ou pessoas levam desconto.',
    maxTicketsLabel: 'Ingressos ou pessoas com desconto por compra',
    startsAt: 'Começa em',
    endsAt: 'Termina em',
    periodHint: 'Sem datas, vale enquanto o anúncio estiver à venda.',
    save: 'Salvar',
    create: 'Criar cupom',
    errors: {
      code: 'Código: de 3 a 20 letras ou números, sem espaço.',
      percent: 'Desconto de 1% a 90%.',
      value: 'Informe o valor do desconto.',
      targets: 'Escolha pelo menos um evento ou oferta.',
      options: 'Escolha pelo menos um lote ou opção, ou marque todos.',
      maxUses: 'O limite de usos precisa ser maior que os usos que já existem.',
      maxTickets: 'Escolha de 1 a 50 ingressos com desconto.',
      period: 'O fim precisa ser depois do começo.',
    },
  },
  errors: {
    PROMO_CODE_TAKEN: 'Você já tem um cupom com este código.',
    PROMO_LOCKED: 'Este cupom já foi usado: só o limite, o fim e a pausa podem mudar.',
    PROMO_IN_USE: 'Cupom já usado não pode ser excluído. Pause ou encerre.',
    PROMO_TARGET_INVALID: 'Um dos eventos, ofertas ou opções não está mais disponível.',
    VALIDATION_ERROR: 'Confira os campos do cupom.',
    failed: 'Não foi possível salvar agora. Tente de novo.',
  },
};
