import type { ArrivalNoticeTranslation } from './arrivalNoticeResources';

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
