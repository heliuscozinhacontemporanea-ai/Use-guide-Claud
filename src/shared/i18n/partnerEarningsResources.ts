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
