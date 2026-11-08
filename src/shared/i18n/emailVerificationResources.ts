/** Textos da confirmação de e-mail e da página de ação da conta (D22). pt-BR é a fonte. */
export interface EmailVerificationTranslation {
  title: string;
  sentAfterSignup: string;
  required: string;
  spamHint: string;
  checked: string;
  resend: string;
  resendIn: string;
  sent: string;
  notYet: string;
  verified: string;
  later: string;
  close: string;
  partnerRequired: string;
  errors: {
    TOO_MANY_REQUESTS: string;
    failed: string;
  };
  action: {
    verifying: string;
    verifiedTitle: string;
    verifiedText: string;
    goToApp: string;
    invalidTitle: string;
    invalidText: string;
  };
}

export const emailVerificationPtBR: EmailVerificationTranslation = {
  title: 'Confirme seu e-mail',
  sentAfterSignup:
    'Enviamos um link para {{email}}. Abra o e-mail e toque no link para confirmar sua conta.',
  required:
    'Para continuar, confirme seu e-mail. Enviamos o link para {{email}} quando você criou a conta.',
  spamHint: 'Não chegou? Veja a caixa de spam ou peça outro link.',
  checked: 'Já confirmei',
  resend: 'Enviar outro link',
  resendIn: 'Enviar outro link em {{seconds}} s',
  sent: 'Link enviado para {{email}}.',
  notYet: 'Ainda não aparece confirmado. Toque no link do e-mail e tente de novo.',
  verified: 'E-mail confirmado.',
  later: 'Agora não',
  close: 'Fechar',
  partnerRequired:
    'Confirme seu e-mail para concluir o cadastro do seu negócio. Depois, toque em enviar de novo.',
  errors: {
    TOO_MANY_REQUESTS: 'Muitos envios seguidos. Espere alguns minutos e tente de novo.',
    failed: 'Não foi possível enviar o link. Tente de novo.',
  },
  action: {
    verifying: 'Confirmando seu e-mail…',
    verifiedTitle: 'E-mail confirmado',
    verifiedText: 'Pronto. Sua conta no Use Guide está confirmada.',
    goToApp: 'Ir para o Use Guide',
    invalidTitle: 'Link inválido',
    invalidText: 'Este link venceu ou já foi usado. No app, peça um novo link.',
  },
};

export const emailVerificationEn: EmailVerificationTranslation = {
  title: 'Confirm your email',
  sentAfterSignup:
    'We sent a link to {{email}}. Open the email and tap the link to confirm your account.',
  required:
    'To continue, confirm your email. We sent the link to {{email}} when you created your account.',
  spamHint: 'Didn’t get it? Check your spam folder or ask for another link.',
  checked: 'I’ve confirmed it',
  resend: 'Send another link',
  resendIn: 'Send another link in {{seconds}} s',
  sent: 'Link sent to {{email}}.',
  notYet: 'It doesn’t show as confirmed yet. Tap the link in the email and try again.',
  verified: 'Email confirmed.',
  later: 'Not now',
  close: 'Close',
  partnerRequired: 'Confirm your email to finish registering your business. Then tap send again.',
  errors: {
    TOO_MANY_REQUESTS: 'Too many requests in a row. Wait a few minutes and try again.',
    failed: 'We couldn’t send the link. Try again.',
  },
  action: {
    verifying: 'Confirming your email…',
    verifiedTitle: 'Email confirmed',
    verifiedText: 'All set. Your Use Guide account is confirmed.',
    goToApp: 'Go to Use Guide',
    invalidTitle: 'Invalid link',
    invalidText: 'This link has expired or was already used. Ask for a new one in the app.',
  },
};

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
