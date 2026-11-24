import type { LocalizedText } from '../types/bookings';

/** Texto do parceiro no idioma da tela; sem a tradução, o português que ele escreveu. */
export function textFor(text: LocalizedText | undefined, language: string): string {
  if (!text) return '';
  const key = language === 'en' || language === 'fr' ? language : 'pt-BR';
  return text[key] || text['pt-BR'];
}
