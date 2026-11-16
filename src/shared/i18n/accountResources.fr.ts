import type { AccountTranslation } from './accountResources';

export const accountFr: AccountTranslation = {
  firstName: 'Prénom',
  lastName: 'Nom',
  phone: 'Téléphone',
  email: 'E-mail',
  save: 'Enregistrer les modifications',
  saving: 'Enregistrement…',
  changePassword: 'Changer le mot de passe',
  showPassword: 'Afficher le mot de passe',
  hidePassword: 'Masquer le mot de passe',
  password: {
    title: 'Nouveau mot de passe',
    current: 'Mot de passe actuel',
    new: 'Nouveau mot de passe',
    confirm: 'Confirmer le nouveau mot de passe',
    requirements: 'Le nouveau mot de passe doit avoir :',
    rules: {
      upper: 'Une majuscule',
      lower: 'Une minuscule',
      number: 'Un chiffre',
      length: '8 à 20 caractères',
    },
    submit: 'Mettre à jour le mot de passe',
    saving: 'Mise à jour…',
  },
  delete: {
    action: 'Supprimer le compte',
    title: 'Supprimer votre compte ?',
    message: 'La suppression est définitive et irréversible.',
    partnerNote: 'Vos établissements et événements enregistrés seront aussi supprimés.',
    passwordLabel: 'Pour confirmer, saisissez votre mot de passe',
    confirm: 'Supprimer le compte',
    deleting: 'Suppression…',
    cancel: 'Garder le compte',
  },
  validation: {
    firstNameRequired: 'Indiquez votre prénom.',
    firstNameTooLong: "Le prénom peut avoir jusqu'à 50 caractères.",
    lastNameRequired: 'Indiquez votre nom.',
    lastNameTooLong: "Le nom peut avoir jusqu'à 50 caractères.",
    phoneInvalid: 'Numéro de téléphone invalide.',
    currentRequired: 'Indiquez votre mot de passe actuel.',
    newRules:
      'Le mot de passe doit avoir 8 à 20 caractères, avec une majuscule, une minuscule et un chiffre.',
    confirmRequired: 'Confirmez le nouveau mot de passe.',
    mismatch: 'Les mots de passe ne correspondent pas.',
    passwordRequired: 'Indiquez votre mot de passe pour confirmer.',
  },
  feedback: {
    profileSaved: 'Informations enregistrées.',
    profileError: "Impossible d'enregistrer. Réessayez.",
    profileLoadError: 'Impossible de charger vos informations.',
    passwordSaved: 'Mot de passe mis à jour.',
    passwordError: 'Impossible de mettre à jour le mot de passe. Réessayez.',
    wrongPassword: 'Mot de passe incorrect. Vérifiez et réessayez.',
    googleCanceled: 'Annulé : confirmez avec votre compte Google pour continuer.',
    deleteError: 'Impossible de supprimer le compte. Vérifiez votre connexion et réessayez.',
    recentLogin: 'Par sécurité, reconnectez-vous avant de supprimer votre compte.',
    closureBookings:
      'Votre compte a des réservations actives en tant que partenaire. Annulez les créneaux dans l’agenda du tableau de bord et réessayez.',
    closureSessions:
      'Votre compte a des séances à venir avec des billets ou des invitations. Annulez-les ou reportez-les depuis la fiche de la séance et réessayez.',
    closureDebts:
      'Votre compte a une pénalité impayée. Réglez-la dans Gains, dans le tableau de bord partenaire, et réessayez.',
    closurePayouts:
      'Votre compte a des virements à recevoir ou retenus par une réclamation. Attendez le virement et réessayez.',
    photoSaved: 'Photo mise à jour.',
    photoError: "Impossible d'utiliser cette photo. Essayez-en une autre.",
  },
};
