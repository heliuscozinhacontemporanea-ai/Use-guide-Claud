/**
 * Tira dado pessoal e segredo de texto livre antes de ir para o log (AGENTS.md §7.5 e §10.3):
 * e-mail, sequência longa de dígitos (CPF, CNPJ, telefone, cartão), token e parâmetros de URL.
 * Espelho em `src/shared/utils/scrubPersonalData.ts`, com teste de paridade.
 */

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const JWT = /eyJ[\w-]+\.[\w-]+\.[\w-]+/g;
const LONG_TOKEN = /\b[A-Za-z0-9_-]{32,}\b/g;
// Seis ou mais dígitos, com separadores comuns; depois de ":" é linha ou coluna da pilha.
const DIGITS = /(?<![\w:])\d(?:[\s.\-/]?\d){5,}(?!\w)/g;
// Parâmetros e âncora da URL saem; o `:linha:coluna` de uma linha da pilha fica.
const URL_QUERY = /(https?:\/\/[^\s?#)"']+)[?#][^\s)"']*?(?=:\d+(?::\d+)?(?:[\s)"']|$)|[\s)"']|$)/g;

function scrubSecrets(text: string): string {
  return text
    .replace(URL_QUERY, '$1')
    .replace(EMAIL, '[email]')
    .replace(JWT, '[token]')
    .replace(LONG_TOKEN, '[token]');
}

/** Mensagem de erro ou outro texto livre. */
export function scrubText(text: string): string {
  return scrubSecrets(text).replace(DIGITS, '[num]');
}

/**
 * Pilha de chamadas: a primeira linha (a mensagem) é limpa por inteiro; nas linhas dos arquivos,
 * os números de linha e coluna ficam, para o Error Reporting agrupar.
 */
export function scrubStack(stack: string): string {
  const [first = '', ...frames] = stack.split('\n');
  return [scrubText(first), ...frames.map(scrubSecrets)].join('\n');
}
