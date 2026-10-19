/**
 * Quantos proxies confiáveis ficam entre o visitante e o Express (AGENTS.md §7.4: número exato,
 * nunca `true`). Com `true`, o IP viria do X-Forwarded-For que o próprio cliente pode forjar.
 * Em produção o valor é obrigatório; no AI Studio há um proxy na frente do servidor.
 */
export function resolveTrustProxyHops(
  raw: string | undefined = process.env.TRUST_PROXY_HOPS,
  isProduction: boolean = process.env.NODE_ENV === 'production'
): number {
  const trimmed = (raw ?? '').trim();
  if (trimmed === '') {
    if (isProduction) {
      throw new Error(
        'TRUST_PROXY_HOPS não configurado (número de proxies na frente do servidor).'
      );
    }
    return 1;
  }
  const hops = Number(trimmed);
  if (!Number.isInteger(hops) || hops < 0 || hops > 10) {
    throw new Error('TRUST_PROXY_HOPS deve ser um número inteiro entre 0 e 10.');
  }
  return hops;
}
