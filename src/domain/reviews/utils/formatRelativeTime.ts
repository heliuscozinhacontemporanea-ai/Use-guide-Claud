import { ReviewDateValue } from '../types/review';

export function formatRelativeTime(
  value: ReviewDateValue | { toDate?: () => Date; seconds?: number }
): string {
  if (!value) {
    return 'Hoje';
  }

  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    date = (value as { toDate: () => Date }).toDate();
  } else if (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    typeof (value as { seconds?: number }).seconds === 'number'
  ) {
    date = new Date((value as { seconds: number }).seconds * 1000);
  } else {
    date = new Date(value as string | number);
  }

  if (Number.isNaN(date.getTime())) {
    return 'Hoje';
  }

  const difference = Date.now() - date.getTime();
  if (difference <= 0) {
    return 'Hoje';
  }

  const days = Math.floor(difference / 86_400_000);
  if (days === 0) {
    return 'Hoje';
  }
  if (days === 1) {
    return '1 dia atrás';
  }
  if (days < 7) {
    return `${days} dias atrás`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks === 1) {
    return '1 semana atrás';
  }
  if (days < 30) {
    return `${weeks} semanas atrás`;
  }

  const months = Math.floor(days / 30);
  if (months === 1) {
    return '1 mês atrás';
  }
  if (days < 365) {
    return `${months} meses atrás`;
  }

  const years = Math.floor(days / 365);
  if (years === 1) {
    return '1 ano atrás';
  }
  return `${years} anos atrás`;
}
