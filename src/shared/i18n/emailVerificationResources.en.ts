import type { EmailVerificationTranslation } from './emailVerificationResources';

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
