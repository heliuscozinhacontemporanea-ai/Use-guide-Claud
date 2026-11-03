import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from '../../../shared/kernel/locale';
import {
  NOTIFICATION_TEXTS_EN,
  NOTIFICATION_TEXTS_FR,
  NOTIFICATION_TEXTS_PT_BR,
  type NotificationTypeTexts,
} from '../i18n/notificationTexts';
import type { NotificationParams } from '../types/notificationTypes';

const TEXTS: Record<Locale, NotificationTypeTexts> = {
  'pt-BR': NOTIFICATION_TEXTS_PT_BR,
  en: NOTIFICATION_TEXTS_EN,
  fr: NOTIFICATION_TEXTS_FR,
};
const NAMED_PARAMS = ['event', 'business', 'username', 'listing'];
const COUNT_PARAMS = ['count', 'participants', 'rating', 'days'];
const TIME_ZONE = 'America/Fortaleza';

export function toLocale(value: unknown): Locale {
  return SUPPORTED_LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(values[key] ?? ''));
}

/**
 * Título e texto do push no idioma do aparelho, com as mesmas regras da central no app
 * (versão sem nome, @ no usuário, data no fuso do negócio e plural do idioma).
 */
export function renderNotificationText(
  type: string,
  params: NotificationParams,
  localeInput: unknown
): { title: string; body: string } | null {
  const locale = toLocale(localeInput);
  const texts = TEXTS[locale][type];
  if (!texts) return null;
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
  for (const key of COUNT_PARAMS) {
    if (typeof params[key] === 'number') values.count = params[key];
  }
  const missingName = NAMED_PARAMS.some((name) => name in params && !params[name]);
  const pick = (part: 'title' | 'body'): string => {
    const generic = texts[`${part}Generic`];
    if (missingName && generic) return generic;
    const plain = texts[part];
    if (plain) return plain;
    const plural = new Intl.PluralRules(locale).select(Number(values.count ?? 0));
    return texts[`${part}_${plural}`] ?? texts[`${part}_other`] ?? '';
  };
  return { title: fill(pick('title'), values), body: fill(pick('body'), values) };
}
