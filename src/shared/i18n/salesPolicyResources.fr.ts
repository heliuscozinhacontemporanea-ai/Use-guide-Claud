import type { SalesPolicyTranslation } from './salesPolicyResources';

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
  sectionTitle: 'Règles de vente',
  policyLegend: 'Politique d’annulation',
  lockedHint: 'Après la publication, vous ne pouvez passer qu’à une politique plus flexible.',
  withdrawal:
    'Droit de rétractation : remboursement intégral, frais de service compris, si vous annulez dans les 7 jours suivant l’achat et au moins 48 h avant le début.',
  withdrawalNoFee:
    'Droit de rétractation : remboursement intégral si vous annulez dans les 7 jours suivant l’achat et au moins 48 h avant le début.',
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
