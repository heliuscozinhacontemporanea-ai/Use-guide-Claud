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

export const partnerEarningsEn: PartnerEarningsTranslation = {
  title: 'Earnings',
  toReceive: 'To receive',
  toReceiveHint_one: 'in {{count}} payout',
  toReceiveHint_other: 'in {{count}} payouts',
  received: 'Received in {{month}}',
  receivedHint: 'so far',
  tabs: { payouts: 'Payouts', statement: 'Statement', debts: 'Debts' },
  empty: 'No payouts yet.',
  loadError: "Couldn't load your earnings.",
  status: { scheduled: 'Scheduled', held: 'Held until a decision', paid: 'Paid' },
  hold: {
    claim: 'Customer opened a claim',
    dispute: 'Card dispute',
    service_proof: 'Waiting for service confirmation',
  },
  single: '{{title}} ({{dates}})',
  many_one: '{{count}} sale on {{dates}}',
  many_other: '{{count}} sales on {{dates}}',
  accounts: 'Payout accounts',
  accountsReady_one: '{{count}} CNPJ · all set',
  accountsReady_other: '{{count}} CNPJs · all set',
  accountsPartial: '{{ready}} of {{count}} ready to receive',
  reports: {
    title: 'Reports',
    periods: { '7d': '7 days', '30d': '30 days', '12m': '12 months' },
    sold: 'Sold in {{period}}',
    groupBy: 'Group by: {{unit}}',
    units: { day: 'Day', week: 'Week', month: 'Month' },
    byItem: 'By item',
    sales_one: '{{count}} sale',
    sales_other: '{{count}} sales',
    empty: 'No sales in this period.',
    truncated: 'Many sales in this period: amounts may be below the total.',
    loadError: "Couldn't load the reports.",
    profile: 'Visits and reviews',
    profileHint: 'Who saw your listings and reviews to reply to',
  },
  sheet: {
    title: 'Payout on {{date}}',
    heldTitle: 'Held sale',
    accountTo: 'Goes to {{name}} · {{document}}',
    accountPaid: 'Paid to {{name}} · {{document}}',
    sold: 'Sold',
    fee: 'Use Guide fee ({{percent}})',
    offset: 'Debt deduction',
    receive: 'You receive',
    noteScheduled:
      'The payout goes out 2 days after the service, unless the customer opens a claim.',
    noteHeld: 'The amount is held until a decision on this sale.',
  },
};

export const partnerEarningsFr: PartnerEarningsTranslation = {
  title: 'Gains',
  toReceive: 'À recevoir',
  toReceiveHint_one: 'en {{count}} versement',
  toReceiveHint_other: 'en {{count}} versements',
  received: 'Reçu en {{month}}',
  receivedHint: "jusqu'à aujourd'hui",
  tabs: { payouts: 'Versements', statement: 'Relevé', debts: 'Dettes' },
  empty: 'Aucun versement pour le moment.',
  loadError: 'Impossible de charger vos gains.',
  status: { scheduled: 'Programmé', held: "Retenu jusqu'à la décision", paid: 'Payé' },
  hold: {
    claim: 'Le client a ouvert une réclamation',
    dispute: 'Contestation de carte',
    service_proof: 'En attente de la confirmation du service',
  },
  single: '{{title}} ({{dates}})',
  many_one: '{{count}} vente du {{dates}}',
  many_other: '{{count}} ventes du {{dates}}',
  accounts: 'Comptes de versement',
  accountsReady_one: '{{count}} CNPJ · tout est en ordre',
  accountsReady_other: '{{count}} CNPJ · tout est en ordre',
  accountsPartial: '{{ready}} sur {{count}} prêts à recevoir',
  reports: {
    title: 'Rapports',
    periods: { '7d': '7 jours', '30d': '30 jours', '12m': '12 mois' },
    sold: 'Vendu sur {{period}}',
    groupBy: 'Regrouper par : {{unit}}',
    units: { day: 'Jour', week: 'Semaine', month: 'Mois' },
    byItem: 'Par élément',
    sales_one: '{{count}} vente',
    sales_other: '{{count}} ventes',
    empty: 'Aucune vente sur la période.',
    truncated: 'Beaucoup de ventes sur la période : les montants peuvent être inférieurs au total.',
    loadError: 'Impossible de charger les rapports.',
    profile: 'Visites et avis',
    profileHint: 'Qui a vu vos annonces et les avis à répondre',
  },
  sheet: {
    title: 'Versement du {{date}}',
    heldTitle: 'Vente retenue',
    accountTo: 'Versé à {{name}} · {{document}}',
    accountPaid: 'Versé à {{name}} · {{document}}',
    sold: 'Vendu',
    fee: 'Frais Use Guide ({{percent}})',
    offset: 'Déduction de dette',
    receive: 'Vous recevez',
    noteScheduled:
      "Le versement part 2 jours après le service, si le client n'ouvre pas de réclamation.",
    noteHeld: "Le montant est retenu jusqu'à la décision sur cette vente.",
  },
};
