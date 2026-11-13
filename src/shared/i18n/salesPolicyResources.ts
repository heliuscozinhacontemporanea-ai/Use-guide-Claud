/** Textos das políticas de cancelamento e da taxa de serviço (D14). pt-BR é a fonte. */
interface PolicyText {
  title: string;
  description: string;
}

export interface SalesPolicyTranslation {
  policies: {
    event: Record<'flexible' | 'moderate' | 'strict' | 'none', PolicyText>;
    booking: Record<'flexible' | 'moderate' | 'strict' | 'none', PolicyText>;
    transfer: Record<'transfer_flexible' | 'transfer_standard', PolicyText>;
  };
  sectionTitle: string;
  policyLegend: string;
  lockedHint: string;
  withdrawal: string;
  withdrawalNoFee: string;
  noShow: string;
  serviceFee: {
    legend: string;
    passToBuyer: PolicyText;
    absorb: PolicyText;
    line: string;
    notRefundable: string;
  };
}

export const salesPolicyPtBR: SalesPolicyTranslation = {
  policies: {
    event: {
      flexible: { title: 'Flexível', description: 'Reembolso integral até 24 h antes do início.' },
      moderate: {
        title: 'Moderada',
        description: 'Reembolso integral até 7 dias antes do início.',
      },
      strict: { title: 'Rígida', description: 'Reembolso integral até 30 dias antes do início.' },
      none: {
        title: 'Sem reembolso',
        description: 'Sem reembolso fora do direito de arrependimento.',
      },
    },
    booking: {
      flexible: { title: 'Flexível', description: 'Reembolso integral até 24 h antes do início.' },
      moderate: {
        title: 'Moderada',
        description: 'Reembolso integral até 5 dias antes do início; 50% até 24 h antes.',
      },
      strict: { title: 'Rígida', description: 'Reembolso de 50% até 7 dias antes do início.' },
      none: {
        title: 'Sem reembolso',
        description: 'Sem reembolso fora do direito de arrependimento.',
      },
    },
    transfer: {
      transfer_flexible: {
        title: 'Translado flexível',
        description: 'Reembolso integral até 24 h antes da saída.',
      },
      transfer_standard: {
        title: 'Translado padrão',
        description: 'Reembolso de 95% até 24 h antes da saída.',
      },
    },
  },
  sectionTitle: 'Regras de venda',
  policyLegend: 'Política de cancelamento',
  lockedHint: 'Depois de publicar, só é possível trocar por uma política mais flexível.',
  withdrawal:
    'Direito de arrependimento: reembolso integral, inclusive a taxa de serviço, se cancelar em até 7 dias da compra e até 48 h antes do início.',
  withdrawalNoFee:
    'Direito de arrependimento: reembolso integral se cancelar em até 7 dias da compra e até 48 h antes do início.',
  noShow: 'Quem não comparece não tem reembolso.',
  serviceFee: {
    legend: 'Taxa de serviço',
    passToBuyer: {
      title: 'O comprador paga',
      description: 'Uma taxa de serviço por ingresso pago é somada ao preço do ingresso.',
    },
    absorb: {
      title: 'Eu absorvo',
      description: 'O comprador paga só o preço do ingresso, e a comissão da plataforma é maior.',
    },
    line: 'Taxa de serviço',
    notRefundable:
      'A taxa de serviço só é devolvida no direito de arrependimento ou se o organizador cancelar.',
  },
};
