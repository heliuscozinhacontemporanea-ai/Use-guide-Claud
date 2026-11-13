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
