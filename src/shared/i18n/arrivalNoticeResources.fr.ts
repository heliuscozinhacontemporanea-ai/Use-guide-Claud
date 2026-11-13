import type { ArrivalNoticeTranslation } from './arrivalNoticeResources';

export const arrivalNoticeFr: ArrivalNoticeTranslation = {
  title: '{{business}} est arrivé',
  titleFallback: 'Votre guide est arrivé',
  message: 'On vous attend au point de rendez-vous. Montrez votre code.',
  yourCode: 'Votre code',
  coming: "J'arrive",
  notGoing: 'Je ne viens plus',
  comingSent: 'Nous avons prévenu que vous arrivez.',
  sheetTitle: 'Vous ne venez plus ?',
  sheetDescription: '{{title}} · {{when}}',
  sheetMessageStarted:
    'Nous allons prévenir {{business}} que vous ne venez pas. Comme le service a déjà commencé, cela compte comme une absence, sans remboursement.',
  sheetMessageArrived:
    'Nous allons prévenir {{business}} que vous ne venez pas. Comme on vous attend déjà, cela compte comme une absence, sans remboursement.',
  sheetConfirm: 'Prévenir que je ne viens pas',
  back: 'Retour',
  notGoingSent: 'Nous avons prévenu que vous ne venez pas.',
  error: "Impossible d'envoyer votre réponse. Réessayez.",
};
