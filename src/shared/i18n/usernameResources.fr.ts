import type { UsernameTranslation } from './usernameResources';

export const usernameFr: UsernameTranslation = {
  title: 'Nom d’utilisateur',
  intro:
    'Votre nom d’utilisateur vous identifie sur Use Guide. D’autres personnes peuvent l’utiliser pour trouver votre compte.',
  label: 'Votre @',
  rules: 'De 3 à 30 lettres, chiffres, point ou tiret bas. Sans espaces ni accents.',
  save: 'Enregistrer',
  change: 'Changer de @',
  changeWarning:
    'Vous pouvez le changer une fois tous les 30 jours. L’ancien @ reste à vous pendant 14 jours.',
  lockedUntil: 'Vous pourrez le changer à nouveau à partir du {{date}}.',
  saved: 'C’est fait : vous êtes maintenant @{{username}}.',
  loadError: 'Impossible de charger votre nom d’utilisateur.',
  retry: 'Réessayer',
  onboardingTitle: 'Choisissez votre nom d’utilisateur',
  signOut: 'Se déconnecter',
  errors: {
    USERNAME_INVALID: 'Ce @ n’est pas autorisé. Utilisez lettres, chiffres, point ou tiret bas.',
    USERNAME_TAKEN: 'Ce @ est déjà pris. Choisissez-en un autre.',
    USERNAME_CHANGE_TOO_SOON: 'Vous avez changé de @ il y a moins de 30 jours.',
    failed: 'Impossible d’enregistrer. Réessayez.',
  },
  transfer: {
    title: 'Transférer le billet',
    label: '@ du destinataire',
    search: 'Rechercher',
    confirmTitle: 'Vérifiez qui va le recevoir',
    confirm: 'Transférer à @{{username}}',
    other: 'Chercher une autre personne',
    hint: 'Le billet quitte votre portefeuille et le QR code actuel ne fonctionne plus.',
    done: 'Billet transféré à @{{username}}.',
    returnTitle: 'Rendre le billet',
    returnHint:
      'Vous avez reçu ce billet de {{name}}. Un billet reçu ne peut revenir qu’à la personne qui l’a acheté.',
    returnConfirm: 'Rendre à {{name}}',
    returned: 'Billet rendu à {{name}}.',
    link: {
      title: 'La personne n’a pas encore de compte ?',
      hint: 'Envoyez un lien : elle crée son compte et accepte le billet. Le lien est valable 30 minutes et une seule fois, et le billet reste à vous jusqu’à l’acceptation.',
      create: 'Créer un lien de transfert',
      ready:
        'Lien prêt. Valable jusqu’à {{time}} et une seule fois. Toute personne ayant le lien peut accepter le billet : envoyez-le seulement à la bonne personne.',
      pending:
        'Un lien de transfert est ouvert jusqu’à {{time}}. Le billet reste à vous jusqu’à l’acceptation.',
      share: 'Partager',
      copy: 'Copier le lien',
      copied: 'Lien copié.',
      cancel: 'Annuler le lien',
      shareText:
        'J’ai un billet pour toi : {{event}}. Ouvre le lien, crée ton compte Use Guide et accepte-le.',
      receiveTitle: 'Vous avez reçu un billet',
      loginHint: 'Connectez-vous ou créez votre compte Use Guide pour voir et accepter le billet.',
      login: 'Se connecter ou créer un compte',
      from: 'Envoyé par {{name}}. Le lien est valable jusqu’à {{time}}.',
      accept: 'Accepter le billet',
      decline: 'Plus tard',
      accepted: 'C’est fait : le billet est dans votre portefeuille.',
      seeTickets: 'Voir mes billets',
      errors: {
        TRANSFER_LINK_INVALID: 'Ce lien n’est pas valable ou a déjà été utilisé.',
        TRANSFER_LINK_EXPIRED: 'Ce lien a expiré. Demandez-en un nouveau à l’expéditeur.',
        TRANSFER_LINK_OWN: 'Ce lien est à vous : envoyez-le à l’autre personne.',
        RECIPIENT_NOT_VERIFIED: 'Confirmez votre e-mail pour recevoir le billet.',
        RATE_LIMITED: 'Trop de tentatives d’affilée. Réessayez dans quelques minutes.',
        failed: 'Impossible de terminer. Réessayez.',
      },
    },
    errors: {
      TRANSFER_ONLY_TO_BUYER: 'Un billet reçu ne peut être rendu qu’à la personne qui l’a acheté.',
      USERNAME_NOT_FOUND:
        'Aucun compte avec ce @. Demandez à la personne de le vérifier dans Réglages.',
      TRANSFER_TO_SELF: 'Ce billet est déjà à vous.',
      RECIPIENT_NOT_VERIFIED:
        'Ce compte n’a pas confirmé son e-mail et ne peut pas recevoir de billets.',
      RATE_LIMITED: 'Trop de recherches d’affilée. Réessayez dans quelques minutes.',
      failed: 'Impossible de transférer. Réessayez.',
    },
  },
};
