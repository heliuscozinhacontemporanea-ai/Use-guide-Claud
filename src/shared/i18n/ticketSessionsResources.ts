/** Textos das ações de sessão do evento no painel do parceiro (D14, D16). pt-BR é a fonte. */
export interface TicketSessionsTranslation {
  sheet: {
    sold: string;
    soldTickets: string;
    entered: string;
    enteredOf: string;
    openGate: string;
    postpone: string;
    cancel: string;
    gateTitle: string;
    openGateMode: string;
    offlineHint: string;
    error: string;
  };
  postpone: string;
  cancel: string;
  statusPostponed: string;
  statusCanceled: string;
  accountNotice: string;
  entries: {
    title: string;
    open: string;
    count_one: string;
    count_other: string;
    empty: string;
    error: string;
    buyer: string;
    guest: string;
    guestTag: string;
    offline: string;
    method: { qr: string; code: string };
  };
  postponeDialog: {
    title: string;
    description: string;
    newStart: string;
    durationKept: string;
    reason: string;
    reasonHint: string;
    submit: string;
    invalid: string;
    done_one: string;
    done_other: string;
  };
  cancelDialog: {
    title: string;
    noSales: string;
    withSales_one: string;
    withSales_other: string;
    penalty: string;
    forceMajeure: string;
    reason: string;
    reasonHint: string;
    postponeInstead: string;
    confirm: string;
    back: string;
    invalid: string;
    done: string;
  };
  failed: string;
}

export const ticketSessionsPtBR: TicketSessionsTranslation = {
  sheet: {
    sold: 'Vendidos',
    soldTickets: 'Ingressos vendidos',
    entered: 'Entraram',
    enteredOf: '{{entered}} de {{total}}',
    openGate: 'Abrir portaria',
    postpone: 'Adiar sessão',
    cancel: 'Cancelar sessão',
    gateTitle: 'Portaria',
    openGateMode: 'Abrir modo portaria',
    offlineHint:
      'Sem internet, a portaria continua conferindo os QR Codes e envia as entradas quando a conexão voltar.',
    error: 'Não foi possível carregar a sessão.',
  },
  postpone: 'Adiar sessão',
  cancel: 'Cancelar sessão',
  statusPostponed: 'Sessão adiada',
  statusCanceled: 'Sessão cancelada',
  accountNotice:
    'Venda de ingressos pagos indisponível: conclua a configuração financeira do CNPJ do estabelecimento deste evento. Inscrições gratuitas funcionam normalmente.',
  entries: {
    title: 'Entradas',
    open: 'Ver quem entrou',
    count_one: '{{count}} entrada',
    count_other: '{{count}} entradas',
    empty: 'Ninguém entrou ainda.',
    error: 'Não foi possível carregar as entradas.',
    buyer: 'Comprador',
    guest: 'Convidado',
    guestTag: 'convidado',
    offline: 'registrada sem internet',
    method: { qr: 'QR', code: 'Código' },
  },
  postponeDialog: {
    title: 'Adiar sessão',
    description:
      'Os ingressos valem na nova data, sem multa para você. Cada comprador é avisado e tem 7 dias para pedir reembolso integral, com a taxa de serviço.',
    newStart: 'Nova data e hora de início',
    durationKept: 'A duração da sessão continua a mesma.',
    reason: 'Motivo',
    reasonHint: 'Aparece no aviso aos compradores. De 3 a 300 caracteres.',
    submit: 'Adiar sessão',
    invalid: 'Informe uma data futura e o motivo.',
    done_one: 'Sessão adiada. {{count}} pedido vale na nova data.',
    done_other: 'Sessão adiada. {{count}} pedidos valem na nova data.',
  },
  cancelDialog: {
    title: 'Cancelar sessão',
    noSales: 'Esta sessão não tem ingressos pagos. Cancelar encerra as vendas dela.',
    withSales_one:
      'Esta sessão tem {{count}} pedido pago. Ele será reembolsado por inteiro, com a taxa de serviço.',
    withSales_other:
      'Esta sessão tem {{count}} pedidos pagos. Todos serão reembolsados por inteiro, com a taxa de serviço.',
    penalty:
      'Seu CNPJ paga multa de 20% do valor vendido, com 24 h para pagar em Recebimentos › Dívidas. Depois disso, a multa é descontada dos repasses e as vendas do CNPJ ficam pausadas.',
    forceMajeure:
      'Foi por força maior (ex.: vento ou interdição pelas autoridades)? Declare em Recebimentos › Dívidas antes do vencimento: a multa fica suspensa até a análise.',
    reason: 'Motivo do cancelamento',
    reasonHint: 'Aparece no aviso aos compradores. De 3 a 300 caracteres.',
    postponeInstead: 'Adiar em vez de cancelar',
    confirm: 'Cancelar sessão',
    back: 'Voltar',
    invalid: 'Informe o motivo do cancelamento.',
    done: 'Sessão cancelada. Os reembolsos foram iniciados.',
  },
  failed: 'Não foi possível concluir agora. Tente de novo.',
};
