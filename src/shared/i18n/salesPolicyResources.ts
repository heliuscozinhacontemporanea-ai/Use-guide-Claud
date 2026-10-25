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
  policyLegend: string;
  lockedHint: string;
  withdrawal: string;
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
  policyLegend: 'Política de cancelamento',
  lockedHint: 'Depois de publicar, só é possível trocar por uma política mais flexível.',
  withdrawal:
    'Direito de arrependimento: reembolso integral, inclusive a taxa de serviço, se cancelar em até 7 dias da compra e até 48 h antes do início.',
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

export const salesPolicyEn: SalesPolicyTranslation = {
  policies: {
    event: {
      flexible: { title: 'Flexible', description: 'Full refund up to 24 h before the start.' },
      moderate: { title: 'Moderate', description: 'Full refund up to 7 days before the start.' },
      strict: { title: 'Strict', description: 'Full refund up to 30 days before the start.' },
      none: { title: 'No refund', description: 'No refund outside the right of withdrawal.' },
    },
    booking: {
      flexible: { title: 'Flexible', description: 'Full refund up to 24 h before the start.' },
      moderate: {
        title: 'Moderate',
        description: 'Full refund up to 5 days before the start; 50% up to 24 h before.',
      },
      strict: { title: 'Strict', description: '50% refund up to 7 days before the start.' },
      none: { title: 'No refund', description: 'No refund outside the right of withdrawal.' },
    },
    transfer: {
      transfer_flexible: {
        title: 'Flexible transfer',
        description: 'Full refund up to 24 h before departure.',
      },
      transfer_standard: {
        title: 'Standard transfer',
        description: '95% refund up to 24 h before departure.',
      },
    },
  },
  policyLegend: 'Cancellation policy',
  lockedHint: 'After publishing, you can only switch to a more flexible policy.',
  withdrawal:
    'Right of withdrawal: full refund, service fee included, if you cancel within 7 days of purchase and at least 48 h before the start.',
  noShow: 'No-shows are not refunded.',
  serviceFee: {
    legend: 'Service fee',
    passToBuyer: {
      title: 'The buyer pays',
      description: 'A service fee per paid ticket is added to the ticket price.',
    },
    absorb: {
      title: 'I absorb it',
      description: 'The buyer pays only the ticket price, and the platform commission is higher.',
    },
    line: 'Service fee',
    notRefundable:
      'The service fee is only refunded under the right of withdrawal or if the organizer cancels.',
  },
};

export const salesPolicyFr: SalesPolicyTranslation = {
  policies: {
    event: {
      flexible: {
        title: 'Flexible',
        description: 'Remboursement intégral jusqu’à 24 h avant le début.',
      },
      moderate: {
        title: 'Modérée',
        description: 'Remboursement intégral jusqu’à 7 jours avant le début.',
      },
      strict: {
        title: 'Stricte',
        description: 'Remboursement intégral jusqu’à 30 jours avant le début.',
      },
      none: {
        title: 'Sans remboursement',
        description: 'Aucun remboursement en dehors du droit de rétractation.',
      },
    },
    booking: {
      flexible: {
        title: 'Flexible',
        description: 'Remboursement intégral jusqu’à 24 h avant le début.',
      },
      moderate: {
        title: 'Modérée',
        description:
          'Remboursement intégral jusqu’à 5 jours avant le début ; 50 % jusqu’à 24 h avant.',
      },
      strict: {
        title: 'Stricte',
        description: 'Remboursement de 50 % jusqu’à 7 jours avant le début.',
      },
      none: {
        title: 'Sans remboursement',
        description: 'Aucun remboursement en dehors du droit de rétractation.',
      },
    },
    transfer: {
      transfer_flexible: {
        title: 'Transfert flexible',
        description: 'Remboursement intégral jusqu’à 24 h avant le départ.',
      },
      transfer_standard: {
        title: 'Transfert standard',
        description: 'Remboursement de 95 % jusqu’à 24 h avant le départ.',
      },
    },
  },
  policyLegend: 'Politique d’annulation',
  lockedHint: 'Après la publication, vous ne pouvez passer qu’à une politique plus flexible.',
  withdrawal:
    'Droit de rétractation : remboursement intégral, frais de service compris, si vous annulez dans les 7 jours suivant l’achat et au moins 48 h avant le début.',
  noShow: 'Aucun remboursement en cas d’absence.',
  serviceFee: {
    legend: 'Frais de service',
    passToBuyer: {
      title: 'L’acheteur paie',
      description: 'Des frais de service par billet payant s’ajoutent au prix du billet.',
    },
    absorb: {
      title: 'Je les prends en charge',
      description:
        'L’acheteur ne paie que le prix du billet, et la commission de la plateforme est plus élevée.',
    },
    line: 'Frais de service',
    notRefundable:
      'Les frais de service ne sont remboursés qu’en cas de rétractation ou d’annulation par l’organisateur.',
  },
};
