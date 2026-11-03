import type { TFunction } from 'i18next';
import type { NotificationDate, StoredNotification } from '../types/notification';
import type { NotificationCenterItem } from '../types/notificationCategories';

const TIME_ZONE = 'America/Fortaleza';

/** Dados que, se vierem vazios, trocam o texto pela versão sem nome (`titleGeneric`/`bodyGeneric`). */
const NAMED_PARAMS = ['event', 'business', 'username', 'listing', 'offer'] as const;

export function toDate(value: NotificationDate): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date((value.seconds ?? 0) * 1000);
}

function hasText(t: TFunction, key: string): boolean {
  return t(key, { defaultValue: '' }) !== '';
}

/**
 * Monta título e texto no idioma ativo a partir do tipo e dos dados (D25, §12.5). Tipo desconhecido
 * (app antigo, tipo novo no servidor) vira um aviso genérico em vez de sumir.
 */
export function describeNotification(
  notification: StoredNotification,
  t: TFunction,
  locale: string
): NotificationCenterItem {
  const params = notification.params ?? {};
  const base = `notify.types.${notification.type}`;
  const known = hasText(t, `${base}.title`);
  const missingName = NAMED_PARAMS.some((name) => name in params && !params[name]);
  const values: Record<string, string | number> = { ...params };
  if (typeof params.username === 'string' && params.username) {
    values.username = `@${params.username}`;
  }
  if (typeof params.startsAt === 'string') {
    values.date = new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: TIME_ZONE,
    }).format(new Date(params.startsAt));
  }
  for (const countKey of ['count', 'participants', 'rating', 'days']) {
    if (typeof params[countKey] === 'number') values.count = params[countKey];
  }
  const pick = (part: 'title' | 'body') =>
    missingName && hasText(t, `${base}.${part}Generic`)
      ? `${base}.${part}Generic`
      : `${base}.${part}`;

  return {
    id: notification.id,
    title: known ? t(pick('title'), values) : t('notify.center.title'),
    body: known ? t(pick('body'), values) : '',
    createdAt: toDate(notification.createdAt),
    read: notification.read,
    link: notification.link ?? null,
  };
}
