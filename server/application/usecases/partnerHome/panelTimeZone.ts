import { PLATFORM_TIME_ZONE } from '../../../shared/kernel/timeZones';

/**
 * Fuso das contas por dia e por mês do painel (D28): o do primeiro estabelecimento do parceiro; sem
 * estabelecimento, o da plataforma.
 */
export function panelTimeZone(establishments: ReadonlyArray<{ timeZone?: string }>): string {
  return establishments.find((item) => item.timeZone)?.timeZone ?? PLATFORM_TIME_ZONE;
}
