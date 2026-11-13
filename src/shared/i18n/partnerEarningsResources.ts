/** Ganhos do painel do parceiro (p20, p21). */
export interface PartnerEarningsTranslation {
  title: string;
  toReceive: string;
  toReceiveHint_one: string;
  toReceiveHint_other: string;
  received: string;
  receivedHint: string;
  tabs: { payouts: string; statement: string; debts: string };
  empty: string;
  loadError: string;
  status: { scheduled: string; held: string; paid: string };
  hold: { claim: string; dispute: string; service_proof: string };
  single: string;
  many_one: string;
  many_other: string;
  accounts: string;
  accountsReady_zero: string;
  accountsReady_one: string;
  accountsReady_other: string;
  accountsPartial: string;
  reports: {
    title: string;
    periods: { '7d': string; '30d': string; '12m': string };
    sold: string;
    groupBy: string;
    units: { day: string; week: string; month: string };
    byItem: string;
    sales_one: string;
    sales_other: string;
    tickets_one: string;
    tickets_other: string;
    promoterTickets_one: string;
    promoterTickets_other: string;
    people_one: string;
    people_other: string;
    groups_one: string;
    groups_other: string;
    empty: string;
    truncated: string;
    loadError: string;
    profile: string;
    profileHint: string;
  };
  sheet: {
    title: string;
    heldTitle: string;
    accountTo: string;
    accountPaid: string;
    sold: string;
    fee: string;
    offset: string;
    receive: string;
    noteScheduled: string;
    noteHeld: string;
  };
}

export const partnerEarningsPtBR: PartnerEarningsTranslation = {
  title: 'Ganhos',
  toReceive: 'A receber',
  toReceiveHint_one: 'em {{count}} repasse',
  toReceiveHint_other: 'em {{count}} repasses',
  received: 'Recebido em {{month}}',
  receivedHint: 'até hoje',
  tabs: { payouts: 'Repasses', statement: 'Extrato', debts: 'Dívidas' },
  empty: 'Nenhum repasse ainda.',
  loadError: 'Não foi possível carregar os ganhos.',
  status: { scheduled: 'Programado', held: 'Segurado até a decisão', paid: 'Pago' },
  hold: {
    claim: 'Cliente abriu reclamação',
    dispute: 'Contestação no cartão',
    service_proof: 'Aguardando a confirmação do serviço',
  },
  single: '{{title}} ({{dates}})',
  many_one: '{{count}} venda de {{dates}}',
  many_other: '{{count}} vendas de {{dates}}',
  accounts: 'Contas de recebimento',
  accountsReady_zero: 'Nenhuma conta ainda',
  accountsReady_one: '{{count}} CNPJ · tudo certo',
  accountsReady_other: '{{count}} CNPJs · tudo certo',
  accountsPartial: '{{ready}} de {{count}} prontas para receber',
  reports: {
    title: 'Relatórios',
    periods: { '7d': '7 dias', '30d': '30 dias', '12m': '12 meses' },
    sold: 'Vendido em {{period}}',
    groupBy: 'Agrupar por: {{unit}}',
    units: { day: 'Dia', week: 'Semana', month: 'Mês' },
    byItem: 'Por item',
    sales_one: '{{count}} venda',
    sales_other: '{{count}} vendas',
    tickets_one: '{{count}} ingresso',
    tickets_other: '{{count}} ingressos',
    promoterTickets_one: '{{count}} por divulgadores',
    promoterTickets_other: '{{count}} por divulgadores',
    people_one: '{{count}} pessoa',
    people_other: '{{count}} pessoas',
    groups_one: '{{count}} grupo',
    groups_other: '{{count}} grupos',
    empty: 'Nenhuma venda no período.',
    truncated: 'Muitas vendas no período: os valores podem estar abaixo do total.',
    loadError: 'Não foi possível carregar os relatórios.',
    profile: 'Visitas e avaliações',
    profileHint: 'Quem viu seus anúncios e avaliações para responder',
  },
  sheet: {
    title: 'Repasse de {{date}}',
    heldTitle: 'Venda retida',
    accountTo: 'Cai na conta de {{name}} · {{document}}',
    accountPaid: 'Caiu na conta de {{name}} · {{document}}',
    sold: 'Vendido',
    fee: 'Taxa do Use Guide ({{percent}})',
    offset: 'Desconto de dívida',
    receive: 'Você recebe',
    noteScheduled: 'O repasse sai 2 dias depois do serviço, se o cliente não abrir reclamação.',
    noteHeld: 'O valor fica retido até a decisão sobre esta venda.',
  },
};
