import { ISO_639_1_CODES } from '../constants/languageCodes';

const capitalize = (name: string, locale: string) =>
  name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);

let storedNames: Intl.DisplayNames | undefined;
let codesByStoredName: Map<string, string> | undefined;

/** Nome gravado de um idioma: em português, com inicial maiúscula, como os seis da lista (D34). */
export function storedLanguageName(code: string): string {
  storedNames ??= new Intl.DisplayNames(['pt-BR'], { type: 'language' });
  return capitalize(storedNames.of(code) ?? code, 'pt-BR');
}

/** Um idioma gravado, com o nome no idioma de quem lê; fora da ISO 639-1, o próprio valor. */
export function languageDisplayName(stored: string, locale: string): string {
  codesByStoredName ??= new Map(ISO_639_1_CODES.map((code) => [storedLanguageName(code), code]));
  const code = codesByStoredName.get(stored);
  if (!code) return stored;
  const name = new Intl.DisplayNames([locale], { type: 'language' }).of(code);
  return name ? capitalize(name, locale) : stored;
}
