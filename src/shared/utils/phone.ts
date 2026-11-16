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

/** Número sem o DDI, com a máscara brasileira (88) 99999-0000; de outros países, só os dígitos. */
export function formatNationalNumber(ddi: string, nationalNumber: string): string {
  const digits = nationalNumber.replace(/\D/g, '');
  if (ddi !== DEFAULT_DDI || digits.length < 10) return digits;
  const split = digits.length > 10 ? 7 : 6;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, split)}-${digits.slice(split)}`;
}

/** E.164 → texto para exibir (AGENTS.md §12.4): DDI e o número com a máscara do país. */
export function formatPhoneForDisplay(e164: string | undefined): string {
  const { ddi, nationalNumber } = splitE164(e164);
  return nationalNumber ? `${ddi} ${formatNationalNumber(ddi, nationalNumber)}` : '';
}

/** Link do WhatsApp para um telefone em E.164; `null` se o telefone não for válido. */
export function whatsAppUrl(e164: string | undefined, text?: string): string | null {
  if (!e164 || !E164_PATTERN.test(e164)) return null;
  const base = `https://wa.me/${e164.slice(1)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
