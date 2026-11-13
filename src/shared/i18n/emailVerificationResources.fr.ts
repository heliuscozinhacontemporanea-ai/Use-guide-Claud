import type { EmailVerificationTranslation } from './emailVerificationResources';

export const emailVerificationFr: EmailVerificationTranslation = {
  title: 'Confirmez votre e-mail',
  sentAfterSignup:
    'Nous avons envoyé un lien à {{email}}. Ouvrez l’e-mail et touchez le lien pour confirmer votre compte.',
  required:
    'Pour continuer, confirmez votre e-mail. Nous avons envoyé le lien à {{email}} lors de la création du compte.',
  spamHint: 'Rien reçu ? Vérifiez les spams ou demandez un autre lien.',
  checked: 'C’est confirmé',
  resend: 'Envoyer un autre lien',
  resendIn: 'Envoyer un autre lien dans {{seconds}} s',
  sent: 'Lien envoyé à {{email}}.',
  notYet: 'Pas encore confirmé. Touchez le lien de l’e-mail et réessayez.',
  verified: 'E-mail confirmé.',
  later: 'Plus tard',
  close: 'Fermer',
  partnerRequired:
    'Confirmez votre e-mail pour terminer l’inscription de votre établissement. Puis touchez à nouveau envoyer.',
  errors: {
    TOO_MANY_REQUESTS: 'Trop d’envois d’affilée. Attendez quelques minutes et réessayez.',
    failed: 'Impossible d’envoyer le lien. Réessayez.',
  },
  action: {
    verifying: 'Confirmation de votre e-mail…',
    verifiedTitle: 'E-mail confirmé',
    verifiedText: 'C’est fait. Votre compte Use Guide est confirmé.',
    goToApp: 'Aller sur Use Guide',
    invalidTitle: 'Lien invalide',
    invalidText: 'Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau dans l’app.',
  },
};
