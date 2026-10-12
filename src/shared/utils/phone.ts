import { COUNTRY_CODES } from '../constants/countryCodes';

// Telefone é gravado em E.164 (AGENTS.md §12.4); o link do WhatsApp é montado na exibição.
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const DEFAULT_DDI = '+55';

/** DDI + número digitado (com ou sem máscara) → E.164; `undefined` se vazio ou inválido. */
export function toE164(ddi: string, nationalNumber: string): string | undefined {
  const ddiDigits = ddi.replace(/\D/g, '');
  const numberDigits = nationalNumber.replace(/\D/g, '');
  if (!ddiDigits || !numberDigits) return undefined;
  const e164 = `+${ddiDigits}${numberDigits}`;
  return E164_PATTERN.test(e164) ? e164 : undefined;
}

/** E.164 → DDI e número, para preencher o campo de telefone na edição. */
export function splitE164(e164: string | undefined): { ddi: string; nationalNumber: string } {
  if (!e164 || !E164_PATTERN.test(e164)) {
    return { ddi: DEFAULT_DDI, nationalNumber: '' };
  }
  const known = [...COUNTRY_CODES]
    .map((country) => country.code as string)
    .sort((a, b) => b.length - a.length)
    .find((code) => e164.startsWith(code));
  const ddi = known ?? e164.slice(0, 3);
  return { ddi, nationalNumber: e164.slice(ddi.length) };
}

/** Link do WhatsApp para um telefone em E.164; `null` se o telefone não for válido. */
export function whatsAppUrl(e164: string | undefined, text?: string): string | null {
  if (!e164 || !E164_PATTERN.test(e164)) return null;
  const base = `https://wa.me/${e164.slice(1)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
