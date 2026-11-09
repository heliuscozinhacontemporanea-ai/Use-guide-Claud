/**
 * Contato e dados de pagamento escritos em texto livre (C2/B37, aprovado em 2026-11-09): telefone,
 * e-mail, link, @ de rede social e chave Pix (CPF, CNPJ, e-mail, telefone ou chave aleatória). Nos
 * anúncios que vendem pelo app, o contato acontece depois da compra, pelo pedido.
 * Cópia de `server/shared/kernel/contactInText.ts`, conferida por teste de paridade.
 */
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi;
const URL =
  /\b(?:https?:\/\/|www\.)[^\s]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|br|io|me|app|link|ly|site|online|store)(?:\.br)?(?:\/[^\s]*)?(?![a-z0-9])/gi;
const HANDLE = /(?:^|[\s(])@[a-z0-9._]{3,}/gi;
const PIX_RANDOM = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
// Telefone, CPF e CNPJ: 8 a 14 dígitos, com espaço, ponto, traço, barra ou parênteses no meio.
const DIGITS = /\+?\(?\d(?:[\s().\-/]{0,2}\d){7,13}/g;
const YEAR_RANGE = /^(?:19|20)\d{2}\s*[-/]\s*(?:19|20)\d{2}$/;
const DATE = /^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/;

function collect(pattern: RegExp, text: string, keep: (match: string) => boolean = () => true) {
  return [...text.matchAll(pattern)].map((match) => match[0].trim()).filter(keep);
}

/** Trechos de contato achados no texto, na ordem em que aparecem; vazio quando não há nenhum. */
export function findContactsInText(text: string): string[] {
  if (!text) return [];
  const emails = collect(EMAIL, text);
  // Cada trecho achado sai do texto antes da busca seguinte: o domínio do e-mail não vira link,
  // e os números de um link não viram telefone.
  const without = (rest: string, parts: string[]) =>
    parts.reduce((current, part) => current.replace(part, ' '), rest);
  const afterEmails = without(text, emails);
  const keys = collect(PIX_RANDOM, afterEmails);
  const urls = collect(URL, without(afterEmails, keys));
  const rest = without(without(afterEmails, keys), urls);
  const found = [
    ...emails,
    ...keys,
    ...urls,
    ...collect(HANDLE, rest),
    ...collect(DIGITS, rest, (match) => {
      const digits = match.replace(/\D/g, '').length;
      return digits >= 8 && digits <= 14 && !YEAR_RANGE.test(match) && !DATE.test(match);
    }),
  ];
  return [...new Set(found)].sort((a, b) => text.indexOf(a) - text.indexOf(b));
}
