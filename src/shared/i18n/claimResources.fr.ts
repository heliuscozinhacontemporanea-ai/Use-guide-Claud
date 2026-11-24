import type { ClaimTranslation } from './claimResources';

export const claimFr: ClaimTranslation = {
  row: { question: 'Vous êtes le propriétaire ?', action: 'C’est à moi' },
  title: 'Reprendre l’annonce',
  lead: 'Use Guide vérifie vos documents et transfère l’annonce sur votre compte, avec ses photos et ses avis.',
  note: 'Le numéro du document est chiffré et n’apparaît que masqué. Pendant l’examen de la demande, l’annonce reste en ligne telle quelle.',
  submit: 'Envoyer la demande',
  loginNote:
    'Connectez-vous ou créez votre compte pour reprendre {{name}}. Vous reviendrez ensuite directement à la demande.',
  sent: {
    title: 'Demande envoyée',
    text: 'Use Guide vérifie vos documents et vous prévient dans l’app. En attendant, {{name}} reste en ligne telle quelle.',
    button: 'Aller au tableau de bord',
  },
  suggest: {
    title: 'Déjà dans le guide ?',
    action: 'C’est le mien',
    hint: 'Si c’est le vôtre, reprenez l’annonce au lieu d’en créer une autre. Sinon, continuez l’inscription normalement.',
  },
  panel: {
    pending: 'En cours d’examen',
    pendingText: 'Demande de reprise de l’annonce · envoyée le {{date}}',
    pendingHint:
      'Une fois approuvée, l’annonce apparaît dans le Catalogue et le guide des étapes montre ce qu’il manque pour vendre.',
    rejected: 'Refusée',
    rejectedText: 'Motif : {{reason}}',
    resend: 'Renvoyer',
    approved: 'Approuvée',
    approvedText: '{{name}} est maintenant à vous. Les photos, les avis et la note restent.',
  },
  admin: {
    tag: 'Reprendre l’annonce',
    place: '{{category}} · {{city}} · annonce de Use Guide',
    sentBy: 'Envoyée par {{name}} · {{date}}',
    holder: { owner: 'Titulaire, associé ou gérant', representative: 'Représentant' },
    other: 'Autre demande pour ce lieu : {{name}}, {{role}}, envoyée le {{date}}.',
    open: 'Ouvrir : {{file}}',
    approve: 'Approuver',
    reject: 'Refuser',
    confirmTitle: 'Transférer l’annonce à {{name}} ?',
    confirmText:
      'Vérifiez la carte CNPJ auprès de l’administration fiscale, le lien de la personne avec l’entreprise (QSA ou MEI) et son identité. {{listing}} passe sur ce compte avec photos, avis et note, et devient vérifiée. Les autres demandes pour ce lieu sont refusées avec le motif « Une autre demande a été approuvée ».',
    return: 'Rendre à Use Guide',
    returnConfirm:
      'Rendre {{listing}} à Use Guide ? L’annonce quitte le compte de {{name}} et la vérification est annulée.',
    returned: 'Rendue à Use Guide',
    approvedToast: 'Annonce transférée sur le compte.',
    rejectedToast: 'Demande refusée.',
    returnedToast: 'Annonce rendue à Use Guide.',
    empty: 'Aucune demande de reprise d’annonce.',
  },
  errors: {
    EMAIL_NOT_VERIFIED: 'Confirmez votre e-mail avant d’envoyer la demande.',
    TERMS_REQUIRED: 'Pour continuer, acceptez les Conditions du partenaire.',
    LISTING_NOT_CLAIMABLE: 'Cette annonce ne peut plus être reprise dans l’app.',
    ALREADY_APPROVED: 'Cette annonce est déjà à vous.',
    DOCUMENT_IN_USE: 'Ce document est déjà lié à un autre compte.',
    CNPJ_ALREADY_USED:
      'Chaque CNPJ vaut pour un établissement. Les succursales utilisent leur CNPJ.',
    LISTING_IN_USE:
      'L’annonce a déjà des réservations, des événements ou une formule du nouveau propriétaire. Réglez-le avec lui via le support.',
    NOT_PENDING: 'Cette demande a déjà été examinée.',
    failed: 'Impossible d’envoyer pour le moment. Réessayez.',
  },
};
