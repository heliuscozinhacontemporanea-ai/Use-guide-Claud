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
