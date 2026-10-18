const DEFAULT_PLATFORM_FEE_PERCENT = 10;

/**
 * Taxa da plataforma (AGENTS.md §8.1), lida de `USE_GUIDE_PLATFORM_FEE_PERCENT`.
 * Sem valor configurado vale o padrão de 10%; valor inválido falha na chamada (§2.2.4)
 * em vez de cobrar uma taxa que ninguém configurou.
 */
export function resolvePlatformFeePercent(
  ...args: [raw?: string | undefined]
): number {
  const raw = args.length > 0 ? args[0] : process.env.USE_GUIDE_PLATFORM_FEE_PERCENT;
  const trimmed = (raw ?? '').replace('%', '').trim();
  if (trimmed === '') return DEFAULT_PLATFORM_FEE_PERCENT;
  const percent = Number(trimmed);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error('USE_GUIDE_PLATFORM_FEE_PERCENT deve ser um número entre 0 e 100.');
  }
  return percent;
}
