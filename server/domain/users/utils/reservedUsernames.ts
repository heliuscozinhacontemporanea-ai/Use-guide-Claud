import { comparableName, mentionsUseGuide } from '../../../shared/kernel/reservedNames';

/**
 * Nomes reservados no @ (D35, item 10): ninguém se passa pelo Use Guide, por uma marca ou por um
 * órgão público. Mudar a lista é um PR (decisão 1a); o app não tem a lista, só o servidor.
 */

// Marcas longas e inconfundíveis: bloqueadas em qualquer parte do @.
const ANYWHERE = [
  // Redes sociais e grandes empresas
  'instagram',
  'facebook',
  'whatsapp',
  'tiktok',
  'twitter',
  'youtube',
  'linkedin',
  'telegram',
  'microsoft',
  'netflix',
  'google',
  // Pagamentos e bancos
  'mercadopago',
  'mercadolivre',
  'picpay',
  'paypal',
  'nubank',
  'bradesco',
  'bancodobrasil',
  'pagseguro',
  // Viagem e ingressos
  'airbnb',
  'booking',
  'tripadvisor',
  'getyourguide',
  'sympla',
  'expedia',
  'trivago',
  'eventbrite',
  'ticketmaster',
  // Órgãos públicos e de turismo
  'prefeitura',
  'governo',
  'icmbio',
  'policia',
  'receitafederal',
  'procon',
  'cadastur',
  'embratur',
  'ministeriodoturismo',
  'detran',
  'defesacivil',
].map(comparableName);

// Curtas ou comuns: só o @ inteiro, ou junto de palavras de autoridade ("meta_oficial"), para não
// bloquear "metade", "tapioca", "badminton", "pineapple", "uberlandia" ou "receitas_da_vovo".
const ALONE = [
  // Use Guide e funções do app
  'admin',
  'administrador',
  'administrator',
  'root',
  'sistema',
  'system',
  'api',
  'www',
  'login',
  'auth',
  'conta',
  'contas',
  'pagamento',
  'pagamentos',
  'financeiro',
  'cobranca',
  'reembolso',
  'seguranca',
  'security',
  'privacidade',
  'privacy',
  'termos',
  'parceiros',
  'noreply',
  // Redes sociais e grandes empresas
  'meta',
  'threads',
  'apple',
  'iphone',
  'android',
  'amazon',
  'gmail',
  // Pagamentos e bancos
  'pix',
  'stripe',
  'itau',
  'caixa',
  'santander',
  'inter',
  'banco',
  // Viagem e ingressos
  'decolar',
  'uber',
  'ifood',
  'hoteis',
  // Órgãos públicos e de turismo
  'receita',
  'setur',
  'mtur',
  'bombeiros',
].map(comparableName);

// Palavras de autoridade: sozinhas ou juntas ("suporte_oficial") também são reservadas.
const AUTHORITY = [
  'oficial',
  'official',
  'suporte',
  'support',
  'ajuda',
  'help',
  'atendimento',
  'sac',
  'staff',
  'equipe',
  'team',
  'verificado',
  'verified',
  'moderador',
  'moderator',
  'admin',
  'adm',
].map(comparableName);

// Só valem junto de um nome reservado ("meta_br", "pix_app"), nunca sozinhas.
const SUFFIXES = ['br', 'brasil', 'app'].map(comparableName);

const ONLY_AUTHORITY = new RegExp(`^(?:${AUTHORITY.join('|')})+$`);
const ONLY_AUTHORITY_OR_SUFFIX = new RegExp(`^(?:${[...AUTHORITY, ...SUFFIXES].join('|')})+$`);

/** O resto do @, sem o nome curto no começo ou no fim, é só autoridade ou sufixo. */
function isAloneWithAuthority(name: string, term: string): boolean {
  const rest = name.startsWith(term)
    ? name.slice(term.length)
    : name.endsWith(term)
      ? name.slice(0, -term.length)
      : null;
  return rest !== null && (rest === '' || ONLY_AUTHORITY_OR_SUFFIX.test(rest));
}

export function isReservedUsername(username: string): boolean {
  if (mentionsUseGuide(username)) return true;
  const name = comparableName(username);
  if (ONLY_AUTHORITY.test(name)) return true;
  if (ANYWHERE.some((term) => name.includes(term))) return true;
  return ALONE.some((term) => isAloneWithAuthority(name, term));
}
