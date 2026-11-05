/** Aviso "chegou" ao comprador e a folha "Não vou mais" (p45, p46, D27). */
export interface ArrivalNoticeTranslation {
  title: string;
  titleFallback: string;
  message: string;
  yourCode: string;
  coming: string;
  notGoing: string;
  comingSent: string;
  sheetTitle: string;
  sheetDescription: string;
  sheetMessageStarted: string;
  sheetMessageArrived: string;
  sheetConfirm: string;
  back: string;
  notGoingSent: string;
  error: string;
}

export const arrivalNoticePtBR: ArrivalNoticeTranslation = {
  title: '{{business}} chegou',
  titleFallback: 'Seu guia chegou',
  message: 'Estão esperando você no local combinado. Mostre o seu código.',
  yourCode: 'Seu código',
  coming: 'Estou chegando',
  notGoing: 'Não vou mais',
  comingSent: 'Avisamos que você está chegando.',
  sheetTitle: 'Não vai mais?',
  sheetDescription: '{{title}} · {{when}}',
  sheetMessageStarted:
    'Vamos avisar {{business}} que você não vai. Como o serviço já começou, conta como ausência e não há reembolso.',
  sheetMessageArrived:
    'Vamos avisar {{business}} que você não vai. Como já estão esperando você, conta como ausência e não há reembolso.',
  sheetConfirm: 'Avisar que não vou',
  back: 'Voltar',
  notGoingSent: 'Avisamos que você não vai.',
  error: 'Não foi possível enviar a resposta. Tente de novo.',
};

export const arrivalNoticeEn: ArrivalNoticeTranslation = {
  title: '{{business}} has arrived',
  titleFallback: 'Your guide has arrived',
  message: "They're waiting for you at the meeting point. Show your code.",
  yourCode: 'Your code',
  coming: "I'm on my way",
  notGoing: "I'm not coming",
  comingSent: "We told them you're on your way.",
  sheetTitle: 'Not coming anymore?',
  sheetDescription: '{{title}} · {{when}}',
  sheetMessageStarted:
    "We'll let {{business}} know you're not coming. Since the service has already started, it counts as a no-show and there's no refund.",
  sheetMessageArrived:
    "We'll let {{business}} know you're not coming. Since they're already waiting for you, it counts as a no-show and there's no refund.",
  sheetConfirm: "Tell them I'm not coming",
  back: 'Back',
  notGoingSent: "We told them you're not coming.",
  error: 'Could not send your reply. Try again.',
};

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
