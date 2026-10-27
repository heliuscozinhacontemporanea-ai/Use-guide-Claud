import type { ReviewDateValue } from '../types/review';

type RawDate = ReviewDateValue | { toDate?: () => Date; seconds?: number };

/** Data da avaliação em ISO, qualquer que seja o formato vindo do Firestore; `null` se não der. */
export function reviewDateToIso(value: RawDate): string | null {
  if (!value) return null;
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'object' && typeof value.toDate === 'function') {
    date = value.toDate();
  } else if (typeof value === 'object' && typeof value.seconds === 'number') {
    date = new Date(value.seconds * 1000);
  } else {
    date = new Date(value as string | number);
  }
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
